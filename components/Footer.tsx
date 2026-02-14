"use client";

import React from "react";
import Link from "next/link";
import { Instagram, Twitter, Facebook, Mail, Phone, MapPin, Heart } from "lucide-react";
import { motion } from "framer-motion";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: "Plataforma",
      links: [
        { name: "Buscar Especialistas", href: "/discover" },
        { name: "QuMarket (Tienda)", href: "/market" },
        { name: "QuBlocks (Academia)", href: "/academy" },
        { name: "Para Doctores", href: "/business" }
      ]
    },
    {
      title: "Compañía",
      links: [
        { name: "Sobre Nosotros", href: "/about" },
        { name: "Blog", href: "/blog" },
        { name: "Carreras", href: "/careers" },
        { name: "Contacto", href: "/contact" }
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Términos y Condiciones", href: "/terms" },
        { name: "Aviso de Privacidad", href: "/privacy" },
        { name: "Política de Cookies", href: "/cookies" }
      ]
    }
  ];

  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com/quhealthy", name: "Instagram", color: "hover:text-pink-400" },
    { icon: Twitter, href: "https://twitter.com/quhealthy", name: "Twitter", color: "hover:text-blue-400" },
    { icon: Facebook, href: "https://facebook.com/quhealthy", name: "Facebook", color: "hover:text-blue-500" }
  ];

  return (
    <footer className="relative bg-gray-950 text-gray-400 py-16 border-t border-gray-900 overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-purple-950/5 to-gray-950 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          
          {/* Columna 1: Marca y Propuesta (Ocupa 2 espacios en LG) */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/" className="inline-block group">
                <span className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent tracking-tight">
                  QuHealthy
                </span>
              </Link>
              <p className="mt-4 text-gray-400 text-sm leading-relaxed max-w-sm">
                El sistema operativo integral para la salud y el bienestar. 
                Conectamos pacientes con los mejores especialistas certificados en LATAM.
              </p>
              
              <div className="mt-6 flex items-center space-x-5">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 ${social.color} transition-all duration-300 hover:scale-110 hover:border-gray-700`}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={`Visítanos en ${social.name}`}
                    >
                      <Icon size={18} />
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Columnas de Enlaces (Iteración limpia) */}
          {footerLinks.map((column, columnIndex) => (
            <div key={column.title} className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: columnIndex * 0.1 }}
              >
                <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-6">
                  {column.title}
                </h3>
                <ul className="space-y-4">
                  {column.links.map((link) => (
                    <li key={link.name}>
                      <Link 
                        href={link.href} 
                        className="text-sm hover:text-purple-400 transition-colors flex items-center group"
                      >
                        <span className="w-0 group-hover:w-2 transition-all duration-300 overflow-hidden bg-purple-500 h-[2px] mr-0 group-hover:mr-2"></span>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          ))}

          {/* Columna de Contacto */}
          <div className="lg:col-span-1">
             <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-6">
                  Contacto
                </h3>
                <ul className="space-y-4 text-sm">
                  <li className="flex items-start group">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0 mr-3 group-hover:bg-purple-500/20 transition-colors duration-200">
                      <Mail size={16} className="text-purple-400" />
                    </div>
                    <a href="mailto:hola@quhealthy.com" className="hover:text-white transition-colors">
                      hola@quhealthy.com
                    </a>
                  </li>
                  <li className="flex items-start group">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center flex-shrink-0 mr-3 group-hover:bg-pink-500/20 transition-colors duration-200">
                      <Phone size={16} className="text-pink-400" />
                    </div>
                    <a href="tel:+525512345678" className="hover:text-white transition-colors">
                      +52 (55) 1234 5678
                    </a>
                  </li>
                  <li className="flex items-start group">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 mr-3 group-hover:bg-blue-500/20 transition-colors duration-200">
                      <MapPin size={16} className="text-blue-400" />
                    </div>
                    <span>CDMX, México</span>
                  </li>
                </ul>
             </motion.div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-16 pt-8 border-t border-gray-900">
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 gap-4">
            <div className="flex items-center gap-2">
              <p>&copy; {currentYear} QuHealthy Inc. Todos los derechos reservados.</p>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center gap-1">
                Hecho con <Heart className="w-3 h-3 text-red-500 fill-current" /> en México
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacidad</Link>
              <Link href="/terms" className="hover:text-gray-400 transition-colors">Términos</Link>
              <Link href="/sitemap" className="hover:text-gray-400 transition-colors">Mapa del sitio</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;