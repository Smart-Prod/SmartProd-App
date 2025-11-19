import * as invoiceService from '../services/invoice.service.js';
import { successResponse, errorResponse } from '../utils/response.util.js';

export const createInvoice = async (req, res) => {
  try {
    const invoice = await invoiceService.createInvoice(req.body);
    return successResponse(res, 201, 'Nota fiscal criada com sucesso!', invoice);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

export const getAllInvoices = async (req, res) => {
  try {
    const invoices = await invoiceService.getAllInvoices();
    return successResponse(res, 200, 'Notas fiscais listadas com sucesso!', invoices);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
