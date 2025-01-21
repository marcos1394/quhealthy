"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import owlAnimation from "@/public/animations/owl.json";
import { Shield, BookOpen, ShoppingBag, Heart } from "lucide-react";
import "./globals.css";
import Link from "next/link";

// Configuración de las animaciones
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

type ProductCardProps = {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  gradient: string;
  index: number;
};

const TypeWriter: React.FC = () => {
  const phrases = [
    "Revolucionando el futuro con Blockchain e IA",
    "Transformando la salud digital en Latinoamérica",
    "Protegiendo tus activos digitales con IA",
    "Conectando el comercio del futuro",
    "Educación blockchain para todos",
  ];

  const [currentPhrase, setCurrentPhrase] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const typeSpeed = isDeleting ? 50 : 100;
    const currentFullPhrase = phrases[phraseIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setCurrentPhrase(currentFullPhrase.substring(0, currentIndex + 1));
        setCurrentIndex((prev) => prev + 1);

        if (currentIndex >= currentFullPhrase.length - 1) {
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        setCurrentPhrase(currentFullPhrase.substring(0, currentIndex - 1));
        setCurrentIndex((prev) => prev - 1);

        if (currentIndex <= 1) {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
          setCurrentIndex(0);
        }
      }
    }, typeSpeed);

    return () => clearTimeout(timeout);
  }, [currentIndex, isDeleting, phraseIndex]);

  return (
    <div className="h-20 flex items-center justify-center">
      <motion.p
        className="text-2xl text-gray-100 leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {currentPhrase}
        <span className="animate-pulse">|</span>
      </motion.p>
    </div>
  );
};

const ProductCard: React.FC<ProductCardProps> = ({
  title,
  description,
  icon: Icon,
  gradient,
  index,
}) => {
  const getRoute = (productName: string) => {
    switch (productName) {
      case "QuHealthy":
        return "/quhealthy";
      case "QuBlocks":
        return "/qublocks";
      case "SuiShield":
        return "/suishield";
      case "QuMarket":
        return "/qumarket";
      default:
        return "/";
    }
  };

  return (
    <Link href={getRoute(title)}>
      <motion.div
        variants={fadeInUp}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        className="relative overflow-hidden rounded-xl bg-gray-900 backdrop-blur-md border border-gray-700 p-8 text-white shadow-lg cursor-pointer"
        role="article"
        aria-labelledby={`product-title-${title}`}
      >
        <div className={`absolute inset-0 opacity-20 ${gradient}`} />
        <Icon className="w-12 h-12 mb-4 text-white" aria-hidden="true" />
        <h3 id={`product-title-${title}`} className="text-2xl font-bold mb-3 text-white">
          {title}
        </h3>
        <p className="text-gray-100 leading-relaxed mb-6">{description}</p>
        <motion.div whileHover={{ scale: 1.05 }} className="mt-4">
          <span
            className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-6 py-2 rounded-md inline-block"
            aria-label={`Explorar ${title}`}
          >
            Explorar
          </span>
        </motion.div>
      </motion.div>
    </Link>
  );
};

const generateDeterministicParticles = (count: number) => {
  return Array.from({ length: count }).map((_, index) => ({
    left: `${(index * 31) % 100}%`,
    top: `${(index * 57) % 100}%`,
  }));
};

const HeroParticle = ({ left, top }: { left: string; top: string }) => (
  <motion.div
    animate={{
      scale: [1, 1.5, 1],
      opacity: [0.3, 0, 0.3],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      repeatType: "reverse",
    }}
    className="absolute w-1.5 h-1.5 bg-blue-400 rounded-full"
    style={{ left, top }}
    aria-hidden="true"
  />
);

export default function Home() {
  const [particles] = useState(() => generateDeterministicParticles(15));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <AnimatePresence>
          {particles.map((particle, i) => (
            <HeroParticle key={i} left={particle.left} top={particle.top} />
          ))}
        </AnimatePresence>

        <motion.div
          className="absolute top-10 right-10 w-40 h-40"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          aria-hidden="true"
        >
          <Lottie animationData={owlAnimation} loop={true} />
        </motion.div>

        <motion.div
          className="relative z-10 text-center p-8 max-w-4xl"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="text-7xl font-bold mb-8 text-white"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.8,
              type: "spring",
              stiffness: 200,
            }}
          >
            QUBITS
          </motion.h1>
          <TypeWriter />
        </motion.div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.h2
            className="text-5xl font-bold mb-6 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Nuestros Productos
          </motion.h2>
          <motion.p
            className="text-xl text-gray-100"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Soluciones innovadoras para un mundo descentralizado
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-10"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <ProductCard
            title="QuHealthy"
            description="Conectando servicios de salud en México con usuarios en USA mediante blockchain e IA"
            icon={Heart}
            gradient="bg-gradient-to-br from-pink-500 to-red-600"
            index={0}
          />
          <ProductCard
            title="QuBlocks"
            description="Plataforma de cursos en línea sobre blockchain con IA para Latinoamérica"
            icon={BookOpen}
            gradient="bg-gradient-to-br from-blue-500 to-purple-600"
            index={1}
          />
          <ProductCard
            title="SuiShield"
            description="Antivirus en tiempo real para transacciones en la red Sui"
            icon={Shield}
            gradient="bg-gradient-to-br from-green-500 to-emerald-600"
            index={2}
          />
          <ProductCard
            title="QuMarket"
            description="Marketplace blockchain con IA para Latinoamérica"
            icon={ShoppingBag}
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
            index={3}
          />
        </motion.div>
      </div>
    </div>
  );
}
