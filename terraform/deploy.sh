#!/bin/bash

# ==========================================
# TERRAFORM DEPLOYMENT SCRIPT
# Tech Challenge 2 - FIAP 3FRNT
# ==========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="dev"
AUTO_APPROVE=false
DESTROY=false
DEPLOY_ECS=false
BUILD_AND_PUSH=false

# Functions
print_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --environment    Environment to deploy (dev, staging, prod)"
    echo "  -a, --auto-approve   Auto approve terraform apply"
    echo "  -d, --destroy        Destroy infrastructure"
    echo "  --ecs                Deploy ECS infrastructure"
    echo "  --build-push         Build and push Docker image to ECR"
    echo "  -h, --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -e dev                    # Deploy S3 infrastructure to development"
    echo "  $0 -e dev --ecs              # Deploy S3 + ECS infrastructure"
    echo "  $0 -e dev --ecs --build-push # Deploy + build and push Docker image"
    echo "  $0 -e prod -a --ecs          # Deploy to production with auto-approve"
    echo "  $0 -e staging -d             # Destroy staging infrastructure"
}

print_header() {
    echo -e "${BLUE}"
    echo "=========================================="
    echo "  TERRAFORM DEPLOYMENT SCRIPT"
    echo "  S3 + ECS Infrastructure"
    echo "  Tech Challenge 2 - FIAP 3FRNT"
    echo "=========================================="
    echo -e "${NC}"
}

check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"
    
    # Check if terraform is installed
    if ! command -v terraform &> /dev/null; then
        echo -e "${RED}Error: Terraform is not installed${NC}"
        exit 1
    fi
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        echo -e "${YELLOW}Warning: AWS CLI is not installed${NC}"
        echo -e "${YELLOW}You can still proceed if you have AWS credentials configured via environment variables${NC}"
    fi
    
    # Check Docker if ECS deployment is requested
    if [ "$DEPLOY_ECS" = true ] && [ "$BUILD_AND_PUSH" = true ]; then
        if ! command -v docker &> /dev/null; then
            echo -e "${RED}Error: Docker is not installed but required for ECS deployment${NC}"
            exit 1
        fi
        
        # Check if Docker is running
        if ! docker info > /dev/null 2>&1; then
            echo -e "${RED}Error: Docker is not running${NC}"
            exit 1
        fi
    fi
    
    # Check if environment file exists
    if [ ! -f "environments/${ENVIRONMENT}.tfvars" ]; then
        echo -e "${RED}Error: Environment file environments/${ENVIRONMENT}.tfvars not found${NC}"
        exit 1
    fi
    
    # Check if required environment variables are set for ECS
    if [ "$DEPLOY_ECS" = true ]; then
        if [ -z "$TF_VAR_mongodb_uri" ]; then
            echo -e "${YELLOW}Warning: TF_VAR_mongodb_uri not set. Make sure to set it before deploying ECS.${NC}"
        fi
        if [ -z "$TF_VAR_jwt_secret" ]; then
            echo -e "${YELLOW}Warning: TF_VAR_jwt_secret not set. Make sure to set it before deploying ECS.${NC}"
        fi
    fi
    
    echo -e "${GREEN}Prerequisites check completed${NC}"
}

check_aws_credentials() {
    echo -e "${YELLOW}Checking AWS credentials...${NC}"
    
    if [ -z "$AWS_ACCESS_KEY_ID" ] && [ -z "$AWS_PROFILE" ]; then
        echo -e "${YELLOW}Warning: No AWS credentials found in environment variables${NC}"
        echo -e "${YELLOW}Please ensure you have configured AWS credentials via:${NC}"
        echo -e "${YELLOW}  - aws configure${NC}"
        echo -e "${YELLOW}  - Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)${NC}"
        echo -e "${YELLOW}  - IAM roles (if running on EC2)${NC}"
        echo ""
        read -p "Do you want to continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        echo -e "${GREEN}AWS credentials found${NC}"
    fi
}

terraform_init() {
    echo -e "${YELLOW}Initializing Terraform...${NC}"
    terraform init
    echo -e "${GREEN}Terraform initialized${NC}"
}

terraform_plan() {
    echo -e "${YELLOW}Creating Terraform plan for environment: ${ENVIRONMENT}${NC}"
    terraform plan -var-file="environments/${ENVIRONMENT}.tfvars" -out="terraform-${ENVIRONMENT}.plan"
    echo -e "${GREEN}Terraform plan created${NC}"
}

terraform_apply() {
    echo -e "${YELLOW}Applying Terraform configuration for environment: ${ENVIRONMENT}${NC}"
    
    if [ "$AUTO_APPROVE" = true ]; then
        terraform apply -auto-approve "terraform-${ENVIRONMENT}.plan"
    else
        terraform apply "terraform-${ENVIRONMENT}.plan"
    fi
    
    echo -e "${GREEN}Terraform apply completed${NC}"
}

