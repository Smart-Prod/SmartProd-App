import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createBOM = async (data) => {
  const { productId, materials } = data;

  if (!productId) throw new Error("productId é obrigatório.");
  if (!Array.isArray(materials) || materials.length === 0)
    throw new Error("A lista de materiais é obrigatória.");

  // 1️⃣ Verifica se o produto final existe
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) throw new Error("Produto final não encontrado.");

  // 2️⃣ Impede receita duplicada
  const existingBOM = await prisma.bOM.findUnique({
    where: { productId }
  });

  if (existingBOM) throw new Error("Este produto já possui uma receita cadastrada.");

  // 3️⃣ Valida materiais em 1 query (melhor performance)
  const materialIds = materials.map(m => m.materialId);

  const foundMaterials = await prisma.product.findMany({
    where: { id: { in: materialIds } }
  });

  if (foundMaterials.length !== materialIds.length) {
    const foundIds = foundMaterials.map(m => m.id);
    const missing = materialIds.filter(id => !foundIds.includes(id));
    throw new Error(`Materiais inválidos: ${missing.join(", ")}`);
  }

  // 4️⃣ Valida quantidade
  materials.forEach(m => {
    if (m.quantity <= 0) throw new Error(`Quantidade inválida para material ${m.materialId}`);
  });

  // 5️⃣ Cria BOM
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
