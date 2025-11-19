import * as userService from '../services/user.service.js';
import { successResponse, errorResponse } from '../utils/response.util.js';

export const register = async (req, res) => {
  try {
    const { name, email, senha } = req.body;

    if (!name || !email || !senha) {
      return errorResponse(res, 400, "Nome, email e senha são obrigatórios.");
    }

    const user = await userService.createUser(req.body);
    const { senha: _, ...userWithoutPassword } = user;

    return successResponse(res, 201, 'Usuário criado com sucesso!', userWithoutPassword);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

export const login = async (req, res) => {
  try {
    console.log("REQ BODY LOGIN:", req.body); // 🔍 Debug temporário

    const { email, senha } = req.body;

    // 🚨 Isso evita o erro do Prisma
    if (!email || !senha) {
      return errorResponse(res, 400, "Email e senha são obrigatórios.");
    }

    const { user, token } = await userService.loginUser(email, senha);

    const { senha: _, ...userWithoutPassword } = user;

    return successResponse(res, 200, 'Login realizado com sucesso!', {
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    return errorResponse(res, 401, error.message);
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    return successResponse(res, 200, 'Usuários listados com sucesso!', users);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
