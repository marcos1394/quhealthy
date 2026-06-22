"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';

// ── Fallback Image Component ───────────────────────────────────────────────────
const SafeImage = ({ src, alt, className, fallback }: { src: string, alt: string, className?: string, fallback: React.ReactNode }) => {
  const [error, setError] = useState(false);
  if (!src || error) {
    return <>{fallback}</>;
  }
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      onError={() => setError(true)}
    />
  );
};

import {
  Sparkles, Video, Image as ImageIcon, Loader2,
  ArrowDownToLine, CalendarPlus, CheckCircle2,
  AlertCircle, Clock, Trash2, FolderArchive
} from 'lucide-react';
import { toast } from 'react-toastify';

import { useSocial } from '@/hooks/useSocial';
import { ScheduledPostDTO, PostStatus } from '@/types/social';
import { QhSpinner } from '@/components/ui/QhSpinner';
import ScheduleModal from '@/components/dashboard/marketing/ScheduleModal';
import { cn } from '@/lib/utils';

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
      const data = await getScheduledPosts(0, 20) as any;
      if (Array.isArray(data)) {
        setPosts(data);
      } else {
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
    if (!confirm(t('cancel_post_confirm', { defaultValue: '¿CONFIRMA LA ANULACIÓN DE ESTA PUBLICACIÓN?' }))) return;
    setCancellingId(postId);
    try {
      await cancelPost(postId);
      toast.success(t('cancel_post_success', { defaultValue: 'PUBLICACIÓN ANULADA.' }));
      fetchPosts();
    } catch {
      toast.error(t('cancel_post_error', { defaultValue: 'FALLO EN ANULACIÓN.' }));
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
          <span className="border border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} />
            {t('status_published', { defaultValue: 'PUBLICADO' })}
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="border border-indigo-500/30 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/10 dark:text-indigo-400 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Clock className="w-3 h-3" strokeWidth={1.5} />
            {t('status_scheduled', { defaultValue: 'EN COLA' })}
          </span>
        );
      case 'FAILED':
        return (
          <span className="border border-red-500/30 bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
            <AlertCircle className="w-3 h-3" strokeWidth={1.5} />
            {t('status_failed', { defaultValue: 'FALLIDO' })}
          </span>
        );
      default:
        return null;
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">

        {/* Header Arquitectónico */}
        <div className="p-6 md:p-8 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505]">
          <h2 className="text-sm font-semibold uppercase tracking-tight text-black dark:text-white mb-1">
            {t('content_gallery_title', { defaultValue: 'MATRIZ DE CONTENIDO' })}
          </h2>
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
            {t('content_gallery_desc', { defaultValue: 'REPOSITORIO Y AUDITORÍA DE ACTIVOS DE MARKETING' })}
          </p>
        </div>

        {/* Estados */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-gray-50 dark:bg-[#050505]">
            <QhSpinner size="lg" className="text-black dark:text-white" />
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-6 animate-pulse">
              SINCRONIZANDO ACTIVOS...
            </p>
          </div>

        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0 bg-gray-50 dark:bg-[#050505]">
            {posts.map((post) => {
              const mediaUrl    = getFirstMediaUrl(post);
              const isMediaVideo = isVideo(mediaUrl ?? undefined);
              const isCancelling = cancellingId === post.id;

              return (
                <div
                  key={post.id}
                  className="flex flex-col border-b border-r border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] transition-colors hover:bg-gray-50 dark:hover:bg-[#111]"
                >
                  {/* ── Media (Visor) ─────────────────────────────────────────────── */}
                  <div className="relative h-48 w-full flex-shrink-0 bg-gray-50 dark:bg-[#050505] border-b border-black/10 dark:border-white/10">
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
                        <SafeImage 
                          src={mediaUrl} 
                          alt="Post" 
                          className="w-full h-full object-cover" 
                          fallback={
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                              <ImageIcon className="w-6 h-6 mb-2" strokeWidth={1.5} />
                              <span className="text-[9px] font-bold uppercase tracking-widest">{t('text_only_badge', { defaultValue: 'SÓLO TEXTO' })}</span>
                            </div>
                          }
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <ImageIcon className="w-6 h-6 mb-2" strokeWidth={1.5} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">{t('text_only_badge', { defaultValue: 'SÓLO TEXTO' })}</span>
                      </div>
                    )}

                    {/* Badge: tipo de media */}
                    {mediaUrl && (
                      <div className="absolute top-3 left-3 flex items-center">
                        <span className="border border-black/10 dark:border-white/10 bg-white/90 dark:bg-[#0a0a0a]/90 text-black dark:text-white backdrop-blur-sm px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                          {isMediaVideo
                            ? <><Video className="w-3 h-3" strokeWidth={1.5} />{t('video_badge', { defaultValue: 'VIDEO' })}</>
                            : <><ImageIcon className="w-3 h-3" strokeWidth={1.5} />{t('image_badge', { defaultValue: 'IMAGEN' })}</>
                          }
                        </span>
                      </div>
                    )}

                    {/* Badge: plataforma */}
                    {post.platform && (
                      <div className="absolute top-3 right-3 flex items-center">
                        <span className="border border-black/20 dark:border-white/20 bg-black/90 text-white dark:bg-white/90 dark:text-black backdrop-blur-sm px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest">
                          {post.platform}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ── Detalles ───────────────────────────────────────────── */}
                  <div className="flex flex-col flex-1 p-5">
                    <div className="flex justify-between items-center mb-4">
                      {renderStatusBadge(post.status)}
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                        {new Date(post.scheduledAt).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                    </div>

                    <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white line-clamp-3 mb-6 flex-1 leading-relaxed">
                      {post.content || <span className="text-gray-400">{t('no_content', { defaultValue: 'SIN DESCRIPCIÓN' })}</span>}
                    </p>
                  </div>

                  {/* ── Comandos (Footer) ──────────────────────────────────────────── */}
                  <div className="flex border-t border-black/10 dark:border-white/10 mt-auto shrink-0 bg-gray-50 dark:bg-[#050505]">

                    {/* Descargar media */}
                    <button
                      disabled={!mediaUrl}
                      className="flex-1 h-12 flex items-center justify-center gap-2 border-r border-black/10 dark:border-white/10 bg-transparent text-gray-500 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-[#111] transition-colors text-[9px] font-bold uppercase tracking-widest disabled:opacity-50"
                      onClick={() => mediaUrl && window.open(mediaUrl, '_blank')}
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>

                    {/* Editar / Reprogramar + Cancelar */}
                    {post.status === 'SCHEDULED' ? (
                      <>
                        <button
                          className="flex-1 h-12 flex items-center justify-center gap-2 border-r border-black/10 dark:border-white/10 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[9px] font-bold uppercase tracking-widest"
                          onClick={() => { setSelectedPost(post); setIsModalOpen(true); }}
                        >
                          <CalendarPlus className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                        <button
                          disabled={isCancelling}
                          title={t('cancel_post_btn', { defaultValue: 'ANULAR' })}
                          className="w-16 h-12 flex items-center justify-center bg-transparent text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50"
                          onClick={() => handleCancelPost(post.id)}
                        >
                          {isCancelling
                            ? <QhSpinner size="sm" className="text-current" />
                            : <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                          }
                        </button>
                      </>
                    ) : (
                      <button
                        className="flex-1 h-12 flex items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[9px] font-bold uppercase tracking-widest"
                        onClick={() => { setSelectedPost(post); setIsModalOpen(true); }}
                      >
                        <CalendarPlus className="w-3.5 h-3.5" strokeWidth={1.5} />
                        {t('schedule_btn', { defaultValue: 'PROGRAMAR' })}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        ) : (
          /* ── Empty state ─────────────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-24 text-center bg-gray-50 dark:bg-[#050505]">
            <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center mb-6">
              <FolderArchive className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-tight text-black dark:text-white mb-2">
              {t('gallery_empty_title', { defaultValue: 'REPOSITORIO VACÍO' })}
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-xs leading-relaxed">
              {t('gallery_empty_desc', { defaultValue: 'AÚN NO HAY ACTIVOS DIGITALES GENERADOS O PROGRAMADOS.' })}
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