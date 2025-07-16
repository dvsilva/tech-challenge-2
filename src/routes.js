const { Router } = require("express");
const AccountController = require("./controller/Account");
const S3Controller = require("./controller/S3");
const DatabaseController = require("./controller/Database");
const accountController = new AccountController({});
const s3Controller = new S3Controller();
const router = Router();

/**
 * @swagger
 * /account:
 *   get:
 *     summary: Busca contas do usuário autenticado
 *     tags: [Contas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de contas encontradas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Conta encontrada carregado com sucesso"
 *                 result:
 *                   type: object
 *                   properties:
 *                     account:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "60f7b1b9b3f4b3b9b3f4b3b9"
 *                           userId:
 *                             type: string
 *                             example: "60f7b1b9b3f4b3b9b3f4b3b8"
 *                           balance:
 *                             type: number
 *                             example: 1500.75
 *                           accountNumber:
 *                             type: string
 *                             example: "12345-6"
 *                     transactions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "60f7b1b9b3f4b3b9b3f4b3ba"
 *                           accountId:
 *                             type: string
 *                             example: "60f7b1b9b3f4b3b9b3f4b3b9"
 *                           value:
 *                             type: number
 *                             example: 150.50
 *                           type:
 *                             type: string
 *                             example: "transferencia"
 *                           description:
 *                             type: string
 *                             example: "Pagamento de mensalidade escolar"
 *                           date:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-07-15T10:30:00.000Z"
 *                     cards:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "60f7b1b9b3f4b3b9b3f4b3bb"
 *                           accountId:
 *                             type: string
 *                             example: "60f7b1b9b3f4b3b9b3f4b3b9"
 *                           cardNumber:
 *                             type: string
 *                             example: "****-****-****-1234"
 *                           cardType:
 *                             type: string
 *                             example: "debito"
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/account", accountController.find.bind(accountController));

/**
 * @swagger
 * /account/transaction:
 *   post:
 *     summary: Cria uma nova transação
 *     tags: [Transações]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountId
 *               - value
 *               - type
 *               - from
 *               - to
 *             properties:
 *               accountId:
 *                 type: string
 *                 description: ID da conta
 *                 example: "60f7b1b9b3f4b3b9b3f4b3b9"
 *               value:
 *                 type: number
 *                 description: Valor da transação
 *                 example: 150.50
 *               type:
 *                 type: string
 *                 description: Tipo da transação
 *                 enum: [exchange, loan, transfer]
 *                 example: "transferencia"
 *               from:
 *                 type: string
 *                 description: Origem da transação
 *                 example: "Conta Corrente"
 *               to:
 *                 type: string
 *                 description: Destino da transação
 *                 example: "João Silva"
 *               anexo:
 *                 type: string
 *                 description: URL do anexo (opcional)
 *                 example: "https://bucket.s3.amazonaws.com/anexo.pdf"
 *               description:
 *                 type: string
 *                 description: Descrição da transação (opcional)
 *                 example: "Pagamento de mensalidade escolar"
 *     responses:
 *       201:
 *         description: Transação criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Transação criada com sucesso"
 *                 result:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60f7b1b9b3f4b3b9b3f4b3b9"
 *                     accountId:
 *                       type: string
 *                       example: "60f7b1b9b3f4b3b9b3f4b3b9"
 *                     value:
 *                       type: number
 *                       example: 150.50
 *                     type:
 *                       type: string
 *                       example: "transferencia"
 *                     from:
 *                       type: string
 *                       example: "Conta Corrente"
 *                     to:
 *                       type: string
 *                       example: "João Silva"
 *                     description:
 *                       type: string
 *                       example: "Pagamento de mensalidade escolar"
 *                     date:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-07-15T10:30:00.000Z"
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.post(
  "/account/transaction",
  accountController.createTransaction.bind(accountController)
);

/**
 * @swagger
 * /account/transaction/{transactionId}:
 *   put:
 *     summary: Atualiza uma transação existente
 *     tags: [Transações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         description: ID da transação a ser atualizada
 *         schema:
 *           type: string
 *           example: "60f7b1b9b3f4b3b9b3f4b3b9"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: number
 *                 example: 150.75
 *                 description: Valor da transação
 *               type:
 *                 type: string
 *                 enum: [exchange, loan, transfer]
 *                 example: "Credit"
 *                 description: Tipo da transação
 *               from:
 *                 type: string
 *                 example: "João Silva"
 *                 description: Origem da transação
 *               to:
 *                 type: string
 *                 example: "Maria Santos"
 *                 description: Destino da transação
 *               anexo:
 *                 type: string
 *                 example: "Comprovante de pagamento"
 *                 description: Anexo ou observação da transação
 *               description:
 *                 type: string
 *                 example: "Pagamento de mensalidade escolar"
 *                 description: Descrição da transação
 *     responses:
 *       200:
 *         description: Transação atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Transação atualizada com sucesso"
 *                 result:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60f7b1b9b3f4b3b9b3f4b3b9"
 *                     accountId:
 *                       type: string
 *                       example: "60f7b1b9b3f4b3b9b3f4b3b8"
 *                     value:
 *                       type: number
 *                       example: 150.75
 *                     type:
 *                       type: string
 *                       example: "Credit"
 *                     from:
 *                       type: string
 *                       example: "João Silva"
 *                     to:
 *                       type: string
 *                       example: "Maria Santos"
 *                     description:
 *                       type: string
 *                       example: "Pagamento de mensalidade escolar"
 *                     date:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-07-15T10:30:00.000Z"
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Transação não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.put(
  "/account/transaction/:transactionId",
  accountController.updateTransaction.bind(accountController)
);

/**
 * @swagger
 * /account/transaction/{transactionId}:
 *   delete:
 *     summary: Exclui uma transação existente
 *     tags: [Transações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         description: ID da transação a ser excluída
 *         schema:
 *           type: string
 *           example: "60f7b1b9b3f4b3b9b3f4b3b9"
 *     responses:
 *       200:
 *         description: Transação excluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Transação excluída com sucesso"
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Transação não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.delete(
  "/account/transaction/:transactionId",
  accountController.deleteTransaction.bind(accountController)
);

/**
 * @swagger
 * /account/{accountId}/statement:
 *   get:
 *     summary: Obtém extrato da conta
 *     tags: [Extratos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         description: ID da conta
 *         schema:
 *           type: string
 *           example: "60f7b1b9b3f4b3b9b3f4b3b9"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial para filtrar transações (YYYY-MM-DD)
 *         example: "2023-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final para filtrar transações (YYYY-MM-DD)
 *         example: "2023-12-31"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [exchange, loan, transfer]
 *         description: Filtrar por tipo de transação
 *         example: "transferencia"
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *         description: Filtrar por origem da transação (busca parcial)
 *         example: "João"
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *         description: Filtrar por destino da transação (busca parcial)
 *         example: "Maria"
 *       - in: query
 *         name: description
 *         schema:
 *           type: string
 *         description: Filtrar por descrição da transação (busca parcial)
 *         example: "pagamento"
 *       - in: query
 *         name: anexo
 *         schema:
 *           type: string
 *         description: Filtrar por anexo da transação (busca parcial)
 *         example: "comprovante"
 *       - in: query
 *         name: minValue
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Valor mínimo da transação
 *         example: 100.00
 *       - in: query
 *         name: maxValue
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Valor máximo da transação
 *         example: 1000.00
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página para paginação
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número de transações por página
 *         example: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date, value, type, from, to, description]
 *           default: "date"
 *         description: Campo para ordenação
 *         example: "date"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "desc"
 *         description: Ordem da classificação
 *         example: "desc"
 *     responses:
 *       200:
 *         description: Extrato encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Extrato obtido com sucesso"
 *                 result:
 *                   type: object
 *                   properties:
 *                     transactions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "60f7b1b9b3f4b3b9b3f4b3ba"
 *                           accountId:
 *                             type: string
 *                             example: "60f7b1b9b3f4b3b9b3f4b3b9"
 *                           value:
 *                             type: number
 *                             example: 150.50
 *                           type:
 *                             type: string
 *                             example: "transferencia"
 *                           from:
 *                             type: string
 *                             example: "Conta Corrente"
 *                           to:
 *                             type: string
 *                             example: "João Silva"
 *                           date:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-07-15T10:30:00.000Z"
 *                           anexo:
 *                             type: string
 *                             description: URL do anexo se houver
 *                             example: "https://bucket.s3.amazonaws.com/anexo.pdf"
 *                           description:
 *                             type: string
 *                             description: Descrição da transação
 *                             example: "Pagamento de mensalidade escolar"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *                         totalCount:
 *                           type: integer
 *                           example: 50
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPreviousPage:
 *                           type: boolean
 *                           example: false
 *                         limit:
 *                           type: integer
 *                           example: 10
 *       400:
 *         description: ID da conta inválido
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Conta não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  "/account/:accountId/statement",
  accountController.getStatement.bind(accountController)
);

/**
 * @swagger
 * /s3/signed-url:
 *   post:
 *     summary: Gera URL assinada para operações S3
 *     tags: [S3]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bucket
 *               - key
 *               - operation
 *             properties:
 *               bucket:
 *                 type: string
 *                 example: "3frnt-group6-bytebank"
 *               key:
 *                 type: string
 *                 example: "uploads/1642678800000_abc123_document.pdf"
 *               contentType:
 *                 type: string
 *                 example: "application/pdf"
 *               operation:
 *                 type: string
 *                 enum: [putObject, getObject]
 *                 example: "putObject"
 *               originalFileName:
 *                 type: string
 *                 example: "document.pdf"
 *                 description: "Nome original do arquivo (opcional, usado para gerar nome único)"
 *     responses:
 *       200:
 *         description: URL assinada gerada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 signedUrl:
 *                   type: string
 *                   example: "https://3frnt-group6-bytebank.s3.amazonaws.com/uploads/1642678800000_abc123_document.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=..."
 *                 key:
 *                   type: string
 *                   example: "uploads/1642678800000_abc123_document.pdf"
 *                 expiresIn:
 *                   type: number
 *                   description: Tempo de expiração em segundos
 *                   example: 3600
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Parâmetros obrigatórios ausentes"
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.post(
  "/s3/signed-url",
  s3Controller.generateSignedUrl.bind(s3Controller)
);

/**
 * @swagger
 * /s3/file:
 *   delete:
 *     summary: Deleta arquivo do S3
 *     tags: [S3]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bucket
 *               - key
 *             properties:
 *               bucket:
 *                 type: string
 *                 example: "3frnt-group6-bytebank"
 *               key:
 *                 type: string
 *                 example: "uploads/1642678800000_abc123_document.pdf"
 *     responses:
 *       200:
 *         description: Arquivo deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Arquivo deletado com sucesso"
 *                 deletedKey:
 *                   type: string
 *                   example: "uploads/1642678800000_abc123_document.pdf"
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Bucket e key são obrigatórios"
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Arquivo não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete("/s3/file", s3Controller.deleteFile.bind(s3Controller));

/**
 * @swagger
 * /s3/files:
 *   get:
 *     summary: Lista arquivos no bucket S3
 *     tags: [S3]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: bucket
 *         schema:
 *           type: string
 *         description: Nome do bucket (opcional)
 *       - in: query
 *         name: prefix
 *         schema:
 *           type: string
 *         description: Prefixo para filtrar arquivos
 *       - in: query
 *         name: maxKeys
 *         schema:
 *           type: integer
 *         description: Número máximo de arquivos a retornar
 *         example: 100
 *     responses:
 *       200:
 *         description: Lista de arquivos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 files:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       key:
 *                         type: string
 *                         example: "uploads/1642678800000_abc123_document.pdf"
 *                       size:
 *                         type: number
 *                         example: 2048576
 *                       lastModified:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-07-15T10:30:00.000Z"
 *                       etag:
 *                         type: string
 *                         example: "\"d41d8cd98f00b204e9800998ecf8427e\""
 *                 totalCount:
 *                   type: number
 *                   example: 25
 *                 isTruncated:
 *                   type: boolean
 *                   example: false
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/s3/files", s3Controller.listFiles.bind(s3Controller));

/**
 * @swagger
 * /s3/file/metadata:
 *   get:
 *     summary: Obtém metadados de um arquivo S3
 *     tags: [S3]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: bucket
 *         schema:
 *           type: string
 *         description: Nome do bucket (opcional)
 *       - in: query
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Chave do arquivo
 *         example: "uploads/1642678800000_abc123_document.pdf"
 *     responses:
 *       200:
 *         description: Metadados do arquivo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     key:
 *                       type: string
 *                       example: "uploads/1642678800000_abc123_document.pdf"
 *                     size:
 *                       type: number
 *                       example: 2048576
 *                     lastModified:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-07-15T10:30:00.000Z"
 *                     contentType:
 *                       type: string
 *                       example: "application/pdf"
 *                     etag:
 *                       type: string
 *                       example: "\"d41d8cd98f00b204e9800998ecf8427e\""
 *                     storageClass:
 *                       type: string
 *                       example: "STANDARD"
 *       400:
 *         description: Parâmetros inválidos
 *       404:
 *         description: Arquivo não encontrado
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  "/s3/file/metadata",
  s3Controller.getFileMetadata.bind(s3Controller)
);

/**
 * @swagger
 * /s3/health:
 *   get:
 *     summary: Verifica conexão com S3
 *     tags: [S3]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conexão S3 está funcionando
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Conexão S3 funcionando corretamente"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-07-15T10:30:00.000Z"
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Falha na conexão com S3
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Falha ao conectar com S3"
 */
