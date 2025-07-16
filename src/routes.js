const { Router } = require("express");
const AccountController = require("./controller/Account");
const S3Controller = require("./controller/S3");
const DatabaseController = require("./controller/Database");
const UserController = require("./controller/User");
const InvestmentController = require("./controller/Investment");
const accountController = new AccountController({});
const s3Controller = new S3Controller();
const userController = new UserController({});
const investmentController = new InvestmentController();
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
 *               - amount
 *               - type
 *               - from
 *               - to
 *             properties:
 *               accountId:
 *                 type: string
 *                 description: ID da conta
 *                 example: "60f7b1b9b3f4b3b9b3f4b3b9"
 *               amount:
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
 *                     amount:
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
 *               amount:
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
 *                     amount:
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
 *           enum: [date, amount, type, from, to, description]
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
 *                           amount:
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

// Card CRUD Routes

/**
 * @swagger
 * /cards:
 *   post:
 *     summary: Cria um novo cartão
 *     tags: [Cartões]
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
 *               - type
 *               - number
 *               - dueDate
 *               - functions
 *               - cvc
 *               - name
 *             properties:
 *               accountId:
 *                 type: string
 *                 description: ID da conta
 *                 example: "60f7b1b9b3f4b3b9b3f4b3b9"
 *               type:
 *                 type: string
 *                 description: Tipo do cartão
 *                 enum: [credit, debit, both]
 *                 example: "credit"
 *               number:
 *                 type: string
 *                 description: Número do cartão
 *                 example: "1234567890123456"
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Data de vencimento
 *                 example: "2025-12-31"
 *               functions:
 *                 type: string
 *                 description: Funções do cartão
 *                 example: "credit,debit,withdraw"
 *               cvc:
 *                 type: string
 *                 description: Código de segurança
 *                 example: "123"
 *               paymentDate:
 *                 type: string
 *                 format: date
 *                 description: Data de pagamento (opcional)
 *                 example: "2025-01-15"
 *               name:
 *                 type: string
 *                 description: Nome do portador
 *                 example: "João Silva"
 *     responses:
 *       201:
 *         description: Cartão criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cartão criado com sucesso"
 *                 result:
 *                   $ref: '#/components/schemas/Card'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/cards", accountController.createCard.bind(accountController));

/**
 * @swagger
 * /cards:
 *   get:
 *     summary: Lista todos os cartões ou filtra por conta
 *     tags: [Cartões]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: accountId
 *         schema:
 *           type: string
 *         description: ID da conta para filtrar cartões
 *         example: "60f7b1b9b3f4b3b9b3f4b3b9"
 *     responses:
 *       200:
 *         description: Cartões encontrados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cartões encontrados com sucesso"
 *                 result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Card'
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/cards", accountController.getAllCards.bind(accountController));

/**
 * @swagger
 * /cards/{cardId}:
 *   get:
 *     summary: Busca um cartão específico por ID
 *     tags: [Cartões]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         description: ID do cartão
 *         schema:
 *           type: string
 *           example: "60f7b1b9b3f4b3b9b3f4b3ba"
 *     responses:
 *       200:
 *         description: Cartão encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cartão encontrado com sucesso"
 *                 result:
 *                   $ref: '#/components/schemas/Card'
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Cartão não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  "/cards/:cardId",
  accountController.getCardById.bind(accountController)
);

/**
 * @swagger
 * /cards/{cardId}:
 *   put:
 *     summary: Atualiza um cartão existente
 *     tags: [Cartões]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         description: ID do cartão a ser atualizado
 *         schema:
 *           type: string
 *           example: "60f7b1b9b3f4b3b9b3f4b3ba"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [credit, debit, both]
 *                 example: "credit"
 *               is_blocked:
 *                 type: boolean
 *                 example: false
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-31"
 *               functions:
 *                 type: string
 *                 example: "credit,debit,withdraw"
 *               paymentDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-15"
 *               name:
 *                 type: string
 *                 example: "João Silva"
 *     responses:
 *       200:
 *         description: Cartão atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cartão atualizado com sucesso"
 *                 result:
 *                   $ref: '#/components/schemas/Card'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Cartão não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put(
  "/cards/:cardId",
  accountController.updateCard.bind(accountController)
);

/**
 * @swagger
 * /cards/{cardId}:
 *   delete:
 *     summary: Exclui um cartão existente
 *     tags: [Cartões]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         description: ID do cartão a ser excluído
 *         schema:
 *           type: string
 *           example: "60f7b1b9b3f4b3b9b3f4b3ba"
 *     responses:
 *       200:
 *         description: Cartão excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cartão excluído com sucesso"
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Cartão não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete(
  "/cards/:cardId",
  accountController.deleteCard.bind(accountController)
);

/**
 * @swagger
 * /cards/{cardId}/toggle-block:
 *   patch:
 *     summary: Bloqueia ou desbloqueia um cartão
 *     tags: [Cartões]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         description: ID do cartão
 *         schema:
 *           type: string
 *           example: "60f7b1b9b3f4b3b9b3f4b3ba"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - is_blocked
 *             properties:
 *               is_blocked:
 *                 type: boolean
 *                 description: Status de bloqueio do cartão
 *                 example: true
 *     responses:
 *       200:
 *         description: Status do cartão alterado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cartão bloqueado com sucesso"
 *                 result:
 *                   $ref: '#/components/schemas/Card'
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Cartão não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.patch(
  "/cards/:cardId/toggle-block",
  accountController.toggleCardBlock.bind(accountController)
);

/**
 * @swagger
 * components:
 *   schemas:
 *     Card:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "60f7b1b9b3f4b3b9b3f4b3ba"
 *         accountId:
 *           type: string
 *           example: "60f7b1b9b3f4b3b9b3f4b3b9"
 *         type:
 *           type: string
 *           enum: [credit, debit, both]
 *           example: "credit"
 *         is_blocked:
 *           type: boolean
 *           example: false
 *         number:
 *           type: string
 *           example: "1234567890123456"
 *         dueDate:
 *           type: string
 *           format: date-time
 *           example: "2025-12-31T00:00:00.000Z"
 *         functions:
 *           type: string
 *           example: "credit,debit,withdraw"
 *         cvc:
 *           type: string
 *           example: "123"
 *         paymentDate:
 *           type: string
 *           format: date-time
 *           example: "2025-01-15T00:00:00.000Z"
 *         name:
 *           type: string
 *           example: "João Silva"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: ID único do usuário
 *           example: "60f7b1b9b3f4b3b9b3f4b3b9"
 *         name:
 *           type: string
 *           description: Nome completo do usuário
 *           example: "João Silva"
 *         username:
 *           type: string
 *           description: Nome de usuário
 *           example: "joao_silva"
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário
 *           example: "joao@email.com"
 *         password:
 *           type: string
 *           description: Senha do usuário
 *           example: "senha123"
 *         settings:
 *           $ref: '#/components/schemas/UserSettings'
 *     UserSettings:
 *       type: object
 *       properties:
 *         notifications:
 *           type: boolean
 *           description: Receber notificações
 *           example: true
 *         language:
 *           type: string
 *           description: Idioma preferido
 *           example: "pt-BR"
 *         currency:
 *           type: string
 *           description: Moeda padrão
 *           example: "BRL"
 *         twoFactorAuth:
 *           type: boolean
 *           description: Autenticação de dois fatores
 *           example: false
 *         emailAlerts:
 *           type: boolean
 *           description: Alertas por email
 *           example: true
 *         smsAlerts:
 *           type: boolean
 *           description: Alertas por SMS
 *           example: false
 *         theme:
 *           type: string
 *           description: Tema da interface
 *           example: "light"
 *     UserUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Nome completo do usuário
 *           example: "João Silva Atualizado"
 *         username:
 *           type: string
 *           description: Nome de usuário
 *           example: "joao_silva_updated"
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário
 *           example: "joao.updated@email.com"
 *     PasswordChange:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           description: Senha atual
 *           example: "senha123"
 *         newPassword:
 *           type: string
 *           description: Nova senha
 *           example: "novaSenha456"
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Busca usuário por ID
 *     tags: [Operações de Autenticação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário encontrado com sucesso"
 *                 result:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro no servidor
 */
