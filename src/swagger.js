const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Contas",
      version: "1.0.8",
      description: "Documentação da API de Contas",
    },
    tags: [
      {
        name: "Contas",
        description: "Operações relacionadas a contas",
      },
      {
        name: "Transações",
        description: "Operações relacionadas a transações",
      },
      {
        name: "Extratos",
        description: "Operações relacionadas a extratos",
      },
      {
        name: "S3",
        description: "Operações relacionadas ao Amazon S3",
      },
      {
        name: "Auth",
        description: "Operações de autenticação",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [], // Define que toda rota utilizará este esquema como padrão
      },
    ],
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor de Desenvolvimento",
      },
      ...(process.env.ALB_URL
        ? [
            {
              url: process.env.ALB_URL,
              description: "Servidor AWS (HTTP)",
            },
          ]
        : []),
      ...(process.env.ALB_HTTPS_URL
        ? [
            {
              url: process.env.ALB_HTTPS_URL,
              description: "Servidor AWS (HTTPS)",
            },
          ]
        : []),
    ].filter(Boolean),
  },
  apis: ["./src/routes.js", "./src/publicRoutes.js"], // arquivos que contêm anotações do swagger
};

const specs = swaggerJsdoc(options);
module.exports = specs;
