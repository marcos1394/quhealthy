"use client";

import React from "react";
import { motion } from "framer-motion";
import { QuoteIcon } from "lucide-react";
import Card from "../Card";
import ProductPill from "../ProductPill";

interface TestimonialCardProps {
  name: string;
  role: string;
  image: string;
  text: string;
  product: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  name,
  role,
  image,
  text,
  product,
}) => {
  // Determine product color
  const getProductColor = () => {
    switch (product) {
      case "Quhealthy":
        return "bg-purple-500";
      case "Qumarket":
        return "bg-pink-500";
      case "Qublocks":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const pillColor = getProductColor();
  const gradientColor = pillColor.replace("bg-", "bg-gradient-to-r from-") + " to-" + pillColor.replace("bg-", "").replace("500", "700");

  return (
    <Card className="h-full" gradient={gradientColor}>
      <div className="flex justify-end mb-4">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <QuoteIcon className={`w-10 h-10 ${pillColor.replace("bg", "text")}`} />
        </motion.div>
      </div>
      
      <p className="text-gray-200 mb-6 italic">{text}</p>
      
      <div className="flex items-center mt-auto">
        <div className="relative">
          <img
            src={image}
            alt={name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${pillColor} rounded-full border-2 border-gray-800`}></div>
        </div>
        <div className="ml-4">
          <p className="font-semibold text-white">{name}</p>
          <p className="text-sm text-gray-400">{role}</p>
        </div>
        <div className="ml-auto">
          <ProductPill name={product} color={pillColor} />
        </div>
      </div>
    </Card>
  );
};

export default TestimonialCard;