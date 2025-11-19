import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();

export const createInvoice = async (data) => {
  const { type, items } = data;

  if (!items || items.length === 0) {
    throw new Error("A nota precisa ter ao menos 1 item.");
  }

  return await prisma.$transaction(async (tx) => {
    // 1️⃣ Buscar produtos usados na nota
    const productIds = items.map(i => i.productId);

    const products = await tx.product.findMany({
      where: { id: { in: productIds } }
    });

    if (products.length !== items.length) {
      throw new Error("Algum produto informado não existe.");
    }

    // 2️⃣ Validar regras MP/PA
    for (const item of items) {
      const prod = products.find(p => p.id === item.productId);

      if (type === "ENTRADA" && prod.type !== "MP") {
        throw new Error(`Produto ${prod.name} não é MP. Somente MP aparece em nota de entrada.`);
      }

      if (type === "SAIDA" && prod.type !== "PA") {
        throw new Error(`Produto ${prod.name} não é PA. Somente PA aparece em nota de saída.`);
      }
    }

    // 3️⃣ Atualizar estoque
    for (const item of items) {
      const prod = products.find(p => p.id === item.productId);

      const current = prod.currentStock ?? 0;

      if (type === "ENTRADA") {
        await tx.product.update({
          where: { id: prod.id },
          data: {
            currentStock: current + item.quantity
          }
        });
      }

      if (type === "SAIDA") {
        if (current < item.quantity) {
          throw new Error(
            `Estoque insuficiente do produto ${prod.name}. Atual: ${current} | Necessário: ${item.quantity}`
          );
        }

        await tx.product.update({
          where: { id: prod.id },
          data: {
            currentStock: current - item.quantity
          }
        });
      }
    }

    // 4️⃣ Criar a invoice + items
    try {
      const invoice = await tx.invoice.create({
        data: {
          ...data,
          status: "PROCESSADA",
          items: {
            create: items.map(i => ({
              productId: i.productId,
              quantity: i.quantity,
              value: i.value
            }))
          }
        },
        include: { items: true }
      });

      return invoice;

    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error("O número da nota já existe.");
      }

      throw error;
    }
  });
};
