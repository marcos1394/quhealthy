"use client";

/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PreferenceCard } from "./PreferenceCard";

interface PreferenceCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
  badge?: string;
  highlighted?: boolean;
  onClick?: () => void;
}

export const PreferenceCardAction: React.FC<
  PreferenceCardProps & {
    actionLabel?: string;
    onAction?: () => void;
  }
> = (props) => {
  const { actionLabel = "Configurar", onAction, ...cardProps } = props;

  return (
    <PreferenceCard {...cardProps}>
      {props.children}

      {onAction && (
        <motion.button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAction();
          }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={cn(
            "mt-4 w-full h-10 px-4 rounded-xl font-bold text-xs",
            "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs",
            "transition-all duration-200 cursor-pointer border-0",
            "flex items-center justify-center gap-2"
          )}
        >
          <span>{actionLabel}</span>
          <ChevronRight className="w-4 h-4" strokeWidth={2} />
        </motion.button>
      )}
    </PreferenceCard>
  );
};