"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Store, 
  Calendar, 
  Users, 
  BarChart3, 
  Settings,
  HeartPulse,
  ChevronLeft,
  User,
  LogOut,
  Bell,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

// Configuración de elementos de navegación con badges y descripciones
const navItems = [
  { 
    name: 'Dashboard', 
    href: '/quhealthy/dashboard', 
    icon: LayoutDashboard,
    description: 'Vista general de tu práctica',
    badge: null,
    color: 'from-blue-500 to-cyan-500'
  },
  { 
    name: 'Mi Tienda', 
    href: '/quhealthy/profile/providers/marketplace', 
    icon: Store,
    description: 'Productos y servicios',
    badge: 'Nuevo',
    color: 'from-emerald-500 to-teal-500'
  },
  { 
    name: 'Agenda', 
    href: '/quhealthy/profile/providers/calendar', 
    icon: Calendar,
    description: 'Citas y horarios',
    badge: '3',
    color: 'from-purple-500 to-pink-500'
  },
  { 
    name: 'Pacientes', 
    href: '/quhealthy/profile/providers/patients', 
    icon: Users,
    description: 'Gestión de pacientes',
    badge: null,
    color: 'from-orange-500 to-red-500'
  },
  { 
    name: 'Reportes', 
    href: '/quhealthy/profile/providers/reports', 
    icon: BarChart3,
    description: 'Análisis y estadísticas',
    badge: null,
    color: 'from-indigo-500 to-purple-500'
  },
  { 
    name: 'Configuración', 
    href: '/quhealthy/profile/providers/settings', 
    icon: Settings,
    description: 'Preferencias y ajustes',
    badge: null,
    color: 'from-gray-500 to-slate-500'
  },
];

// Elementos del footer
const footerItems = [
  { name: 'Ayuda', icon: HelpCircle, href: '/help' },
  { name: 'Notificaciones', icon: Bell, href: '/notifications', badge: '2' },
];

// Animaciones
const sidebarVariants = {
  expanded: {
    width: 280,
    transition: { 
      duration: 0.3, 
      ease: [0.25, 0.46, 0.45, 0.94] 
    }
  },
  collapsed: {
    width: 80,
    transition: { 
      duration: 0.3, 
      ease: [0.25, 0.46, 0.45, 0.94] 
    }
  }
};

const itemVariants = {
  expanded: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, delay: 0.1 }
  },
  collapsed: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.15 }
  }
};

