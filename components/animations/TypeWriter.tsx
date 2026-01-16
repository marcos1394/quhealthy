"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils"; // Utilidad estándar de ShadCN

interface TypeWriterProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
  className?: string;
}

const TypeWriter: React.FC<TypeWriterProps> = ({
  phrases,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseTime = 1500,
  className,
}) => {
  const [currentPhrase, setCurrentPhrase] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    // Seguridad: Si no hay frases, no hacer nada
    if (!phrases || phrases.length === 0) return;

    const currentFullPhrase = phrases[phraseIndex];
    const speed = isDeleting ? deletingSpeed : typingSpeed;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setCurrentPhrase(currentFullPhrase.substring(0, currentIndex + 1));
        setCurrentIndex((prev) => prev + 1);

        if (currentIndex >= currentFullPhrase.length - 1) {
          setTimeout(() => setIsDeleting(true), pauseTime);
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
    }, speed);

    return () => clearTimeout(timeout);
  }, [currentIndex, isDeleting, phraseIndex, phrases, typingSpeed, deletingSpeed, pauseTime]);

  return (
    <div className={cn("flex items-center justify-start min-h-[3rem]", className ?? "")}>
      {/* Texto visible solo para humanos (animado) */}
      <motion.p
        className="text-2xl md:text-3xl text-gray-100 leading-relaxed font-light tracking-wide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        aria-hidden="true" 
      >
        {currentPhrase}
        <span className="animate-pulse text-emerald-400 font-bold ml-1">|</span>
      </motion.p>

      {/* Texto visible solo para robots/lectores de pantalla (SEO Friendly) */}
      <span className="sr-only">
        {phrases.join(". ")}
      </span>
    </div>
  );
};

export default TypeWriter;