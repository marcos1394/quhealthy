"use client";

import React from "react";
import { Bell, Menu, Search, User } from "lucide-react";
import { Sidebar } from "./Sidebar"; // Reusamos el sidebar para el móvil

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  return (
    <header className="h-16 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-6">
      
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-4">
        
        {/* Mobile Menu Trigger (Solo visible en pantallas pequeñas) */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="default" className="text-gray-400 hover:text-white">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            {/* El sidebar se renderiza dentro del Sheet en móvil */}
            <SheetContent size="default" className="p-0 bg-gray-950 border-gray-800 w-72">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input 
            placeholder="Buscar pacientes, citas o ajustes..." 
            className="pl-10 bg-gray-900 border-gray-800 text-gray-300 focus:border-purple-500 rounded-full h-10 transition-all focus:w-full"
          />
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-3">
        
        {/* Notifications */}
        <Button variant="ghost" size="default" className="relative text-gray-400 hover:text-white hover:bg-gray-800 rounded-full">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full border-2 border-gray-950"></span>
        </Button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-9 w-9 border border-gray-700 cursor-pointer hover:border-purple-500 transition-colors">
                <AvatarImage src="/avatars/01.png" alt="@usuario" />
                <AvatarFallback className="bg-purple-900 text-purple-200">DR</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-gray-900 border-gray-800 text-gray-200" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-white">Dr. Marcos Sandoval</p>
                <p className="text-xs leading-none text-gray-500">m.sandoval@quhealthy.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-800" />
            <DropdownMenuItem className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800">
                <User className="mr-2 h-4 w-4" /> Mi Perfil
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800">
                Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-800" />
            <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-red-900/20 cursor-pointer">
                Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};