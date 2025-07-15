# ==========================================
# TERRAFORM CONFIGURATION FOR S3 BUCKET
# Tech Challenge 2 - FIAP 3FRNT
# ==========================================

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# AWS Provider Configuration
provider "aws" {
  region = var.aws_region
}

# S3 Bucket for Tech Challenge 2
resource "aws_s3_bucket" "tech_challenge_bucket" {
  bucket = var.bucket_name

  tags = {
    Name        = "Tech Challenge 2 Bucket"
    Environment = var.environment
    Project     = "FIAP-3FRNT-Tech-Challenge-2"
    Team        = "Group6"
  }
}

# S3 Bucket Versioning
resource "aws_s3_bucket_versioning" "tech_challenge_versioning" {
  bucket = aws_s3_bucket.tech_challenge_bucket.id
  versioning_configuration {
    status = "Suspended"
  }  
}

# S3 Bucket Server Side Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "tech_challenge_encryption" {
  bucket = aws_s3_bucket.tech_challenge_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# S3 Bucket Public Access Block
resource "aws_s3_bucket_public_access_block" "tech_challenge_pab" {
  bucket = aws_s3_bucket.tech_challenge_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# S3 Bucket CORS Configuration
resource "aws_s3_bucket_cors_configuration" "tech_challenge_cors" {
  bucket = aws_s3_bucket.tech_challenge_bucket.id

  cors_rule {
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

# IAM User for Application Access
resource "aws_iam_user" "s3_user" {
  name = "${var.bucket_name}-user"
  path = "/"

  tags = {
    Name        = "S3 User for Tech Challenge 2"
    Environment = var.environment
    Project     = "FIAP-3FRNT-Tech-Challenge-2"
  }
}

# IAM Access Key for S3 User
resource "aws_iam_access_key" "s3_user_key" {
  user = aws_iam_user.s3_user.name
}

# IAM Policy for S3 Access
resource "aws_iam_policy" "s3_policy" {
  name        = "${var.bucket_name}-policy"
  description = "Policy for S3 bucket access in Tech Challenge 2"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowS3BucketAccess"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket",
          "s3:GetObjectVersion",
          "s3:DeleteObjectVersion"
        ]
        Resource = [
          aws_s3_bucket.tech_challenge_bucket.arn,
          "${aws_s3_bucket.tech_challenge_bucket.arn}/*"
        ]
      }
    ]
  })
}

# Attach Policy to User
resource "aws_iam_user_policy_attachment" "s3_user_policy_attachment" {
  user       = aws_iam_user.s3_user.name
  policy_arn = aws_iam_policy.s3_policy.arn
}

# ==========================================
# ECR USER AND PERMISSIONS
# ==========================================

# IAM User for ECR Access
resource "aws_iam_user" "ecr_user" {
  name = "${var.bucket_name}-ecr-user"
  path = "/"

  tags = {
    Name        = "ECR User for Tech Challenge 2"
    Environment = var.environment
    Project     = "FIAP-3FRNT-Tech-Challenge-2"
  }
}

# IAM Access Key for ECR User
resource "aws_iam_access_key" "ecr_user_key" {
  user = aws_iam_user.ecr_user.name
}

# IAM Policy for ECR Access
resource "aws_iam_policy" "ecr_policy" {
  name        = "${var.bucket_name}-ecr-policy"
  description = "Policy for ECR access in Tech Challenge 2"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowECRAccess"
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:PutImage",
          "ecr:ListImages",
          "ecr:DescribeImages",
          "ecr:DescribeRepositories"
        ]
        Resource = "*"
      }
    ]
  })
}

# Attach ECR Policy to ECR User
resource "aws_iam_user_policy_attachment" "ecr_user_policy_attachment" {
  user       = aws_iam_user.ecr_user.name
  policy_arn = aws_iam_policy.ecr_policy.arn
}

# S3 Bucket Lifecycle Configuration
resource "aws_s3_bucket_lifecycle_configuration" "tech_challenge_lifecycle" {
  bucket = aws_s3_bucket.tech_challenge_bucket.id

  rule {
    id     = "delete_incomplete_multipart_uploads"
    status = "Enabled"

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }

  rule {
    id     = "transition_to_ia"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    transition {
      days          = 365
      storage_class = "DEEP_ARCHIVE"
    }
  }
}

# S3 Bucket Notification Configuration (Optional - for future use)
resource "aws_s3_bucket_notification" "tech_challenge_notification" {
  bucket = aws_s3_bucket.tech_challenge_bucket.id
}
