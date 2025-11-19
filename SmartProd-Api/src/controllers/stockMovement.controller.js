import * as stockMovementService from '../services/stockMovement.service.js';
import { successResponse, errorResponse } from '../utils/response.util.js';

export const createMovement = async (req, res) => {
  try {
    const mov = await stockMovementService.createMovement(req.body);
    return successResponse(res, 201, 'Movimentação registrada com sucesso!', mov);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

export const getAllMovements = async (req, res) => {
  try {
    const movements = await stockMovementService.getAllMovements();
    return successResponse(res, 200, 'Movimentações listadas com sucesso!', movements);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
