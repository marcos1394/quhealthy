"use client";

import React from "react";
import Link from "next/link";
import { FaUser, FaCalendarAlt, FaClipboard, FaSearch, FaWallet, FaBell } from "react-icons/fa";
import { motion } from "framer-motion";

interface SidebarProps {
  activePage: string;
  isOpen: boolean;
  onToggle: () => void;
  onNavigate?: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, isOpen, onToggle, onNavigate }) => {
    const menuItems = [
      { id: "profile", name: "Perfil", icon: <FaUser />, link: "/profile" },
      { id: "search", name: "Buscar Servicios", icon: <FaSearch />, link: "/search" },
      { id: "appointments", name: "Citas", icon: <FaCalendarAlt />, link: "/appointments" },
      { id: "history", name: "Historial Médico", icon: <FaClipboard />, link: "/history" },
      { id: "payments", name: "Pagos", icon: <FaWallet />, link: "/payments" },
      { id: "notifications", name: "Notificaciones", icon: <FaBell />, link: "/notifications" },
    ];
  
    return (
      <>
        {/* Overlay para móvil */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={onToggle}
          />
        )}
  
        {/* Sidebar */}
        <motion.div
  initial={{ x: -300 }} // Oculto fuera de la pantalla
  animate={{
    x: isOpen || window.innerWidth >= 1024 ? 0 : -300, // Visible en pantallas grandes o cuando está abierto
  }}
  transition={{ duration: 0.3 }}
  className={`fixed left-0 top-0 h-full w-64 bg-gray-800 text-white shadow-lg z-30 flex flex-col py-6 px-4 lg:relative lg:translate-x-0 lg:block`}
>
          {/* Botón para cerrar en móvil */}
          <button
            onClick={onToggle}
            className="absolute right-4 top-4 text-white lg:hidden"
          >
            ✕
          </button>
  
          {/* Logo o Encabezado */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-teal-400 text-center">QuHealthy</h1>
            <p className="text-center text-sm text-gray-400">Tu salud conectada</p>
          </div>
  
          {/* Menú */}
          <nav className="flex-1">
            <ul className="space-y-4">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.link}
                    className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-300 ${
                      activePage === item.id
                        ? "bg-teal-500 text-white"
                        : "bg-gray-700 hover:bg-teal-400 hover:text-white"
                    }`}
                    onClick={() => {
                      onNavigate?.(item.id);
                      if (window.innerWidth < 1024) onToggle();
                    }}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
  
          {/* Botón Cerrar Sesión */}
          <div className="mt-auto">
            <button
              onClick={() => {
                alert("Cerrar sesión");
              }}
              className="w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition-all"
            >
              Cerrar Sesión
            </button>
          </div>
        </motion.div>
      </>
    );
  };

export default Sidebar;