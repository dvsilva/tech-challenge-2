// Load environment variables
require("dotenv").config();

const Express = require("express");
const publicRoutes = require("./publicRoutes");
const routes = require("./routes");
const connectDB = require("./infra/mongoose/mongooseConect");
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
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 200,
  })
);

app.use(publicRoutes);
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
  .then(() => {
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
