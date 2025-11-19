import express from 'express';
import * as stockMovementController from '../controllers/stockMovement.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', authenticateToken, stockMovementController.createMovement);
router.get('/', authenticateToken, stockMovementController.getAllMovements);

export default router;
