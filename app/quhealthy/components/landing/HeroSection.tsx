"use client";
import { motion } from "framer-motion";
import Link from 'next/link';
import { ArrowRight, Building2 } from "lucide-react";

export const HeroSection = () => (
  <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden">
    <div className="absolute inset-0 z-0">
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-blob" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-600/30 rounded-full blur-3xl animate-blob animation-delay-4000" />
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
    </div>
    <div className="relative z-10 max-w-4xl px-4">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300"
      >
        Tu Bienestar Sin Fronteras
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeInOut" }}
        className="text-lg md:text-xl text-purple-200/90 mb-12 max-w-2xl mx-auto"
      >
        Accede a los mejores servicios de salud y belleza en México, desde cualquier lugar. Agenda, paga y gestiona tu bienestar con la seguridad de la tecnología del futuro.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeInOut" }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Link href="/quhealthy/healthservicesearch" className="bg-white text-purple-700 font-semibold py-4 px-8 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2 transition-transform hover:scale-105 shadow-lg">
          Buscar Servicios <ArrowRight className="w-5 h-5" />
        </Link>
        <Link href="/quhealthy/authentication/providers/signup" className="bg-purple-800/80 backdrop-blur-sm border border-purple-500 text-white font-semibold py-4 px-8 rounded-lg hover:bg-purple-900 flex items-center justify-center gap-2 transition-transform hover:scale-105 shadow-lg">
          Soy un Proveedor <Building2 className="w-5 h-5" />
        </Link>
      </motion.div>
    </div>
  </section>
);