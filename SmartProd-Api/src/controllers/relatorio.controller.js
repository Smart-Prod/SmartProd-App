import * as relatorioService from '../services/relatorio.service.js';
import { successResponse, errorResponse } from '../utils/response.util.js';

export const getRelatorioProducao = async (req, res) => {
  try {
    const { dataInicial, dataFinal } = req.query;

    const data = await relatorioService.getRelatorioProducao(
      dataInicial,
      dataFinal
    );

    return successResponse(res, 200, 'Relatório carregado com sucesso', data);
  } catch (err) {
    return errorResponse(res, 400, err.message);
  }
};
export const getRelatorioEstoque = async (req, res) => {
  try {
    const { dataInicial, dataFinal } = req.query;

    const data = await relatorioService.getRelatorioEstoque(
      dataInicial,
      dataFinal
    );

    return successResponse(res, 200, 'Relatório de estoque carregado', data);
  } catch (err) {
    return errorResponse(res, 400, err.message);
  }
};
export const getRelatorioConsumoMP = async (req, res) => {
  try {
    const { dataInicial, dataFinal } = req.query;

    const data = await relatorioService.getRelatorioConsumoMP(
      dataInicial,
      dataFinal
    );

    return successResponse(res, 200, 'Relatório de consumo carregado', data);
  } catch (err) {
    return errorResponse(res, 400, err.message);
  }
};
export const getRelatorioVendas = async (req, res) => {
  try {
    const { dataInicial, dataFinal } = req.query;

    const data = await relatorioService.getRelatorioVendas(
      dataInicial,
      dataFinal
    );

    return successResponse(res, 200, 'Relatório de vendas carregado', data);
  } catch (err) {
    return errorResponse(res, 400, err.message);
  }
};
