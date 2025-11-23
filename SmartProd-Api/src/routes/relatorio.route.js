import { Router } from 'express';
import { getRelatorioProducao } from '../controllers/relatorio.controller.js';

const router = Router();

router.get('/producao', getRelatorioProducao);
router.get('/estoque', getRelatorioEstoque);
router.get('/consumo-mp', getRelatorioConsumoMP);
router.get('/vendas', getRelatorioVendas);


export default router;
