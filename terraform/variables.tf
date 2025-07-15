# ==========================================
# TERRAFORM VARIABLES
# Tech Challenge 2 - FIAP 3FRNT
# ==========================================

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "bucket_name" {
  description = "Name of the S3 bucket"
  type        = string
  default     = "3frnt-group6-bytebank"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "development"
}

variable "cors_origins" {
  description = "List of allowed CORS origins"
  type        = list(string)
  default = [
    "http://localhost:3000",
    "http://localhost:3001", 
    "http://localhost:4200",
    "http://localhost:8080",
    "http://127.0.0.1:5500",
    "http://127.0.0.1:5501"
  ]
}

variable "signed_url_expires" {
  description = "Expiration time for signed URLs in seconds"
  type        = number
  default     = 3600
}

# ==========================================
# ECS VARIABLES
# ==========================================

variable "app_name" {
  description = "Name of the application"
  type        = string
  default     = "tech-challenge-2"
}

variable "app_port" {
  description = "Port on which the application runs"
  type        = number
  default     = 3000
}

variable "cpu" {
  description = "CPU units for the ECS task"
  type        = number
  default     = 512
}

variable "memory" {
  description = "Memory in MB for the ECS task"
  type        = number
  default     = 1024
}

variable "desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 2
}

variable "mongodb_uri" {
  description = "MongoDB connection URI"
  type        = string
  default     = ""
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  default     = "your-secret-key"
  sensitive   = true
}

variable "node_env" {
  description = "Node.js environment"
  type        = string
  default     = "production"
}
