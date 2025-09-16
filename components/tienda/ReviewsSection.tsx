"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageCircle, ChevronDown, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReviewItem } from '@/app/quhealthy/types/marketplace'; // 1. Importamos el tipo desde el archivo central

// 2. Definimos las props usando la interfaz importada
interface ReviewsSectionProps {
  reviews: {
    average: number;
    count: number;
    items: ReviewItem[];
  };
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews }) => {
  const [showAll, setShowAll] = useState(false);

  // Si no hay reseñas, mostramos un estado vacío profesional
  if (!reviews || reviews.count === 0) {
    return (
      <section>
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-800 rounded-full mx-auto mb-6 flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Aún no hay opiniones
          </h3>
          <p className="text-gray-400">
            Sé el primero en dejar una reseña sobre este profesional después de tu cita.
          </p>
        </div>
      </section>
    );
  }

  // Lógica para mostrar todas las reseñas o solo las primeras
  const displayedReviews = showAll ? reviews.items : reviews.items.slice(0, 3);
  
  // Lógica para calcular la distribución de ratings para las barras de progreso
  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.items.filter(r => r.rating === rating).length
  }));

  return (
    <section>
      {/* Header con estadísticas */}
      <div className="mb-12 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-3">
            Opiniones de Clientes ({reviews.count})
          </h2>
          <p className="text-gray-400">
            Todas las reseñas son de clientes verificados.
          </p>
        </div>
        
        {/* Estadísticas de ratings */}
        <Card className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700/50 w-full lg:max-w-sm">
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-white">{reviews.average.toFixed(1)}</div>
            <div className="flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-5 h-5 ${i < Math.round(reviews.average) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
                />
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Basado en {reviews.count} {reviews.count === 1 ? 'opinión' : 'opiniones'}
            </p>
          </div>
          
          <div className="space-y-1">
            {ratingCounts.map(({ rating, count }) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm text-gray-400 w-6">{rating}★</span>
                <div className="flex-1 bg-gray-700/50 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    className="bg-yellow-400 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / reviews.count) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <span className="text-sm text-gray-300 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      {/* Lista de reseñas */}
      <div className="space-y-6">
        {displayedReviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center border border-gray-700/50 shrink-0">
                    <span className="text-white font-semibold text-lg">
                      {review.author.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-white">{review.author.name}</h4>
                        <p className="text-gray-400 text-sm">
                          {new Date(review.createdAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="relative mt-4">
                      <Quote className="absolute -top-2 -left-2 w-6 h-6 text-purple-400/20" />
                      <blockquote className="text-gray-300 leading-relaxed pl-4">
                        {review.comment}
                      </blockquote>
                    </div>

                    {review.providerResponse && (
                       <div className="mt-4 p-4 bg-gray-800/50 border-l-2 border-purple-400 rounded-r-lg">
                          <p className="font-semibold text-purple-300 text-sm">Respuesta del Profesional</p>
                          <p className="text-gray-400 text-sm mt-1">{review.providerResponse}</p>
                       </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {reviews.items.length > 3 && (
        <div className="text-center mt-10">
          <Button
            onClick={() => setShowAll(!showAll)}
            variant="outline"
            className="border-gray-600 hover:bg-purple-500/10 hover:text-purple-300"
          >
            {showAll ? 'Mostrar menos' : `Ver todas las ${reviews.count} reseñas`}
            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showAll ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      )}
    </section>
  );
};