router.get("/users/:id", userController.findById.bind(userController));

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Atualiza dados do usuário
 *     tags: [Operações de Autenticação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário atualizado com sucesso"
 *                 result:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro no servidor
 */
router.put("/users/:id", userController.update.bind(userController));

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Exclui usuário
 *     tags: [Operações de Autenticação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário excluído com sucesso"
 *                 result:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro no servidor
 */
router.delete("/users/:id", userController.delete.bind(userController));

/**
 * @swagger
 * /users/{id}/change-password:
 *   put:
 *     summary: Altera senha do usuário
 *     tags: [Operações de Autenticação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PasswordChange'
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Senha alterada com sucesso"
 *                 result:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60f7b1b9b3f4b3b9b3f4b3b9"
 *                     message:
 *                       type: string
 *                       example: "Senha atualizada"
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Usuário não encontrado ou senha incorreta
 *       500:
 *         description: Erro no servidor
 */
router.put(
  "/users/:id/change-password",
  userController.changePassword.bind(userController)
);

/**
 * @swagger
 * /users/{id}/settings:
 *   get:
 *     summary: Busca configurações do usuário
 *     tags: [Operações de Autenticação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Configurações encontradas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Configurações encontradas com sucesso"
 *                 result:
 *                   $ref: '#/components/schemas/UserSettings'
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro no servidor
 */
router.get(
  "/users/:id/settings",
  userController.getSettings.bind(userController)
);

/**
 * @swagger
 * /users/{id}/settings:
 *   put:
 *     summary: Atualiza configurações do usuário
 *     tags: [Operações de Autenticação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserSettings'
 *     responses:
 *       200:
 *         description: Configurações atualizadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Configurações atualizadas com sucesso"
 *                 result:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro no servidor
 */
router.put(
  "/users/:id/settings",
  userController.updateSettings.bind(userController)
);

// ==================== INVESTMENT ROUTES ====================

/**
 * @swagger
 * /investments/types:
 *   get:
 *     summary: Busca tipos e categorias de investimentos disponíveis
 *     tags: [Investimentos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tipos de investimento carregados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tipos de investimento carregados com sucesso"
 *                 result:
 *                   type: object
 *                   properties:
 *                     types:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                             example: "renda_fixa"
 *                           label:
 *                             type: string
 *                             example: "Renda Fixa"
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                             example: "fundos_investimento"
 *                           label:
 *                             type: string
 *                             example: "Fundos de Investimento"
 *                     subtypes:
 *                       type: object
 *                     riskLevels:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                             example: "baixo"
 *                           label:
 *                             type: string
 *                             example: "Baixo"
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  "/investments/types",
  investmentController.getInvestmentTypes.bind(investmentController)
);

/**
 * @swagger
 * /investments:
 *   get:
 *     summary: Busca investimentos do usuário autenticado
 *     tags: [Investimentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [renda_fixa, renda_variavel]
 *         description: Filtrar por tipo de investimento
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [fundos_investimento, previdencia_privada, bolsa_valores]
 *         description: Filtrar por categoria de investimento
 *     responses:
 *       200:
 *         description: Lista de investimentos encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Investimentos encontrados com sucesso"
 *                 result:
 *                   type: object
 *                   properties:
 *                     investments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "60f7b1b9b3f4b3b9b3f4b3b9"
 *                           type:
 *                             type: string
 *                             example: "renda_fixa"
 *                           category:
 *                             type: string
 *                             example: "fundos_investimento"
 *                           subtype:
 *                             type: string
 *                             example: "CDB"
 *                           name:
 *                             type: string
 *                             example: "CDB Banco XYZ"
 *                           value:
 *                             type: number
 *                             example: 10500.00
 *                           initialValue:
 *                             type: number
 *                             example: 10000.00
 *                           currentYield:
 *                             type: number
 *                             example: 5.2
 *                           profit:
 *                             type: number
 *                             example: 500.00
 *                           profitPercentage:
 *                             type: number
 *                             example: 5.00
 *                           riskLevel:
 *                             type: string
 *                             example: "baixo"
 *                           purchaseDate:
 *                             type: string
 *                             format: date-time
 *                           maturityDate:
 *                             type: string
 *                             format: date-time
 *                           isMatured:
 *                             type: boolean
 *                             example: false
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalValue:
 *                           type: number
 *                           example: 50000.00
 *                         totalInitialValue:
 *                           type: number
 *                           example: 45000.00
 *                         totalProfit:
 *                           type: number
 *                           example: 5000.00
 *                         totalProfitPercentage:
 *                           type: number
 *                           example: 11.11
 *                         totalInvestments:
 *                           type: number
 *                           example: 5
 *                         byCategory:
 *                           type: array
 *                           items:
 *                             type: object
 *                     count:
 *                       type: number
 *                       example: 5
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  "/investments",
  investmentController.find.bind(investmentController)
);

/**
 * @swagger
 * /investments:
 *   post:
 *     summary: Cria um novo investimento
 *     tags: [Investimentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - category
 *               - subtype
 *               - name
 *               - initialValue
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [renda_fixa, renda_variavel]
 *                 example: "renda_fixa"
 *                 description: "Tipo do investimento"
 *               category:
 *                 type: string
 *                 enum: [fundos_investimento, previdencia_privada, bolsa_valores]
 *                 example: "fundos_investimento"
 *                 description: "Categoria do investimento"
 *               subtype:
 *                 type: string
 *                 example: "CDB"
 *                 description: "Subtipo específico do investimento"
 *               name:
 *                 type: string
 *                 example: "CDB Banco XYZ 120% CDI"
 *                 description: "Nome do investimento"
 *               initialValue:
 *                 type: number
 *                 example: 10000.00
 *                 description: "Valor inicial investido"
 *               currentYield:
 *                 type: number
 *                 example: 5.2
 *                 description: "Rendimento atual em porcentagem"
 *               maturityDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-31"
 *                 description: "Data de vencimento (para renda fixa)"
 *               riskLevel:
 *                 type: string
 *                 enum: [baixo, medio, alto]
 *                 example: "baixo"
 *                 description: "Nível de risco do investimento"
 *               description:
 *                 type: string
 *                 example: "Investimento em CDB com liquidez diária"
 *                 description: "Descrição adicional do investimento"
 *     responses:
 *       201:
 *         description: Investimento criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Investimento criado com sucesso"
 *                 result:
 *                   type: object
 *                   description: "Dados do investimento criado"
 *       400:
 *         description: Dados inválidos ou erro de validação
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.post(
  "/investments",
  investmentController.create.bind(investmentController)
);

/**
 * @swagger
 * /investments/{id}:
 *   get:
 *     summary: Busca um investimento específico por ID
 *     tags: [Investimentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do investimento
 *     responses:
 *       200:
 *         description: Investimento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Investimento encontrado com sucesso"
 *                 result:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     type:
 *                       type: string
 *                     category:
 *                       type: string
 *                     subtype:
 *                       type: string
 *                     name:
 *                       type: string
 *                     value:
 *                       type: number
 *                     initialValue:
 *                       type: number
 *                     profit:
 *                       type: number
 *                     profitPercentage:
 *                       type: number
 *                     currentYield:
 *                       type: number
 *                     purchaseDate:
 *                       type: string
 *                       format: date-time
 *                     maturityDate:
 *                       type: string
 *                       format: date-time
 *                     riskLevel:
 *                       type: string
 *                     description:
 *                       type: string
 *                     isMatured:
 *                       type: boolean
 *                     daysToMaturity:
 *                       type: number
 *                     investmentDays:
 *                       type: number
 *       404:
 *         description: Investimento não encontrado
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  "/investments/:id",
  investmentController.findById.bind(investmentController)
);

/**
 * @swagger
 * /investments/{id}:
 *   put:
 *     summary: Atualiza um investimento existente
 *     tags: [Investimentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do investimento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: number
 *                 example: 10500.00
 *                 description: "Novo valor atual do investimento"
 *               currentYield:
 *                 type: number
 *                 example: 5.5
 *                 description: "Novo rendimento atual em porcentagem"
 *               name:
 *                 type: string
 *                 example: "CDB Banco XYZ 125% CDI"
 *                 description: "Novo nome do investimento"
 *               maturityDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-01-31"
 *                 description: "Nova data de vencimento"
 *               riskLevel:
 *                 type: string
 *                 enum: [baixo, medio, alto]
 *                 example: "medio"
 *                 description: "Novo nível de risco"
 *               description:
 *                 type: string
 *                 example: "Investimento com rendimento atualizado"
 *                 description: "Nova descrição do investimento"
 *     responses:
 *       200:
 *         description: Investimento atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Investimento atualizado com sucesso"
 *                 result:
 *                   type: object
 *                   description: "Dados do investimento atualizado"
 *       400:
 *         description: Dados inválidos ou erro de validação
 *       404:
 *         description: Investimento não encontrado
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.put(
  "/investments/:id",
  investmentController.update.bind(investmentController)
);

/**
 * @swagger
 * /investments/{id}:
 *   delete:
 *     summary: Remove um investimento
 *     tags: [Investimentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do investimento
 *     responses:
 *       200:
 *         description: Investimento removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Investimento removido com sucesso"
 *                 result:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     value:
 *                       type: number
 *       400:
 *         description: Erro na operação ou restrição de exclusão
 *       404:
 *         description: Investimento não encontrado
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.delete(
  "/investments/:id",
  investmentController.delete.bind(investmentController)
);

/**
 * @swagger
 * /investments/transfer:
 *   post:
 *     summary: Transfere dinheiro da conta para um investimento
 *     tags: [Investimentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - investmentId
 *               - amount
 *             properties:
 *               investmentId:
 *                 type: string
 *                 example: "60f7b1b9b3f4b3b9b3f4b3b9"
 *                 description: "ID do investimento de destino"
 *               amount:
 *                 type: number
 *                 example: 1000.00
 *                 description: "Valor a ser transferido"
 *               description:
 *                 type: string
 *                 example: "Aporte adicional no CDB"
 *                 description: "Descrição da transferência"
 *     responses:
 *       200:
 *         description: Transferência realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Transferência para investimento realizada com sucesso"
 *                 result:
 *                   type: object
 *                   properties:
 *                     investment:
 *                       type: object
 *                       description: "Dados atualizados do investimento"
 *                     transaction:
 *                       type: object
 *                       description: "Dados da transação criada"
 *                     transferAmount:
 *                       type: number
 *                       example: 1000.00
 *                     newInvestmentValue:
 *                       type: number
 *                       example: 11500.00
 *       400:
 *         description: Dados inválidos, saldo insuficiente ou erro de validação
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.post(
  "/investments/transfer",
  investmentController.transfer.bind(investmentController)
);

/**
 * @swagger
 * /investments/redeem:
 *   post:
 *     summary: Realiza resgate de um investimento (parcial ou total)
 *     tags: [Investimentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - investmentId
 *               - amount
 *             properties:
 *               investmentId:
 *                 type: string
 *                 example: "60f7b1b9b3f4b3b9b3f4b3b9"
 *                 description: "ID do investimento"
 *               amount:
 *                 type: number
 *                 example: 5000.00
 *                 description: "Valor a ser resgatado"
 *               redeemType:
 *                 type: string
 *                 enum: [partial, total]
 *                 example: "partial"
 *                 description: "Tipo de resgate - parcial ou total"
 *               description:
 *                 type: string
 *                 example: "Resgate parcial para emergência"
 *                 description: "Descrição do resgate"
 *     responses:
 *       200:
 *         description: Resgate realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Resgate parcial realizado com sucesso"
 *                 result:
 *                   type: object
 *                   properties:
 *                     investment:
 *                       type: object
 *                       description: "Dados atualizados do investimento (se resgate parcial)"
 *                     transaction:
 *                       type: object
 *                       description: "Dados da transação de resgate"
 *                     redeemedAmount:
 *                       type: number
 *                       example: 5000.00
 *                     redeemType:
 *                       type: string
 *                       example: "partial"
 *                     investmentCompletelyRedeemed:
 *                       type: boolean
 *                       example: false
 *                     newInvestmentValue:
 *                       type: number
 *                       example: 5500.00
 *                     originalInvestmentValue:
 *                       type: number
 *                       example: 10500.00
 *       400:
 *         description: Dados inválidos, valor excede disponível ou erro de validação
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.post(
  "/investments/redeem",
  investmentController.redeem.bind(investmentController)
);

module.exports = router;
