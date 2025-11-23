import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";

dotenv.config();

const app = express();

// HABILITA CORS ANTES DE TUDO
app.use(
  cors({
    origin: "http://localhost:5173", // frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// SUAS ROTAS
app.use("/SmartProd-api", routes);

// MIDDLEWARE DE ERRO
app.use(errorHandler);

export default app;
