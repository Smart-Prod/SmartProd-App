import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getAllMovements = async (filters = {}) => {
  const { search, productId, type, startDate, endDate } = filters;

  const where = {};

  // Filtro por produto
  if (productId) {
    where.productId = Number(productId);
  }

  // Filtro pelo tipo (ENTRADA, SAIDA...)
  if (type) {
    where.type = type;
  }

  // Filtros de data
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  // Filtro de texto (nome ou código do produto)
  if (search) {
    where.OR = [
      { product: { name: { contains: search } } },
      { product: { code: { contains: search } } },
    ];
  }

  // Movimentações
  const movements = await prisma.stockMovement.findMany({
    where,
    include: {
      product: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Totais agregados
  const totals = await prisma.stockMovement.groupBy({
    by: ['type'],
    where,
    _count: true,
  });

  const summary = {
    entradas: 0,
    saídas: 0,
    producao: 0,
    consumo: 0,
  };

  totals.forEach(t => {
    switch (t.type) {
      case 'ENTRADA':
        summary.entradas = t._count;
        break;
      case 'SAIDA':
        summary.saídas = t._count;
        break;
      case 'PRODUCAO':
        summary.producao = t._count;
        break;
      case 'CONSUMO':
        summary.consumo = t._count;
        break;
    }
  });

  // Saldo líquido
  const saldoLiquido =
    (summary.entradas + summary.producao) -
    (summary.saídas + summary.consumo);

  return {
    summary,              // Totais para os cards da tela
    total: movements.length,
    saldoLiquido,
    movements,            // Lista detalhada para a tabela
  };
};
