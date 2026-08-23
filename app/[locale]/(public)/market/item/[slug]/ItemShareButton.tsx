"use client";

import React from "react";
import { Share } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ItemShareButtonProps {
  itemName: string;
  className?: string;
}

export function ItemShareButton({ itemName, className }: ItemShareButtonProps) {
  const handleShare = async () => {
    const shareData = {
      title: itemName,
      text: `Descubre ${itemName} en QuHealthy`,
      url: typeof window !== "undefined" ? window.location.href : "",
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Cancelado por el usuario
      }
    } else if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleShare}
      className={
        className ||
        "flex-1 h-12 rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121212] text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-all"
      }
      title="Compartir este ítem"
    >
      <Share className="w-4 h-4 text-gray-500 dark:text-gray-400" strokeWidth={1.75} />
      <span>Compartir</span>
    </Button>
  );
}
