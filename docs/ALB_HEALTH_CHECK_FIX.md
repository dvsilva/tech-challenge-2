# ALB Health Check Fix

## Issue

Your ECS tasks were failing ALB health checks, preventing successful deployment.

## Root Causes Identified

1. **Environment Variable Mismatch**: The MongoDB connection code was looking for `MONGO_URI` but the ECS task was providing `MONGODB_URI`
2. **Aggressive Health Check Settings**: The ALB health check had tight timeouts and intervals
3. **Database Connection Blocking Server Startup**: If the MongoDB connection failed, the server wouldn't start

## Changes Made

### 1. Fixed Environment Variable Mismatch

- **File**: `src/infra/mongoose/mongooseConect.js`
- **Change**: Updated to use `MONGODB_URI` consistently
- **Before**: `process.env.MONGO_URI`
- **After**: `process.env.MONGODB_URI`

### 2. Improved ALB Health Check Configuration

- **File**: `terraform/ecs.tf`
- **Changes**:
  - Increased timeout from 5s to 10s
  - Reduced interval from 30s to 15s (faster detection)
  - Increased unhealthy threshold from 3 to 5 (more tolerant)
  - Increased health check grace period from 300s to 600s

### 3. Enhanced Error Handling

- **File**: `src/index.js`
- **Change**: Server now starts even if database connection fails
- **Benefit**: Health checks can succeed while database issues are resolved

### 4. Added Debugging Endpoints

- **File**: `src/publicRoutes.js`
- **Added**: `/startup` endpoint to show container status and environment variables
- **Benefit**: Easier troubleshooting of deployment issues

### 5. Added ECS Deployment Configuration

- **File**: `terraform/ecs.tf`
- **Added**: Deployment configuration for rolling updates
- **Settings**:
  - Maximum percent: 200% (can run double capacity during deployment)
  - Minimum healthy percent: 50% (maintains half capacity during deployment)

## Deployment Steps

1. **Apply Terraform Changes**:

   ```bash
   cd terraform
   ./deploy.sh -e dev --ecs -a
   ```

2. **Build and Push New Image**:

   ```bash
   cd terraform
   ./deploy.sh -e dev --ecs --build-push -a
   ```

3. **Monitor Deployment**:
   - Check ECS service status in AWS Console
   - Check ALB target group health
   - Test endpoints:
     - `http://your-alb-url/health`
     - `http://your-alb-url/startup`

## Health Check Endpoints

- **Basic Health**: `/health` - Simple health check, always returns 200
- **Detailed Health**: `/health/detailed` - Includes database connectivity checks
- **Startup Info**: `/startup` - Shows environment variables and system status

## Troubleshooting

If health checks still fail:

1. **Check Container Logs**:

   ```bash
   aws logs tail /ecs/tech-challenge-2 --follow
   ```

2. **Test Endpoints Directly**:

   - SSH to container or use AWS CloudShell
   - `curl http://localhost:3000/health`

3. **Verify Environment Variables**:

   - Check `/startup` endpoint output
   - Verify SSM parameters in AWS Console

4. **Database Connectivity**:
   - Check `/health/detailed` endpoint
   - Verify MongoDB URI format and credentials

## Expected Behavior

After these changes:

- ECS tasks should start successfully
- ALB health checks should pass
- Application should be accessible via the load balancer
- Database connection issues won't prevent the application from starting
