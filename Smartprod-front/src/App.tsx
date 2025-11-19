import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './pages/Login'
import Dashboard from './pages/Dashboard'


export default function App(): JSX.Element {
return (
<AuthProvider>
<Routes>
<Route path="/login" element={<LoginPage />} />
<Route
path="/dashboard"
element={
<RequireAuth>
<Dashboard />
</RequireAuth>
}
/>
<Route path="/" element={<Navigate to="/dashboard" replace />} />
</Routes>
</AuthProvider>
)
}


function RequireAuth({ children }: { children: JSX.Element }) {
const { user } = useAuth()
if (!user) return <Navigate to="/login" replace />
return children
}