terraform_destroy() {
    echo -e "${RED}WARNING: This will destroy all infrastructure for environment: ${ENVIRONMENT}${NC}"
    echo -e "${RED}This action cannot be undone!${NC}"
    echo ""
    
    if [ "$AUTO_APPROVE" = false ]; then
        read -p "Are you sure you want to destroy the infrastructure? Type 'yes' to confirm: " confirm
        if [ "$confirm" != "yes" ]; then
            echo -e "${YELLOW}Destroy cancelled${NC}"
            exit 0
        fi
    fi
    
    echo -e "${YELLOW}Destroying Terraform infrastructure for environment: ${ENVIRONMENT}${NC}"
    
    if [ "$AUTO_APPROVE" = true ]; then
        terraform destroy -auto-approve -var-file="environments/${ENVIRONMENT}.tfvars"
    else
        terraform destroy -var-file="environments/${ENVIRONMENT}.tfvars"
    fi
    
    echo -e "${GREEN}Terraform destroy completed${NC}"
}

show_outputs() {
    echo -e "${YELLOW}Terraform outputs:${NC}"
    terraform output
    echo ""
    
    echo -e "${YELLOW}To update your .env file with the generated credentials, run:${NC}"
    echo -e "${BLUE}cd .. && echo 'AWS_ACCESS_KEY_ID='$(terraform output -raw aws_access_key_id) >> .env${NC}"
    echo -e "${BLUE}cd .. && echo 'AWS_SECRET_ACCESS_KEY='$(terraform output -raw aws_secret_access_key) >> .env${NC}"
    echo -e "${BLUE}cd .. && echo 'S3_BUCKET_NAME='$(terraform output -raw bucket_name) >> .env${NC}"
}

cleanup() {
    echo -e "${YELLOW}Cleaning up temporary files...${NC}"
    rm -f terraform-*.plan
    echo -e "${GREEN}Cleanup completed${NC}"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -a|--auto-approve)
            AUTO_APPROVE=true
            shift
            ;;
        -d|--destroy)
            DESTROY=true
            shift
            ;;
        --ecs)
            DEPLOY_ECS=true
            shift
            ;;
        --build-push)
            BUILD_AND_PUSH=true
            shift
            ;;
        -h|--help)
            print_usage
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            print_usage
            exit 1
            ;;
    esac
done

# Main execution
main() {
    print_header
    
    echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
    echo -e "${BLUE}Auto-approve: ${AUTO_APPROVE}${NC}"
    echo -e "${BLUE}Destroy mode: ${DESTROY}${NC}"
    echo -e "${BLUE}Deploy ECS: ${DEPLOY_ECS}${NC}"
    echo -e "${BLUE}Build & Push: ${BUILD_AND_PUSH}${NC}"
    echo ""
    
    check_prerequisites
    check_aws_credentials
    terraform_init
    
    if [ "$DESTROY" = true ]; then
        terraform_destroy
    else
        terraform_plan
        terraform_apply
        show_outputs
        
        # ECS specific actions
        if [ "$DEPLOY_ECS" = true ] && [ "$BUILD_AND_PUSH" = true ]; then
            echo -e "${YELLOW}Building and pushing Docker image...${NC}"
            if [ -f "./build-and-deploy.sh" ]; then
                chmod +x ./build-and-deploy.sh
                ./build-and-deploy.sh -e $ENVIRONMENT -p
            else
                echo -e "${RED}Error: build-and-deploy.sh not found${NC}"
                exit 1
            fi
            
            echo -e "${YELLOW}Forcing ECS service deployment...${NC}"
            APP_NAME=$(terraform output -raw app_name 2>/dev/null || echo "tech-challenge-2-${ENVIRONMENT}")
            aws ecs update-service \
                --cluster "${APP_NAME}-cluster" \
                --service "${APP_NAME}-service" \
                --force-new-deployment > /dev/null 2>&1 || echo -e "${YELLOW}Note: Could not force ECS deployment (service may not exist yet)${NC}"
        fi
        
        # Show ECS specific outputs if deployed
        if [ "$DEPLOY_ECS" = true ]; then
            echo -e "${GREEN}ECS Infrastructure deployed successfully!${NC}"
            echo -e "${YELLOW}Application URL: $(terraform output -raw application_url 2>/dev/null || echo 'Not available yet')${NC}"
            echo -e "${YELLOW}ECR Repository: $(terraform output -raw ecr_repository_url 2>/dev/null || echo 'Not available')${NC}"
        fi
    fi
    
    cleanup
    
    echo -e "${GREEN}Deployment script completed successfully!${NC}"
}

# Execute main function
main
