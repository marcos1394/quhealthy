/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSessionStore } from '@/stores/SessionStore'; // 1. Importamos el store de sesión unificado
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { 
   
  Clock, 
  Crown, 
  X, 
  Zap, 
  Star,
  ArrowRight,
  AlertTriangle,
  Gift,
  Rocket
} from 'lucide-react';

// Tipos para el estado del trial
type TrialUrgency = 'critical' | 'warning' | 'normal';

interface TrialBannerConfig {
  urgency: TrialUrgency;
  icon: React.ReactNode;
  gradient: string;
  borderColor: string;
  textColor: string;
  badgeStyle: string;
  pulseColor: string;
  message: string;
  ctaText: string;
}

// Configuración para diferentes estados de urgencia
const getTrialConfig = (daysLeft: number): TrialBannerConfig => {
  if (daysLeft === 0) {
    return {
      urgency: 'critical',
      icon: <AlertTriangle className="w-5 h-5" />,
      gradient: 'from-red-600/40 via-orange-500/30 to-red-600/40',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-100',
      badgeStyle: 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600',
      pulseColor: 'bg-red-400',
      message: "🚨 Tu período de prueba termina HOY",
      ctaText: "Actualizar Ahora"
    };
  } else if (daysLeft <= 3) {
    return {
      urgency: 'critical',
      icon: <Clock className="w-5 h-5" />,
      gradient: 'from-orange-600/40 via-red-500/30 to-orange-600/40',
      borderColor: 'border-orange-500/30',
      textColor: 'text-orange-100',
      badgeStyle: 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600',
      pulseColor: 'bg-orange-400',
      message: `⚡ Solo ${daysLeft} ${daysLeft === 1 ? 'día' : 'días'} restantes`,
      ctaText: "¡Actualizar Ya!"
    };
  } else if (daysLeft <= 7) {
    return {
      urgency: 'warning',
      icon: <Zap className="w-5 h-5" />,
      gradient: 'from-yellow-600/40 via-amber-500/30 to-yellow-600/40',
      borderColor: 'border-yellow-500/30',
      textColor: 'text-yellow-100',
      badgeStyle: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-600 hover:to-amber-600',
      pulseColor: 'bg-yellow-400',
      message: `⏰ ${daysLeft} días restantes de tu prueba`,
      ctaText: "Ver Planes"
    };
  } else {
    return {
      urgency: 'normal',
      icon: <Gift className="w-5 h-5" />,
      gradient: 'from-purple-600/40 via-blue-500/30 to-purple-600/40',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-100',
      badgeStyle: 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600',
      pulseColor: 'bg-purple-400',
      message: `✨ ${daysLeft} días restantes de tu prueba gratuita`,
      ctaText: "Explorar Planes"
    };
  }
};

