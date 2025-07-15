#!/bin/bash

# ==========================================
# QUICK START SCRIPT
# Tech Challenge 2 - FIAP 3FRNT ECS Setup
# ==========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}"
    echo "=========================================="
    echo "  TECH CHALLENGE 2 - QUICK START"
    echo "  ECS Infrastructure Setup"
    echo "=========================================="
    echo -e "${NC}"
}

print_section() {
    echo -e "${YELLOW}$1${NC}"
    echo "----------------------------------------"
}

check_tools() {
    print_section "🔧 Checking Required Tools"
    
    local missing_tools=()
    
    if ! command -v terraform &> /dev/null; then
        missing_tools+=("terraform")
    fi
    
    if ! command -v aws &> /dev/null; then
        missing_tools+=("aws-cli")
    fi
    
    if ! command -v docker &> /dev/null; then
        missing_tools+=("docker")
    fi
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        echo -e "${RED}Missing required tools: ${missing_tools[*]}${NC}"
        echo ""
        echo "Please install the missing tools:"
        echo "• Terraform: https://www.terraform.io/downloads.html"
        echo "• AWS CLI: https://aws.amazon.com/cli/"
        echo "• Docker: https://www.docker.com/get-started"
        exit 1
    fi
    
    echo -e "${GREEN}✓ All required tools are installed${NC}"
    echo ""
}

setup_environment() {
    print_section "⚙️  Environment Setup"
    
    # Copy .env.example if .env doesn't exist
    if [ ! -f .env ]; then
        echo "Creating .env file from template..."
        cp .env.example .env
        echo -e "${YELLOW}⚠️  Please edit .env file with your configuration${NC}"
    else
        echo -e "${GREEN}✓ .env file already exists${NC}"
    fi
    
    # Check if AWS credentials are configured
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${YELLOW}⚠️  AWS credentials not configured${NC}"
        echo "Please run: aws configure"
        echo "Or set environment variables:"
        echo "  export AWS_ACCESS_KEY_ID=your-key"
        echo "  export AWS_SECRET_ACCESS_KEY=your-secret"
        echo ""
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        echo -e "${GREEN}✓ AWS credentials configured${NC}"
    fi
    
    echo ""
}

deploy_infrastructure() {
    print_section "🚀 Infrastructure Deployment Options"
    
    echo "Choose deployment option:"
    echo "1) S3 only (basic setup)"
    echo "2) S3 + ECS (full application stack)"
    echo "3) S3 + ECS + Build & Push Docker image"
    echo ""
    read -p "Enter your choice (1-3): " -n 1 -r
    echo
    
    cd terraform
    
    case $REPLY in
        1)
            echo -e "${YELLOW}Deploying S3 infrastructure only...${NC}"
            ./deploy.sh -e dev
            ;;
        2)
            echo -e "${YELLOW}Deploying S3 + ECS infrastructure...${NC}"
            check_ecs_variables
            ./deploy.sh -e dev --ecs
            ;;
        3)
            echo -e "${YELLOW}Deploying full stack with Docker build...${NC}"
            check_ecs_variables
            ./deploy.sh -e dev --ecs --build-push
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            exit 1
            ;;
    esac
    
    cd ..
}

check_ecs_variables() {
    print_section "🔐 ECS Variables Check"
    
    if [ -z "$TF_VAR_mongodb_uri" ]; then
        echo -e "${YELLOW}MongoDB URI not set.${NC}"
        read -p "Enter MongoDB URI (or press Enter for local): " mongodb_uri
        if [ -n "$mongodb_uri" ]; then
            export TF_VAR_mongodb_uri="$mongodb_uri"
        else
            export TF_VAR_mongodb_uri="mongodb://localhost:27017/tech-challenge-2"
        fi
    fi
    
    if [ -z "$TF_VAR_jwt_secret" ]; then
        echo -e "${YELLOW}JWT Secret not set.${NC}"
        read -p "Enter JWT Secret (or press Enter for default): " jwt_secret
        if [ -n "$jwt_secret" ]; then
            export TF_VAR_jwt_secret="$jwt_secret"
        else
            export TF_VAR_jwt_secret="default-jwt-secret-change-in-production"
        fi
    fi
    
    echo -e "${GREEN}✓ ECS variables configured${NC}"
    echo ""
}

show_next_steps() {
    print_section "✅ Next Steps"
    
    echo "Your infrastructure has been deployed! Here's what you can do next:"
    echo ""
    echo "1. Check your application:"
    echo "   • View AWS Console: https://console.aws.amazon.com/ecs/"
    echo "   • Monitor logs: aws logs tail /ecs/tech-challenge-2-dev --follow"
    echo ""
    echo "2. Test the API:"
    echo "   • Swagger docs will be available at: http://[load-balancer-url]/docs"
    echo "   • Get the URL: cd terraform && terraform output application_url"
    echo ""
    echo "3. Local development:"
    echo "   • npm install"
    echo "   • npm run dev"
    echo ""
    echo "4. Make changes:"
    echo "   • Edit code and rebuild: cd terraform && ./build-and-deploy.sh -e dev -p"
    echo "   • Update infrastructure: cd terraform && ./deploy.sh -e dev --ecs"
    echo ""
    echo "5. Clean up when done:"
    echo "   • cd terraform && ./deploy.sh -e dev -d"
    echo ""
    echo -e "${GREEN}Happy coding! 🎉${NC}"
}

# Main execution
main() {
    print_header
    
    check_tools
    setup_environment
    deploy_infrastructure
    show_next_steps
}

# Execute main function
main "$@"
