import axios from "axios";
import type { LoginRequest } from "../types/auth";
import type { InternalAxiosRequestConfig, AxiosRequestHeaders } from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/SmartProd-api",
  headers: { "Content-Type": "application/json" },
});

// Interceptor para incluir o token (lê sessionStorage em vez de localStorage)
API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = sessionStorage.getItem("token"); // <-- sessionStorage
  config.headers = (config.headers ?? {}) as AxiosRequestHeaders;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// LOGIN TIPADO - exemplo: armazenar token em sessionStorage
export async function login(payload: LoginRequest) {
  const { data } = await API.post("/users/login", payload);
  const result = data.data;
  // supondo que result contém { token: "..." } — adapte conforme sua API
  if (result?.token) {
    sessionStorage.setItem("token", result.token);
    API.defaults.headers.common["Authorization"] = `Bearer ${result.token}`;
  }
  return result;
}

// LOGOUT - limpa sessionStorage
export function logout() {
  sessionStorage.removeItem("token");
  delete API.defaults.headers.common["Authorization"];
}

export default API;