// Animaciones
const bannerVariants = {
  initial: { 
    opacity: 0, 
    height: 0, 
    y: -20,
    scale: 0.95
  },
  animate: { 
    opacity: 1, 
    height: 'auto', 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: { 
    opacity: 0, 
    height: 0, 
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

const contentVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      delay: 0.2,
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const badgeVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      delay: 0.4,
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 }
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

const pulseVariants = {
  pulse: {
    scale: [1, 1.2, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const shimmerVariants = {
  shimmer: {
    x: [-100, 200],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
      repeatDelay: 3
    }
  }
};

export const TrialBanner = () => {
  const { user, isLoading } = useSessionStore();
  const [isDismissed, setIsDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number } | null>(null);

  // Derivamos las propiedades necesarias directamente del objeto 'user'
  const planStatus = user?.planStatus;
  const trialExpiresAt = user && user.role === 'provider' ? (user as any).trialExpiresAt : null;

  useEffect(() => {
    // La validación ahora comprueba el rol y el estado del plan desde 'user'
    if (user?.role !== 'provider' || planStatus !== 'trial' || !trialExpiresAt) {
      setTimeLeft(null);
      return;
    }

    const expiryDateString = trialExpiresAt;

    const updateTimeLeft = () => {
      const today = new Date();
      const expiryDate = new Date(expiryDateString);
      const diffTime = expiryDate.getTime() - today.getTime();
      
      if (diffTime <= 0) {
        setTimeLeft({ hours: 0, minutes: 0 });
        return;
      }

      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysLeft <= 1) { // Mostrar horas en el último día
        const hours = Math.floor((diffTime / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diffTime / 1000 / 60) % 60);
        setTimeLeft({ hours, minutes });
      } else {
        setTimeLeft(null);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); 

    return () => clearInterval(interval);
  }, [user, planStatus, trialExpiresAt]); // Dependemos del objeto 'user' completo

  // Condición de renderizado actualizada
  if (isLoading || !user || user.role !== 'provider' || planStatus !== 'trial' || !trialExpiresAt || isDismissed) {
    return null;
  }

  // El resto de la lógica para calcular días y obtener la configuración se mantiene igual
  const today = new Date();
  const expiryDate = new Date(trialExpiresAt);
  const diffTime = expiryDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (daysLeft < 0) return null;

  const config = getTrialConfig(daysLeft);

  const handleDismiss = () => setIsDismissed(true);

  const renderTimeRemaining = () => {
    if (timeLeft && daysLeft === 0) {
      return (
        <motion.div 
          className="flex items-center space-x-2 text-sm"
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Clock className="w-4 h-4" />
          <span className="font-mono font-bold">
            {timeLeft.hours.toString().padStart(2, '0')}:
            {timeLeft.minutes.toString().padStart(2, '0')} restantes
          </span>
        </motion.div>
      );
    }
    return null;
  };

  const renderFeatureHighlight = () => {
    const features = [
      { icon: <Crown className="w-4 h-4" />, text: "Acceso Premium" },
      { icon: <Rocket className="w-4 h-4" />, text: "Sin Límites" },
      { icon: <Star className="w-4 h-4" />, text: "Soporte 24/7" }
    ];

    return (
      <motion.div 
        className="hidden lg:flex items-center space-x-4 text-xs opacity-80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 0.6 }}
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="flex items-center space-x-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + index * 0.1 }}
          >
            {feature.icon}
            <span>{feature.text}</span>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={bannerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="overflow-hidden relative"
      >
        <div className={`
          bg-gradient-to-r ${config.gradient} text-white relative
          border-b ${config.borderColor} shadow-lg backdrop-blur-sm
        `}>
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Animated background shapes */}
            <motion.div
              className="absolute top-0 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl"
              animate={{
                scale: [1, 1.2, 1],
                x: [0, 20, 0],
                y: [0, -10, 0]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute bottom-0 right-1/4 w-24 h-24 bg-white/10 rounded-full blur-2xl"
              animate={{
                scale: [1.2, 1, 1.2],
                x: [0, -15, 0],
                y: [0, 5, 0]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 4
              }}
            />
            
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              variants={shimmerVariants}
              animate="shimmer"
              style={{ width: '30%' }}
            />
          </div>

          <div className="container mx-auto px-4 py-4 relative z-10">
            <div className="flex items-center justify-between gap-4">
              {/* Left section - Icon and message */}
              <motion.div 
                className="flex items-center gap-3 flex-1"
                variants={contentVariants}
                initial="initial"
                animate="animate"
              >
                {/* Animated icon */}
                <motion.div 
                  className="relative flex-shrink-0"
                  variants={pulseVariants}
                  animate={config.urgency === 'critical' ? 'pulse' : ''}
                >
                  <div className={`${config.textColor}`}>
                    {config.icon}
                  </div>
                  {config.urgency === 'critical' && (
                    <motion.div
                      className={`absolute inset-0 ${config.pulseColor} rounded-full blur-sm opacity-50`}
                      variants={pulseVariants}
                      animate="pulse"
                    />
                  )}
                </motion.div>

                {/* Message content */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className={`font-semibold ${config.textColor} text-sm sm:text-base`}>
                    {config.message}
                  </span>
                  {renderTimeRemaining()}
                </div>

                {/* Feature highlight for larger screens */}
                {renderFeatureHighlight()}
              </motion.div>

              {/* Right section - CTA and dismiss */}
              <div className="flex items-center gap-3">
                {/* CTA Button */}
                <motion.div
                  variants={badgeVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Link href="/quhealthy/profile/providers/plans">
                    <Badge 
                      className={`
                        ${config.badgeStyle} font-bold cursor-pointer 
                        shadow-lg border-0 px-4 py-2 text-sm
                        relative overflow-hidden group
                      `}
                    >
                      {/* Button shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
                      
                      <span className="relative z-10 flex items-center gap-2">
                        {config.ctaText}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                      </span>
                    </Badge>
                  </Link>
                </motion.div>

                {/* Dismiss button - Only show for non-critical states */}
                {config.urgency !== 'critical' && (
                  <motion.button
                    onClick={handleDismiss}
                    className={`
                      ${config.textColor} hover:text-white p-1 rounded-full 
                      hover:bg-white/10 transition-all duration-200 flex-shrink-0
                    `}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Progress bar for critical states */}
            {config.urgency === 'critical' && timeLeft && (
              <motion.div
                className="mt-3 w-full"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                <div className="w-full bg-black/20 rounded-full h-1 overflow-hidden">
                  <motion.div
                    className={`h-full ${config.pulseColor} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${Math.max(5, (timeLeft.hours * 60 + timeLeft.minutes) / (24 * 60) * 100)}%`
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1 opacity-75">
                  <span>Tiempo restante</span>
                  <span>Expira a medianoche</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Urgency indicator border */}
          {config.urgency === 'critical' && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500"
              animate={{
                opacity: [0.5, 1, 0.5],
                scaleX: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};