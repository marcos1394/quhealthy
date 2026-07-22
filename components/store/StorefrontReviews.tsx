"use client";

import React from 'react';
import { useProviderReviews } from '@/hooks/useProviderReviews';
import { Star, CheckCircle2, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface StorefrontReviewsProps {
  providerId: number;
}

export const StorefrontReviews: React.FC<StorefrontReviewsProps> = ({ providerId }) => {
  const { reviewsResponse, isLoading } = useProviderReviews(providerId, 0, 6);

  if (isLoading) {
    return (
      <div className="py-12 border-t border-gray-200 dark:border-gray-800 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-100 dark:bg-[#111] border border-gray-200 dark:border-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  const reviews = reviewsResponse?.content || [];

  if (reviews.length === 0) return null;

  return (
    <div className="py-12 border-t border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3 mb-8">
        <Star className="w-6 h-6 fill-black dark:fill-white text-black dark:text-white" strokeWidth={1} />
        <h2 className="text-2xl font-bold uppercase tracking-tight text-black dark:text-white">
          Reseñas de Pacientes
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {reviews.map((review) => (
          <div key={review.id} className="flex flex-col space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 border border-black dark:border-white bg-gray-100 dark:bg-black flex items-center justify-center shrink-0">
                <span className="text-lg font-bold uppercase text-black dark:text-white">
                  {/* Default to 'U' for User since name might not be in payload */}
                  U
                </span>
              </div>
              <div>
                <p className="text-[12px] font-bold uppercase tracking-widest text-black dark:text-white leading-none mb-1">
                  Usuario Verificado
                </p>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  <span>
                    {(() => {
                      try {
                        const rawDate: any = review.createdAt;
                        let dateObj: Date;
                        if (Array.isArray(rawDate)) {
                          dateObj = new Date(rawDate[0], rawDate[1] - 1, rawDate[2], rawDate[3] || 0, rawDate[4] || 0);
                        } else {
                          dateObj = new Date(rawDate);
                        }
                        if (isNaN(dateObj.getTime())) return "Reciente";
                        return format(dateObj, "MMMM yyyy", { locale: es });
                      } catch {
                        return "Reciente";
                      }
                    })()}
                  </span>
                  {review.isVerified && (
                    <>
                      <span>•</span>
                      <span className="flex items-center text-black dark:text-white">
                        <CheckCircle2 className="w-3 h-3 mr-1" strokeWidth={2} /> Auténtico
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-black dark:fill-white text-black dark:text-white' : 'fill-transparent text-gray-300 dark:text-gray-700'}`} 
                  strokeWidth={1.5} 
                />
              ))}
            </div>

            <p className="text-[12px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 leading-relaxed">
              &quot;{review.comment}&quot;
            </p>

            {review.providerResponse && (
              <div className="mt-4 p-4 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex gap-3">
                <MessageCircle className="w-4 h-4 mt-0.5 shrink-0 text-black dark:text-white" strokeWidth={1.5} />
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-black dark:text-white mb-2">Respuesta del Especialista</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 leading-relaxed">
                    {review.providerResponse}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {reviewsResponse && reviewsResponse.totalElements > 6 && (
        <div className="mt-10">
          <button className="border border-black dark:border-white px-6 h-12 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
            Mostrar todas las {reviewsResponse.totalElements} reseñas
          </button>
        </div>
      )}
    </div>
  );
};
