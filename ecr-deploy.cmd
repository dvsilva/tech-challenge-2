@echo off
setlocal enabledelayedexpansion

REM ==========================================
REM ECR LOGIN AND DOCKER BUILD SCRIPT
REM Tech Challenge 2 - FIAP 3FRNT
REM ==========================================

echo.
echo 🚀 ECR Login and Docker Build Script
echo ==================================

REM Configuration
set AWS_REGION=us-east-1
set APP_NAME=tech-challenge-2

REM Check if required tools are installed
echo Checking dependencies...

where aws >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ AWS CLI is not installed
    exit /b 1
)

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed
    exit /b 1
)

where terraform >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Terraform is not installed
    exit /b 1
)

echo ✅ All dependencies found

REM Get ECR credentials from Terraform outputs
echo Getting ECR credentials from Terraform...

cd terraform

for /f "tokens=*" %%i in ('terraform output -raw ecr_aws_access_key_id 2^>nul') do set ECR_ACCESS_KEY=%%i
for /f "tokens=*" %%i in ('terraform output -raw ecr_aws_secret_access_key 2^>nul') do set ECR_SECRET_KEY=%%i
for /f "tokens=*" %%i in ('terraform output -raw ecr_repository_url 2^>nul') do set ECR_REPOSITORY_URL=%%i

if "!ECR_ACCESS_KEY!"=="" (
    echo ❌ Could not get ECR credentials from Terraform outputs
    echo Please make sure you have applied the Terraform configuration
    exit /b 1
)

cd ..
echo ✅ ECR credentials retrieved

REM Configure AWS credentials for ECR user
echo Configuring AWS credentials for ECR user...

set AWS_ACCESS_KEY_ID=!ECR_ACCESS_KEY!
set AWS_SECRET_ACCESS_KEY=!ECR_SECRET_KEY!
set AWS_DEFAULT_REGION=!AWS_REGION!

echo ✅ AWS credentials configured

REM Login to ECR
echo Logging in to ECR...

for /f "tokens=*" %%i in ('aws ecr get-login-password --region !AWS_REGION!') do set ECR_PASSWORD=%%i
echo !ECR_PASSWORD! | docker login --username AWS --password-stdin !ECR_REPOSITORY_URL!

if %errorlevel% neq 0 (
    echo ❌ Failed to login to ECR
    exit /b 1
)

echo ✅ Successfully logged in to ECR

REM Build and tag Docker image
echo Building Docker image...

docker build -t !APP_NAME! .

if %errorlevel% neq 0 (
    echo ❌ Failed to build Docker image
    exit /b 1
)

echo ✅ Docker image built successfully

REM Tag the image for ECR
docker tag !APP_NAME!:latest !ECR_REPOSITORY_URL!:latest

echo ✅ Image tagged for ECR

REM Push image to ECR
echo Pushing image to ECR...

docker push !ECR_REPOSITORY_URL!:latest

if %errorlevel% neq 0 (
    echo ❌ Failed to push image to ECR
    exit /b 1
)

echo ✅ Image pushed successfully to ECR
echo Repository URL: !ECR_REPOSITORY_URL!

echo.
echo 🎉 ECR deployment completed successfully!
echo Next steps:
echo 1. Update your ECS service to deploy the new image
echo 2. Check the ECS service status in AWS Console

pause
