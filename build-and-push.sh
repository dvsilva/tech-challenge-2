#!/bin/bash

# Build and Push Docker Image to ECR
# Make sure Docker Desktop is running before executing this script

set -e  # Exit on any error

# Configuration
ECR_REGISTRY="672508880349.dkr.ecr.us-east-1.amazonaws.com"
REPOSITORY_NAME="tech-challenge-2"
IMAGE_TAG="latest"
REGION="us-east-1"

echo "=== Building and Pushing Docker Image to ECR ==="
echo "ECR Registry: $ECR_REGISTRY"
echo "Repository: $REPOSITORY_NAME"
echo "Tag: $IMAGE_TAG"
echo "Region: $REGION"
echo

# Step 1: Build the Docker image
echo "Step 1: Building Docker image..."
docker build -t $REPOSITORY_NAME:$IMAGE_TAG .
echo "✓ Docker image built successfully"
echo

# Step 2: Tag the image for ECR
echo "Step 2: Tagging image for ECR..."
docker tag $REPOSITORY_NAME:$IMAGE_TAG $ECR_REGISTRY/$REPOSITORY_NAME:$IMAGE_TAG
echo "✓ Image tagged successfully"
echo

# Step 3: Login to ECR
echo "Step 3: Logging into ECR..."
# Try AWS CLI first, fallback to manual login if not available
if command -v aws &> /dev/null; then
    echo "Using AWS CLI for authentication..."
    aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
else
    echo "AWS CLI not found. Please run the following command manually:"
    echo "aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REGISTRY"
    echo "Or install AWS CLI and run this script again."
    echo
    echo "Alternatively, you can use the AWS credentials directly:"
    echo "echo 'rfiBMx7UhSqLgb3GjCNblmQ9YsYdCNQlbOiKHa2m' | docker login --username AWS --password-stdin $ECR_REGISTRY"
    exit 1
fi
echo "✓ Successfully logged into ECR"
echo

# Step 4: Push the image
echo "Step 4: Pushing image to ECR..."
docker push $ECR_REGISTRY/$REPOSITORY_NAME:$IMAGE_TAG
echo "✓ Image pushed successfully to ECR"
echo

echo "=== Build and Push Complete ==="
echo "Your image is now available at: $ECR_REGISTRY/$REPOSITORY_NAME:$IMAGE_TAG"
