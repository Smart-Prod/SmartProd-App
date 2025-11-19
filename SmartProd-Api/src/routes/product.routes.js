import express from "express";
import * as productController from "../controllers/product.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ✅ Criar produto
router.post("/create", authenticateToken, productController.createProduct);

// ✅ Listar produtos
router.get("/", authenticateToken, productController.getAllProducts);

// ✅ Buscar produto por ID
router.get("/:id", authenticateToken, productController.getProductById);

export default router;
