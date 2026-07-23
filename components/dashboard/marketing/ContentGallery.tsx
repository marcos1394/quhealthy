"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/mouse-events-have-key-events */

import React, { useEffect, useState, useCallback, useReducer } from 'react';
import { useTranslations } from 'next-intl';
import {
  Video, 
  Image as ImageIcon, 
  ArrowDownToLine, 
  CalendarPlus, 
  CheckCircle2,
  AlertCircle, 
  Clock, 
  Trash2, 
  FolderArchive,
  Sparkles
} from 'lucide-react';
import { toast } from 'react-toastify';

import { useSocial } from '@/hooks/useSocial';
import { ScheduledPostDTO, PostStatus } from '@/types/social';
import { QhSpinner } from '@/components/ui/QhSpinner';
import ScheduleModal from '@/components/dashboard/marketing/ScheduleModal';
import { cn } from '@/lib/utils';

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

// ── Types ──────────────────────────────────────────────────────────────────────

interface ContentGalleryProps {
  refreshTrigger: number;
}

interface State {
  posts: ScheduledPostDTO[];
  isLoading: boolean;
  selectedPost: ScheduledPostDTO | null;
  isModalOpen: boolean;
  cancellingId: string | null;
}

type Action =
  | { type: 'SET_POSTS'; payload: any }
  | { type: 'SET_ISLOADING'; payload: any }
  | { type: 'SET_SELECTEDPOST'; payload: any }
  | { type: 'SET_ISMODALOPEN'; payload: any }
  | { type: 'SET_CANCELLINGID'; payload: any };

function galleryReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_POSTS': return { ...state, posts: action.payload };
    case 'SET_ISLOADING': return { ...state, isLoading: action.payload };
    case 'SET_SELECTEDPOST': return { ...state, selectedPost: action.payload };
    case 'SET_ISMODALOPEN': return { ...state, isModalOpen: action.payload };
    case 'SET_CANCELLINGID': return { ...state, cancellingId: action.payload };
    default: return state;
  }
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ContentGallery({ refreshTrigger }: ContentGalleryProps) {
  const t = useTranslations('DashboardMarketing');

  const { getScheduledPosts, cancelPost } = useSocial();

  const [state, dispatch] = useReducer(galleryReducer, {
    posts: [],
    isLoading: true,
    selectedPost: null,
    isModalOpen: false,
    cancellingId: null,
  });

  const { posts, isLoading, selectedPost, isModalOpen, cancellingId } = state;

  // ── Fetch ───────────────────────────────────────────────────────────────────

  const fetchPosts = useCallback(async () => {
    dispatch({ type: 'SET_ISLOADING', payload: true });
    try {
      const data = await getScheduledPosts(0, 20) as any;
      if (Array.isArray(data)) {
        dispatch({ type: 'SET_POSTS', payload: data });
      } else {
        dispatch({ type: 'SET_POSTS', payload: data?.content ?? [] });
      }
    } catch {
      // Error manejado en hook
    } finally {
      dispatch({ type: 'SET_ISLOADING', payload: false });
    }
  }, [getScheduledPosts]);

  useEffect(() => { fetchPosts(); }, [refreshTrigger, fetchPosts]);

  // ── Cancel ──────────────────────────────────────────────────────────────────

  const handleCancelPost = async (postId: string) => {
    if (!confirm(t('cancel_post_confirm', { defaultValue: '¿Confirma la anulación de esta publicación?' }))) return;
    dispatch({ type: 'SET_CANCELLINGID', payload: postId });
    try {
      await cancelPost(postId);
      toast.success(t('cancel_post_success', { defaultValue: 'Publicación anulada.' }), { theme: 'colored' });
      fetchPosts();
    } catch {
      toast.error(t('cancel_post_error', { defaultValue: 'Fallo al anular la publicación.' }));
    } finally {
      dispatch({ type: 'SET_CANCELLINGID', payload: null });
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t('status_published', { defaultValue: 'Publicado' })}</span>
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/40 shadow-sm">
            <Clock className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t('status_scheduled', { defaultValue: 'En cola' })}</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-lg border border-red-200 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/40 shadow-sm">
            <AlertCircle className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t('status_failed', { defaultValue: 'Fallido' })}</span>
          </span>
        );
      default:
        return null;
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden flex flex-col font-sans">

        {/* Cabecera del Repositorio */}
        <div className="p-5 md:p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex items-center justify-between">
          <div>
            <h2 className="text-xs md:text-sm font-bold text-gray-900 dark:text-white leading-tight">
              {t('content_gallery_title', { defaultValue: 'Matriz y Galería de Contenido' })}
            </h2>
            <p className="text-[11px] font-semibold text-gray-500">
              {t('content_gallery_desc', { defaultValue: 'Repositorio y auditoría de activos de marketing digital' })}
            </p>
          </div>
        </div>

        {/* Estados */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 gap-4 min-h-[300px]">
            <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
            <p className="text-xs font-semibold text-gray-500 animate-pulse">
              Sincronizando biblioteca de activos...
            </p>
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 p-6 bg-gray-50/30 dark:bg-[#050505]/30">
            {posts.map((post: any) => {
              const mediaUrl = getFirstMediaUrl(post);
              const isMediaVideo = isVideo(mediaUrl ?? undefined);
              const isCancelling = cancellingId === post.id;

              return (
                <div
                  key={post.id}
                  className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm hover:border-emerald-500/30 transition-all flex flex-col justify-between group"
                >
                  {/* ── Media (Visor) ─────────────────────────────────────────────── */}
                  <div className="relative h-48 w-full bg-gray-50 dark:bg-[#050505] overflow-hidden border-b border-gray-100 dark:border-gray-800">
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
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          fallback={
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4">
                              <ImageIcon className="w-8 h-8 mb-2 stroke-1" />
                              <span className="text-[11px] font-semibold">{t('text_only_badge', { defaultValue: 'Publicación de Texto' })}</span>
                            </div>
                          }
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4">
                        <Sparkles className="w-8 h-8 mb-2 stroke-1 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-bold text-gray-500">{t('text_only_badge', { defaultValue: 'Sólo Texto' })}</span>
                      </div>
                    )}

                    {/* Badge: Tipo de media */}
                    {mediaUrl && (
                      <div className="absolute top-3 left-3 flex items-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-[#0a0a0a]/90 text-gray-900 dark:text-white backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50 text-[10px] font-bold shadow-sm">
                          {isMediaVideo
                            ? <><Video className="w-3 h-3 text-emerald-600 dark:text-emerald-400" strokeWidth={2} /><span>{t('video_badge', { defaultValue: 'Video' })}</span></>
                            : <><ImageIcon className="w-3 h-3 text-emerald-600 dark:text-emerald-400" strokeWidth={2} /><span>{t('image_badge', { defaultValue: 'Imagen' })}</span></>
                          }
                        </span>
                      </div>
                    )}

                    {/* Badge: Plataforma */}
                    {post.platform && (
                      <div className="absolute top-3 right-3 flex items-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-900/90 text-white dark:bg-white/90 dark:text-gray-900 backdrop-blur-md text-[10px] font-bold shadow-sm">
                          {post.platform}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ── Detalles ───────────────────────────────────────────── */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      {renderStatusBadge(post.status)}
                      <span className="text-xs font-mono font-semibold text-gray-400">
                        {new Date(post.scheduledAt).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200 line-clamp-3 leading-relaxed">
                      {post.content || <span className="text-gray-400 italic">{t('no_content', { defaultValue: 'Sin descripción' })}</span>}
                    </p>
                  </div>

                  {/* ── Comandos (Footer) ──────────────────────────────────── */}
                  <div className="p-3 bg-gray-50/50 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                    
                    {/* Descargar media */}
                    <button
                      type="button"
                      disabled={!mediaUrl}
                      onClick={() => mediaUrl && window.open(mediaUrl, '_blank')}
                      className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors flex items-center justify-center shrink-0 shadow-sm disabled:opacity-40"
                    >
                      <ArrowDownToLine className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                    </button>

                    {/* Editar / Reprogramar + Cancelar */}
                    {post.status === 'SCHEDULED' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => { dispatch({ type: 'SET_SELECTEDPOST', payload: post }); dispatch({ type: 'SET_ISMODALOPEN', payload: true }); }}
                          className="flex-1 h-10 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <CalendarPlus className="w-4 h-4" strokeWidth={2} />
                          <span>Reprogramar</span>
                        </button>
                        
                        <button
                          type="button"
                          disabled={isCancelling}
                          title={t('cancel_post_btn', { defaultValue: 'Anular' })}
                          onClick={() => handleCancelPost(post.id)}
                          className="w-10 h-10 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors flex items-center justify-center shrink-0 shadow-sm disabled:opacity-50"
                        >
                          {isCancelling ? (
                            <QhSpinner size="sm" className="text-current" />
                          ) : (
                            <Trash2 className="w-4 h-4" strokeWidth={2} />
                          )}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { dispatch({ type: 'SET_SELECTEDPOST', payload: post }); dispatch({ type: 'SET_ISMODALOPEN', payload: true }); }}
                        className="flex-1 h-10 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <CalendarPlus className="w-4 h-4" strokeWidth={2} />
                        <span>{t('schedule_btn', { defaultValue: 'Programar' })}</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* ── Empty State ─────────────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-[#0a0a0a]">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 flex items-center justify-center mb-4 shadow-sm">
              <FolderArchive className="w-6 h-6 text-gray-400" strokeWidth={2} />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
              {t('gallery_empty_title', { defaultValue: 'Repositorio Vacío' })}
            </h3>
            <p className="text-xs font-medium text-gray-500 max-w-xs leading-relaxed">
              {t('gallery_empty_desc', { defaultValue: 'Aún no hay activos digitales generados o programados en el sistema.' })}
            </p>
          </div>
        )}
      </div>

      {/* ── ScheduleModal ─────────────────────────────────────────────────── */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => { 
          dispatch({ type: 'SET_ISMODALOPEN', payload: false }); 
          dispatch({ type: 'SET_SELECTEDPOST', payload: null }); 
        }}
        onScheduled={() => { 
          dispatch({ type: 'SET_ISMODALOPEN', payload: false }); 
          dispatch({ type: 'SET_SELECTEDPOST', payload: null }); 
          fetchPosts(); 
        }}
        post={selectedPost ?? undefined}
      />
    </>
  );
}