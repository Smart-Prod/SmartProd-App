import * as productionOrderService from '../services/productionOrder.service.js';
import { successResponse, errorResponse } from '../utils/response.util.js';

export const createOrder = async (req, res) => {
  try {
    const order = await productionOrderService.createOrder(req.body);
    return successResponse(res, 201, 'Ordem de produção criada com sucesso!', order);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await productionOrderService.getAllOrders();
    return successResponse(res, 200, 'Ordens listadas com sucesso!', orders);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
