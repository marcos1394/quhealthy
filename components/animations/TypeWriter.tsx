"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TypeWriterProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
}

const TypeWriter: React.FC<TypeWriterProps> = ({
  phrases,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseTime = 1500,
}) => {
  const [currentPhrase, setCurrentPhrase] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
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
    <div className="h-20 flex items-center justify-center">
      <motion.p
        className="text-2xl text-gray-100 leading-relaxed text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {currentPhrase}
        <span className="animate-pulse text-purple-400">|</span>
      </motion.p>
    </div>
  );
};

export default TypeWriter;