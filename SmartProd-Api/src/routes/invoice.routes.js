import express from 'express';
import * as invoiceController from '../controllers/invoice.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', authenticateToken, invoiceController.createInvoice);
router.get('/', authenticateToken, invoiceController.getAllInvoices);

export default router;
