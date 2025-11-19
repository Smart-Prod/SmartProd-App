import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createProduct = async (data, usuarioId) => {
  const { code, name, type, unit, currentStock, reservedStock, minStock } = data;

  // 🔎 Verifica duplicidade
  const existing = await prisma.product.findUnique({ where: { code } });
  if (existing) throw new Error("Código de produto já está em uso.");

  // ✅ Criação correta
  return prisma.product.create({
    data: {
      code,
      name,
      type,
      unit,
      currentStock,
      reservedStock,
      minStock,
      usuarioId, // ✅ dentro de data, não fora!
    },
  });
};

export const getAllProducts = async () => {
  return prisma.product.findMany({
    include: { bom: true },
  });
};

export const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { bom: true },
  });
  if (!product) throw new Error("Produto não encontrado.");
  return product;
};
