#!/bin/bash

# ==========================================
# ECR LOGIN AND DOCKER BUILD SCRIPT
# Tech Challenge 2 - FIAP 3FRNT
# ==========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="us-east-1"
APP_NAME="tech-challenge-2"

echo -e "${GREEN}🚀 ECR Login and Docker Build Script${NC}"
echo "=================================="

# Check if required tools are installed
check_dependencies() {
    echo -e "${YELLOW}Checking dependencies...${NC}"
    
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ AWS CLI is not installed${NC}"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed${NC}"
        exit 1
    fi
    
    if ! command -v terraform &> /dev/null; then
        echo -e "${RED}❌ Terraform is not installed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All dependencies found${NC}"
}

# Get ECR credentials from Terraform outputs
get_ecr_credentials() {
    echo -e "${YELLOW}Getting ECR credentials from Terraform...${NC}"
    
    cd terraform
    
    ECR_ACCESS_KEY=$(terraform output -raw ecr_aws_access_key_id 2>/dev/null || echo "")
    ECR_SECRET_KEY=$(terraform output -raw ecr_aws_secret_access_key 2>/dev/null || echo "")
    ECR_REPOSITORY_URL=$(terraform output -raw ecr_repository_url 2>/dev/null || echo "")
    
    if [ -z "$ECR_ACCESS_KEY" ] || [ -z "$ECR_SECRET_KEY" ] || [ -z "$ECR_REPOSITORY_URL" ]; then
        echo -e "${RED}❌ Could not get ECR credentials from Terraform outputs${NC}"
        echo -e "${YELLOW}Please make sure you have applied the Terraform configuration${NC}"
        exit 1
    fi
    
    cd ..
    echo -e "${GREEN}✅ ECR credentials retrieved${NC}"
}

# Configure AWS credentials for ECR user
configure_aws_credentials() {
    echo -e "${YELLOW}Configuring AWS credentials for ECR user...${NC}"
    
    # Set environment variables for this session
    export AWS_ACCESS_KEY_ID="$ECR_ACCESS_KEY"
    export AWS_SECRET_ACCESS_KEY="$ECR_SECRET_KEY"
    export AWS_DEFAULT_REGION="$AWS_REGION"
    
    echo -e "${GREEN}✅ AWS credentials configured${NC}"
}

# Login to ECR
ecr_login() {
    echo -e "${YELLOW}Logging in to ECR...${NC}"
    
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPOSITORY_URL
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully logged in to ECR${NC}"
    else
        echo -e "${RED}❌ Failed to login to ECR${NC}"
        exit 1
    fi
}

# Build and tag Docker image
build_and_tag_image() {
    echo -e "${YELLOW}Building Docker image...${NC}"
    
    # Build the image
    docker build -t $APP_NAME .
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Docker image built successfully${NC}"
    else
        echo -e "${RED}❌ Failed to build Docker image${NC}"
        exit 1
    fi
    
    # Tag the image for ECR
    docker tag $APP_NAME:latest $ECR_REPOSITORY_URL:latest
    
    echo -e "${GREEN}✅ Image tagged for ECR${NC}"
}

# Push image to ECR
push_image() {
    echo -e "${YELLOW}Pushing image to ECR...${NC}"
    
    docker push $ECR_REPOSITORY_URL:latest
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Image pushed successfully to ECR${NC}"
        echo -e "${GREEN}Repository URL: $ECR_REPOSITORY_URL${NC}"
    else
        echo -e "${RED}❌ Failed to push image to ECR${NC}"
        exit 1
    fi
}

# Main execution
main() {
    echo -e "${GREEN}Starting ECR deployment process...${NC}"
    
    check_dependencies
    get_ecr_credentials
    configure_aws_credentials
    ecr_login
    build_and_tag_image
    push_image
    
    echo -e "${GREEN}🎉 ECR deployment completed successfully!${NC}"
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Update your ECS service to deploy the new image"
    echo "2. Check the ECS service status in AWS Console"
}

# Run main function
main "$@"
