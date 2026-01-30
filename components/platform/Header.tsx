"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Bell, 
  Menu, 
  Search, 
  User, 
  Settings, 
  Calendar, 
  Users, 
  FileText,
  Command,
  MessageSquare,
  Video,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import { Sidebar } from "./Sidebar";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Quick Actions for Command Palette
const quickActions = [
  { label: "Nueva Cita", icon: Calendar, href: "/provider/dashboard/appointments/new", shortcut: "C" },
  { label: "Ver Pacientes", icon: Users, href: "/provider/dashboard/patients", shortcut: "P" },
  { label: "Mis Documentos", icon: FileText, href: "/provider/dashboard/documents", shortcut: "D" },
  { label: "Configuración", icon: Settings, href: "/provider/settings/preferences", shortcut: "S" },
  { label: "Iniciar Videollamada", icon: Video, href: "/provider/video-call", shortcut: "V" },
  { label: "Mensajes", icon: MessageSquare, href: "/provider/dashboard/messages", shortcut: "M" },
];

// Mock Notifications
const notifications = [
  {
    id: 1,
    type: "appointment",
    title: "Nueva cita confirmada",
    description: "María García ha confirmado su cita para mañana a las 10:00 AM",
    time: "Hace 5 min",
    read: false,
    icon: CheckCircle,
    iconColor: "text-chart-3",
  },
  {
    id: 2,
    type: "reminder",
    title: "Recordatorio de cita",
    description: "Tu próxima cita con Juan Pérez es en 30 minutos",
    time: "Hace 15 min",
    read: false,
    icon: Clock,
    iconColor: "text-chart-4",
  },
  {
    id: 3,
    type: "alert",
    title: "Documentos pendientes",
    description: "Tienes 3 recetas médicas pendientes de firma",
    time: "Hace 1 hora",
    read: true,
    icon: AlertCircle,
    iconColor: "text-chart-5",
  },
  {
    id: 4,
    type: "message",
    title: "Nuevo mensaje",
    description: "Carlos López te ha enviado un mensaje sobre su tratamiento",
    time: "Hace 2 horas",
    read: true,
    icon: MessageSquare,
    iconColor: "text-chart-2",
  },
];

export const Header = () => {
  const router = useRouter();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const unreadCount = notifications.filter(n => !n.read).length;

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredActions = quickActions.filter(action =>
    action.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
        
        {/* Left: Mobile Toggle & Search */}
        <div className="flex items-center gap-4">
          
          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 border-border">
                <Sidebar />
              </SheetContent>
            </Sheet>
          </div>

          {/* Command Palette Trigger */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="hidden md:flex items-center gap-3 h-10 px-4 rounded-lg border border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors min-w-[280px] lg:min-w-[320px]"
          >
            <Search className="w-4 h-4" />
            <span className="text-sm flex-1 text-left">Buscar o ejecutar comando...</span>
            <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <Command className="w-3 h-3" />K
            </kbd>
          </button>

          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setIsCommandOpen(true)}
          >
            <Search className="w-5 h-5" />
          </Button>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-2">
          
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="font-semibold text-foreground">Notificaciones</h3>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount} nuevas
                  </Badge>
                )}
              </div>
              <ScrollArea className="h-[320px]">
                <div className="py-2">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      className={cn(
                        "w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left",
                        !notification.read && "bg-primary/5"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        notification.read ? "bg-muted" : "bg-primary/10"
                      )}>
                        <notification.icon className={cn("w-4 h-4", notification.iconColor)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm truncate",
                          !notification.read && "font-medium text-foreground"
                        )}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {notification.description}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {notification.time}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
              <div className="border-t border-border p-2">
                <Button variant="ghost" className="w-full text-sm text-muted-foreground hover:text-foreground">
                  Ver todas las notificaciones
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 gap-2 px-2 hover:bg-muted">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage src="/avatars/doctor-01.jpg" alt="Dr. Usuario" />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">DR</AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-foreground">Dr. Sandoval</span>
                  <span className="text-[10px] text-muted-foreground">Pro Plan</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Dr. Marcos Sandoval</p>
                  <p className="text-xs text-muted-foreground">m.sandoval@quhealthy.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push('/provider/profile')}>
                  <User className="mr-2 h-4 w-4" /> Mi Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/provider/settings/billing')}>
                  <FileText className="mr-2 h-4 w-4" /> Facturación
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/provider/settings/preferences')}>
                  <Settings className="mr-2 h-4 w-4" /> Configuración
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Command Palette Dialog */}
      <Dialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
          <div className="flex items-center border-b border-border px-4">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar pacientes, citas, acciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-14 px-4 text-sm bg-transparent border-0 outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            <button
              onClick={() => setIsCommandOpen(false)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <ScrollArea className="max-h-[320px]">
            <div className="p-2">
              <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Acciones Rápidas
              </p>
              {filteredActions.map((action) => (
                <button
                  key={action.href}
                  onClick={() => {
                    router.push(action.href);
                    setIsCommandOpen(false);
                    setSearchQuery("");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                    <action.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="flex-1 text-left">{action.label}</span>
                  <kbd className="h-5 px-1.5 rounded border border-border bg-background font-mono text-[10px] text-muted-foreground">
                    {action.shortcut}
                  </kbd>
                </button>
              ))}
              
              {filteredActions.length === 0 && (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No se encontraron resultados
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="border-t border-border px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1 rounded border border-border bg-background">↑↓</kbd>
                navegar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 rounded border border-border bg-background">↵</kbd>
                seleccionar
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1 rounded border border-border bg-background">esc</kbd>
              cerrar
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
