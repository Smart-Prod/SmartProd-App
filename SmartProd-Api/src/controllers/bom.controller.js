import * as bomService from "../services/bom.service.js";
import { successResponse, errorResponse } from "../utils/response.util.js";

export const createBOM = async (req, res) => {
  try {
    const data = req.body;
    const response = await bomService.createBOM(data);
    return successResponse(res, 201, "Receita cadastrada com sucesso!", response);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

export const getBOM = async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const response = await bomService.getBOM(productId);
    return successResponse(res, 200, "Receita carregada com sucesso!", response);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};
