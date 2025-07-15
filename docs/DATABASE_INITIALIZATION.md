# Serviço de Inicialização do Banco de Dados

Este projeto inclui um serviço completo para inicializar o banco de dados MongoDB com os dados do arquivo `db.json`.

## Recursos Disponíveis

### 1. Script de Linha de Comando

#### Comandos npm disponíveis:

```bash
# Inicializa o banco (apenas se estiver vazio)
npm run init-db

# Força a reinicialização (remove dados existentes)
npm run init-db:force

# Exibe apenas as estatísticas do banco
npm run db:stats
```

#### Uso direto do script:

```bash
# Inicialização normal
node scripts/initDb.js

# Força reset dos dados
node scripts/initDb.js --force

# Apenas estatísticas
node scripts/initDb.js --stats
```

### 2. Endpoints da API

#### POST `/database/initialize`

Inicializa o banco de dados via API.

**Body (opcional):**

```json
{
  "forceReset": false
}
```

**Resposta de sucesso:**

```json
{
  "success": true,
  "message": "Banco de dados inicializado com sucesso",
  "data": {
    "created": {
      "usersCreated": 6,
      "accountsCreated": 6,
      "transactionsCreated": 30
    },
    "currentStats": {
      "users": 6,
      "accounts": 6,
      "transactions": 30
    }
  }
}
```

#### GET `/database/stats`

Obtém estatísticas do banco de dados.

**Resposta:**

```json
{
  "success": true,
  "message": "Estatísticas obtidas com sucesso",
  "data": {
    "users": 6,
    "accounts": 6,
    "transactions": 30
  }
}
```

#### GET `/database/status`

Verifica se o banco foi inicializado.

**Resposta:**

```json
{
  "success": true,
  "message": "Status obtido com sucesso",
  "data": {
    "isInitialized": true,
    "stats": {
      "users": 6,
      "accounts": 6,
      "transactions": 30
    }
  }
}
```

#### DELETE `/database/clear`

Limpa todos os dados do banco.

### 3. Auto-inicialização no Startup

Para habilitar a auto-inicialização quando a aplicação iniciar, defina a variável de ambiente:

```bash
AUTO_INIT_DB=true
```

Quando habilitada, a aplicação verificará automaticamente se o banco está vazio e o inicializará com os dados do `db.json`.

## Mapeamento de Dados

### Usuários (db.json → MongoDB)

```
db.json users → MongoDB User collection
- id → originalId (para referência)
- name → username
- email → email
- password → password
```

### Transações (db.json → MongoDB)

```
db.json transactions → MongoDB DetailedAccount collection
- id → originalId (para referência)
- type → type
- amount → value
- date → date
- description → from/to
- id_user → accountId (via mapeamento)
```

### Contas

Uma conta padrão do tipo "corrente" é criada automaticamente para cada usuário.

## Exemplos de Uso

### Inicialização via cURL

```bash
# Verificar status
curl -X GET "http://localhost:3000/database/status" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Inicializar banco
curl -X POST "http://localhost:3000/database/initialize" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"forceReset": false}'

# Obter estatísticas
curl -X GET "http://localhost:3000/database/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Usando em Código

```javascript
const DataInitializerService = require("./src/service/dataInitializer");

async function example() {
  const initializer = new DataInitializerService();

  // Verifica se já foi inicializado
  const isInitialized = await initializer.isDataInitialized();

  // Inicializa se necessário
  if (!isInitialized) {
    await initializer.initializeDatabase();
  }

  // Exibe estatísticas
  await initializer.showDatabaseStats();
}
```

## Arquivos Relacionados

- `src/service/dataInitializer.js` - Serviço principal
- `src/controller/Database.js` - Controller para endpoints da API
- `src/middleware/autoInitDb.js` - Middleware para auto-inicialização
- `scripts/initDb.js` - Script de linha de comando
- `db.json` - Dados de origem

## Observações

1. **Segurança**: Os endpoints da API requerem autenticação (Bearer token)
2. **Ambiente**: Funciona tanto com MongoDB em memória (desenvolvimento) quanto MongoDB real (produção)
3. **Idempotência**: A inicialização é segura para executar múltiplas vezes
4. **Logs**: Todos os processos incluem logs detalhados para monitoramento
