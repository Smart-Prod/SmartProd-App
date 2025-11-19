import axios from 'axios'
import type { LoginRequest } from '../types/auth'


const API = axios.create({
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333',
headers: { 'Content-Type': 'application/json' },
})


export async function login(payload: LoginRequest) {
const { data } = await API.post('/auth/login', payload)
// Expecting { user: { ... }, token: '...' }
return data
}


export default API