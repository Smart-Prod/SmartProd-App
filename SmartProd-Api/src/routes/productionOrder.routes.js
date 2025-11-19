import express from 'express';
import * as productionOrderController from '../controllers/productionOrder.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';


const router = express.Router();

router.post('/createOrder', authenticateToken, productionOrderController.createOrder);
router.get('/getAllOrders', authenticateToken, productionOrderController.getAllOrders);


export default router;
