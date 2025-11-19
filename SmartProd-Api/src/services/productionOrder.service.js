import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createOrder = async (data) => {
  const { productId, usuarioId, quantity } = data;

  // Verifica se o produto existe
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error('Produto não encontrado.');

  // 1 — Cria a ordem de produção
  const order = await prisma.productionOrder.create({
    data: {
      productId,
      usuarioId,
      quantity,
      status: 'PLANEJADA',
      produced: 0,
    },
  });

  // 2 — Busca a BOM (receita) do produto
  const bom = await prisma.bOM.findUnique({
    where: { productId },
    include: {
      items: {
        include: {
          material: true,
        },
      },
    },
  });

  // Se não tiver receita cadastrada, retorna só a ordem
  if (!bom) {
    return {
      order,
      materialsNeeded: [],
    };
  }

  // 3 — Calcula o consumo de materiais
  const materialsNeeded = bom.items.map((item) => ({
    materialId: item.materialId,
    materialName: item.material.name,
    quantityPerUnit: item.quantity,
    totalQuantity: item.quantity * quantity,
  }));

  return {
    order,
    materialsNeeded,
  };
};

export const getAllOrders = async () => {
  return prisma.productionOrder.findMany({
    include: { product: true, usuario: true },
  });
};
