# ==========================================
# TERRAFORM OUTPUTS
# Tech Challenge 2 - FIAP 3FRNT
# ==========================================

output "bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.tech_challenge_bucket.bucket
}

output "bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.tech_challenge_bucket.arn
}

output "bucket_domain_name" {
  description = "Domain name of the S3 bucket"
  value       = aws_s3_bucket.tech_challenge_bucket.bucket_domain_name
}

output "bucket_regional_domain_name" {
  description = "Regional domain name of the S3 bucket"
  value       = aws_s3_bucket.tech_challenge_bucket.bucket_regional_domain_name
}

output "iam_user_name" {
  description = "Name of the IAM user for S3 access"
  value       = aws_iam_user.s3_user.name
}

output "iam_user_arn" {
  description = "ARN of the IAM user for S3 access"
  value       = aws_iam_user.s3_user.arn
}

output "aws_access_key_id" {
  description = "AWS Access Key ID for the S3 user"
  value       = aws_iam_access_key.s3_user_key.id
  sensitive   = true
}

output "aws_secret_access_key" {
  description = "AWS Secret Access Key for the S3 user"
  value       = aws_iam_access_key.s3_user_key.secret
  sensitive   = true
}

# ==========================================
# ECR USER OUTPUTS
# ==========================================

output "ecr_user_name" {
  description = "Name of the IAM user for ECR access"
  value       = aws_iam_user.ecr_user.name
}

output "ecr_user_arn" {
  description = "ARN of the IAM user for ECR access"
  value       = aws_iam_user.ecr_user.arn
}

output "ecr_aws_access_key_id" {
  description = "AWS Access Key ID for the ECR user"
  value       = aws_iam_access_key.ecr_user_key.id
  sensitive   = true
}

output "ecr_aws_secret_access_key" {
  description = "AWS Secret Access Key for the ECR user"
  value       = aws_iam_access_key.ecr_user_key.secret
  sensitive   = true
}

output "cors_configuration" {
  description = "CORS configuration applied to the bucket"
  value = {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = var.cors_origins
    expose_headers = [
      "ETag",
      "x-amz-server-side-encryption", 
      "x-amz-request-id",
      "x-amz-id-2"
    ]
    max_age_seconds = 3000
  }
}

# ==========================================
# ECS OUTPUTS
# ==========================================

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "Name of the ECS service"
  value       = aws_ecs_service.app.name
}

output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = aws_ecr_repository.app.repository_url
}

output "load_balancer_dns" {
  description = "DNS name of the load balancer"
  value       = aws_lb.main.dns_name
}

output "application_url" {
  description = "URL to access the application"
  value       = "http://${aws_lb.main.dns_name}"
}
