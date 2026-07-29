"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-multi-comp */

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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

export const PreferenceCard: React.FC<PreferenceCardProps> = ({
  icon: Icon,
  title,
  description,
  children,
  className = "",
  badge,
  highlighted = false,
  onClick,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={onClick ? { y: -2 } : {}}
      className={cn(onClick ? "cursor-pointer" : "")}
      onClick={onClick}
    >
      <Card
        className={cn(
          "bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm transition-all duration-200 font-sans overflow-hidden",
          "hover:border-emerald-500/30 hover:shadow-md",
          highlighted
            ? "border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/20 ring-1 ring-emerald-500/30"
            : "",
          onClick ? "hover:border-emerald-500/40" : "",
          className
        )}
      >
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-start gap-4 sm:gap-5">
            {/* Icon Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 220,
                delay: 0.1,
              }}
              whileHover={{ scale: 1.05 }}
              className={cn(
                "w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center transition-all duration-200 shadow-2xs",
                highlighted
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400"
              )}
            >
              <Icon className="w-6 h-6" strokeWidth={2} />
            </motion.div>

            {/* Content */}
            <div className="flex-1 space-y-4 min-w-0">
              {/* Header */}
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                        {title}
                      </h3>

                      {/* Badge opcional */}
                      {badge && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shadow-2xs">
                          <Sparkles className="w-3 h-3" strokeWidth={2} />
                          <span>{badge}</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                      {description}
                    </p>
                  </div>

                  {/* Click Indicator */}
                  {onClick && (
                    <motion.div
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.2 }}
                      className="pt-1 shrink-0"
                    >
                      <ChevronRight
                        className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                        strokeWidth={2}
                      />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Separador */}
              <div className="w-full h-px bg-gray-100 dark:bg-gray-800" />

              {/* Children Content */}
              <div className="space-y-4">{children}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

/**
 * Variante compacta para espacios reducidos
 */
export const PreferenceCardCompact: React.FC<PreferenceCardProps> = (
  props
) => {
  const {
    icon: Icon,
    title,
    description,
    children,
    className,
    badge,
    highlighted,
  } = props;

  return (
    <Card
      className={cn(
        "bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xs transition-all duration-200 font-sans",
        "hover:border-emerald-500/30 hover:shadow-xs",
        highlighted
          ? "border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20"
          : "",
        className
      )}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl shrink-0 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs">
            <Icon className="w-4 h-4" strokeWidth={2} />
          </div>

          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                {title}
              </h4>
              {badge && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shadow-2xs">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {description}
            </p>
            <div className="space-y-2 pt-1">{children}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Variante con acción principal integradora
 */
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
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAction();
          }}
          className="mt-4 w-full h-10 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer border-0"
        >
          <span>{actionLabel}</span>
          <ChevronRight className="w-4 h-4" strokeWidth={2} />
        </button>
      )}
    </PreferenceCard>
  );
};