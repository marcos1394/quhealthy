"use client";

import React from "react";
import Link from "next/link";
import { Instagram, Twitter, Facebook, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: "Servicios",
      links: [
        { name: "Profesionales", href: "/profesionales" },
        { name: "Tratamientos", href: "/tratamientos" },
        { name: "Clinicas", href: "/clinicas" },
        { name: "Productos", href: "/productos" }
      ]
    },
    {
      title: "Empresa",
      links: [
        { name: "Sobre Nosotros", href: "/sobre-nosotros" },
        { name: "Trabaja con Nosotros", href: "/empleo" },
        { name: "Blog", href: "/blog" },
        { name: "Prensa", href: "/prensa" }
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Términos de uso", href: "/terminos" },
        { name: "Política de privacidad", href: "/privacidad" },
        { name: "Cookies", href: "/cookies" }
      ]
    }
  ];

  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com/quhealthy", name: "Instagram" },
    { icon: Twitter, href: "https://twitter.com/quhealthy", name: "Twitter" },
    { icon: Facebook, href: "https://facebook.com/quhealthy", name: "Facebook" }
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 py-16 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Logo and description */}
          <div className="col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  QuHealthy
                </span>
              </Link>
              <p className="mt-4 text-gray-400 max-w-xs">
                El marketplace que conecta personas con los mejores profesionales y servicios de salud y belleza.
              </p>
              <div className="mt-6 flex items-center space-x-4">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-purple-400 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={social.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      <Icon size={20} />
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Links */}
          {footerLinks.map((column, columnIndex) => (
            <div key={column.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: columnIndex * 0.1 }}
              >
                <h3 className="text-white font-semibold text-lg mb-4">{column.title}</h3>
                <ul className="space-y-3">
                  {column.links.map((link, linkIndex) => (
                    <motion.li
                      key={link.name}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: (columnIndex * 0.1) + (linkIndex * 0.05) + 0.2 }}
                    >
                      <Link href={link.href} className="text-gray-400 hover:text-purple-400 transition-colors">
                        {link.name}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Contact and copyright */}
        <motion.div
          className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row items-center md:space-x-6 mb-4 md:mb-0">
            <div className="flex items-center mb-3 md:mb-0">
              <Mail size={16} className="mr-2 text-purple-400" />
              <a href="mailto:contacto@quhealthy.com" className="hover:text-purple-400 transition-colors">contacto@quhealthy.com</a>
            </div>
            <div className="flex items-center">
              <Phone size={16} className="mr-2 text-purple-400" />
              <a href="tel:+34911234567" className="hover:text-purple-400 transition-colors">+34 911 234 567</a>
            </div>
          </div>
          <div className="text-gray-500 text-sm">
            &copy; {currentYear} QuHealthy. Todos los derechos reservados.
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;