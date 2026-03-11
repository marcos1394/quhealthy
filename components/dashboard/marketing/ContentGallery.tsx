"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  Sparkles, Video, Image as ImageIcon, Loader2,
  ArrowDownToLine, CalendarPlus, CheckCircle,
  AlertCircle, Clock, Trash2
} from 'lucide-react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSocial } from '@/hooks/useSocial';
import { ScheduledPostDTO, PostStatus } from '@/types/social';
import { QhSpinner } from '@/components/ui/QhSpinner';
import ScheduleModal from '@/components/dashboard/marketing/ScheduleModal';

// ── Types ──────────────────────────────────────────────────────────────────────

interface ContentGalleryProps {
  refreshTrigger: number;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ContentGallery({ refreshTrigger }: ContentGalleryProps) {
  const t  = useTranslations('DashboardMarketing');

  const { getScheduledPosts, cancelPost } = useSocial();

  const [posts, setPosts]           = useState<ScheduledPostDTO[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [selectedPost, setSelectedPost]   = useState<ScheduledPostDTO | null>(null);
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [cancellingId, setCancellingId]   = useState<string | null>(null);

  // ── Fetch ───────────────────────────────────────────────────────────────────

 const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      // 🚀 Hacemos un cast a 'any' temporalmente para que TypeScript no se queje
      const data = await getScheduledPosts(0, 20) as any;
      
      // 🚀 Verificamos la forma real de los datos que llegaron
      if (Array.isArray(data)) {
        // Si el backend mandó un Array directo (nuestro caso actual)
        setPosts(data);
      } else {
        // Si en el futuro el backend manda una página (SpringPage)
        setPosts(data?.content ?? []);
      }
      
    } catch {
      // error ya manejado en el hook
    } finally {
      setIsLoading(false);
    }
  }, [getScheduledPosts]);

  useEffect(() => { fetchPosts(); }, [refreshTrigger]);

  // ── Cancel ──────────────────────────────────────────────────────────────────

  const handleCancelPost = async (postId: string) => {
    if (!confirm(t('cancel_post_confirm'))) return;
    setCancellingId(postId);
    try {
      await cancelPost(postId);
      toast.success(t('cancel_post_success'));
      fetchPosts();
    } catch {
      // ⚠️ El endpoint DELETE /posts/{id} aún no está implementado en el backend.
      // Cuando se implemente en SocialController, esto funcionará sin cambios aquí.
      toast.error(t('cancel_post_error'));
    } finally {
      setCancellingId(null);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const isVideo = (url?: string) =>
    Boolean(url?.match(/\.(mp4|webm|mov)$/i));

  const getFirstMediaUrl = (post: ScheduledPostDTO): string | null =>
    (post.mediaUrls && post.mediaUrls.length > 0) ? post.mediaUrls[0] : null;

  const renderStatusBadge = (status: PostStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 text-[10px]">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t('status_published')}
          </Badge>
        );
      case 'SCHEDULED':
        return (
          <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 text-[10px]">
            <Clock className="w-3 h-3 mr-1" />
            {t('status_scheduled')}
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 text-[10px]">
            <AlertCircle className="w-3 h-3 mr-1" />
            {t('status_failed')}
          </Badge>
        );
      default:
        return null;
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="space-y-6 pt-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {t('content_gallery_title')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t('content_gallery_desc')}
            </p>
          </div>
        </div>

        {/* Estados */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <QhSpinner size="md" />
          </div>

        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.map((post) => {
              const mediaUrl    = getFirstMediaUrl(post);
              const isMediaVideo = isVideo(mediaUrl ?? undefined);
              const isCancelling = cancellingId === post.id;

              return (
                <div
                  key={post.id}
                  className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col h-[380px]"
                >
                  {/* ── Media ─────────────────────────────────────────────── */}
                  <div className="relative h-48 bg-slate-100 dark:bg-slate-950 w-full flex-shrink-0">
                    {mediaUrl ? (
                      isMediaVideo ? (
                        <video
                          src={mediaUrl}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                          onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                        />
                      ) : (
                        <Image src={mediaUrl} alt="Post" fill className="object-cover" />
                      )
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-900">
                        <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                        <span className="text-xs font-medium">{t('text_only_badge')}</span>
                      </div>
                    )}

                    {/* Badge: tipo de media */}
                    {mediaUrl && (
                      <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="bg-white/90 text-slate-900 dark:bg-slate-900/90 dark:text-white backdrop-blur shadow-sm border-0 text-[10px]">
                          {isMediaVideo
                            ? <><Video className="w-3 h-3 mr-1" />{t('video_badge')}</>
                            : <><ImageIcon className="w-3 h-3 mr-1" />{t('image_badge')}</>
                          }
                        </Badge>
                      </div>
                    )}

                    {/* Badge: plataforma — opcional en el DTO */}
                    {post.platform && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-slate-900/80 text-white backdrop-blur border-0 hover:bg-slate-900 text-[10px]">
                          {post.platform}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* ── Detalles ───────────────────────────────────────────── */}
                  <div className="flex flex-col flex-1 p-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                      {renderStatusBadge(post.status)}
                      <span className="text-xs text-slate-400">
                        {new Date(post.scheduledAt).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 flex-1">
                      {post.content || t('no_content')}
                    </p>

                    {/* ── Acciones ──────────────────────────────────────────── */}
                    <div className="grid grid-cols-2 gap-2 mt-auto">

                      {/* Descargar media */}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!mediaUrl}
                        className="w-full border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs"
                        onClick={() => mediaUrl && window.open(mediaUrl, '_blank')}
                      >
                        <ArrowDownToLine className="w-3.5 h-3.5 mr-1.5" />
                        {t('download_btn')}
                      </Button>

                      {/* Editar / Reprogramar + Cancelar */}
                      {post.status === 'SCHEDULED' ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs"
                            onClick={() => { setSelectedPost(post); setIsModalOpen(true); }}
                          >
                            <CalendarPlus className="w-3.5 h-3.5 mr-1" />
                            {t('reschedule_btn')}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isCancelling}
                            title={t('cancel_post_btn')}
                            className="px-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                            onClick={() => handleCancelPost(post.id)}
                          >
                            {isCancelling
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Trash2 className="w-3.5 h-3.5" />
                            }
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs"
                          onClick={() => { setSelectedPost(post); setIsModalOpen(true); }}
                        >
                          <CalendarPlus className="w-3.5 h-3.5 mr-1.5" />
                          {t('schedule_btn')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        ) : (
          /* ── Empty state ─────────────────────────────────────────────────── */
          <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 dark:border-slate-700">
              <Sparkles className="w-8 h-8 text-medical-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {t('gallery_empty_title')}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-sm">
              {t('gallery_empty_desc')}
            </p>
          </div>
        )}
      </div>

      {/* ── ScheduleModal (reprogramar post existente) ──────────────────────── */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedPost(null); }}
        onScheduled={() => { setIsModalOpen(false); setSelectedPost(null); fetchPosts(); }}
        post={selectedPost ?? undefined}
      />
    </>
  );
}