const iconVariants = {
  hover: {
    scale: 1.1,
    rotate: [0, -10, 10, 0],
    transition: { 
      scale: { duration: 0.2 },
      rotate: { duration: 0.4 }
    }
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

const badgeVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 500, 
      damping: 30 
    }
  },
  pulse: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = "" }) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = useState({
    name: "Dr. Juan Pérez",
    email: "juan.perez@quhealthy.com",
    avatar: "JP",
    status: "online",
    plan: "Pro"
  });

  // Auto-collapse en pantallas pequeñas
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const renderNavItem = (item: typeof navItems[0]) => {
    const isActive = pathname === item.href;
    
    return (
      <motion.div
        key={item.name}
        className="relative group"
        onHoverStart={() => setHoveredItem(item.name)}
        onHoverEnd={() => setHoveredItem(null)}
        whileHover="hover"
        whileTap="tap"
      >
        <Link
          href={item.href}
          className={`
            relative flex items-center rounded-xl transition-all duration-300 overflow-hidden
            ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3'}
            ${isActive
              ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 shadow-lg shadow-purple-500/10'
              : 'hover:bg-gradient-to-r hover:from-gray-700/30 hover:to-gray-600/30 border border-transparent'
            }
          `}
        >
          {/* Background gradient effect */}
          {isActive && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r opacity-10"
              style={{
                background: `linear-gradient(135deg, ${item.color.split(' ')[0].replace('from-', '')}, ${item.color.split(' ')[2].replace('to-', '')})`
              }}
              layoutId="activeBackground"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}

          {/* Icon */}
          <motion.div
            className="relative z-10"
            variants={iconVariants}
          >
            <item.icon 
              className={`
                w-6 h-6 transition-all duration-300
                ${isActive 
                  ? 'text-white drop-shadow-sm' 
                  : 'text-gray-400 group-hover:text-white'
                }
              `} 
            />
            {/* Icon glow effect */}
            {isActive && (
              <motion.div
                className="absolute inset-0 blur-sm opacity-50"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <item.icon className="w-6 h-6 text-purple-400" />
              </motion.div>
            )}
          </motion.div>

          {/* Text and description */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                className="flex-1 ml-4 min-w-0"
                variants={itemVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`
                      font-medium transition-colors duration-300 truncate
                      ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}
                    `}>
                      {item.name}
                    </p>
                    <p className={`
                      text-xs transition-colors duration-300 truncate mt-0.5
                      ${isActive ? 'text-purple-200' : 'text-gray-500 group-hover:text-gray-400'}
                    `}>
                      {item.description}
                    </p>
                  </div>
                  
                  {/* Badge */}
                  {item.badge && (
                    <motion.div
                      variants={badgeVariants}
                      initial="initial"
                      animate={["animate", item.badge === "Nuevo" ? "pulse" : ""]}
                      className={`
                        px-2 py-0.5 text-xs font-bold rounded-full
                        ${item.badge === "Nuevo" 
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-sm' 
                          : 'bg-purple-500 text-white shadow-sm'
                        }
                      `}
                    >
                      {item.badge}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tooltip para modo colapsado */}
          <AnimatePresence>
            {isCollapsed && hoveredItem === item.name && (
              <motion.div
                initial={{ opacity: 0, x: -10, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -10, scale: 0.8 }}
                className="absolute left-full ml-4 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-xl border border-gray-700 whitespace-nowrap z-50"
              >
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-gray-400 mt-1">{item.description}</div>
                {/* Flecha del tooltip */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 rotate-45 border-l border-b border-gray-700"></div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active indicator */}
          {isActive && (
            <motion.div
              className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-400 to-blue-400 rounded-l-full"
              layoutId="activeIndicator"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </Link>
      </motion.div>
    );
  };

  return (
    <motion.aside
      className={`
        hidden md:flex flex-col bg-gradient-to-b from-gray-900/95 to-gray-800/95 
        backdrop-blur-xl border-r border-gray-700/50 relative overflow-hidden ${className}
      `}
      variants={sidebarVariants}
      animate={isCollapsed ? "collapsed" : "expanded"}
      initial={false}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between h-20 px-4 border-b border-gray-700/50">
        <AnimatePresence>
          {!isCollapsed ? (
            <motion.div
              className="flex items-center"
              variants={itemVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
            >
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
              >
                <HeartPulse className="w-8 h-8 text-purple-400" />
                <motion.div
                  className="absolute inset-0 blur-sm"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <HeartPulse className="w-8 h-8 text-purple-400" />
                </motion.div>
              </motion.div>
              <div className="ml-3">
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  QuHealthy
                </h1>
                <div className="flex items-center mt-1">
                  <Sparkles className="w-3 h-3 text-yellow-400 mr-1" />
                  <span className="text-xs text-yellow-400 font-medium">{user.plan}</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="relative mx-auto"
            >
              <HeartPulse className="w-8 h-8 text-purple-400" />
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle button */}
        <motion.button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-all duration-200 ml-auto"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.div>
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 relative z-10">
        {navItems.map(renderNavItem)}
        
        {/* Divider */}
        <motion.div 
          className="my-6 border-t border-gray-700/50"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        />
        
        {/* Footer items */}
        <div className="space-y-2">
          {footerItems.map((item) => (
            <motion.div
              key={item.name}
              className="relative group"
              whileHover="hover"
              whileTap="tap"
            >
              <Link
                href={item.href}
                className={`
                  flex items-center rounded-xl transition-all duration-300
                  ${isCollapsed ? 'justify-center p-3' : 'px-4 py-2'}
                  hover:bg-gray-700/30 text-gray-400 hover:text-white
                `}
              >
                <motion.div variants={iconVariants} className="relative">
                  <item.icon className="w-5 h-5" />
                  {item.badge && (
                    <motion.div
                      variants={badgeVariants}
                      initial="initial"
                      animate="animate"
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                    >
                      {item.badge}
                    </motion.div>
                  )}
                </motion.div>
                
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      className="ml-3 text-sm"
                      variants={itemVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          ))}
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="relative z-10 p-4 border-t border-gray-700/50">
        <AnimatePresence>
          {!isCollapsed ? (
            <motion.div
              variants={itemVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="space-y-3"
            >
              {/* User info */}
              <motion.div 
                className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600/30 hover:border-purple-500/30 transition-all duration-300 cursor-pointer group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center font-semibold text-white text-sm shadow-lg">
                    {user.avatar}
                  </div>
                  <motion.div
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-800 ${
                      user.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                    }`}
                    animate={user.status === 'online' ? {
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7]
                    } : {}}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate group-hover:text-purple-200 transition-colors">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              </motion.div>

              {/* Action buttons */}
              <div className="flex space-x-2">
                <motion.button
                  className="flex-1 flex items-center justify-center p-2 rounded-lg bg-gray-700/50 hover:bg-purple-600/20 text-gray-400 hover:text-purple-300 transition-all duration-200 border border-gray-600/30 hover:border-purple-500/30"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <User className="w-4 h-4" />
                </motion.button>
                <motion.button
                  className="flex-1 flex items-center justify-center p-2 rounded-lg bg-gray-700/50 hover:bg-red-600/20 text-gray-400 hover:text-red-300 transition-all duration-200 border border-gray-600/30 hover:border-red-500/30"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Copyright */}
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  © {new Date().getFullYear()} QuHealthy
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="flex flex-col items-center space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {/* Collapsed user avatar */}
              <motion.div 
                className="relative cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center font-semibold text-white text-sm shadow-lg">
                  {user.avatar}
                </div>
                <motion.div
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-800 ${
                    user.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                  }`}
                  animate={user.status === 'online' ? {
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
              
              {/* Collapsed logout button */}
              <motion.button
                className="p-2 rounded-lg hover:bg-red-600/20 text-gray-400 hover:text-red-300 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
};