// Load environment variables
require("dotenv").config();

const Express = require("express");
const publicRoutes = require("./publicRoutes");
const routes = require("./routes");
const connectDB = require("./infra/mongoose/mongooseConect");
const autoInitializeDatabase = require("./middleware/autoInitDb");
const app = new Express();
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./swagger");
const UserController = require("./controller/User");
const cors = require("cors");

app.use(Express.json());

// Configure CORS
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : "*";

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // If corsOrigins is "*", allow all origins
      if (corsOrigins === "*" || corsOrigins.includes("*")) {
        return callback(null, true);
      }

      // Check if the origin is in our allowed list
      if (corsOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }

      // Log the denied origin for debugging
      console.log(`CORS blocked origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],
    preflightContinue: false,
    optionsSuccessStatus: 200,
  })
);

app.use(publicRoutes);

// Handle CORS preflight for Swagger
app.options("/health/detailed", cors());
app.options("/health", cors());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use((req, res, next) => {
  if (req.url.includes("/docs")) {
    return next();
  }
  const [_, token] = req.headers["authorization"]?.split(" ") || [];
  const user = UserController.getToken(token);
  if (!user) return res.status(401).json({ message: "Token inválido" });
  req.user = user;
  next();
});
app.use(routes);

connectDB()
  .then(async () => {
    // Auto-inicialização do banco de dados (se habilitada)
    await autoInitializeDatabase();

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
      console.log(`Ambiente: ${process.env.NODE_ENV}`);
      console.log(`Swagger docs: http://localhost:${port}/docs`);
      console.log(`Health check: http://localhost:${port}/health`);
    });
  })
  .catch((error) => {
    console.error("Erro ao conectar ao banco de dados:", error);
    // Still start the server even if DB connection fails for health checks
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Servidor iniciado na porta ${port} (sem DB)`);
      console.log(`Health check: http://localhost:${port}/health`);
    });
  });

module.exports = app;
