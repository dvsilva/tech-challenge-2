# Testes para API de Usuários

Este arquivo contém exemplos de requisições para testar as novas funcionalidades implementadas.

## 1. Registrar um novo usuário

```bash
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Usuário Teste",
    "username": "teste_usuario",
    "email": "teste@email.com",
    "password": "senha123"
  }'
```

## 2. Autenticar usuário

```bash
curl -X POST http://localhost:3000/user/auth \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@email.com",
    "password": "senha123"
  }'
```

## 3. Buscar usuário por ID (substitua {USER_ID} e {TOKEN})

```bash
curl -X GET http://localhost:3000/users/{USER_ID} \
  -H "Authorization: Bearer {TOKEN}"
```

## 4. Atualizar dados do usuário

```bash
curl -X PUT http://localhost:3000/users/{USER_ID} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{
    "name": "Usuário Atualizado",
    "username": "usuario_atualizado",
    "email": "novo_email@email.com"
  }'
```

## 5. Buscar configurações do usuário

```bash
curl -X GET http://localhost:3000/users/{USER_ID}/settings \
  -H "Authorization: Bearer {TOKEN}"
```

## 6. Atualizar configurações do usuário

```bash
curl -X PUT http://localhost:3000/users/{USER_ID}/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{
    "notifications": false,
    "language": "en-US",
    "currency": "USD",
    "twoFactorAuth": true,
    "emailAlerts": false,
    "smsAlerts": true,
    "theme": "dark"
  }'
```

## 7. Alterar senha do usuário

```bash
curl -X PUT http://localhost:3000/users/{USER_ID}/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{
    "currentPassword": "senha123",
    "newPassword": "novaSenha456"
  }'
```

## 8. Excluir usuário

```bash
curl -X DELETE http://localhost:3000/users/{USER_ID} \
  -H "Authorization: Bearer {TOKEN}"
```

## Como usar:

1. Execute o teste 1 para criar um usuário
2. Execute o teste 2 para obter o token
3. Copie o token da resposta e o ID do usuário
4. Substitua {TOKEN} e {USER_ID} nos demais testes
5. Execute os testes na ordem desejada

## Observações:

- Todas as rotas em `/users/*` são protegidas e requerem autenticação
- O token JWT expira em 12 horas
- Ao excluir um usuário, todas as contas e cartões relacionados são removidos
- As configurações têm valores padrão definidos no modelo
- A alteração de senha requer a senha atual para validação
