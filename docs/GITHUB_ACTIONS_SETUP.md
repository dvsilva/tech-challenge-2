# GitHub Actions Setup for AWS ECR

This repository contains GitHub Actions workflows to automatically build and push Docker images to AWS ECR.

## Workflows

### 1. `build-and-push.yml` - Simple ECR Push

- Triggers on push to `main`, `master`, or `develop` branches
- Can be manually triggered from GitHub UI
- Builds Docker image and pushes to ECR with commit SHA and `latest` tags

### 2. `deploy-to-ecr.yml` - ECR Push + ECS Deployment

- Same triggers as above
- Additionally updates ECS service after pushing to ECR
- More comprehensive deployment pipeline

## Setup Instructions

### 1. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add these secrets:

| Secret Name             | Value                   | Description                |
| ----------------------- | ----------------------- | -------------------------- |
| `AWS_ACCESS_KEY_ID`     | `AWS_ACCESS_KEY_ID`     | Your AWS Access Key ID     |
| `AWS_SECRET_ACCESS_KEY` | `AWS_SECRET_ACCESS_KEY` | Your AWS Secret Access Key |

### 2. Verify ECR Repository

Make sure your ECR repository exists:

- Registry: `672508880349.dkr.ecr.us-east-1.amazonaws.com`
- Repository: `tech-challenge-2`
- Region: `us-east-1`

### 3. Push Your Code

Once the secrets are configured, simply push your code to trigger the workflow:

```bash
git add .
git commit -m "Add GitHub Actions for ECR deployment"
git push origin main
```

### 4. Monitor the Workflow

1. Go to your GitHub repository
2. Click on the "Actions" tab
3. You'll see the workflow running
4. Click on the workflow run to see detailed logs

## Manual Trigger

You can also trigger the workflow manually:

1. Go to GitHub → Actions tab
2. Select the workflow
3. Click "Run workflow"
4. Choose the branch and click "Run workflow"

## Expected Output

After successful execution, your Docker image will be available at:

- `672508880349.dkr.ecr.us-east-1.amazonaws.com/tech-challenge-2:latest`
- `672508880349.dkr.ecr.us-east-1.amazonaws.com/tech-challenge-2:<commit-sha>`

## Troubleshooting

### Common Issues:

1. **Authentication Failed**: Verify AWS credentials in GitHub secrets
2. **ECR Repository Not Found**: Ensure the repository exists in ECR
3. **Permission Denied**: Check IAM permissions for ECR operations
4. **Docker Build Failed**: Check Dockerfile syntax and dependencies

### Required IAM Permissions:

Your AWS user should have these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:GetAuthorizationToken",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    }
  ]
}
```

## Next Steps

1. Add the GitHub secrets
2. Push your code
3. Monitor the GitHub Actions execution
4. Verify the image in ECR console
5. Update your ECS service to use the new image (if using ECS)
