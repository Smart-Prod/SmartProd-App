import React, { JSX, Suspense, lazy } from "react"
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { ErrorBoundary } from "./utils/ErrorBoundary"
import { Toaster } from "./components/ui/sonner"
import { LoadingSpinner } from "./components/common/LoadingSpinner"

// Lazy imports para páginas
const Login = lazy(() => import("./pages/Login"))
const Register = lazy(() => import("./pages/Register"))
const Layout = lazy(() => import("./layout/Layout").then(m => ({ default: m.Layout })))
const Dashboard = lazy(() => import("./pages/Dashboard").then(m => ({ default: m.Dashboard })))
const ProductsPage = lazy(() => import("./pages/ProductsPage").then(m => ({ default: m.ProductsPage })))
const RawMaterialsPage = lazy(() => import("./pages/RawMaterialsPage").then(m => ({ default: m.RawMaterialsPage })))
const FinishedGoodsPage = lazy(() => import("./pages/FinishedGoodsPage").then(m => ({ default: m.FinishedGoodsPage })))
const ProductionOrdersPage = lazy(() => import("./pages/ProductionOrdersPage").then(m => ({ default: m.ProductionOrdersPage })))
const InvoicesPage = lazy(() => import("./pages/InvoicesPage").then(m => ({ default: m.InvoicesPage })))
const MovementsPage = lazy(() => import("./pages/MovementsPageImproved").then(m => ({ default: m.MovementsPageImproved })))
const ReportsPage = lazy(() => import("./pages/ReportsPage").then(m => ({ default: m.ReportsPage })))
const AdminPage = lazy(() => import("./pages/AdminPage").then(m => ({ default: m.AdminPage })))

/** --- Proteção de Rotas --- */
function RequireAuth({ children }: { children: React.ReactElement }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

function RequireRole({
  children,
  role,
}: {
  children: React.ReactElement
  role: string
}) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to="/dashboard" replace />
  return children
}

/** Layout wrapper */
function AppLayoutWrapper() {
  const navigate = useNavigate()
  const location = useLocation()

  const onNavigate = (page: string) => navigate(page)

  return (
    <Layout currentPage={location.pathname} onNavigate={onNavigate}>
      <Outlet />
    </Layout>
  )
}


/** Fallback para lazy loading */
function Loader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner />
    </div>
  )
}

/** App Principal */
export default function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<Loader />}>
            <Routes>
              {/* Público */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Redirect raiz */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Rotas protegidas + layout */}
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
                  <Route path="products/:id" element={<ProductsPage />} />
                  <Route path="raw-materials" element={<RawMaterialsPage />} />
                  <Route path="finished-goods" element={<FinishedGoodsPage />} />
                  <Route path="production-orders" element={<ProductionOrdersPage />} />
                  <Route path="invoices" element={<InvoicesPage />} />
                  <Route path="movements" element={<MovementsPage />} />
                  <Route path="reports" element={<ReportsPage />} />

                  {/* Admin */}
                  <Route
                    path="admin"
                    element={
                      <RequireRole role="admin">
                        <AdminPage />
                      </RequireRole>
                    }
                  />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>

            <Toaster />
          </BrowserRouter>
        </AuthProvider>
      </ErrorBoundary>
  )
}