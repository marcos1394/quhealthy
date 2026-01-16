/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';

interface AppointmentContext {
  appointmentId: number;
  consumerId: number;
  providerId: number;
}

export default function LeaveReviewPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [appointmentInfo, setAppointmentInfo] = useState<AppointmentContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    
    // Validamos el token al cargar la página
    axios.get(`/api/reviews/verify-token/${token}`)
      .then(res => {
        setAppointmentInfo(res.data);
      })
      .catch(err => {
        setError(err.response?.data?.message || "Este enlace ya no es válido.");
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Por favor, selecciona una calificación de estrellas.");
      return;
    }
    try {
      // Usamos el endpoint que ya teníamos para crear la reseña
      await axios.post('/api/reviews', {
        rating,
        comment,
        providerId: appointmentInfo?.providerId,
        appointmentId: appointmentInfo?.appointmentId,
      }, { withCredentials: true });

      toast.success("¡Gracias por tu reseña!");
      // Idealmente, redirigir al perfil del proveedor para que vea su reseña
      router.push(`/tienda/${appointmentInfo?.providerId}`); 
    } catch (err: any) {
      toast.error(err.response?.data?.message || "No se pudo enviar tu reseña.");
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }
  
  if (error) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><p className="text-red-500 text-center">{error}</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center p-4">
      <div className="max-w-lg w-full bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
        <h1 className="text-3xl font-bold mb-2">Deja tu Opinión</h1>
        <p className="text-gray-400 mb-6">Tu feedback ayuda a otros a tomar mejores decisiones.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-medium mb-2">Tu Calificación</label>
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  onClick={() => setRating(star)}
                  className={`w-10 h-10 cursor-pointer transition-all ${
                    rating >= star 
                      ? 'text-yellow-400 fill-yellow-400 scale-110' 
                      : 'text-gray-600 hover:text-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">Tu Comentario (Opcional)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded border-gray-600 min-h-[120px]"
              rows={5}
              placeholder="Describe tu experiencia con el profesional, el servicio, las instalaciones, etc."
            />
          </div>
          <Button type="submit" size="lg" className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-base">
            Enviar Reseña
          </Button>
        </form>
      </div>
    </div>
  );
}