# ==========================================
# TERRAFORM BACKEND CONFIGURATION
# Tech Challenge 2 - FIAP 3FRNT
# ==========================================

# Uncomment and configure this block if you want to use remote state storage
# This is recommended for team collaboration and production environments

# terraform {
#   backend "s3" {
#     bucket = "your-terraform-state-bucket"
#     key    = "tech-challenge-2/s3/terraform.tfstate"
#     region = "us-east-1"
#     
#     # Optional: DynamoDB table for state locking
#     dynamodb_table = "terraform-state-lock"
#     encrypt        = true
#   }
# }

# For local development, you can use local backend (default)
# The state file will be stored locally as terraform.tfstate
