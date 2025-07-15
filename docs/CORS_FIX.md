# CORS Fix for Tech Challenge 2

## Problem

The Swagger UI at `http://tech-challenge-2-alb-1096144064.us-east-1.elb.amazonaws.com/docs/#/Health/get_health_detailed` was returning:

```
Failed to fetch.
Possible Reasons:
CORS
Network Failure
URL scheme must be "http" or "https" for CORS request.
```

## Root Causes

1. **Missing HTTPS support**: Modern browsers require HTTPS for CORS requests
2. **Incomplete CORS origins**: The ALB URL wasn't properly included in CORS configuration
3. **Swagger server misconfiguration**: Swagger only listed localhost as a server
4. **Limited CORS headers**: Missing some headers required for Swagger UI

## Solutions Implemented

### 1. Enhanced CORS Configuration (`src/index.js`)

- Added dynamic origin checking function
- Included additional HTTP methods (PATCH)
- Added more allowed headers (X-Requested-With, Accept, Origin)
- Added exposed headers for better compatibility
- Enhanced logging for debugging CORS issues

### 2. Updated Terraform Configuration

- **Security Groups** (`terraform/ecs.tf`): Added port 443 for HTTPS support
- **Variables** (`terraform/variables.tf`): Added `alb_dns_name` variable for configuration
- **ECS Environment**: Added ALB URLs to CORS_ORIGIN environment variable
- **New Environment Variables**: Added `ALB_URL` and `ALB_HTTPS_URL` for dynamic configuration

### 3. Dynamic Swagger Configuration (`src/swagger.js`)

- Added ALB URLs as server options
- Made server configuration dynamic based on environment variables
- Support for both HTTP and HTTPS versions

### 4. Explicit CORS Preflight Handling (`src/index.js`)

- Added explicit OPTIONS handling for health endpoints
- Ensures preflight requests are properly handled

## Files Modified

- `src/index.js` - Enhanced CORS configuration
- `src/swagger.js` - Dynamic server configuration
- `terraform/variables.tf` - Added ALB DNS variable and updated CORS origins
- `terraform/ecs.tf` - Added HTTPS support and environment variables

## Deployment Steps

### Option 1: Using the provided scripts

```bash
# For Linux/Mac
chmod +x fix-cors-deploy.sh
./fix-cors-deploy.sh

# For Windows
fix-cors-deploy.cmd
```

### Option 2: Manual deployment

1. **Update ECR repository URL** in the deployment scripts
2. **Build and push Docker image**:

   ```bash
   docker build -t tech-challenge-2:cors-fix .
   docker tag tech-challenge-2:cors-fix YOUR_ECR_REPO:cors-fix
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_REPO
   docker push YOUR_ECR_REPO:cors-fix
   ```

3. **Apply Terraform changes**:
   ```bash
   cd terraform
   terraform plan -var="alb_dns_name=tech-challenge-2-alb-1096144064.us-east-1.elb.amazonaws.com"
   terraform apply -auto-approve
   ```

## Testing the Fix

### Option 1: Using the test script

```bash
chmod +x test-cors.sh
./test-cors.sh
```

### Option 2: Manual testing

1. **Check CORS headers**:

   ```bash
   curl -i -X OPTIONS "http://tech-challenge-2-alb-1096144064.us-east-1.elb.amazonaws.com/health/detailed" \
     -H "Origin: http://tech-challenge-2-alb-1096144064.us-east-1.elb.amazonaws.com" \
     -H "Access-Control-Request-Method: GET"
   ```

2. **Test in browser**: Visit the Swagger UI and try the endpoints again

## Expected Results

After applying these fixes:

- ✅ Swagger UI should successfully fetch data from health endpoints
- ✅ CORS headers should be present in responses
- ✅ Both HTTP and HTTPS should be supported (if SSL certificate is configured)
- ✅ No more "Failed to fetch" errors in Swagger UI

## Additional Notes

### HTTPS Support

- The ALB security group now allows port 443
- To enable HTTPS, you'll need to configure an SSL certificate on the ALB
- Consider using AWS Certificate Manager (ACM) for free SSL certificates

### Environment Variables Added

- `CORS_ORIGIN`: Includes both localhost and ALB URLs
- `ALB_URL`: HTTP version of ALB URL
- `ALB_HTTPS_URL`: HTTPS version of ALB URL

### Security Considerations

- CORS is now properly configured to only allow specific origins
- Credentials are supported for authenticated requests
- All necessary headers are exposed for API functionality

## Troubleshooting

### If CORS issues persist:

1. Check browser developer tools for specific CORS error messages
2. Verify the `CORS_ORIGIN` environment variable includes your domain
3. Ensure the ALB URL is correct and accessible
4. Test with both HTTP and HTTPS protocols

### If HTTPS doesn't work:

1. Configure an SSL certificate on the ALB
2. Update DNS or use a custom domain
3. Check ALB listener configuration for port 443

### Debug CORS configuration:

```bash
# Check current CORS environment variable
kubectl exec -it <pod-name> -- env | grep CORS

# Or in ECS task
aws ecs describe-tasks --cluster your-cluster --tasks your-task-id
```
