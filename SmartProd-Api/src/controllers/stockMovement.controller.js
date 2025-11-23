import * as stockMovementService from '../services/stockMovement.service.js';
import { successResponse, errorResponse } from '../utils/response.util.js';

export const getAllMovements = async (req, res) => {
  try {
    const filters = {
      search: req.query.search || null,
      productId: req.query.productId || null,
      type: req.query.type || null,
      startDate: req.query.startDate || null,
      endDate: req.query.endDate || null,
    };

    const movements = await stockMovementService.getAllMovements(filters);

    return successResponse(
      res,
      200,
      'Movimentações listadas com sucesso!',
      movements
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

