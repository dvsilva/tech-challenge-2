# ECR Integration Guide

This document explains how to use the separate ECR user created for Docker image management in the Tech Challenge 2 project.

## Overview

The Terraform configuration now creates two separate IAM users:

1. **S3 User** (`fiap-3frnt-group6-bytebank-user`) - For S3 operations only
2. **ECR User** (`fiap-3frnt-group6-bytebank-ecr-user`) - For ECR operations only

This separation follows the principle of least privilege, ensuring each user has only the permissions they need.

## ECR User Permissions

The ECR user has the following permissions:

- `ecr:GetAuthorizationToken` - Login to ECR
- `ecr:BatchCheckLayerAvailability` - Check if image layers exist
- `ecr:GetDownloadUrlForLayer` - Download image layers
- `ecr:BatchGetImage` - Pull images
- `ecr:InitiateLayerUpload` - Start uploading image layers
- `ecr:UploadLayerPart` - Upload image layer parts
- `ecr:CompleteLayerUpload` - Complete layer upload
- `ecr:PutImage` - Push complete images
- `ecr:ListImages` - List repository images
- `ecr:DescribeImages` - Get image details
- `ecr:DescribeRepositories` - Get repository details

## Getting ECR Credentials

After applying the Terraform configuration, you can get the ECR credentials using:

```bash
# Get ECR Access Key ID
terraform output ecr_aws_access_key_id

# Get ECR Secret Access Key
terraform output ecr_aws_secret_access_key

# Get ECR Repository URL
terraform output ecr_repository_url
```

## Manual ECR Login

If you want to login to ECR manually:

```bash
# Set ECR user credentials
export AWS_ACCESS_KEY_ID="your-ecr-access-key"
export AWS_SECRET_ACCESS_KEY="your-ecr-secret-key"
export AWS_DEFAULT_REGION="us-east-1"

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-ecr-repository-url
```

## Automated Deployment Scripts

We've provided two scripts for automated ECR deployment:

### Linux/macOS/WSL (Bash)

```bash
chmod +x ecr-deploy.sh
./ecr-deploy.sh
```

### Windows (Batch)

```cmd
ecr-deploy.cmd
```

Both scripts will:

1. Check for required dependencies (AWS CLI, Docker, Terraform)
2. Retrieve ECR credentials from Terraform outputs
3. Configure AWS credentials for the ECR user
4. Login to ECR
5. Build the Docker image
6. Tag the image for ECR
7. Push the image to ECR

## Troubleshooting

### Common Issues

1. **"ecr:GetAuthorizationToken" permission denied**

   - Make sure you're using the ECR user credentials, not the S3 user credentials
   - Verify the ECR user policy is attached correctly

2. **"Repository does not exist"**

   - Make sure you've applied the Terraform configuration that creates the ECR repository
   - Check that the repository URL is correct

3. **Docker login fails**

   - Verify AWS credentials are set correctly
   - Check that AWS CLI is configured with the right region

4. **Image push fails**
   - Make sure the image is tagged correctly
   - Verify you're logged in to ECR
   - Check that the repository name matches exactly

### Verification Commands

```bash
# Check if ECR user can authenticate
aws ecr get-authorization-token --region us-east-1

# List ECR repositories
aws ecr describe-repositories --region us-east-1

# List images in repository
aws ecr list-images --repository-name tech-challenge-2 --region us-east-1
```

## Environment Variables for CI/CD

If you're using CI/CD pipelines, set these environment variables:

```bash
ECR_AWS_ACCESS_KEY_ID=your-ecr-access-key
ECR_AWS_SECRET_ACCESS_KEY=your-ecr-secret-key
ECR_REPOSITORY_URL=your-ecr-repository-url
AWS_DEFAULT_REGION=us-east-1
```

## Security Best Practices

1. **Rotate Access Keys Regularly** - Consider rotating the ECR user access keys periodically
2. **Use IAM Roles in Production** - For production environments, prefer IAM roles over IAM users
3. **Monitor Usage** - Monitor ECR access patterns in CloudTrail
4. **Limit IP Ranges** - Consider adding IP restrictions to the ECR policy if needed

## SSM Parameter Store

The ECR credentials are also stored in AWS Systems Manager Parameter Store:

- ECR Access Key: `/{app_name}/{environment}/ecr-aws-access-key-id`
- ECR Secret Key: `/{app_name}/{environment}/ecr-aws-secret-access-key`

These can be accessed by your ECS tasks for runtime ECR operations.
