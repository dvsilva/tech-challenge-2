# ECS Infrastructure - Tech Challenge 2

Este documento descreve a infraestrutura do Amazon ECS (Elastic Container Service) para a aplicação Node.js do Tech Challenge 2.

## Arquitetura

A infraestrutura ECS inclui:

- **ECS Cluster**: Cluster Fargate para executar as tarefas
- **ECS Service**: Serviço que gerencia as tarefas da aplicação
- **Application Load Balancer (ALB)**: Distribui o tráfego para as instâncias
- **ECR Repository**: Repositório para as imagens Docker
- **Security Groups**: Controle de acesso à rede
- **IAM Roles**: Permissões para ECS e aplicação
- **CloudWatch Logs**: Logs centralizados
- **SSM Parameters**: Armazenamento seguro de secrets

## Pré-requisitos

1. **AWS CLI** configurado com credenciais apropriadas
2. **Terraform** v1.0 ou superior
3. **Docker** instalado localmente
4. **Git** (opcional, para tags de commit)

## Configuração

### 1. Variáveis de Ambiente

Antes de fazer o deploy, configure as seguintes variáveis:

```bash
# MongoDB URI (obrigatório)
export TF_VAR_mongodb_uri="mongodb+srv://user:password@cluster.mongodb.net/database"

# JWT Secret (obrigatório)
export TF_VAR_jwt_secret="your-super-secret-jwt-key"

# Opcional: Override outras configurações
export TF_VAR_desired_count=2
export TF_VAR_cpu=512
export TF_VAR_memory=1024
```

### 2. Inicialização do Terraform

```bash
cd terraform
terraform init
```

## Deploy

### Deploy para Desenvolvimento

```bash
# Deploy da infraestrutura
terraform plan -var-file="environments/dev.tfvars"
terraform apply -var-file="environments/dev.tfvars"

# Build e push da imagem Docker
chmod +x build-and-deploy.sh
./build-and-deploy.sh -e dev -p
```

### Deploy para Produção

```bash
# Deploy da infraestrutura
terraform plan -var-file="environments/prod.tfvars"
terraform apply -var-file="environments/prod.tfvars"

# Build e push da imagem Docker
./build-and-deploy.sh -e prod -p
```

## Comandos Úteis

### Build Local (sem push para ECR)

```bash
./build-and-deploy.sh -e dev
```

### Verificar Status do Serviço ECS

```bash
aws ecs describe-services \
  --cluster tech-challenge-2-dev-cluster \
  --services tech-challenge-2-dev-service
```

### Ver Logs da Aplicação

```bash
aws logs tail /ecs/tech-challenge-2-dev --follow
```

### Forçar Nova Deployment

```bash
aws ecs update-service \
  --cluster tech-challenge-2-dev-cluster \
  --service tech-challenge-2-dev-service \
  --force-new-deployment
```

## Monitoramento

### Health Check

A aplicação tem um health check configurado no endpoint `/docs` (Swagger UI).

### CloudWatch Logs

Os logs são enviados automaticamente para o CloudWatch Logs no grupo `/ecs/{app_name}`.

### Métricas

O ECS cluster tem Container Insights habilitado para métricas detalhadas.

## Troubleshooting

### Problema: Task não inicia

1. Verifique os logs do CloudWatch
2. Confirme que a imagem Docker existe no ECR
3. Verifique se os secrets estão configurados no SSM

```bash
# Verificar se a imagem existe
aws ecr describe-images \
  --repository-name tech-challenge-2-dev \
  --image-ids imageTag=latest

# Verificar secrets no SSM
aws ssm get-parameter \
  --name "/tech-challenge-2-dev/development/mongodb-uri" \
  --with-decryption
```

### Problema: Load Balancer Unhealthy

1. Verifique se a aplicação está respondendo na porta 3000
2. Confirme que o endpoint `/docs` está acessível
3. Verifique os security groups

```bash
# Testar conectividade diretamente na task
aws ecs execute-command \
  --cluster tech-challenge-2-dev-cluster \
  --task TASK_ID \
  --interactive \
  --command "/bin/bash"
```

### Problema: Deploy Falha

1. Verifique as credenciais AWS
2. Confirme que o ECR repository existe
3. Verifique se o Docker está rodando

## Configurações por Ambiente

### Desenvolvimento

- CPU: 256
- Memory: 512 MB
- Desired Count: 1
- Node Environment: development

### Produção

- CPU: 512
- Memory: 1024 MB
- Desired Count: 2
- Node Environment: production

## Segurança

- Todas as secrets são armazenadas no AWS Systems Manager Parameter Store
- As tarefas ECS executam com IAM roles específicas
- Security groups restringem o acesso apenas ao necessário
- Comunicação entre ALB e tasks é feita via rede privada

## Custos

Estimativa mensal para ambiente de desenvolvimento:

- ECS Fargate: ~$15-25
- Application Load Balancer: ~$16
- CloudWatch Logs: ~$1-5
- ECR: ~$1
- **Total**: ~$33-47/mês

## Limpeza

Para destruir a infraestrutura:

```bash
terraform destroy -var-file="environments/dev.tfvars"
```

**Atenção**: Isso irá remover todos os recursos, incluindo dados no S3 (se houver).
