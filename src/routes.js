const { Router } = require("express");
const AccountController = require("./controller/Account");
const S3Controller = require("./controller/S3");
const accountController = new AccountController({});
const s3Controller = new S3Controller();
const router = Router();

/**
 * @swagger
 * /account:
 *   get:
 *     summary: Busca contas
 *     tags: [Contas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de contas encontradas
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
 *     responses:
 *       201:
 *         description: Transação criada com sucesso
 */
router.post(
  "/account/transaction",
  accountController.createTransaction.bind(accountController)
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
 *     responses:
 *       200:
 *         description: Extrato encontrado
 *       401:
 *         description: Token invalido
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
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
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
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
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
 *     responses:
 *       200:
 *         description: Lista de arquivos
 *       401:
 *         description: Token inválido
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
 *     responses:
 *       200:
 *         description: Metadados do arquivo
 *       404:
 *         description: Arquivo não encontrado
 *       401:
 *         description: Token inválido
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
 *       500:
 *         description: Falha na conexão com S3
 */
router.get("/s3/health", s3Controller.healthCheck.bind(s3Controller));

module.exports = router;
