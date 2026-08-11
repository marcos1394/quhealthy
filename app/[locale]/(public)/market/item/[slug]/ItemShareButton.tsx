"use client";

import React from 'react';
import { Share } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';

interface ItemShareButtonProps {
  itemName: string;
}

export function ItemShareButton({ itemName }: ItemShareButtonProps) {
  const t = useTranslations("StorePublic");

  const handleShare = async () => {
    const shareData = {
      title: itemName,
      text: `Descubre ${itemName} en QuHealthy`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error al compartir:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t("copied_toast"));
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="w-14 h-14 md:h-16 flex items-center justify-center border border-black dark:border-white bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-gray-50 dark:hover:bg-[#111] transition-colors"
      title={t("share")}
    >
      <Share className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
    </button>
  );
}
