# Resumo das Alterações - Campo 'name' para Usuário

## Alterações Realizadas

### 1. Modelo User (src/models/User.js)

- ✅ Adicionado campo `name` ao construtor
- ✅ Incluído `name` na validação `isValid()`
- ✅ Campo `name` agora é obrigatório

### 2. Schema Mongoose (src/infra/mongoose/modelos.js)

- ✅ Adicionado campo `name` ao UserSchema
- ✅ Definido como obrigatório (`required: true`)
- ✅ Campo posicionado antes de `username`

### 3. Feature updateUser (src/feature/User/updateUser.js)

- ✅ Adicionado `name` aos campos permitidos para atualização
- ✅ Array `allowedFields` agora inclui: `["name", "username", "email"]`

### 4. Documentação Swagger (src/routes.js)

- ✅ Schema `User` atualizado com campo `name`
- ✅ Schema `UserUpdate` atualizado com campo `name`
- ✅ Exemplos e descrições incluídos

### 5. Rotas Públicas (src/publicRoutes.js)

- ✅ Schema de criação de usuário atualizado
- ✅ Campo `name` incluído na documentação da rota POST /user
- ✅ Exemplo e descrição adicionados

### 6. Documentação (docs/USER_CRUD_API.md)

- ✅ Exemplos de JSON atualizados para incluir campo `name`
- ✅ Descrição de atualização alterada para incluir `name`
- ✅ Documentação dos schemas atualizada

### 7. Testes (docs/USER_API_TESTS.md)

- ✅ Exemplo de criação de usuário atualizado
- ✅ Exemplo de atualização de usuário atualizado
- ✅ Comandos curl atualizados

## Estrutura do Campo 'name'

```javascript
{
  name: {
    type: String,
    required: true,
    description: "Nome completo do usuário",
    example: "João Silva"
  }
}
```

## Exemplo de Uso

### Criar Usuário

```json
{
  "name": "João Silva",
  "username": "joao_silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```

### Atualizar Usuário

```json
{
  "name": "João Silva Atualizado",
  "username": "joao_silva_updated",
  "email": "joao.updated@email.com"
}
```

## Validações

- Campo `name` é **obrigatório** na criação
- Campo `name` pode ser atualizado via PUT /users/{id}
- Campo `name` é validado no método `isValid()` do modelo
- Campo `name` é persistido no MongoDB com schema validation

## Endpoints Afetados

1. **POST /user** - Criação de usuário (campo obrigatório)
2. **PUT /users/{id}** - Atualização de usuário (campo opcional)
3. **GET /users/{id}** - Retorna o campo `name` na resposta
4. **GET /user** - Lista usuários com campo `name`

## Migração de Dados

⚠️ **Atenção**: Usuários existentes sem o campo `name` podem precisar de migração no banco de dados, pois o campo agora é obrigatório.

## Testes Recomendados

1. Criar usuário com campo `name`
2. Tentar criar usuário sem campo `name` (deve falhar)
3. Atualizar campo `name` de usuário existente
4. Verificar retorno do campo `name` nas consultas
