import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();

export const createInvoice = async (data) => {
  try {
    // cria diretamente; se number já existir, o banco lançará P2002
    return await prisma.invoice.create({
      data: {
        ...data,
        items: { create: data.items },
      },
      include: { items: true },
    });
  } catch (error) {
    // trata erro de unique constraint (P2002) do Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      // adapta a mensagem conforme necessário
      throw new Error('Número da nota já existe.');
    }
    // rethrow para ser tratado pelo controller
    throw error;
  }
};

export const getAllInvoices = async () => {
  return prisma.invoice.findMany({
    include: { items: true, usuario: true },
  });
};