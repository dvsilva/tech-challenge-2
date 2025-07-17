# Inicialização de Investimentos

Este documento descreve como inicializar dados de investimentos no sistema automaticamente.

## Visão Geral

O sistema agora suporta a criação automática de dados de massa para investimentos, permitindo desenvolvimento e testes locais com dados realistas.

## Dados de Investimentos Disponíveis

O arquivo `db.json` contém 12 investimentos diversificados distribuídos entre os usuários:

### Tipos de Investimentos:

- **CDB** (Certificado de Depósito Bancário)
- **LCI** (Letra de Crédito Imobiliário)
- **LCA** (Letra de Crédito do Agronegócio)
- **Tesouro Direto**
- **Fundos de Investimento**
- **Fundos Imobiliários (FII)**
- **Ações**
- **Criptomoedas**
- **Debêntures**

### Níveis de Risco:

- **Baixo**: CDB, LCI, LCA, Tesouro Direto
- **Médio**: Fundos de Investimento, FII, Debêntures
- **Alto**: Ações, Criptomoedas

## Como Utilizar

### 1. Via NPM Scripts

#### Inicializar apenas investimentos:

```bash
npm run init-investments
```

#### Forçar reinicialização dos investimentos (remove existentes):

```bash
npm run init-investments:force
```

#### Inicialização completa (usuários, contas, transações e investimentos):

```bash
npm run init-db
```

#### Ver estatísticas do banco:

```bash
npm run db:stats
```

### 2. Via Script Direto

```bash
# Apenas investimentos
node scripts/initDb.js --investments-only

# Forçar reset dos investimentos
node scripts/initDb.js --investments-only --force

# Ver estatísticas
node scripts/initDb.js --stats
```

### 3. Via API REST

#### Inicializar investimentos:

```http
POST /api/database/initialize-investments
Content-Type: application/json

{
  "forceReset": false
}
```

#### Ver estatísticas:

```http
GET /api/database/stats
```

## Pré-requisitos

Para inicializar apenas investimentos, é necessário que já existam:

- Usuários cadastrados no banco
- Contas criadas para os usuários

Se não existirem usuários e contas, use primeiro:

```bash
npm run init-db
```

## Estrutura dos Dados de Investimentos

Cada investimento contém:

```json
{
  "id": "inv1",
  "type": "CDB",
  "name": "CDB Banco Seguro - 120% CDI",
  "value": 5000.0,
  "id_user": "u1",
  "dateCreated": "2025-01-15T10:00:00.000Z",
  "maturityDate": "2026-01-15T10:00:00.000Z",
  "interestRate": 1.2,
  "riskLevel": "baixo"
}
```

### Campos:

- **id**: Identificador único do investimento
- **type**: Tipo do investimento
- **name**: Nome descritivo do produto
- **value**: Valor investido
- **id_user**: ID do usuário proprietário
- **dateCreated**: Data de criação do investimento
- **maturityDate**: Data de vencimento (null para investimentos sem vencimento)
- **interestRate**: Taxa de juros (null para investimentos variáveis)
- **riskLevel**: Nível de risco (baixo, medio, alto)

## Ambiente de Desenvolvimento

Para desenvolvimento local, configure as variáveis de ambiente:

```env
# .env
AUTO_INIT_DB=true
NODE_ENV=development
```

Com `AUTO_INIT_DB=true`, o sistema inicializará automaticamente todos os dados (incluindo investimentos) na primeira execução.

## Verificando os Dados

Após a inicialização, você pode verificar se os investimentos foram criados:

1. **Via API**:

   ```http
   GET /api/database/stats
   ```

2. **Via Script**:

   ```bash
   npm run db:stats
   ```

3. **Via MongoDB diretamente**:
   ```javascript
   db.investments.find().pretty();
   ```

## Casos de Uso

### Desenvolvimento Local

```bash
# Primeira vez - inicialização completa
npm run init-db

# Resetar apenas investimentos para testes
npm run init-investments:force
```

### Testes Automatizados

```bash
# Limpar e recriar investimentos
npm run init-investments:force
```

### Demonstrações

```bash
# Garantir dados completos
npm run init-db
```

## Troubleshooting

### Erro: "É necessário ter usuários e contas cadastrados"

**Solução**: Execute a inicialização completa primeiro:

```bash
npm run init-db
```

### Erro: "Já existem investimentos no banco"

**Solução**: Use a opção force para resetar:

```bash
npm run init-investments:force
```

### Nenhum investimento criado

**Verificações**:

1. Conferir se o arquivo `db.json` contém a seção `investments`
2. Verificar se existem usuários e contas válidas no banco
3. Verificar logs de erro durante a execução

## Logs e Monitoramento

Durante a execução, o sistema exibe logs detalhados:

```
Iniciando inicialização apenas dos investimentos...
Encontradas 6 contas no banco
12 investimentos salvos no MongoDB
Inicialização de investimentos concluída com sucesso!

=== Estatísticas do Banco de Dados ===
Usuários: 6
Contas: 6
Transações: 45
Investimentos: 12
```

## Personalização

Para personalizar os dados de investimentos, edite o arquivo `db.json` na seção `investments`, adicionando, removendo ou modificando os investimentos conforme necessário.
