import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getRelatorioProducao = async (dataInicial, dataFinal) => {
  // Converte para Date
  const start = new Date(dataInicial);
  const end = new Date(dataFinal);
  // Ajusta final para pegar o dia inteiro
  end.setHours(23, 59, 59);

  // TOTAL PLANEJADO
  const totalPlanejado = await prisma.productionOrder.aggregate({
    where: {
      createdAt: {
        gte: start,
        lte: end
      },
    },
    _sum: { quantity: true }
  });

  // TOTAL REAL PRODUZIDO
  const totalProduzido = await prisma.productionOrder.aggregate({
    where: {
      finishedAt: {
        gte: start,
        lte: end
      },
    },
    _sum: { produced: true }
  });

  const planejado = totalPlanejado._sum.quantity || 0;
  const produzido = totalProduzido._sum.produced || 0;

  const eficiencia =
    planejado === 0 ? 0 : Math.round((produzido / planejado) * 100);

  // PRODUÇÃO POR PRODUTO (para o gráfico)
  const producaoPorProduto = await prisma.productionOrder.groupBy({
    by: ['productId'],
    where: {
      finishedAt: {
        gte: start,
        lte: end,
      },
    },
    _sum: { produced: true }
  });

  // Busca nome dos produtos
  const resultado = [];
  for (const item of producaoPorProduto) {
    const produto = await prisma.product.findUnique({
      where: { id: item.productId },
      select: { name: true }
    });

    resultado.push({
      productId: item.productId,
      nome: produto?.name || 'Desconhecido',
      totalProduzido: item._sum.produced || 0
    });
  }

  return {
    totalPlanejado: planejado,
    totalProduzido: produzido,
    eficiencia,
    producaoPorProduto: resultado
  };
};
export const getRelatorioEstoque = async (dataInicial, dataFinal) => {
  const start = new Date(dataInicial);
  const end = new Date(dataFinal);
  end.setHours(23, 59, 59);

  // Estoque atual
  const itensEstoque = await prisma.stock.findMany({
    include: {
      product: { select: { name: true } }
    }
  });

  return itensEstoque.map(e => ({
    productId: e.productId,
    produto: e.product?.name || 'Desconhecido',
    quantidade: e.quantity,
    unidade: e.unit || 'UN'
  }));
};
export const getRelatorioConsumoMP = async (dataInicial, dataFinal) => {
  const start = new Date(dataInicial);
  const end = new Date(dataFinal);
  end.setHours(23, 59, 59);

  const consumo = await prisma.stockMovement.groupBy({
    by: ['productId'],
    where: {
      type: 'saida',
      createdAt: {
        gte: start,
        lte: end
      }
    },
    _sum: { quantity: true }
  });

  const resultado = [];

  for (const item of consumo) {
    const produto = await prisma.product.findUnique({
      where: { id: item.productId },
      select: { name: true }
    });

    resultado.push({
      productId: item.productId,
      produto: produto?.name || 'Desconhecido',
      totalConsumido: item._sum.quantity || 0
    });
  }

  return resultado;
};
export const getRelatorioVendas = async (dataInicial, dataFinal) => {
  const start = new Date(dataInicial);
  const end = new Date(dataFinal);
  end.setHours(23, 59, 59);

  // Total de vendas (agrupado)
  const vendas = await prisma.sale.groupBy({
    by: ['productId'],
    where: {
      createdAt: {
        gte: start,
        lte: end
      }
    },
    _sum: { quantity: true, totalValue: true }
  });

  const resultado = [];

  for (const item of vendas) {
    const produto = await prisma.product.findUnique({
      where: { id: item.productId },
      select: { name: true }
    });

    resultado.push({
      productId: item.productId,
      produto: produto?.name || 'Desconhecido',
      quantidadeVendida: item._sum.quantity || 0,
      totalFaturado: item._sum.totalValue || 0
    });
  }

  return resultado;
};
