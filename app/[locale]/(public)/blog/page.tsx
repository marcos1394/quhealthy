"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-static-value */;
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Search, Calendar, ChevronRight } from "lucide-react";
import useSWR from "swr";
import axiosInstance from "@/lib/axios";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Interfaz esperada del backend
interface BlogPost {
 id: string;
 title: string;
 slug: string;
 excerpt: string;
 keywords: string[];
 createdAt: string;
 imageUrl: string;
}

const fetcher = (url: string) => axiosInstance.get<BlogPost[]>(url).then(res => res.data);

export default function BlogPage() {
 const t = useTranslations("PublicBlog");
 const locale = useLocale();
 const [searchQuery, setSearchQuery] = useState("");
 const categories = [
 t('categories.all'),
 t('categories.mental_health'),
 t('categories.nutrition'),
 t('categories.dermatology'),
 t('categories.innovation'),
 t('categories.lifestyle')
 ];

 const { data: posts, isLoading, error } = useSWR<BlogPost[]>("/api/intelligence/blog/posts", fetcher);

 // Filtro simple en cliente
 const filteredPosts = posts?.filter(post => 
 post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
 post.keywords?.some(kw => kw.toLowerCase().includes(searchQuery.toLowerCase()))
 ) || [];

 const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
 const regularPosts = filteredPosts.slice(1);

 // Animaciones
 const containerVariants = {
 hidden: { opacity: 0 },
 show: {
 opacity: 1,
 transition: { staggerChildren: 0.1 }
 }
 };

 const itemVariants = {
 hidden: { opacity: 0, y: 20 },
 show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
 };

 return (
 <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans selection:bg-gray-200 dark:selection:bg-white/20">
 
 {/* Editorial Header */}
 <section className="pt-32 pb-12 md:pt-40 md:pb-16 border-b border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#0a0a0a]">
 <div className="container mx-auto px-6 md:px-12 max-w-7xl">
 
 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
 >
 <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-8">
 <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">QuHealthy</Link>
 <ChevronRight className="w-3 h-3" />
 <span className="text-black dark:text-white">Editorial</span>
 </div>

 <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-12">
 <div className="max-w-3xl">
 <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-black dark:text-white mb-6 leading-[1.1]">
 {t('title_light')}
 <span className="font-serif italic text-gray-400 dark:text-gray-500 font-light px-2">
 {t('title_highlight')}
 </span>
 {t('title_dark')}
 </h1>
 <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-light leading-relaxed">
 {t('subtitle')}
 </p>
 </div>

 {/* Search Bar (Flush Design) */}
 <div className="w-full md:w-80 relative group">
 <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
 <Search className="h-4 w-4 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
 </div>
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder={t('search_ph')}
 className="w-full bg-transparent border-b border-gray-300 dark:border-gray-800 py-3 pl-8 pr-4 text-sm font-light outline-none transition-all focus:border-black dark:focus:border-white text-black dark:text-white placeholder:text-gray-400"
 />
 </div>
 </div>

 {/* Categories Tabs (Editorial Menu) */}
 <div className="flex items-center gap-6 overflow-x-auto pt-4 pb-2 border-t border-gray-200 dark:border-white/10 scrollbar-hide">
 {categories.map((cat, idx) => (
 <button 
 key={idx}
 className={`whitespace-nowrap pb-2 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
 idx === 0 
 ? 'border-black dark:border-white text-black dark:text-white' 
 : 'border-transparent text-gray-400 hover:text-black dark:hover:text-white'
 }`}
 >
 {cat}
 </button>
 ))}
 </div>
 </motion.div>
 </div>
 </section>

 {/* Main Content Area */}
 <section className="py-16 md:py-24 min-h-[50vh]">
 <div className="container mx-auto px-6 md:px-12 max-w-7xl">
 
 {/* Loading State */}
 {isLoading && (
 <div className="flex flex-col items-center justify-center py-32 text-gray-400 font-light">
 <div className="w-6 h-6 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin mb-4"></div>
 <p className="text-xs uppercase tracking-widest">{t('loading')}</p>
 </div>
 )}

 {/* Error / Empty States */}
 {!isLoading && (!posts || posts.length === 0) && (
 <div className="text-center py-32 border-t border-b border-gray-200 dark:border-gray-800 my-10">
 <Search className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-6" strokeWidth={1} />
 <h3 className="text-xl font-semibold text-black dark:text-white mb-2">{t('empty_title')}</h3>
 <p className="text-gray-500 dark:text-gray-400 font-light max-w-md mx-auto">
 {t('empty_desc')}
 </p>
 </div>
 )}

 {!isLoading && posts && posts.length > 0 && filteredPosts.length === 0 && (
 <div className="text-center py-20">
 <p className="text-gray-500 font-light text-lg">{t('no_results')}</p>
 </div>
 )}

 {/* Featured Post */}
 {!isLoading && featuredPost && !searchQuery && (
 <Link href={`/${locale}/blog/${featuredPost.slug}`}>
 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
 className="group cursor-pointer grid md:grid-cols-2 gap-10 lg:gap-16 items-center mb-24 pb-20 border-b border-gray-200 dark:border-gray-800"
 >
 <div className="relative aspect-[4/3] md:aspect-[4/5] w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
 <img 
 src={featuredPost.imageUrl} 
 alt={featuredPost.title} 
 className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" 
 />
 <div className="absolute top-4 left-4 z-20 bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 flex items-center">
 <span className="text-[10px] font-bold uppercase tracking-widest">{featuredPost.keywords?.[0] || 'Health Tech'}</span>
 </div>
 </div>
 
 <div className="flex flex-col justify-center py-4">
 <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
 <span className="flex items-center gap-1.5">
 <Calendar className="w-3.5 h-3.5" /> 
 {new Date(featuredPost.createdAt).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric'})}
 </span>
 <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
 <span>Editorial</span>
 </div>
 
 <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-black dark:text-white mb-6 leading-[1.1] group-hover:underline decoration-1 underline-offset-8 transition-all">
 {featuredPost.title}
 </h2>
 
 <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-light leading-relaxed mb-10">
 {featuredPost.excerpt}
 </p>
 
 <div>
 <span className="inline-flex items-center text-black dark:text-white text-xs font-bold uppercase tracking-widest">
 {t('read_more')} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
 </span>
 </div>
 </div>
 </motion.div>
 </Link>
 )}

 {/* Grid Posts */}
 {!isLoading && regularPosts.length > 0 && (
 <motion.div 
 variants={containerVariants}
 initial="hidden"
 whileInView="show"
 viewport={{ once: true, margin: "-100px" }}
 className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16"
 >
 {regularPosts.map((post, idx) => (
 <Link href={`/${locale}/blog/${post.slug}`} key={post.id || idx}>
 <motion.article 
 variants={itemVariants}
 className="group cursor-pointer flex flex-col h-full"
 >
 <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-900 mb-6">
 <img 
 src={post.imageUrl} 
 alt={post.title} 
 className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" 
 />
 <div className="absolute top-4 left-4 z-20 bg-black text-white dark:bg-white dark:text-black px-2.5 py-1">
 <span className="text-[9px] font-bold uppercase tracking-widest">{post.keywords?.[0] || 'Health Tech'}</span>
 </div>
 </div>
 
 <div className="flex flex-col flex-1">
 <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
 <span>{new Date(post.createdAt).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric'})}</span>
 </div>
 
 <h3 className="text-2xl font-semibold text-black dark:text-white mb-3 leading-tight group-hover:underline decoration-1 underline-offset-4 transition-all line-clamp-3">
 {post.title}
 </h3>
 
 <p className="text-gray-500 dark:text-gray-400 font-light leading-relaxed mb-6 line-clamp-3 flex-1">
 {post.excerpt}
 </p>
 
 <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800 mt-auto">
 <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Editorial</span>
 <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-black dark:group-hover:text-white opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
 </div>
 </div>
 </motion.article>
 </Link>
 ))}
 </motion.div>
 )}

 {/* Load More Button */}
 {!isLoading && regularPosts.length > 0 && (
 <div className="mt-24 flex justify-center">
 <Button 
 variant="outline" 
 className="rounded-none border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black uppercase text-xs font-bold tracking-widest h-14 px-10 transition-all"
 >
 {t('load_more')}
 </Button>
 </div>
 )}
 </div>
 </section>
 </div>
 );
}