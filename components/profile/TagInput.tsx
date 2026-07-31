"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

/**
 * Componente de "Tag/Pill Input" para datos médicos y etiquetas de salud.
 * El usuario escribe texto y al presionar Enter o coma se convierte en una
 * píldora visual eliminable. Se almacena internamente como string separado por ", ".
 */
export function TagInput({
  value,
  onChange,
  placeholder,
  icon,
}: TagInputProps) {
  const t = useTranslations("TagInput");
  const [inputValue, setInputValue] = useState("");

  const safeValue = typeof value === "string" ? value : "";
  const tags = safeValue
    ? safeValue
        .split(",")
        .flatMap((tStr) => {
          const trimmed = tStr.trim();
          return trimmed ? [trimmed] : [];
        })
    : [];

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;

    if (tags.some((tItem) => tItem.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue("");
      return;
    }

    const newTags = [...tags, trimmed];
    onChange(newTags.join(", "));
    setInputValue("");
  };

  const removeTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    onChange(newTags.join(", "));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    }

    if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className="space-y-3 font-sans transition-colors select-none">
      {/* Visualización de Etiquetas */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge
              key={`${tag}-${index}`}
              variant="outline"
              className="bg-emerald-50/80 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40 px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-2xs animate-in fade-in-0 zoom-in-95 duration-200"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full p-0.5 transition-colors cursor-pointer"
                aria-label={t("remove_tag_aria", { tag })}
              >
                <X className="w-3 h-3" strokeWidth={2.5} />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Campo de Entrada */}
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
            {icon}
          </div>
        )}

        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(inputValue)}
          placeholder={tags.length === 0 ? placeholder : t("add_more")}
          className={cn(
            "rounded-xl h-11 bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs placeholder:text-gray-400 placeholder:font-normal",
            icon ? "pl-10" : "pl-3.5"
          )}
        />
      </div>
    </div>
  );
}