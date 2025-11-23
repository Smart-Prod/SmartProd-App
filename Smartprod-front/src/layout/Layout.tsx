"use client"

import React, { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import {
  Menu,
  Home,
  Package,
  Factory,
  Truck,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Boxes,
  ClipboardList,
  Archive,
  ChevronLeft,
  ChevronRight,
  FilePlus, // <-- Adicionado para corrigir ReferenceError: FilePlus is not defined
} from "lucide-react"
import { ImageWithFallback } from "@/components/ui/ImageWithFallback"
/* ---------- Example image imports (update paths to match your repo) ---------- */
import logoFull from "@/assets/logo-full.png"
import logoIcon from "@/assets/logo-icon.png"

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  const menuItems = [
    { id: "/dashboard", label: "Dashboard", icon: Home },
    { id: "/products", label: "Cadastros", icon: FilePlus },
    { id: "/products", label: "Produtos", icon: Package },
    { id: "/raw-materials", label: "Matéria-Prima", icon: Boxes },
    { id: "/finished-goods", label: "Produtos Acabados", icon: Archive },
    { id: "/production-orders", label: "Ordens de Produção", icon: ClipboardList },
    { id: "/invoices", label: "Notas Fiscais", icon: FileText },
    { id: "/movements", label: "Movimentações", icon: Truck },
    { id: "/reports", label: "Relatórios", icon: BarChart3 },
  ];

  const adminItems = [{ id: "admin", label: "Administração", icon: Settings }];

  const handleLogout = () => logout();

  // Sidebar component
  const Sidebar = ({ collapsed = false, showToggle = false }: { collapsed?: boolean; showToggle?: boolean }) => (
    <div className="flex flex-col h-full bg-white border-r">
      {/* Logo + Toggle */}
      <div className="p-6 border-b relative">
        <div className={`flex items-center transition-all duration-300 ${collapsed ? "justify-center" : "space-x-3"}`}>
          <ImageWithFallback
            src={collapsed ? logoIcon : logoFull}
            alt="Smart Prod"
            className={`h-10 ${collapsed ? "w-10" : "w-auto max-w-[200px]"} object-contain transition-all duration-300`}
          />
        </div>

        {showToggle && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-white shadow-sm hidden lg:flex hover:bg-gray-100 transition-colors"
                  onClick={() => setDesktopCollapsed(!desktopCollapsed)}
                >
                  {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{collapsed ? "Expandir menu" : "Recolher menu"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <TooltipProvider>
          <div className="space-y-2">
            {menuItems.map((item) =>
              collapsed ? (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={currentPage === item.id ? "secondary" : "ghost"}
                      className="w-full justify-center px-2"
                      onClick={() => onNavigate(item.id)}
                    >
                      <item.icon className={`h-4 w-4 ${currentPage === item.id ? "text-primary" : ""}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => onNavigate(item.id)}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              )
            )}
          </div>

          {/* Admin Menu */}
          {user?.role === "admin" && (
            <div className="mt-8">
              {!collapsed && <h3 className="px-2 text-sm text-muted-foreground mb-2">Administração</h3>}
              <div className="space-y-2">
                {adminItems.map((item) =>
                  collapsed ? (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={currentPage === item.id ? "secondary" : "ghost"}
                          className="w-full justify-center px-2"
                          onClick={() => onNavigate(item.id)}
                        >
                          <item.icon className={`h-4 w-4 ${currentPage === item.id ? "text-primary" : ""}`} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  ) : (
                    <Button
                      key={item.id}
                      variant={currentPage === item.id ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => onNavigate(item.id)}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  )
                )}
              </div>
            </div>
          )}
        </TooltipProvider>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        {!collapsed && (
          <div className="flex items-center justify-between mb-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm truncate">{user?.name}</p>
              <Badge variant="outline" className="text-xs">
                {user?.role}
              </Badge>
            </div>
          </div>
        )}

        {collapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleLogout} className="w-full px-2">
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Sair</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 transition-all duration-300 z-30 ${
          desktopCollapsed ? "lg:w-20" : "lg:w-64"
        }`}
      >
        <Sidebar collapsed={desktopCollapsed} showToggle />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-40 bg-white shadow-sm"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar collapsed={false} showToggle={false} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${desktopCollapsed ? "lg:pl-20" : "lg:pl-64"}`}>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};