# ==========================================

# TERRAFORM S3 INFRASTRUCTURE

# Tech Challenge 2 - FIAP 3FRNT

# ==========================================

Este diretório contém a configuração Terraform para provisionar a infraestrutura AWS S3 necessária para a aplicação Tech Challenge 2.

## Estrutura dos Arquivos

- `main.tf` - Recursos principais (S3 bucket, IAM, policies)
- `variables.tf` - Definições de variáveis
- `outputs.tf` - Outputs dos recursos criados
- `backend.tf` - Configuração do backend do Terraform
- `terraform.tfvars.example` - Exemplo de variáveis de ambiente

## Recursos Criados

### S3 Bucket

- **Nome**: `3frnt-group6-bytebank` (configurável)
- **Versionamento**: Habilitado
- **Criptografia**: AES256
- **CORS**: Configurado para permitir uploads diretos do frontend
- **Lifecycle**: Transição automática para classes de armazenamento mais baratas

### Configuração CORS

```json
{
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
  "AllowedOrigins": [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:4200",
    "http://localhost:8080",
    "http://127.0.0.1:5500",
    "http://127.0.0.1:5501"
  ],
  "ExposeHeaders": [
    "ETag",
    "x-amz-server-side-encryption",
    "x-amz-request-id",
    "x-amz-id-2"
  ],
  "MaxAgeSeconds": 3000
}
```

### IAM Resources

- **IAM User**: `3frnt-group6-bytebank-user`
- **IAM Policy**: Permissões mínimas para operações S3
- **Access Keys**: Geradas automaticamente para o usuário

### Políticas de Segurança

- Criptografia server-side habilitada
- Versionamento de objetos
- Lifecycle policies para otimização de custos
- Configuração de limpeza de uploads incompletos

## Pré-requisitos

1. **Terraform**: Versão >= 1.0
2. **AWS CLI**: Configurado com credenciais válidas
3. **Credenciais AWS**: Com permissões para criar recursos S3 e IAM

### Instalação do Terraform

#### Windows

```bash

# Via Scoop
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

scoop install terraform
```

#### macOS

```bash
# Via Homebrew
brew install terraform
```

#### Linux

```bash
# Download direto
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/
```

## Configuração AWS

### 1. Configurar Credenciais AWS

```bash
# Opção 1: AWS CLI
aws configure

# Opção 2: Variáveis de ambiente
export AWS_ACCESS_KEY_ID="sua-access-key"
export AWS_SECRET_ACCESS_KEY="sua-secret-key"
export AWS_DEFAULT_REGION="us-east-1"
```

### 2. Verificar Permissões

Certifique-se de que suas credenciais AWS tenham as seguintes permissões:

- `s3:*` (para criar e gerenciar buckets S3)
- `iam:*` (para criar usuários e políticas IAM)

## Como Usar

### 1. Preparar Variáveis

```bash
# Copiar arquivo de exemplo
cp terraform.tfvars.example terraform.tfvars

# Editar com suas configurações
vim terraform.tfvars
```

### 2. Inicializar Terraform

```bash
cd terraform
terraform init
```

### 3. Planejar Implantação

```bash
# Visualizar mudanças que serão aplicadas
terraform plan
```

### 4. Aplicar Configuração

```bash
# Aplicar mudanças (será solicitada confirmação)
terraform apply

# Para aplicar automaticamente (usar com cuidado)
terraform apply -auto-approve
```

### 5. Verificar Outputs

```bash
# Ver todos os outputs
terraform output

# Ver output específico
terraform output bucket_name

# Ver outputs sensíveis (access keys)
terraform output -json
```

### 6. Obter Credenciais para Aplicação

```bash
# Salvar credenciais em arquivo .env
echo "AWS_ACCESS_KEY_ID=$(terraform output -raw aws_access_key_id)" >> ../.env
echo "AWS_SECRET_ACCESS_KEY=$(terraform output -raw aws_secret_access_key)" >> ../.env
echo "S3_BUCKET_NAME=$(terraform output -raw bucket_name)" >> ../.env
```

## Ambientes

### Desenvolvimento

```bash
# Usar arquivo de variáveis específico
terraform apply -var-file="environments/dev.tfvars"
```

### Produção

```bash
# Usar arquivo de variáveis de produção
terraform apply -var-file="environments/prod.tfvars"
```

## Customização

### Modificar Origens CORS

Edite o arquivo `terraform.tfvars`:

```hcl
cors_origins = [
  "http://localhost:3000",
  "https://meu-frontend.com",
  "https://meu-app.vercel.app"
]
```

### Alterar Nome do Bucket

```hcl
bucket_name = "meu-projeto-bucket"
```

### Configurar Região Diferente

```hcl
aws_region = "sa-east-1"  # São Paulo
```

## Limpeza

Para remover todos os recursos criados:

```bash
# CUIDADO: Isso irá deletar o bucket e todos os dados
terraform destroy
```

## Troubleshooting

### Erro: Bucket já existe

```
Error: creating S3 Bucket: BucketAlreadyExists
```

**Solução**: Altere o nome do bucket na variável `bucket_name`

### Erro: Permissões insuficientes

```
Error: creating IAM User: AccessDenied
```

**Solução**: Verifique se suas credenciais AWS têm permissões IAM

### Erro: Região não suportada

```
Error: creating S3 Bucket: InvalidLocationConstraint
```

**Solução**: Verifique se a região especificada é válida

## Integração com a Aplicação

Após executar o Terraform, atualize o arquivo `.env` da aplicação com as credenciais geradas:

```bash
# Copiar do .env.example
cp .env.example .env

# Adicionar credenciais do Terraform
terraform output -json | jq -r '
  "AWS_ACCESS_KEY_ID=" + .aws_access_key_id.value,
  "AWS_SECRET_ACCESS_KEY=" + .aws_secret_access_key.value,
  "S3_BUCKET_NAME=" + .bucket_name.value
' >> .env
```

## Monitoramento

### Verificar Status dos Recursos

```bash
# Listar recursos gerenciados
terraform state list

# Ver detalhes de um recurso específico
terraform state show aws_s3_bucket.tech_challenge_bucket
```

### Validar Configuração

```bash
# Validar sintaxe dos arquivos
terraform validate

# Formatar arquivos
terraform fmt
```

## Backup e Estado

### State File

O arquivo `terraform.tfstate` contém o estado atual da infraestrutura. **Faça backup deste arquivo!**

### Backend Remoto (Recomendado para Produção)

Descomente e configure o bloco `backend` em `backend.tf` para usar S3 como backend:

```hcl
terraform {
  backend "s3" {
    bucket = "meu-terraform-state-bucket"
    key    = "tech-challenge-2/s3/terraform.tfstate"
    region = "us-east-1"
  }
}
```

## Segurança

- ✅ Criptografia server-side habilitada
- ✅ Versionamento de objetos
- ✅ Políticas IAM com permissões mínimas
- ✅ Access keys geradas automaticamente
- ✅ CORS configurado adequadamente

## Custos

Os recursos criados podem gerar custos na AWS:

- S3 bucket: Cobrança por armazenamento e transferência
- Requests: Cobrança por operações (GET, PUT, DELETE)
- Lifecycle transitions: Pequena taxa por transição

Para ambiente de desenvolvimento, os custos são tipicamente muito baixos.

## Suporte

Para dúvidas ou problemas:

1. Verifique os logs do Terraform
2. Consulte a documentação oficial da AWS
3. Verifique as permissões IAM
4. Entre em contato com a equipe de desenvolvimento
