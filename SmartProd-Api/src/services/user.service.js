import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

export const createUser = async (data) => {
  const { name, email, senha } = data;

  // 🟢 Troquei "user" por "usuario"
  const existingUser = await prisma.usuario.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('E-mail já está em uso.');
  }

  const hashedPassword = await bcrypt.hash(senha, 10);

  const user = await prisma.usuario.create({
    data: {
      name,
      email,
      senha: hashedPassword,
    },
  });

  return user;
};

export const loginUser = async (email, senha) => {
  const user = await prisma.usuario.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Usuário não encontrado.');
  }

  const senhaValida = await bcrypt.compare(senha, user.senha);
  if (!senhaValida) {
    throw new Error('Senha incorreta.');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

  return { user, token };
};

export const getAllUsers = async () => {
  return prisma.usuario.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });
};
