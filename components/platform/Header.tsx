"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Menu, 
  Search, 
  User,
  LogOut,
  Settings,
  CreditCard,
  HelpCircle,
  Sparkles,
  Calendar,
  Users,
  TrendingUp,
  X,
  Command
} from "lucide-react";
import { Sidebar } from "./Sidebar";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * Header Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. FEEDBACK INMEDIATO
 *    - Notification badge con contador
 *    - Search suggestions en tiempo real
 *    - Visual hover states
 *    - Quick stats visible
 * 
 * 2. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Icons descriptivos
 *    - Labels claros
 *    - Quick actions visibles
 *    - Recent searches
 * 
 * 3. AFFORDANCE
 *    - Clickable areas claras
 *    - Hover effects
 *    - Interactive badges
 *    - Clear CTAs
 * 
 * 4. PRIMING
 *    - Notifications destacadas
 *    - Stats positivos
 *    - Success indicators
 *    - Growth badges
 * 
 * 5. CREDIBILIDAD
 *    - Profile stats
 *    - Professional avatar
 *    - Plan badge
 *    - Trust indicators
 * 
 * 6. MINIMIZAR CARGA COGNITIVA
 *    - Quick actions
 *    - Search shortcuts
 *    - One-click access
 *    - Clear hierarchy
 */

// Mock data - CREDIBILIDAD
const mockNotifications = [
  { id: 1, type: 'appointment', message: 'Nueva cita agendada', time: '5 min', unread: true },
  { id: 2, type: 'review', message: 'Nueva reseña recibida', time: '1h', unread: true },
  { id: 3, type: 'payment', message: 'Pago procesado', time: '2h', unread: false }
];

const searchSuggestions = [
  { type: 'patient', label: 'Juan Pérez', icon: User },
  { type: 'appointment', label: 'Citas de hoy', icon: Calendar },
  { type: 'setting', label: 'Configuración', icon: Settings }
];

