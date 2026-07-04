'use client';

import React, { useState, useEffect } from 'react';
import { Tag } from 'lucide-react';
import { useDiscoverFilters } from '@/hooks/useDiscoverFilters';

const PRESETS = [500, 1000, 2000, 5000];

export function PriceFilter() {
 const { filters, setFilter } = useDiscoverFilters();
 const [maxPrice, setMaxPrice] = useState<string>(filters.maxPrice ? String(filters.maxPrice) : '');

 useEffect(() => {
 if (filters.maxPrice !== undefined) {
 setMaxPrice(String(filters.maxPrice));
 } else {
 setMaxPrice('');
 }
 }, [filters.maxPrice]);

 const applyPrice = () => {
 if (maxPrice) {
 setFilter('maxPrice', Number(maxPrice));
 } else {
 setFilter('maxPrice', undefined);
 }
 };

 return (
 <div className="space-y-4">
 <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Presupuesto máx.</span>

 {/* Presets rápidos */}
 <div className="flex flex-wrap gap-1.5">
 {PRESETS.map((p) => (
 <button
 key={p}
 onClick={() => {
 setMaxPrice(String(p));
 setFilter('maxPrice', p);
 }}
 className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest border transition-all duration-200 ${
 filters.maxPrice === p
 ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]'
 : 'bg-white text-black border-black dark:bg-[#0a0a0a] dark:text-white dark:border-white hover:shadow-[2px_2px_0_0_#000] dark:hover:shadow-[2px_2px_0_0_#fff]'
 }`}
 >
 ${p.toLocaleString()}
 </button>
 ))}
 </div>

 {/* Input personalizado */}
 <div className="relative">
 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm pointer-events-none">$</span>
 <input
 type="number"
 value={maxPrice}
 onChange={(e) => setMaxPrice(e.target.value)}
 onBlur={applyPrice}
 onKeyDown={(e) => e.key === 'Enter' && applyPrice()}
 placeholder="Personalizado"
 className="w-full bg-white dark:bg-[#0a0a0a] border border-black dark:border-white pl-8 pr-3 py-2.5 text-xs font-bold text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:shadow-[2px_2px_0_0_#000] dark:focus:shadow-[2px_2px_0_0_#fff] transition-all"
 />
 </div>

 {/* Solo Ofertas */}
 <label className="flex items-center gap-3 cursor-pointer group">
 <div
 className={`relative flex items-center justify-center w-5 h-5 border transition-all duration-200 ${
 filters.hasDiscount
 ? 'bg-black border-black dark:bg-white dark:border-white shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]'
 : 'bg-white border-black dark:bg-[#0a0a0a] dark:border-white group-hover:shadow-[2px_2px_0_0_#000] dark:group-hover:shadow-[2px_2px_0_0_#fff]'
 }`}
 >
 <input
 type="checkbox"
 checked={!!filters.hasDiscount}
 onChange={(e) => setFilter('hasDiscount', e.target.checked)}
 className="peer sr-only"
 />
 {filters.hasDiscount && (
 <svg className="w-3 h-3 text-white dark:text-black pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
 <polyline points="20 6 9 17 4 12" />
 </svg>
 )}
 </div>
 <div className="flex items-center gap-1.5">
 <Tag className="w-3 h-3 text-black dark:text-white" strokeWidth={2} />
 <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white transition-colors">
 Solo ofertas
 </span>
 </div>
 </label>
 </div>
 );
}
