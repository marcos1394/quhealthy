"use client";

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Share, Heart, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface StorefrontNavigationProps {
  storeName: string;
  category?: string;
}

export const StorefrontNavigation: React.FC<StorefrontNavigationProps> = ({ storeName, category }) => {
  const router = useRouter();
  const t = useTranslations('marketplace');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Desktop Breadcrumbs (Static Top) */}
      <div className="hidden md:flex max-w-7xl mx-auto px-6 py-4 items-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
        <button 
          onClick={() => router.push('/es/discover')} 
          className="hover:text-black dark:hover:text-white transition-colors"
        >
          {t('discover', { defaultValue: 'Discover' })}
        </button>
        <span className="mx-2">/</span>
        {category && (
          <>
            <span className="hover:text-black dark:hover:text-white transition-colors cursor-pointer">
              {category}
            </span>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-black dark:text-white truncate max-w-[200px]">
          {storeName}
        </span>
      </div>

      {/* Mobile/Sticky Header */}
      <div className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#0a0a0a] transition-all duration-300 border-b",
        isScrolled 
          ? "translate-y-0 opacity-100 border-gray-200 dark:border-gray-800 shadow-sm" 
          : "-translate-y-full opacity-0 border-transparent pointer-events-none"
      )}>
        <div className="h-14 px-4 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center border border-transparent hover:border-black dark:hover:border-white transition-colors pointer-events-auto"
          >
            <ArrowLeft className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
          </button>
          
          <h1 className="text-[12px] font-bold uppercase tracking-widest text-black dark:text-white truncate flex-1 text-center px-4">
            {storeName}
          </h1>

          <div className="flex items-center gap-1">
            <button className="w-10 h-10 flex items-center justify-center pointer-events-auto">
              <Share className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Back Button (Static when at top) */}
      <div className={cn(
        "md:hidden absolute top-4 left-4 z-40 transition-opacity duration-300",
        isScrolled ? "opacity-0 pointer-events-none" : "opacity-100"
      )}>
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center bg-white dark:bg-black rounded-full shadow-md border border-gray-200 dark:border-gray-800"
        >
          <ArrowLeft className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
        </button>
      </div>
    </>
  );
};
