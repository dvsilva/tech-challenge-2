# ==========================================
# SIMPLIFIED ECS INFRASTRUCTURE
# Tech Challenge 2 - FIAP 3FRNT
# ==========================================

# Get default VPC and subnets
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# ==========================================
# SECURITY GROUPS
# ==========================================

# ALB Security Group
resource "aws_security_group" "alb" {
  name_prefix = "${var.app_name}-alb-"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-alb-sg"
  }
}

# ECS Security Group
resource "aws_security_group" "ecs" {
  name_prefix = "${var.app_name}-ecs-"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port       = var.app_port
    to_port         = var.app_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-ecs-sg"
  }
}

# ==========================================
# APPLICATION LOAD BALANCER
# ==========================================

resource "aws_lb" "main" {
  name               = "${var.app_name}-alb"
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = data.aws_subnets.default.ids

  tags = {
    Name = "${var.app_name}-alb"
  }
}

resource "aws_lb_target_group" "app" {
  name        = "${var.app_name}-tg"
  port        = var.app_port
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.default.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 5
    timeout             = 10
    interval            = 15
    path                = "/health"
    matcher             = "200"
    protocol            = "HTTP"
    port                = "traffic-port"
  }

  tags = {
    Name = "${var.app_name}-tg"
  }
}

resource "aws_lb_listener" "app" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}

# ==========================================
# ECR REPOSITORY
# ==========================================

resource "aws_ecr_repository" "app" {
  name = var.app_name

  tags = {
    Name = "${var.app_name}-ecr"
  }
}

# ==========================================
# ECS CLUSTER & SERVICE
# ==========================================

resource "aws_ecs_cluster" "main" {
  name = "${var.app_name}-cluster"

  tags = {
    Name = "${var.app_name}-cluster"
  }
}

# IAM Role for ECS Task Execution
resource "aws_iam_role" "ecs_execution_role" {
  name = "${var.app_name}-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.app_name}-execution-role"
  }
}

resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# IAM Policy for SSM Parameter access
resource "aws_iam_policy" "ssm_policy" {
  name        = "${var.app_name}-ssm-policy"
  description = "Policy to allow ECS execution role to access SSM parameters"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameters",
          "ssm:GetParameter"
        ]
        Resource = [
          "arn:aws:ssm:${var.aws_region}:*:parameter/${var.app_name}/${var.environment}/*"
        ]
      }
    ]
  })

  tags = {
    Name = "${var.app_name}-ssm-policy"
  }
}

# Attach SSM policy to execution role
resource "aws_iam_role_policy_attachment" "ecs_execution_ssm_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = aws_iam_policy.ssm_policy.arn
}

# IAM Role for ECS Task (Application permissions)
resource "aws_iam_role" "ecs_task_role" {
  name = "${var.app_name}-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.app_name}-task-role"
  }
}

# Attach ECR policy to task role
resource "aws_iam_role_policy_attachment" "ecs_task_ecr_policy" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.ecr_policy.arn
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/${var.app_name}"
  retention_in_days = 7

  tags = {
    Name = "${var.app_name}-logs"
  }
}

# SSM Parameters for secrets
resource "aws_ssm_parameter" "mongodb_uri" {
  name  = "/${var.app_name}/${var.environment}/mongodb-uri"
  type  = "SecureString"
  value = var.mongodb_uri != "" ? var.mongodb_uri : "mongodb://localhost:27017/tech-challenge-2"

  tags = {
    Name = "${var.app_name}-mongodb-uri"
  }
}

resource "aws_ssm_parameter" "jwt_secret" {
  name  = "/${var.app_name}/${var.environment}/jwt-secret"
  type  = "SecureString"
  value = var.jwt_secret

  tags = {
    Name = "${var.app_name}-jwt-secret"
  }
}

resource "aws_ssm_parameter" "aws_access_key" {
  name  = "/${var.app_name}/${var.environment}/aws-access-key-id"
  type  = "SecureString"
  value = aws_iam_access_key.s3_user_key.id

  tags = {
    Name = "${var.app_name}-aws-access-key"
  }
}

resource "aws_ssm_parameter" "aws_secret_key" {
  name  = "/${var.app_name}/${var.environment}/aws-secret-access-key"
  type  = "SecureString"
  value = aws_iam_access_key.s3_user_key.secret

  tags = {
    Name = "${var.app_name}-aws-secret-key"
  }
}

# ECR User SSM Parameters
resource "aws_ssm_parameter" "ecr_aws_access_key" {
  name  = "/${var.app_name}/${var.environment}/ecr-aws-access-key-id"
  type  = "SecureString"
  value = aws_iam_access_key.ecr_user_key.id

  tags = {
    Name = "${var.app_name}-ecr-aws-access-key"
  }
}

resource "aws_ssm_parameter" "ecr_aws_secret_key" {
  name  = "/${var.app_name}/${var.environment}/ecr-aws-secret-access-key"
  type  = "SecureString"
  value = aws_iam_access_key.ecr_user_key.secret

  tags = {
    Name = "${var.app_name}-ecr-aws-secret-key"
  }
}

# ECS Task Definition
resource "aws_ecs_task_definition" "app" {
  family                   = var.app_name
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name  = var.app_name
      image = "${aws_ecr_repository.app.repository_url}:latest"
      
      portMappings = [
        {
          containerPort = var.app_port
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "NODE_ENV"
          value = var.node_env
        },
        {
          name  = "PORT"
          value = tostring(var.app_port)
        },
        {
          name  = "AWS_REGION"
          value = var.aws_region
        },
        {
          name  = "S3_BUCKET_NAME"
          value = var.bucket_name
        },
        {
          name  = "SIGNED_URL_EXPIRES"
          value = tostring(var.signed_url_expires)
        },
        {
          name  = "CORS_ORIGIN"
          value = join(",", var.cors_origins)
        }
      ]

      secrets = [
        {
          name      = "MONGODB_URI"
          valueFrom = aws_ssm_parameter.mongodb_uri.arn
        },
        {
          name      = "JWT_SECRET"
          valueFrom = aws_ssm_parameter.jwt_secret.arn
        },
        {
          name      = "AWS_ACCESS_KEY_ID"
          valueFrom = aws_ssm_parameter.aws_access_key.arn
        },
        {
          name      = "AWS_SECRET_ACCESS_KEY"
          valueFrom = aws_ssm_parameter.aws_secret_key.arn
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.app.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }

      essential = true
    }
  ])

  tags = {
    Name = "${var.app_name}-task-definition"
  }
}

# ECS Service
resource "aws_ecs_service" "app" {
  name            = "${var.app_name}-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  # Give ECS time to start up before registering with load balancer
  health_check_grace_period_seconds = 600

  deployment_maximum_percent         = 200
  deployment_minimum_healthy_percent = 50

  network_configuration {
    security_groups  = [aws_security_group.ecs.id]
    subnets          = data.aws_subnets.default.ids
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = var.app_name
    container_port   = var.app_port
  }

  depends_on = [aws_lb_listener.app]

  tags = {
    Name = "${var.app_name}-service"
  }
}
