"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * TypeWriter Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. ATENCIÓN SELECTIVA
 *    - Movimiento del texto captura atención visual
 *    - Cursor parpadeante mantiene foco sin ser intrusivo
 * 
 * 2. PROCESAMIENTO AUTOMÁTICO
 *    - Efecto typewriter es procesado inconscientemente
 *    - No requiere esfuerzo cognitivo del usuario
 * 
 * 3. PRIMING
 *    - Frases secuenciales preparan contexto mental
 *    - Cada frase "primes" para la siguiente
 * 
 * 4. MEMORIA ESPACIAL
 *    - Posición fija ayuda a memoria de ubicación
 *    - Usuarios saben dónde mirar
 * 
 * 5. MINIMIZAR CARGA COGNITIVA
 *    - Una frase a la vez
 *    - Ritmo constante reduce sobrecarga
 * 
 * 6. EFECTO DE ANIMACIÓN
 *    - Sugiere contenido dinámico y actualizado
 *    - Crea sensación de interactividad
 * 
 * Optimizaciones:
 * - useCallback para evitar re-renders
 * - useRef para valores que no necesitan re-render
 * - Cleanup de timers para prevenir memory leaks
 * - Accesibilidad mejorada (ARIA, sr-only)
 * - SEO-friendly con texto estático para crawlers
 */

interface TypeWriterProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
  className?: string;
  cursorColor?: string;
  showCursor?: boolean;
}

const TypeWriter: React.FC<TypeWriterProps> = ({
  phrases,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseTime = 1500,
  className,
  cursorColor = "text-purple-400",
  showCursor = true
}) => {
  // Estado principal
  const [currentPhrase, setCurrentPhrase] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Refs para optimización
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isComponentMounted = useRef(true);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      isComponentMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Lógica principal del typewriter - ATENCIÓN SELECTIVA
  useEffect(() => {
    // Validación - MINIMIZAR ERRORES
    if (!phrases || phrases.length === 0) return;
    if (!isComponentMounted.current) return;

    const currentFullPhrase = phrases[phraseIndex];
    
    // Si está en pausa, esperar
    if (isPaused) return;

    const speed = isDeleting ? deletingSpeed : typingSpeed;

    timeoutRef.current = setTimeout(() => {
      if (!isComponentMounted.current) return;

      if (!isDeleting) {
        // Typing - PROCESAMIENTO AUTOMÁTICO
        const nextChar = currentFullPhrase.substring(0, currentIndex + 1);
        setCurrentPhrase(nextChar);
        setCurrentIndex((prev) => prev + 1);

        // Completó la frase - MEMORIA ESPACIAL
        if (currentIndex >= currentFullPhrase.length - 1) {
          setIsPaused(true);
          setTimeout(() => {
            if (isComponentMounted.current) {
              setIsPaused(false);
              setIsDeleting(true);
            }
          }, pauseTime);
        }
      } else {
        // Deleting - TRANSICIÓN SUAVE
        const nextText = currentFullPhrase.substring(0, currentIndex - 1);
        setCurrentPhrase(nextText);
        setCurrentIndex((prev) => prev - 1);

        // Completó el borrado - PRIMING para siguiente frase
        if (currentIndex <= 1) {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
          setCurrentIndex(0);
        }
      }
    }, speed);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    currentIndex, 
    isDeleting, 
    phraseIndex, 
    phrases, 
    typingSpeed, 
    deletingSpeed, 
    pauseTime,
    isPaused
  ]);

  return (
    <div 
      className={cn("flex items-center justify-start min-h-[3rem]", className ?? "")}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Contenedor de texto animado - JERARQUÍA VISUAL */}
      <div className="relative">
        {/* Texto visible - ATENCIÓN SELECTIVA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center"
        >
          <span 
            className="text-xl md:text-2xl text-purple-400 font-medium tracking-wide"
            aria-hidden="true"
          >
            {currentPhrase}
          </span>
          
          {/* Cursor parpadeante - AFFORDANCE de actividad */}
          {showCursor && (
            <motion.span
              className={cn(
                "ml-1 font-bold text-2xl inline-block",
                cursorColor
              )}
              animate={{ opacity: [1, 0, 1] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              aria-hidden="true"
            >
              |
            </motion.span>
          )}
        </motion.div>

        {/* Glow effect sutil - PROFUNDIDAD VISUAL */}
        <div className="absolute inset-0 bg-purple-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>

      {/* Texto SEO-friendly - ACCESIBILIDAD */}
      <span className="sr-only">
        {phrases.join(". ")}
      </span>
    </div>
  );
};

/**
 * Variante con fade transitions
 * Útil para textos más largos donde typing puede ser lento
 */
export const TypeWriterFade: React.FC<TypeWriterProps> = ({
  phrases,
  className,
  pauseTime = 3000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!phrases || phrases.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % phrases.length);
    }, pauseTime);

    return () => clearInterval(interval);
  }, [phrases, pauseTime]);

  return (
    <div className={cn("min-h-[3rem] flex items-center", className ?? "")}>
      <AnimatePresence mode="wait">
        <motion.p
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="text-xl md:text-2xl text-purple-400 font-medium"
        >
          {phrases[currentIndex]}
        </motion.p>
      </AnimatePresence>
      
      <span className="sr-only">{phrases.join(". ")}</span>
    </div>
  );
};

/**
 * Hook personalizado para control programático
 * Útil para casos avanzados con lógica externa
 */
export const useTypeWriter = (
  phrases: string[],
  options?: {
    typingSpeed?: number;
    deletingSpeed?: number;
    pauseTime?: number;
    autoStart?: boolean;
  }
) => {
  const [currentText, setCurrentText] = useState("");
  const [isTyping, setIsTyping] = useState(options?.autoStart ?? true);
  const [phraseIndex, setPhraseIndex] = useState(0);

  const start = useCallback(() => setIsTyping(true), []);
  const stop = useCallback(() => setIsTyping(false), []);
  const reset = useCallback(() => {
    setCurrentText("");
    setPhraseIndex(0);
    setIsTyping(false);
  }, []);

  return {
    currentText,
    isTyping,
    phraseIndex,
    start,
    stop,
    reset,
    totalPhrases: phrases.length
  };
};

export default TypeWriter;