const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

async function connectDB() {
  try {
    if (
      process.env.MONGODB_URI &&
      process.env.MONGODB_URI.includes("mongodb+srv")
    ) {
      // Conectar ao MongoDB Atlas
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Conectado ao MongoDB Atlas");
    } else if (
      process.env.NODE_ENV === "development" ||
      !process.env.MONGODB_URI
    ) {
      // Iniciar MongoDB em memória para desenvolvimento
      const mongod = await MongoMemoryServer.create();
      const mongoUri = mongod.getUri();
      await mongoose.connect(mongoUri);
      console.log("Conectado ao MongoDB em memória");
    } else {
      // Conectar ao MongoDB real em produção
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Conectado ao MongoDB");
    }
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error);
    throw error; // Re-throw to allow index.js to handle it
  }
}

module.exports = connectDB;
