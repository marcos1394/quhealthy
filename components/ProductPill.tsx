"use client";

import React from "react";
import { motion } from "framer-motion";

interface ProductPillProps {
  name: string;
  color: string;
  delay?: number;
}

const ProductPill: React.FC<ProductPillProps> = ({ name, color, delay = 0 }) => {
  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 400, 
        damping: 10,
        delay 
      }}
      whileHover={{ scale: 1.1, y: -3 }}
      className={`px-4 py-2 rounded-full ${color} text-white text-sm font-semibold mr-2 mb-2 shadow-lg inline-block`}
    >
      {name}
    </motion.span>
  );
};

export default ProductPill;