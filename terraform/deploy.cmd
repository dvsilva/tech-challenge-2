@echo off
REM ==========================================
REM TERRAFORM DEPLOYMENT SCRIPT FOR WINDOWS
REM Tech Challenge 2 - FIAP 3FRNT
REM ==========================================

setlocal enabledelayedexpansion

REM Default values
set ENVIRONMENT=dev
set AUTO_APPROVE=false
set DESTROY=false

REM Colors (basic support for Windows)
set RED=[91m
set GREEN=[92m
set YELLOW=[93m
set BLUE=[94m
set NC=[0m

:parse_args
if "%~1"=="" goto main
if "%~1"=="-e" (
    set ENVIRONMENT=%~2
    shift
    shift
    goto parse_args
)
if "%~1"=="--environment" (
    set ENVIRONMENT=%~2
    shift
    shift
    goto parse_args
)
if "%~1"=="-a" (
    set AUTO_APPROVE=true
    shift
    goto parse_args
)
if "%~1"=="--auto-approve" (
    set AUTO_APPROVE=true
    shift
    goto parse_args
)
if "%~1"=="-d" (
    set DESTROY=true
    shift
    goto parse_args
)
if "%~1"=="--destroy" (
    set DESTROY=true
    shift
    goto parse_args
)
if "%~1"=="-h" goto show_help
if "%~1"=="--help" goto show_help

echo %RED%Unknown option: %~1%NC%
goto show_help

:show_help
echo Usage: %0 [OPTIONS]
echo.
echo Options:
echo   -e, --environment    Environment to deploy (dev, staging, prod)
echo   -a, --auto-approve   Auto approve terraform apply
echo   -d, --destroy        Destroy infrastructure
echo   -h, --help           Show this help message
echo.
echo Examples:
echo   %0 -e dev                    # Deploy to development
echo   %0 -e prod -a                # Deploy to production with auto-approve
echo   %0 -e staging -d             # Destroy staging infrastructure
goto end

:main
echo %BLUE%
echo ==========================================
echo   TERRAFORM S3 DEPLOYMENT SCRIPT
echo   Tech Challenge 2 - FIAP 3FRNT
echo ==========================================
echo %NC%

echo %BLUE%Environment: %ENVIRONMENT%%NC%
echo %BLUE%Auto-approve: %AUTO_APPROVE%%NC%
echo %BLUE%Destroy mode: %DESTROY%%NC%
echo.

REM Check prerequisites
echo %YELLOW%Checking prerequisites...%NC%

terraform version >nul 2>&1
if errorlevel 1 (
    echo %RED%Error: Terraform is not installed%NC%
    goto end
)

if not exist "environments\%ENVIRONMENT%.tfvars" (
    echo %RED%Error: Environment file environments\%ENVIRONMENT%.tfvars not found%NC%
    goto end
)

echo %GREEN%Prerequisites check completed%NC%

REM Check AWS credentials
echo %YELLOW%Checking AWS credentials...%NC%
if "%AWS_ACCESS_KEY_ID%"=="" if "%AWS_PROFILE%"=="" (
    echo %YELLOW%Warning: No AWS credentials found in environment variables%NC%
    echo %YELLOW%Please ensure you have configured AWS credentials%NC%
    set /p continue="Do you want to continue? (y/N): "
    if /i not "!continue!"=="y" goto end
) else (
    echo %GREEN%AWS credentials found%NC%
)

REM Initialize Terraform
echo %YELLOW%Initializing Terraform...%NC%
terraform init
if errorlevel 1 (
    echo %RED%Error: Terraform init failed%NC%
    goto end
)
echo %GREEN%Terraform initialized%NC%

if "%DESTROY%"=="true" goto destroy_infrastructure

REM Plan
echo %YELLOW%Creating Terraform plan for environment: %ENVIRONMENT%%NC%
terraform plan -var-file="environments\%ENVIRONMENT%.tfvars" -out="terraform-%ENVIRONMENT%.plan"
if errorlevel 1 (
    echo %RED%Error: Terraform plan failed%NC%
    goto cleanup
)
echo %GREEN%Terraform plan created%NC%

REM Apply
echo %YELLOW%Applying Terraform configuration for environment: %ENVIRONMENT%%NC%
if "%AUTO_APPROVE%"=="true" (
    terraform apply -auto-approve "terraform-%ENVIRONMENT%.plan"
) else (
    terraform apply "terraform-%ENVIRONMENT%.plan"
)
if errorlevel 1 (
    echo %RED%Error: Terraform apply failed%NC%
    goto cleanup
)
echo %GREEN%Terraform apply completed%NC%

REM Show outputs
echo %YELLOW%Terraform outputs:%NC%
terraform output
echo.

echo %YELLOW%To update your .env file with the generated credentials, run these commands:%NC%
echo %BLUE%cd .. ^&^& echo AWS_ACCESS_KEY_ID=^& terraform output -raw aws_access_key_id ^>^> .env%NC%
echo %BLUE%cd .. ^&^& echo AWS_SECRET_ACCESS_KEY=^& terraform output -raw aws_secret_access_key ^>^> .env%NC%
echo %BLUE%cd .. ^&^& echo S3_BUCKET_NAME=^& terraform output -raw bucket_name ^>^> .env%NC%

goto cleanup

:destroy_infrastructure
echo %RED%WARNING: This will destroy all infrastructure for environment: %ENVIRONMENT%%NC%
echo %RED%This action cannot be undone!%NC%
echo.

if "%AUTO_APPROVE%"=="false" (
    set /p confirm="Are you sure you want to destroy the infrastructure? Type 'yes' to confirm: "
    if not "!confirm!"=="yes" (
        echo %YELLOW%Destroy cancelled%NC%
        goto end
    )
)

echo %YELLOW%Destroying Terraform infrastructure for environment: %ENVIRONMENT%%NC%
if "%AUTO_APPROVE%"=="true" (
    terraform destroy -auto-approve -var-file="environments\%ENVIRONMENT%.tfvars"
) else (
    terraform destroy -var-file="environments\%ENVIRONMENT%.tfvars"
)
if errorlevel 1 (
    echo %RED%Error: Terraform destroy failed%NC%
    goto end
)
echo %GREEN%Terraform destroy completed%NC%

:cleanup
echo %YELLOW%Cleaning up temporary files...%NC%
del /q terraform-*.plan 2>nul
echo %GREEN%Cleanup completed%NC%

echo %GREEN%Deployment script completed successfully!%NC%
goto end

:end
endlocal
