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
      <div className="py-12 border-t border-gray-100 dark:border-gray-800 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 w-48 mb-8 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-50 dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  const reviews = reviewsResponse?.content || [];

  if (reviews.length === 0) return null;

  return (
    <div className="py-12 border-t border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-3 mb-8">
        <Star className="w-6 h-6 fill-yellow-500 text-yellow-500" strokeWidth={2} />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Reseñas de Pacientes
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {reviews.map((review) => (
          <div key={review.id} className="flex flex-col space-y-4 p-5 rounded-2xl border border-gray-100 bg-white shadow-sm dark:bg-[#0a0a0a] dark:border-gray-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-teal-600 dark:text-teal-400">
                  {/* Default to 'U' for User since name might not be in payload */}
                  U
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none mb-1.5">
                  Usuario Verificado
                </p>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
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
                      <span className="flex items-center text-teal-600 dark:text-teal-400">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" strokeWidth={2} /> Auténtico
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
                  className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'fill-transparent text-gray-200 dark:text-gray-700'}`} 
                  strokeWidth={1.5} 
                />
              ))}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">
              &quot;{review.comment}&quot;
            </p>

            {review.providerResponse && (
              <div className="mt-2 p-4 rounded-xl bg-gray-50 dark:bg-[#111] flex gap-3">
                <MessageCircle className="w-4 h-4 mt-0.5 shrink-0 text-gray-500" strokeWidth={2} />
                <div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Respuesta del Especialista</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
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
          <button className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-900 dark:border-gray-700 dark:bg-black dark:hover:bg-gray-900 dark:text-white rounded-xl shadow-sm px-6 h-11 text-sm font-semibold transition-all">
            Mostrar todas las {reviewsResponse.totalElements} reseñas
          </button>
        </div>
      )}
    </div>
  );
};
