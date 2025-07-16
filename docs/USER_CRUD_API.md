# API de Gerenciamento de Usuários - Documentação

Este documento descreve as novas funcionalidades de CRUD completo para usuários e operações adicionais implementadas na API.

## Endpoints Implementados

### 1. Operações de Autenticação (Rotas Públicas)

#### Listar Usuários

- **GET** `/user`
- **Descrição**: Lista todos os usuários cadastrados
- **Tag**: Operações de Autenticação
- **Autenticação**: Não requerida

#### Registrar Usuário

- **POST** `/user`
- **Descrição**: Registra um novo usuário no sistema
- **Tag**: Operações de Autenticação
- **Autenticação**: Não requerida
- **Body**:

```json
{
  "name": "João Silva",
  "username": "joao_silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```

#### Autenticar Usuário

- **POST** `/user/auth`
- **Descrição**: Autentica um usuário e retorna um token JWT
- **Tag**: Operações de Autenticação
- **Autenticação**: Não requerida
- **Body**:

```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

### 2. Operações de Usuário (Rotas Protegidas)

Todas as rotas a seguir requerem autenticação via Bearer Token.

#### Buscar Usuário por ID

- **GET** `/users/{id}`
- **Descrição**: Busca um usuário específico pelo ID
- **Tag**: Operações de Autenticação
- **Autenticação**: Bearer Token
- **Parâmetros**:
  - `id` (path): ID do usuário

#### Atualizar Usuário

- **PUT** `/users/{id}`
- **Descrição**: Atualiza dados do usuário (name, username e email)
- **Tag**: Operações de Autenticação
- **Autenticação**: Bearer Token
- **Parâmetros**:
  - `id` (path): ID do usuário
- **Body**:

```json
{
  "name": "João Silva Atualizado",
  "username": "joao_silva_updated",
  "email": "joao.updated@email.com"
}
```

#### Excluir Usuário

- **DELETE** `/users/{id}`
- **Descrição**: Exclui um usuário e todos os dados relacionados (contas, cartões)
- **Tag**: Operações de Autenticação
- **Autenticação**: Bearer Token
- **Parâmetros**:
  - `id` (path): ID do usuário

#### Alterar Senha

- **PUT** `/users/{id}/change-password`
- **Descrição**: Altera a senha do usuário
- **Tag**: Operações de Autenticação
- **Autenticação**: Bearer Token
- **Parâmetros**:
  - `id` (path): ID do usuário
- **Body**:

```json
{
  "currentPassword": "senha123",
  "newPassword": "novaSenha456"
}
```

### 3. Configurações do Usuário

#### Buscar Configurações

- **GET** `/users/{id}/settings`
- **Descrição**: Busca as configurações do usuário
- **Tag**: Operações de Autenticação
- **Autenticação**: Bearer Token
- **Parâmetros**:
  - `id` (path): ID do usuário

#### Atualizar Configurações

- **PUT** `/users/{id}/settings`
- **Descrição**: Atualiza as configurações do usuário
- **Tag**: Operações de Autenticação
- **Autenticação**: Bearer Token
- **Parâmetros**:
  - `id` (path): ID do usuário
- **Body**:

```json
{
  "notifications": true,
  "language": "pt-BR",
  "currency": "BRL",
  "twoFactorAuth": false,
  "emailAlerts": true,
  "smsAlerts": false,
  "theme": "light"
}
```

## Configurações Disponíveis

| Campo           | Tipo    | Padrão  | Descrição                    |
| --------------- | ------- | ------- | ---------------------------- |
| `notifications` | boolean | true    | Receber notificações         |
| `language`      | string  | "pt-BR" | Idioma preferido             |
| `currency`      | string  | "BRL"   | Moeda padrão                 |
| `twoFactorAuth` | boolean | false   | Autenticação de dois fatores |
| `emailAlerts`   | boolean | true    | Alertas por email            |
| `smsAlerts`     | boolean | false   | Alertas por SMS              |
| `theme`         | string  | "light" | Tema da interface            |

## Schemas Swagger

### User

Esquema principal do usuário com todos os campos incluindo configurações.

### UserSettings

Esquema específico para configurações do usuário.

### UserUpdate

Esquema para atualização de dados do usuário (apenas campos permitidos).

### UserRegistration

Esquema para registro de novo usuário.

### UserLogin

Esquema para autenticação do usuário.

### PasswordChange

Esquema para alteração de senha.

### AuthResponse

Esquema de resposta da autenticação com token JWT.

## Funcionalidades Implementadas

1. **CRUD Completo**: Create, Read, Update, Delete para usuários
2. **Autenticação JWT**: Login e proteção de rotas
3. **Configurações Personalizadas**: Sistema de preferências do usuário
4. **Segurança**: Alteração de senha com validação
5. **Integridade de Dados**: Exclusão em cascata (usuário → contas → cartões)
6. **Documentação Swagger**: Schemas e endpoints completamente documentados
7. **Validação de Dados**: Validação de campos obrigatórios e permitidos
8. **Tratamento de Erros**: Respostas de erro apropriadas para cada situação

## Exemplo de Fluxo de Uso

1. **Registrar usuário**: `POST /user`
2. **Autenticar**: `POST /user/auth` → recebe token
3. **Buscar dados**: `GET /users/{id}` (com token)
4. **Atualizar perfil**: `PUT /users/{id}` (com token)
5. **Configurar preferências**: `PUT /users/{id}/settings` (com token)
6. **Alterar senha**: `PUT /users/{id}/change-password` (com token)

Todas as operações protegidas devem incluir o header:

```
Authorization: Bearer {token}
```
