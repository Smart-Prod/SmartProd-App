"use client"

import React, { JSX } from "react"
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom"

import { AuthProvider, useAuth } from "../src/contexts/AuthContext"
import { AppProvider } from "../src/contexts/AppContext"
import { ErrorBoundary } from "../src/utils/ErrorBoundary"
import { Login } from "../src/pages/Login"
import Register from "../src/pages/Register"
import { Layout } from "../src/layout/Layout"
import { Dashboard } from "../src/pages/Dashboard"
import { ProductsPage } from "../src/pages/ProductsPage"
import { RawMaterialsPage } from "../src/pages/RawMaterialsPage"
import { FinishedGoodsPage } from "../src/pages/FinishedGoodsPage"
import { ProductionOrdersPage } from "../src/pages/ProductionOrdersPage"
import { InvoicesPage } from "../src/pages/InvoicesPage"
import { MovementsPageImproved as MovementsPage } from "../src/pages/MovementsPageImproved"
import { ReportsPage } from "../src/pages/ReportsPage"
import { AdminPage } from "../src/pages/AdminPage"
import { Toaster } from "./components/ui/sonner"

/**
 * Proteção de rota genérica — redireciona para /login se não estiver autenticado.
 */
function RequireAuth({ children }: { children: React.ReactElement }) {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}

/**
 * Proteção de rota para papéis — verifica role do usuário e redireciona ao dashboard
 * caso o usuário não tenha permissão.
 */
function RequireRole({
  children,
  role,
}: {
  children: React.ReactElement
  role: string
}) {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (user.role !== role) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

/**
 * Wrapper usado para rotas que compartilham o layout (barra lateral/topbar).
 * O Layout original exige props `currentPage` e `onNavigate`. Aqui nós
 * derivamos `currentPage` do pathname e fornecemos `onNavigate` usando
 * react-router's navigate to keep the Layout working without changing it.
 *
 * Important: Layout must render an <Outlet /> where nested routes appear.
 */
/**
 * AppLayoutWrapper — não passa mais `currentPage` ou `onNavigate` para Layout.
 * Layout agora deriva currentPage e realiza navegação internamente (useLocation/useNavigate).
 */
function AppLayoutWrapper() {
  const navigate = useNavigate();
  const location = useLocation();

  const onNavigate = (page: string) => {
    navigate(page);
  };

  return (
    <Layout currentPage={location.pathname} onNavigate={onNavigate}>
      <Outlet />
    </Layout>
  );
}



/**
 * Aplicação principal com React Router v6.
 */
export default function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* rota pública de login */}
            <Route path="/login" element={<Login />} />
            <Route path="register" element={<Register />} />
            {/* rota raiz redireciona para dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* rotas que usam o layout e requerem autenticação */}
            <Route
              element={
                <RequireAuth>
                  <AppLayoutWrapper />
                </RequireAuth>
              }
            >

              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<ProductsPage />} />
              
              <Route path="raw-materials" element={<RawMaterialsPage />} />
              <Route path="finished-goods" element={<FinishedGoodsPage />} />
              <Route path="production-orders" element={<ProductionOrdersPage />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="movements" element={<MovementsPage />} />
              <Route path="reports" element={<ReportsPage />} />

              {/* rota admin protegida por role */}
              <Route
                path="admin"
                element={
                  <RequireRole role="admin">
                    <AdminPage />
                  </RequireRole>
                }
              />
            </Route>

            {/* rota catch-all: redireciona para dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </ErrorBoundary>
  )
}