export const Header = () => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const unreadCount = mockNotifications.filter(n => n.unread).length;

  return (
    <header className="h-16 border-b border-gray-800 bg-gray-950/95 backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 shadow-lg shadow-black/5">
      
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-4 flex-1">
        
        {/* Mobile Menu Trigger */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="default"
                className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="p-0 bg-gray-950 border-gray-800 w-72">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </div>

        {/* Global Search Bar - RECONOCIMIENTO */}
        <div className="hidden md:block relative flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input 
              placeholder="Buscar pacientes, citas o ajustes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              className={cn(
                "pl-11 pr-10 bg-gray-900 border-gray-800 text-gray-300 rounded-full h-11 transition-all",
                searchFocused ? "border-purple-500 ring-2 ring-purple-500/20 shadow-lg shadow-purple-500/10" : ""
              )}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="default"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            
            {/* Keyboard Shortcut Hint */}
            {!searchFocused && !searchQuery && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-gray-600">
                <kbd className="px-1.5 py-0.5 bg-gray-800 rounded border border-gray-700 font-mono">
                  ⌘K
                </kbd>
              </div>
            )}
          </div>

          {/* Search Suggestions Dropdown - SATISFICING */}
          <AnimatePresence>
            {searchFocused && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-800 rounded-xl shadow-2xl shadow-black/20 overflow-hidden"
              >
                <div className="p-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                    Búsquedas Sugeridas
                  </p>
                  {searchSuggestions.map((suggestion, index) => {
                    const SuggestionIcon = suggestion.icon;
                    return (
                      <button
                        key={index}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors text-left"
                      >
                        <div className="p-1.5 bg-gray-800 rounded-lg">
                          <SuggestionIcon className="w-4 h-4 text-gray-500" />
                        </div>
                        <span>{suggestion.label}</span>
                        <kbd className="ml-auto px-1.5 py-0.5 bg-gray-800 rounded text-xs text-gray-600 font-mono">
                          ↵
                        </kbd>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-2">
        
        {/* Quick Actions - Mobile Search */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="default"
            className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
          >
            <Search className="w-5 h-5" />
          </Button>
        </div>

        {/* Notifications - PRIMING */}
        <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="default"
              className="relative text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1"
                >
                  <Badge className="bg-purple-500 text-white text-xs px-1.5 min-w-[20px] h-5 flex items-center justify-center border-2 border-gray-950">
                    {unreadCount}
                  </Badge>
                </motion.div>
              )}
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent 
            className="w-80 bg-gray-900 border-gray-800 text-gray-200 p-0" 
            align="end"
          >
            {/* Notifications Header */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Notificaciones</h3>
                {unreadCount > 0 && (
                  <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                    {unreadCount} nuevas
                  </Badge>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {mockNotifications.map((notification, index) => (
                <button
                  key={notification.id}
                  className={cn(
                    "w-full flex items-start gap-3 p-4 text-left transition-colors",
                    notification.unread ? "bg-purple-500/5 hover:bg-purple-500/10" : "hover:bg-gray-800",
                    index !== mockNotifications.length - 1 ? "border-b border-gray-800" : ""
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg flex-shrink-0",
                    notification.type === 'appointment' ? "bg-blue-500/10": "",
                    notification.type === 'review' ? "bg-emerald-500/10" : "",
                    notification.type === 'payment' ? "bg-purple-500/10":""
                  )}>
                    {notification.type === 'appointment' && <Calendar className="w-4 h-4 text-blue-400" />}
                    {notification.type === 'review' && <Sparkles className="w-4 h-4 text-emerald-400" />}
                    {notification.type === 'payment' && <CreditCard className="w-4 h-4 text-purple-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm",
                      notification.unread ? "font-semibold text-white" : "text-gray-300"
                    )}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Hace {notification.time}</p>
                  </div>
                  {notification.unread && (
                    <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2" />
                  )}
                </button>
              ))}
            </div>

            {/* Notifications Footer */}
            <div className="p-3 border-t border-gray-800">
              <Button 
                variant="ghost" 
                className="w-full text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
              >
                Ver todas las notificaciones
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Dropdown - CREDIBILIDAD */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 gap-2 pl-2 pr-3 rounded-full hover:bg-gray-800">
              <Avatar className="h-8 w-8 border-2 border-gray-700 hover:border-purple-500 transition-colors">
                <AvatarImage src="/avatars/01.png" alt="@usuario" />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                  DR
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-semibold text-white">Dr. Marcos</span>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent 
            className="w-72 bg-gray-900 border-gray-800 text-gray-200 p-0" 
            align="end" 
            forceMount
          >
            {/* Profile Header */}
            <div className="p-4 bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-b border-gray-800">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12 border-2 border-purple-500/20">
                  <AvatarImage src="/avatars/01.png" alt="@usuario" />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-lg">
                    DR
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white mb-0.5">Dr. Marcos Sandoval</p>
                  <p className="text-xs text-gray-500 truncate">m.sandoval@quhealthy.com</p>
                  <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 mt-2 text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Plan Premium
                  </Badge>
                </div>
              </div>
            </div>

            {/* Quick Stats - PRIMING */}
            <div className="grid grid-cols-3 gap-2 p-3 border-b border-gray-800">
              <div className="text-center p-2 bg-gray-950/50 rounded-lg">
                <p className="text-lg font-black text-emerald-400">24</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Citas Hoy</p>
              </div>
              <div className="text-center p-2 bg-gray-950/50 rounded-lg">
                <p className="text-lg font-black text-blue-400">4.8</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Rating</p>
              </div>
              <div className="text-center p-2 bg-gray-950/50 rounded-lg">
                <p className="text-lg font-black text-purple-400">156</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Pacientes</p>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <DropdownMenuItem className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800 rounded-lg px-3 py-2.5">
                <User className="mr-3 h-4 w-4 text-purple-400" /> 
                <span className="font-medium">Mi Perfil</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800 rounded-lg px-3 py-2.5">
                <Calendar className="mr-3 h-4 w-4 text-blue-400" /> 
                <span className="font-medium">Mi Agenda</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800 rounded-lg px-3 py-2.5">
                <Users className="mr-3 h-4 w-4 text-emerald-400" /> 
                <span className="font-medium">Mis Pacientes</span>
              </DropdownMenuItem>
            </div>

            <Separator className="bg-gray-800" />

            <div className="p-2">
              <DropdownMenuItem className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800 rounded-lg px-3 py-2.5">
                <Settings className="mr-3 h-4 w-4 text-gray-400" />
                <span>Configuración</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800 rounded-lg px-3 py-2.5">
                <CreditCard className="mr-3 h-4 w-4 text-gray-400" />
                <span>Facturación</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800 rounded-lg px-3 py-2.5">
                <HelpCircle className="mr-3 h-4 w-4 text-gray-400" />
                <span>Ayuda y Soporte</span>
              </DropdownMenuItem>
            </div>

            <Separator className="bg-gray-800" />

            <div className="p-2">
              <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-red-900/20 cursor-pointer rounded-lg px-3 py-2.5 font-semibold">
                <LogOut className="mr-3 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};