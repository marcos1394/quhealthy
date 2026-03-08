"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  Sparkles,
  Video,
  Image as ImageIcon,
  Loader2,
  ArrowDownToLine,
  CalendarPlus,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSocial } from '@/hooks/useSocial';
import { ScheduledPostDTO, PostStatus } from '@/types/social';

interface ContentGalleryProps {
  // Un contador o trigger que cambia cuando AiStudioForm genera un nuevo post
  // para obligar a la galería a recargarse automáticamente.
  refreshTrigger: number;
}

export function ContentGallery({ refreshTrigger }: ContentGalleryProps) {
  const t = useTranslations('DashboardMarketing');
  const { getScheduledPosts, cancelPost } = useSocial();

  const [posts, setPosts] = useState<ScheduledPostDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para los modales de programación (que implementaremos después)
  const [selectedPost, setSelectedPost] = useState<ScheduledPostDTO | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      // Traemos la primera página de posts (los últimos 20)
      const data = await getScheduledPosts(0, 20);
      setPosts(data?.content ?? []);
    } catch (error) {
      console.error("Error al cargar la galería:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getScheduledPosts]);

  // Recargar cuando el componente se monta o cuando la IA genera algo nuevo
  useEffect(() => {
    fetchPosts();
  }, [refreshTrigger]);

  // Función auxiliar para determinar si es video basado en la URL
  const isVideo = (url?: string) => url?.match(/\.(mp4|webm|mov)$/i);

  // Renderizado del Badge de Estado
  const renderStatusBadge = (status: PostStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
            <CheckCircle className="w-3 h-3 mr-1" /> Publicado
          </Badge>
        );
      case 'SCHEDULED':
        return (
          <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">
            <Clock className="w-3 h-3 mr-1" /> Programado
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20">
            <AlertCircle className="w-3 h-3 mr-1" /> Falló
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pt-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {t('content_gallery_title') || 'Galería y Calendario de Contenidos'}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('content_gallery_desc') || 'Administra tus posts generados por IA, descárgalos o reprográmalos.'}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-medical-500" />
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {posts.map((post) => {
            const mediaUrl = post.mediaUrls && post.mediaUrls.length > 0 ? post.mediaUrls[0] : null;
            const isMediaVideo = isVideo(mediaUrl || undefined);

            return (
              <div
                key={post.id}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col h-[380px]"
              >
                {/* --- SECCIÓN MULTIMEDIA --- */}
                <div className="relative h-48 bg-slate-100 dark:bg-slate-950 w-full flex-shrink-0">
                  {mediaUrl ? (
                    isMediaVideo ? (
                      <video
                        src={mediaUrl}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        onMouseOver={e => (e.target as HTMLVideoElement).play()}
                        onMouseOut={e => (e.target as HTMLVideoElement).pause()}
                      />
                    ) : (
                      <Image src={mediaUrl} alt="Post generado" fill className="object-cover" />
                    )
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-900">
                      <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                      <span className="text-xs font-medium">Solo Texto</span>
                    </div>
                  )}

                  {/* Badge de Tipo de Media */}
                  {mediaUrl && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="bg-white/90 text-slate-900 dark:bg-slate-900/90 dark:text-white backdrop-blur shadow-sm border-0">
                        {isMediaVideo ? <Video className="w-3 h-3 mr-1" /> : <ImageIcon className="w-3 h-3 mr-1" />}
                        {isMediaVideo ? 'Video IA' : 'Imagen IA'}
                      </Badge>
                    </div>
                  )}

                  {/* Badge de Plataforma */}
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-slate-900/80 text-white backdrop-blur border-0 hover:bg-slate-900">
                      {post.platform}
                    </Badge>
                  </div>
                </div>

                {/* --- SECCIÓN DETALLES --- */}
                <div className="flex flex-col flex-1 p-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-2">
                    {renderStatusBadge(post.status)}
                    <span className="text-xs text-slate-400">
                      {new Date(post.scheduledAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 flex-1">
                    {post.content || "Sin descripción."}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!mediaUrl}
                      className="w-full border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      onClick={() => mediaUrl && window.open(mediaUrl, '_blank')}
                    >
                      <ArrowDownToLine className="w-4 h-4 mr-1.5" />
                      Descargar
                    </Button>
                    <Button
                      size="sm"
                      className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:hover:bg-slate-200 text-white dark:text-slate-900"
                      onClick={() => {
                        setSelectedPost(post);
                        setIsModalOpen(true);
                      }}
                    >
                      <CalendarPlus className="w-4 h-4 mr-1.5" />
                      {post.status === 'SCHEDULED' ? 'Editar' : 'Reprogramar'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* --- ESTADO VACÍO --- */
        <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
          <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 dark:border-slate-700">
            <Sparkles className="w-8 h-8 text-medical-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            {t('gallery_empty_title') || 'Aún no hay contenido'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {t('gallery_empty_desc') || 'Usa el Estudio de IA arriba para generar tu primer post médico.'}
          </p>
        </div>
      )}

      {/* Aquí iría el componente Modal para reprogramar, pasándole selectedPost */}
      {/* <ScheduleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} post={selectedPost} onScheduled={fetchPosts} /> */}
    </div>
  );
}