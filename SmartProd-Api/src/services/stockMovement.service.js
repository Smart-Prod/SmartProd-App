import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createMovement = async (data) => {
  const { productId, quantity, type } = data;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error('Produto não encontrado.');

  return prisma.stockMovement.create({ data });
};

export const getAllMovements = async () => {
  return prisma.stockMovement.findMany({
    include: { product: true },
    orderBy: { date: 'desc' },
  });
};
