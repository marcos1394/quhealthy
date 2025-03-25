"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface ButtonProps {
  href?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  href,
  variant = "primary",
  size = "md",
  children,
  className = "",
  onClick,
}) => {
  const variants = {
    primary: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    secondary: "bg-gray-800 text-white hover:bg-gray-700",
    outline: "bg-transparent border border-purple-500 text-purple-400 hover:bg-purple-500/10",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg",
  };

  const baseClasses = "rounded-lg font-semibold inline-block transition-all";
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  const buttonContent = (
    <motion.span
      className="w-full h-full flex items-center justify-center"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.span>
  );

  if (href) {
    return <Link href={href} className={classes}>{buttonContent}</Link>;
  }

  return (
    <button onClick={onClick} className={classes}>
      {buttonContent}
    </button>
  );
};

export default Button;