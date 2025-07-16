const { Router } = require("express");
const UserController = require("./controller/User");

const userController = new UserController({});
const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   example: "2025-07-14T10:30:00.000Z"
 *                 service:
 *                   type: string
 *                   example: "tech-challenge-2"
 */
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "tech-challenge-2",
    version: process.env.npm_package_version || "1.0.0",
  });
});

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Detailed health check with dependency checks
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service and dependencies are healthy
 *       503:
 *         description: Service or dependencies are unhealthy
 */
router.get("/health/detailed", async (req, res) => {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "tech-challenge-2",
    version: process.env.npm_package_version || "1.0.0",
    dependencies: {},
  };

  let overallStatus = 200;

  // Check MongoDB connectivity
  try {
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState === 1) {
      health.dependencies.mongodb = { status: "healthy", message: "Connected" };
    } else {
      health.dependencies.mongodb = {
        status: "unhealthy",
        message: "Not connected",
      };
      overallStatus = 503;
    }
  } catch (error) {
    health.dependencies.mongodb = {
      status: "unhealthy",
      message: error.message,
    };
    overallStatus = 503;
  }

  // Check environment variables
  const requiredEnvVars = ["NODE_ENV", "PORT", "MONGODB_URI"];
  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length === 0) {
    health.dependencies.environment = {
      status: "healthy",
      message: "All required env vars present",
    };
  } else {
    health.dependencies.environment = {
      status: "unhealthy",
      message: `Missing env vars: ${missingEnvVars.join(", ")}`,
    };
    overallStatus = 503;
  }

  if (overallStatus !== 200) {
    health.status = "unhealthy";
  }

  res.status(overallStatus).json(health);
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Busca usuários
 *     tags: [Operações de Autenticação]
 *     responses:
 *       200:
 *         description: Lista de usuários encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *       404:
 *         description: Nenhum usuário encontrado
 */
router.get("/users", userController.find.bind(userController));

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Operações de Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome completo do usuário
 *                 example: "João Silva"
 *               username:
 *                 type: string
 *                 description: Nome de usuário
 *                 example: "joao_silva"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário
 *                 example: "joao@email.com"
 *               password:
 *                 type: string
 *                 description: Senha do usuário
 *                 example: "senha123"
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post("/users", userController.create.bind(userController));

/**
 * @swagger
 * /users/auth:
 *   post:
 *     summary: Autenticação de usuário
 *     tags: [Operações de Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Autenticação realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Credenciais inválidas
 */
router.post("/users/auth", userController.auth.bind(userController));

/**
 * @swagger
 * /startup:
 *   get:
 *     summary: Container startup status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Container startup information
 */
router.get("/startup", (req, res) => {
  const startupInfo = {
    status: "running",
    timestamp: new Date().toISOString(),
    service: "tech-challenge-2",
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    envVars: {
      NODE_ENV: !!process.env.NODE_ENV,
      PORT: !!process.env.PORT,
      MONGODB_URI: !!process.env.MONGODB_URI,
      JWT_SECRET: !!process.env.JWT_SECRET,
      AWS_ACCESS_KEY_ID: !!process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: !!process.env.AWS_SECRET_ACCESS_KEY,
      AWS_REGION: !!process.env.AWS_REGION,
      S3_BUCKET_NAME: !!process.env.S3_BUCKET_NAME,
    },
  };

  res.status(200).json(startupInfo);
});

module.exports = router;
