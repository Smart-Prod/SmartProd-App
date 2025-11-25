import React, { createContext, useContext, useEffect, useState } from 'react';
import API, { login as apiLogin } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'admin' | 'gestor' | 'operador';
  // adapte os campos conforme sua API
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Tenta restaurar a sessão ao iniciar (token + fetch /users/me quando possível)
  useEffect(() => {
    const init = async () => {
      const token = sessionStorage.getItem('token');
      const savedUser = sessionStorage.getItem('user');

      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          sessionStorage.removeItem('user');
        }
      }

      if (token) {
        // Configura o token no header da API
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Se houver token, tenta buscar o perfil atualizado (/users/me)
        try {
          const resp = await API.get('/users');
          // A API SmartProd-Api tende a devolver { success, message, data }
          const payload = resp.data?.data ?? resp.data;
          if (payload) {
            // Ajuste conforme o shape real: payload pode ser o usuário diretamente
            const fetchedUser = payload.user ?? payload;
            setUser(fetchedUser ?? null);
            sessionStorage.setItem('user', JSON.stringify(fetchedUser ?? null));
          }
        } catch {
          // token inválido -> limpa tudo
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          delete API.defaults.headers.common['Authorization'];
          setUser(null);
        }
      }

      setLoading(false);
    };

    init();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // apiLogin já faz POST /users/login e retorna data.data
      const resp = await apiLogin({
        email,
        senha: password, // sua API usa "senha"
      } as any);

      // resp pode conter { user, token } ou similar
      const token = resp?.token ?? resp?.accessToken ?? resp?.tokenAccess ?? null;
      const userFromResp = resp?.user ?? resp?.usuario ?? resp;

      if (token) {
        sessionStorage.setItem('token', token);
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      if (userFromResp) {
        sessionStorage.setItem('user', JSON.stringify(userFromResp));
        setUser(userFromResp);
      }

      return true;
    } catch (err) {
      console.error('Login error', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Ajuste os nomes dos campos conforme sua API: use "nome" ou "name"
      const body = {
        name,
        email,
        senha: password,
      };


      const resp = await API.post('/users/register', body);
      const payload = resp.data?.data ?? resp.data;

      const token = payload?.token ?? payload?.accessToken ?? null;
      const userFromResp = payload?.user ?? payload?.usuario ?? payload;

      if (token) {
        sessionStorage.setItem('token', token);
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      if (userFromResp) {
        sessionStorage.setItem('user', JSON.stringify(userFromResp));
        setUser(userFromResp);
      }

      return true;
    } catch (err) {
      console.error('Register error', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    delete API.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};