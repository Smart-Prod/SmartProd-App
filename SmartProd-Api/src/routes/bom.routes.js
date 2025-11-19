import { Router } from "express";
import * as controller from "../controllers/bom.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";


const router = Router();

router.post("/",authenticateToken, controller.createBOM);
router.get("/:productId",authenticateToken, controller.getBOM);

export default router;
