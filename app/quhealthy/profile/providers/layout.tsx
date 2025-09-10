"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProviderStatusStore } from '@/stores/ProviderStatusStore';
import { TrialBanner } from '@/components/ui/TrialBanner';
import { Sidebar } from '@/components/ui/Sidebar';
import { Loader2, Wifi, WifiOff } from 'lucide-react';

export default function ProviderDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useProviderStatusStore();
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  // Monitor connection status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial check
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Enhanced loading screen with better UX
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col justify-center items-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl animate-pulse delay-500" />
        </div>

        {/* Loading content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-center"
        >
          {/* Logo/Brand area */}
          <motion.div
            className="mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <div className="w-8 h-8 bg-white rounded-lg"></div>
            </div>
          </motion.div>

          {/* Spinner */}
          <motion.div
            className="relative mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto" />
            <motion.div
              className="absolute inset-0 border-2 border-purple-500/20 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>

          {/* Loading text */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <h2 className="text-xl font-semibold text-white">
              Preparando tu espacio de trabajo
            </h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Estamos configurando todo para que tengas la mejor experiencia posible
            </p>
          </motion.div>

          {/* Progress dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center space-x-2 mt-8"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-purple-500/50 rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Connection status indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center text-xs text-gray-500"
        >
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3 mr-1 text-green-400" />
              Conectado
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 mr-1 text-red-400" />
              Sin conexión
            </>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-black transition-colors duration-300">
      {/* Offline notification */}
      <AnimatePresence>
        {showOfflineMessage && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white text-center py-2 text-sm font-medium"
          >
            <div className="flex items-center justify-center">
              <WifiOff className="w-4 h-4 mr-2" />
              Sin conexión a internet - Algunas funciones pueden estar limitadas
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-h-screen">
        {/* Enhanced Sidebar */}
        <motion.div
          initial={{ x: -280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative"
        >
          <Sidebar />
          
          {/* Sidebar shadow overlay */}
          <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
        </motion.div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Trial Banner with enhanced styling */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <TrialBanner />
          </motion.div>
          
          {/* Content container with improved scrolling */}
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex-1 relative overflow-hidden"
          >
            {/* Content wrapper with custom scrollbar */}
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
              <div className="p-4 sm:p-6 lg:p-8 pb-8">
                {/* Content background with subtle pattern */}
                <div className="relative min-h-full">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:20px_20px] pointer-events-none" />
                  
                  {/* Page content */}
                  <div className="relative z-10">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key="page-content"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {children}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            {/* Scroll to top button (appears when scrolled) */}
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="fixed bottom-8 right-8 z-40 w-12 h-12 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700 flex items-center justify-center"
              onClick={() => {
                const main = document.querySelector('main > div');
                main?.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-label="Volver arriba"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </motion.button>
          </motion.main>
        </div>
      </div>

      {/* Global notification area */}
      <div id="notification-portal" className="fixed top-4 right-4 z-50 space-y-2" />
    </div>
  );
}