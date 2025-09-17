/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageCircle, ChevronDown, Quote, Sparkles, ThumbsUp, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReviewItem } from '@/app/quhealthy/types/marketplace';

interface ReviewsSectionProps {
  reviews: {
    average: number;
    count: number;
    items: ReviewItem[];
  };
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews }) => {
  const [showAll, setShowAll] = useState(false);

  if (!reviews || reviews.count === 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl mx-auto flex items-center justify-center border border-purple-500/20">
            <MessageCircle className="w-10 h-10 text-purple-400" />
          </div>
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full p-2">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-3">
          Primeras experiencias por escribirse
        </h3>
        <p className="text-slate-400 text-lg max-w-md mx-auto">
          Sé el primero en compartir tu experiencia y ayuda a otros a conocer la calidad de nuestros servicios.
        </p>
      </motion.section>
    );
  }

  const displayedReviews = showAll ? reviews.items : reviews.items.slice(0, 3);
  
  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.items.filter(r => r.rating === rating).length
  }));

  return (
    <section>
      {/* Enhanced Header with Statistics */}
      <div className="mb-16 flex flex-col xl:flex-row xl:items-start xl:justify-between gap-12">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl border border-yellow-500/20">
              <Star className="w-8 h-8 text-yellow-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-yellow-200 to-orange-200 bg-clip-text text-transparent">
              Experiencias de Clientes
            </h2>
          </div>
          <p className="text-slate-400 text-lg">
            {reviews.count} {reviews.count === 1 ? 'reseña verificada' : 'reseñas verificadas'} de clientes reales que han vivido nuestra experiencia.
          </p>
        </motion.div>
        
        {/* Enhanced Statistics Card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:max-w-sm w-full"
        >
          <Card className="bg-gradient-to-br from-slate-800/60 via-slate-800/40 to-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
            {/* Rating display */}
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <div className="text-6xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
                  {reviews.average.toFixed(1)}
                </div>
                <div className="absolute -top-2 -right-8">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.1 + 0.5, type: "spring", stiffness: 200 }}
                  >
                    <Star 
                      className={`w-6 h-6 ${i < Math.round(reviews.average) ? 'text-yellow-400 fill-current' : 'text-slate-600'}`} 
                    />
                  </motion.div>
                ))}
              </div>
              
              <p className="text-slate-400 text-sm">
                Basado en <span className="text-white font-semibold">{reviews.count}</span> {reviews.count === 1 ? 'opinión' : 'opiniones'}
              </p>
            </div>
            
            {/* Rating breakdown */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-green-400" />
                Distribución de calificaciones
              </h4>
              {ratingCounts.map(({ rating, count }) => (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm text-slate-400 font-medium">{rating}</span>
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 bg-slate-700/50 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / reviews.count) * 100}%` }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                    />
                  </div>
                  <span className="text-sm text-slate-300 w-8 text-right font-medium">{count}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
      
      {/* Reviews List */}
      <div className="space-y-8">
        {displayedReviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="group bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/30 transition-all duration-500 overflow-hidden hover:shadow-xl hover:shadow-purple-500/10">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/30 to-blue-600/30 flex items-center justify-center border-2 border-slate-600/50 group-hover:border-purple-500/50 transition-all duration-300 shadow-lg">
                      <span className="text-white font-bold text-xl">
                        {review.author.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-slate-900">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Review content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-lg text-white group-hover:text-purple-300 transition-colors">
                          {review.author.name}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(review.createdAt).toLocaleDateString('es-MX', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/20 rounded-xl px-3 py-2">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-slate-600'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Review text */}
                    <div className="relative mt-6">
                      <Quote className="absolute -top-4 -left-4 w-8 h-8 text-purple-400/30" />
                      <blockquote className="text-slate-300 leading-relaxed pl-6 text-lg">
                        {review.comment}
                      </blockquote>
                    </div>

                    {/* Provider response */}
                    {review.providerResponse && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-6 p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-l-4 border-purple-400 rounded-r-2xl backdrop-blur-sm"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                            <MessageCircle className="w-4 h-4 text-white" />
                          </div>
                          <p className="font-semibold text-purple-300">Respuesta del Profesional</p>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed pl-10">
                          {review.providerResponse}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Show More/Less Button */}
      {reviews.items.length > 3 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Button
            onClick={() => setShowAll(!showAll)}
            variant="outline"
            size="lg"
            className="group bg-slate-800/50 backdrop-blur-xl border-slate-600/50 hover:border-purple-500/50 hover:bg-purple-500/10 text-slate-300 hover:text-white transition-all duration-300 px-8 py-4 rounded-2xl font-semibold"
          >
            <MessageCircle className="w-5 h-5 mr-3" />
            {showAll ? 'Mostrar menos reseñas' : `Ver todas las ${reviews.count} reseñas`}
            <ChevronDown className={`w-5 h-5 ml-3 transition-transform duration-300 ${showAll ? 'rotate-180' : ''} group-hover:scale-110`} />
          </Button>
        </motion.div>
      )}

      {/* Call to Action Footer */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-16"
      >
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <h3 className="text-xl font-semibold text-white">¿Ya viviste tu experiencia?</h3>
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
            Comparte tu opinión y ayuda a otros a tomar la mejor decisión. Tu feedback es valioso para nosotros y para futuros clientes.
          </p>
          <button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-semibold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            Escribir mi Reseña
          </button>
        </div>
      </motion.div>
    </section>
  );
};