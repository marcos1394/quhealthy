"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Search, Calendar, User, Tag } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { useTranslations } from "next-intl";

// Interfaz esperada del backend
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  author: string;
  imageUrl: string;
}

const fetcher = (url: string) => axiosInstance.get<BlogPost[]>(url).then(res => res.data);

export default function BlogPage() {
  const t = useTranslations("PublicBlog");
  const [searchQuery, setSearchQuery] = useState("");
  const categories = ["Todos", "Salud Mental", "Nutrición", "Dermatología", "Innovación Médica", "Estilo de Vida"];

  const { data: posts, isLoading, error } = useSWR<BlogPost[]>("/api/blog/posts", fetcher);

  // Filtro simple en cliente (luego podría pasarse al backend)
  const filteredPosts = posts?.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    post.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const regularPosts = filteredPosts.slice(1);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Editorial Header */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-slate-900 dark:text-white mb-6">
                {t('title_light')}<span className="text-medical-600 dark:text-medical-400 italic font-serif">{t('title_highlight')}</span>{t('title_dark')}
              </h1>
              <p className="text-xl text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                {t('subtitle')}
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="w-full md:w-80 relative"
            >
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_ph')}
                className="w-full bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-medical-500 focus:bg-white dark:focus:bg-slate-800 rounded-full py-3 pl-11 pr-4 text-sm outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400"
              />
            </motion.div>
          </div>

          {/* Categories Pill */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide"
          >
            {categories.map((cat, idx) => (
              <button 
                key={idx}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors ${idx === 0 ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 min-h-[50vh]">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="w-8 h-8 border-4 border-medical-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p>{t('loading')}</p>
            </div>
          )}

          {!isLoading && (!posts || posts.length === 0) && (
            <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">{t('empty_title')}</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {t('empty_desc')}
              </p>
            </div>
          )}

          {!isLoading && posts && posts.length > 0 && filteredPosts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-500 text-lg">{t('no_results')}</p>
            </div>
          )}

          {/* Featured Post */}
          {!isLoading && featuredPost && !searchQuery && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-20 group cursor-pointer"
            >
              <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center bg-white dark:bg-slate-900 p-4 md:p-6 lg:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-500">
                <div className="relative aspect-[4/3] md:aspect-auto md:h-full w-full rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors z-10" />
                  <img src={featuredPost.imageUrl} alt={featuredPost.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
                  <div className="absolute top-4 left-4 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-medical-600 dark:text-medical-400" />
                    <span className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">{featuredPost.category}</span>
                  </div>
                </div>
                
                <div className="flex flex-col justify-center py-4 md:pr-6">
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {featuredPost.date}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {featuredPost.author}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white mb-6 leading-tight group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-light mb-8">
                    {featuredPost.excerpt}
                  </p>
                  <div>
                    <span className="inline-flex items-center gap-2 text-medical-600 dark:text-medical-400 font-semibold text-sm tracking-wide">
                      {t('read_more')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Grid Posts */}
          {!isLoading && regularPosts.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post, idx) => (
                <motion.article 
                  key={post.id || idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
                    <div className="absolute top-4 left-4 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">{post.category}</span>
                    </div>
                  </div>
                  
                  <div className="p-6 md:p-8">
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 mb-4">
                      <span>{post.date}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 leading-snug group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-light mb-6 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">{post.author}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-medical-600 dark:group-hover:text-medical-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          {!isLoading && regularPosts.length > 0 && (
            <div className="mt-20 flex justify-center">
              <Button variant="outline" className="rounded-full px-8 h-12 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
                {t('load_more')}
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
