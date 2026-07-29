"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/mouse-events-have-key-events */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState, useCallback, useReducer } from "react";
import { useTranslations } from "next-intl";
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
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";

import { useSocial } from "@/hooks/useSocial";
import { ScheduledPostDTO, PostStatus } from "@/types/social";
import { QhSpinner } from "@/components/ui/QhSpinner";
import ScheduleModal from "@/components/dashboard/marketing/ScheduleModal";

// ── Fallback Image Component ───────────────────────────────────────────────────
const SafeImage = ({
  src,
  alt,
  className,
  fallback,
}: {
  src: string;
  alt: string;
  className?: string;
  fallback: React.ReactNode;
}) => {
  const [error, setError] = useState(false);
  if (!src || error) {
    return <>{fallback}</>;
  }
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
};

// ── Types & Reducer ─────────────────────────────────────────────────────────────

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
  | { type: "SET_POSTS"; payload: any }
  | { type: "SET_ISLOADING"; payload: any }
  | { type: "SET_SELECTEDPOST"; payload: any }
  | { type: "SET_ISMODALOPEN"; payload: any }
  | { type: "SET_CANCELLINGID"; payload: any };

function galleryReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_POSTS":
      return { ...state, posts: action.payload };
    case "SET_ISLOADING":
      return { ...state, isLoading: action.payload };
    case "SET_SELECTEDPOST":
      return { ...state, selectedPost: action.payload };
    case "SET_ISMODALOPEN":
      return { ...state, isModalOpen: action.payload };
    case "SET_CANCELLINGID":
      return { ...state, cancellingId: action.payload };
    default:
      return state;
  }
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ContentGallery({ refreshTrigger }: ContentGalleryProps) {
  const t = useTranslations("DashboardMarketing");
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
    dispatch({ type: "SET_ISLOADING", payload: true });
    try {
      const data = (await getScheduledPosts(0, 20)) as any;
      if (Array.isArray(data)) {
        dispatch({ type: "SET_POSTS", payload: data });
      } else {
        dispatch({ type: "SET_POSTS", payload: data?.content ?? [] });
      }
    } catch {
      // Error manejado en el hook
    } finally {
      dispatch({ type: "SET_ISLOADING", payload: false });
    }
  }, [getScheduledPosts]);

  useEffect(() => {
    fetchPosts();
  }, [refreshTrigger, fetchPosts]);

  // ── Cancel ──────────────────────────────────────────────────────────────────

  const handleCancelPost = async (postId: string) => {
    if (!confirm(t("cancel_post_confirm"))) return;
    dispatch({ type: "SET_CANCELLINGID", payload: postId });
    try {
      await cancelPost(postId);
      toast.success(t("cancel_post_success"));
      fetchPosts();
    } catch {
      toast.error(t("cancel_post_error"));
    } finally {
      dispatch({ type: "SET_CANCELLINGID", payload: null });
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const isVideo = (url?: string) => Boolean(url?.match(/\.(mp4|webm|mov)$/i));

  const getFirstMediaUrl = (post: ScheduledPostDTO): string | null =>
    post.mediaUrls && post.mediaUrls.length > 0 ? post.mediaUrls[0] : null;

  const renderStatusBadge = (status: PostStatus) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t("status_published")}</span>
          </span>
        );
      case "SCHEDULED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/40 shadow-2xs">
            <Clock className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t("status_scheduled")}</span>
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full border border-red-200 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/40 shadow-2xs">
            <AlertCircle className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t("status_failed")}</span>
          </span>
        );
      default:
        return null;
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden flex flex-col font-sans transition-colors">
        {/* Cabecera del Repositorio */}
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
              {t("content_gallery_title")}
            </h2>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t("content_gallery_desc")}
            </p>
          </div>
        </div>

        {/* Estados */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-3 min-h-[280px]">
            <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
            <p className="text-xs font-semibold text-gray-400">
              {t("syncing_assets")}
            </p>
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-5 sm:p-6 bg-white dark:bg-[#0a0a0a]">
            {posts.map((post: any) => {
              const mediaUrl = getFirstMediaUrl(post);
              const isMediaVideo = isVideo(mediaUrl ?? undefined);
              const isCancelling = cancellingId === post.id;

              return (
                <div
                  key={post.id}
                  className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md hover:border-emerald-500/30 transition-all flex flex-col justify-between group"
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
                          onMouseOver={(e) =>
                            (e.target as HTMLVideoElement).play()
                          }
                          onMouseOut={(e) =>
                            (e.target as HTMLVideoElement).pause()
                          }
                        />
                      ) : (
                        <SafeImage
                          src={mediaUrl}
                          alt="Post"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          fallback={
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4 space-y-1">
                              <ImageIcon className="w-8 h-8 stroke-1" />
                              <span className="text-xs font-medium">
                                {t("text_only_badge")}
                              </span>
                            </div>
                          }
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4 space-y-1">
                        <Sparkles className="w-8 h-8 stroke-1 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                          {t("text_only_badge")}
                        </span>
                      </div>
                    )}

                    {/* Badge: Tipo de media */}
                    {mediaUrl && (
                      <div className="absolute top-3 left-3 flex items-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 dark:bg-[#0a0a0a]/90 text-gray-900 dark:text-white backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50 text-[10px] font-bold shadow-2xs">
                          {isMediaVideo ? (
                            <>
                              <Video
                                className="w-3 h-3 text-emerald-600 dark:text-emerald-400"
                                strokeWidth={2}
                              />
                              <span>{t("video_badge")}</span>
                            </>
                          ) : (
                            <>
                              <ImageIcon
                                className="w-3 h-3 text-emerald-600 dark:text-emerald-400"
                                strokeWidth={2}
                              />
                              <span>{t("image_badge")}</span>
                            </>
                          )}
                        </span>
                      </div>
                    )}

                    {/* Badge: Plataforma */}
                    {post.platform && (
                      <div className="absolute top-3 right-3 flex items-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-900/90 text-white dark:bg-white/90 dark:text-gray-900 backdrop-blur-md text-[10px] font-bold shadow-2xs">
                          {post.platform}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ── Detalles ───────────────────────────────────────────── */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      {renderStatusBadge(post.status)}
                      <span className="text-xs font-mono font-bold text-gray-400">
                        {new Date(post.scheduledAt).toLocaleDateString(
                          "es-MX",
                          {
                            day: "2-digit",
                            month: "short",
                          }
                        )}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed">
                      {post.content || (
                        <span className="text-gray-400 italic">
                          {t("no_content")}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* ── Comandos (Footer) ──────────────────────────────────── */}
                  <div className="p-3 bg-gray-50/60 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                    {/* Descargar media */}
                    <button
                      type="button"
                      disabled={!mediaUrl}
                      onClick={() =>
                        mediaUrl && window.open(mediaUrl, "_blank")
                      }
                      className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-all flex items-center justify-center shrink-0 shadow-2xs disabled:opacity-40 cursor-pointer"
                    >
                      <ArrowDownToLine
                        className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                        strokeWidth={2}
                      />
                    </button>

                    {/* Editar / Reprogramar + Cancelar */}
                    {post.status === "SCHEDULED" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            dispatch({
                              type: "SET_SELECTEDPOST",
                              payload: post,
                            });
                            dispatch({
                              type: "SET_ISMODALOPEN",
                              payload: true,
                            });
                          }}
                          className="flex-1 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer border-0"
                        >
                          <CalendarPlus className="w-4 h-4" strokeWidth={2} />
                          <span>{t("reschedule_btn")}</span>
                        </button>

                        <button
                          type="button"
                          disabled={isCancelling}
                          title={t("cancel_post_btn")}
                          onClick={() => handleCancelPost(post.id)}
                          className="w-9 h-9 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 transition-all flex items-center justify-center shrink-0 shadow-2xs disabled:opacity-50 cursor-pointer"
                        >
                          {isCancelling ? (
                            <QhSpinner size="sm" className="text-red-600" />
                          ) : (
                            <Trash2 className="w-4 h-4" strokeWidth={2} />
                          )}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          dispatch({
                            type: "SET_SELECTEDPOST",
                            payload: post,
                          });
                          dispatch({
                            type: "SET_ISMODALOPEN",
                            payload: true,
                          });
                        }}
                        className="flex-1 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer border-0"
                      >
                        <CalendarPlus className="w-4 h-4" strokeWidth={2} />
                        <span>{t("schedule_btn")}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── Empty State ─────────────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-[#0a0a0a] space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs">
              <FolderArchive className="w-6 h-6" strokeWidth={2} />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              {t("gallery_empty_title")}
            </h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
              {t("gallery_empty_desc")}
            </p>
          </div>
        )}
      </div>

      {/* ── ScheduleModal ─────────────────────────────────────────────────── */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => {
          dispatch({ type: "SET_ISMODALOPEN", payload: false });
          dispatch({ type: "SET_SELECTEDPOST", payload: null });
        }}
        onScheduled={() => {
          dispatch({ type: "SET_ISMODALOPEN", payload: false });
          dispatch({ type: "SET_SELECTEDPOST", payload: null });
          fetchPosts();
        }}
        post={selectedPost ?? undefined}
      />
    </>
  );
}