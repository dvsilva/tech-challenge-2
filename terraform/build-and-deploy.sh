#!/bin/bash

# ==========================================
# DOCKER BUILD AND DEPLOY SCRIPT
# Tech Challenge 2 - FIAP 3FRNT
# ==========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="dev"
REGION="us-east-1"
PUSH_TO_ECR=false

# Function to display usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  -e, --environment   Environment (dev, staging, prod) [default: dev]"
    echo "  -r, --region        AWS region [default: us-east-1]"
    echo "  -p, --push          Push image to ECR"
    echo "  -h, --help          Display this help message"
    exit 1
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        -p|--push)
            PUSH_TO_ECR=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo "Unknown option: $1"
            usage
            ;;
    esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    echo -e "${RED}Error: Environment must be dev, staging, or prod${NC}"
    exit 1
fi

echo -e "${GREEN}Building Docker image for environment: $ENVIRONMENT${NC}"

# Set image name based on environment
if [ "$ENVIRONMENT" = "dev" ]; then
    IMAGE_NAME="tech-challenge-2-dev"
elif [ "$ENVIRONMENT" = "staging" ]; then
    IMAGE_NAME="tech-challenge-2-staging"
else
    IMAGE_NAME="tech-challenge-2-prod"
fi

# Build Docker image
echo -e "${YELLOW}Building Docker image...${NC}"
docker build -t $IMAGE_NAME:latest .

if [ "$PUSH_TO_ECR" = true ]; then
    echo -e "${YELLOW}Pushing image to ECR...${NC}"
    
    # Get AWS account ID
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to get AWS account ID. Make sure AWS CLI is configured.${NC}"
        exit 1
    fi
    
    # Set ECR repository URL
    ECR_REPO="$AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$IMAGE_NAME"
    
    # Login to ECR
    echo -e "${YELLOW}Logging into ECR...${NC}"
    aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REPO
    
    # Tag image for ECR
    docker tag $IMAGE_NAME:latest $ECR_REPO:latest
    
    # Push image
    echo -e "${YELLOW}Pushing image to ECR...${NC}"
    docker push $ECR_REPO:latest
    
    # Optional: Push with git commit hash tag
    if command -v git &> /dev/null && git rev-parse --git-dir > /dev/null 2>&1; then
        GIT_HASH=$(git rev-parse --short HEAD)
        docker tag $IMAGE_NAME:latest $ECR_REPO:$GIT_HASH
        docker push $ECR_REPO:$GIT_HASH
        echo -e "${GREEN}Image also tagged with git hash: $GIT_HASH${NC}"
    fi
    
    echo -e "${GREEN}Successfully pushed image to ECR: $ECR_REPO${NC}"
else
    echo -e "${GREEN}Docker image built successfully: $IMAGE_NAME:latest${NC}"
    echo -e "${YELLOW}To push to ECR, run with -p flag${NC}"
fi

echo -e "${GREEN}Build process completed!${NC}"
