import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createBOM = async (data) => {
  const { productId, materials } = data;

  // 1. Verifica se o produto existe
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) throw new Error("Produto final não encontrado.");

  // 2. Impede receita duplicada (porque productId é UNIQUE)
  const existingBOM = await prisma.bOM.findUnique({
    where: { productId }
  });

  if (existingBOM) throw new Error("Este produto já possui uma receita cadastrada.");

  // 3. Valida materiais
  for (const m of materials) {
    const mat = await prisma.product.findUnique({ where: { id: m.materialId } });
    if (!mat) throw new Error(`Material ${m.materialId} não existe.`);
  }

  // 4. Cria BOM + itens
  const bom = await prisma.bOM.create({
    data: {
      productId,
      materials: {
        create: materials.map(m => ({
          materialId: m.materialId,
          quantity: m.quantity
        }))
      }
    },
    include: {
      materials: {
        include: { material: true }
      }
    }
  });

  return bom;
};

export const getBOM = async (productId) => {
  const bom = await prisma.bOM.findUnique({
    where: { productId },
    include: {
      materials: {
        include: { material: true }
      }
    }
  });

  if (!bom) throw new Error("Nenhuma receita encontrada para este produto.");

  return bom;
};