router.get("/s3/health", s3Controller.healthCheck.bind(s3Controller));

/**
 * @swagger
 * /database/initialize:
 *   post:
 *     summary: Inicializa o banco de dados com dados do db.json
 *     tags: [Database]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               forceReset:
 *                 type: boolean
 *                 description: Se true, limpa dados existentes antes de inicializar
 *                 default: false
 *                 example: false
 *     responses:
 *       200:
 *         description: Banco de dados inicializado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Banco de dados inicializado com sucesso"
 *                 stats:
 *                   type: object
 *                   properties:
 *                     usersCreated:
 *                       type: number
 *                       example: 5
 *                     accountsCreated:
 *                       type: number
 *                       example: 5
 *                     transactionsCreated:
 *                       type: number
 *                       example: 15
 *                     cardsCreated:
 *                       type: number
 *                       example: 8
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/database/initialize", DatabaseController.initializeDatabase);

/**
 * @swagger
 * /database/stats:
 *   get:
 *     summary: Obtém estatísticas do banco de dados
 *     tags: [Database]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: number
 *                       example: 25
 *                     totalAccounts:
 *                       type: number
 *                       example: 30
 *                     totalTransactions:
 *                       type: number
 *                       example: 150
 *                     totalCards:
 *                       type: number
 *                       example: 45
 *                     databaseSize:
 *                       type: string
 *                       example: "2.5 MB"
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/database/stats", DatabaseController.getDatabaseStats);

/**
 * @swagger
 * /database/status:
 *   get:
 *     summary: Verifica se o banco foi inicializado
 *     tags: [Database]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status obtido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 initialized:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Banco de dados está inicializado"
 *                 lastInitialized:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-07-15T10:30:00.000Z"
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/database/status", DatabaseController.getDatabaseStatus);

/**
 * @swagger
 * /database/clear:
 *   delete:
 *     summary: Limpa todos os dados do banco
 *     tags: [Database]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Banco de dados limpo com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Todos os dados foram removidos do banco"
 *                 deletedCounts:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: number
 *                       example: 25
 *                     accounts:
 *                       type: number
 *                       example: 30
 *                     transactions:
 *                       type: number
 *                       example: 150
 *                     cards:
 *                       type: number
 *                       example: 45
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.delete("/database/clear", DatabaseController.clearDatabase);

module.exports = router;

module.exports = router;
