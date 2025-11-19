import express from 'express';
import userRoutes from './user.routes.js';
import productRoutes from './product.routes.js';
import invoiceRoutes from './invoice.routes.js';
import productionOrderRoutes from './productionOrder.routes.js';
import bomRoutes from './bom.routes.js'
import stockMovementRoutes from './stockMovement.routes.js';



const router = express.Router();

router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/orders', productionOrderRoutes);
router.use('/bom', bomRoutes);
router.use('/movements', stockMovementRoutes);

export default router;
