/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import axios from 'axios';
import { Star, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';

interface AppointmentContext {
  appointmentId: number;
  consumerId: number;
  providerId: number;
}

export default function LeaveReviewPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('PatientReviews');
  const token = params.token as string;

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [appointmentInfo, setAppointmentInfo] = useState<AppointmentContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;

    axios.get(`/api/reviews/verify-token/${token}`)
      .then(res => {
        setAppointmentInfo(res.data);
      })
      .catch(err => {
        setError(err.response?.data?.message || t('error_invalid'));
      })
      .finally(() => setIsLoading(false));
  }, [token, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error(t('toast_rating_required'));
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post('/api/reviews', {
        rating,
        comment,
        providerId: appointmentInfo?.providerId,
        appointmentId: appointmentInfo?.appointmentId,
      }, { withCredentials: true });

      toast.success(t('toast_success'));
      router.push(`/tienda/${appointmentInfo?.providerId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('toast_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-medical-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <p className="text-rose-500 dark:text-red-400 text-center font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex justify-center items-center p-4 font-sans selection:bg-medical-500/30">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20">
            <MessageSquare className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t('subtitle')}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">{t('label_rating')}</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className={cn(
                    "w-10 h-10 cursor-pointer transition-all duration-200",
                    (hoverRating || rating) >= star
                      ? 'text-amber-400 fill-amber-400 scale-110'
                      : 'text-slate-200 dark:text-slate-700 hover:text-slate-300 dark:hover:text-slate-600'
                  )}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('label_comment')}</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl min-h-[120px]"
              rows={5}
              placeholder={t('comment_placeholder')}
            />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="w-full bg-medical-600 hover:bg-medical-700 text-white h-12 text-base rounded-xl"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {t('btn_submit')}
          </Button>
        </form>
      </div>
    </div>
  );
}