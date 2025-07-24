"use client";
import { motion } from "framer-motion";
import Link from 'next/link';

export const CtaSection = () => (
  <footer className="py-20 px-8 bg-gradient-to-t from-gray-950 to-gray-900">
    <div className="max-w-4xl mx-auto text-center">
      <motion.h2
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.5 }}
        className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400"
      >
        Únete a la Revolución del Bienestar
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.5 }} transition={{ delay: 0.2 }}
        className="text-xl text-gray-300 mb-8"
      >
        Comienza tu viaje hacia servicios de salud y belleza más accesibles, seguros e inteligentes.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.5 }} transition={{ delay: 0.4 }}
        className="flex gap-4 justify-center"
      >
        <Link href="/quhealthy/authentication/signup" className="bg-white text-purple-700 font-semibold py-4 px-8 rounded-lg hover:bg-gray-200 transition-transform hover:scale-105 shadow-lg">
          Crear mi Cuenta
        </Link>
      </motion.div>
    </div>
  </footer>
);