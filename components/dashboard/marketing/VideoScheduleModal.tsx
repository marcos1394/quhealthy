"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Loader2,
  CalendarClock,
  Video,
  Youtube,
  AlertCircle,
  X,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
  Globe,
  Lock,
  Link as LinkIcon
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Tipos
export interface GeneratedContent {
  id: string;
  generatedText: string;
  generatedVideoUrl?: string; // Nuevo para videos
  generatedImageUrl?: string;
  prompt?: string;
}

export interface SocialConnection {
  id: number;
  platform: 'youtube' | 'tiktok' | 'instagram' | 'facebook' | 'twitter' | 'linkedin';
  username?: string;
}

interface VideoScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduled: () => void;
  content: GeneratedContent | null;
  connections: SocialConnection[];
}

export const VideoScheduleModal: React.FC<VideoScheduleModalProps> = ({
  isOpen,
  onClose,
  onScheduled,
  content,
  connections
}) => {
  const t = useTranslations('DashboardMarketing.videoModal');
  const [publishAt, setPublishAt] = useState('');
  const [selectedConnectionId, setSelectedConnectionId] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [schedulingStep, setSchedulingStep] = useState<'idle' | 'uploading' | 'processing' | 'success'>('idle');

  // YouTube specific
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDesc, setVideoDesc] = useState('');
  const [tags, setTags] = useState('');
  const [privacyStatus, setPrivacyStatus] = useState<'public' | 'unlisted' | 'private'>('public');

  const videoConnections = connections.filter(c =>
    ['youtube', 'tiktok'].includes(c.platform)
  );

  // Reset al abrir/cambiar contenido
  useEffect(() => {
    if (isOpen && content) {
      setPublishAt('');
      setSelectedConnectionId('');
      setValidationError(null);
      setSchedulingStep('idle');
      setShowPreview(false);

      // Pre-llenar campos
      const defaultTitle = content.prompt ?
        (content.prompt.length > 60 ? content.prompt.substring(0, 57) + "..." : content.prompt)
        : "Video Generado IA";

      setVideoTitle(defaultTitle);
      setVideoDesc(content.generatedText || '');
      setTags('health, wellness, tips');
    }
  }, [isOpen, content]);

  // Validación en tiempo real
  useEffect(() => {
    if (!publishAt || !selectedConnectionId || !videoTitle) {
      setValidationError(null);
      return;
    }

    const selectedDate = new Date(publishAt);
    const now = new Date();

    if (videoTitle.length > 100) {
      setValidationError(t('err_max_chars', { max: 100 }));
    } else if (selectedDate <= now) {
      setValidationError(t('err_date_past'));
    } else if (selectedDate.getTime() - now.getTime() < 5 * 60 * 1000) {
      setValidationError(t('err_date_min'));
    } else {
      setValidationError(null);
    }
  }, [publishAt, selectedConnectionId, videoTitle, t]);

  const getPlatformIcon = (platform: string) => {
    if (platform === 'youtube') return <Youtube className="w-5 h-5 text-[#FF0000]" />;
    if (platform === 'tiktok') return <Video className="w-5 h-5 text-black dark:text-white" />;
    return <Video className="w-5 h-5" />;
  };

  const handleSubmit = async () => {
    if (!content || !selectedConnectionId || !publishAt || !videoTitle) {
      toast.warn(t('toast_warn'));
      return;
    }

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsScheduling(true);
    setSchedulingStep('uploading');

    try {
      const selectedConn = videoConnections.find(c => c.id.toString() === selectedConnectionId);

      // Simulamos la subida en fases para mejor UX
      setTimeout(() => setSchedulingStep('processing'), 2000);

      // Endpoint unificado o específico según tu backend
      const endpoint = selectedConn?.platform === 'youtube'
        ? '/api/google/youtube/upload'
        : '/api/social/schedule-video';

      await axios.post(endpoint, {
        socialConnectionId: parseInt(selectedConnectionId),
        title: videoTitle,
        description: videoDesc,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        privacyStatus: privacyStatus,
        videoUrl: content.generatedVideoUrl,
        publishAt: new Date(publishAt).toISOString(),
      }, { withCredentials: true });

      setSchedulingStep('success');
      toast.success(t('toast_success'), {
        icon: <span>"🚀"</span>
      });

      setTimeout(() => {
        onScheduled();
        onClose();
      }, 1500);

    } catch (error: any) {
      console.error(error);
      setSchedulingStep('idle');
      const errorMessage = error?.response?.data?.message || t('toast_error');
      toast.error(errorMessage);
    } finally {
      setTimeout(() => setIsScheduling(false), 1500);
    }
  };

  const selectedConnection = videoConnections.find(
    c => c.id.toString() === selectedConnectionId
  );

  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">

        {/* Header */}
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm"
              >
                <Video className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </motion.div>

              <div className="flex-1 min-w-0 flex flex-col items-start justify-start text-left">
                <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight text-left">
                  {t('title')}
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 text-base text-left">
                  {t('subtitle')}
                </DialogDescription>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg absolute right-4 top-4"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">

          {/* Preview Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t('preview_title')}
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-500/10 h-8"
              >
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? t('hide_preview') : t('show_preview')}
              </Button>
            </div>

            <AnimatePresence>
              {showPreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 flex items-center justify-center min-h-[150px]">
                    {content.generatedVideoUrl ? (
                      <video
                        src={content.generatedVideoUrl}
                        controls
                        className="w-full max-h-64 rounded-lg object-contain bg-black"
                      />
                    ) : (
                      <div className="text-center text-slate-500 py-6">
                        <Video className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Video no disponible para vista previa</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Form Fields: Meta */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('video_title_label')} <span className="text-red-500">*</span></Label>
                <span className={cn("text-xs font-medium", videoTitle.length > 100 ? "text-red-500" : "text-slate-400")}>
                  {videoTitle.length}/100
                </span>
              </div>
              <Input
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder={t('video_title_placeholder')}
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('tags_label')}</Label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder={t('tags_placeholder')}
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
              />
              <p className="text-xs text-slate-500">{t('tags_hint')}</p>
            </div>
          </motion.div>

          {/* Platform & Date Selection Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Column 1: Platform & Privacy */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="space-y-3">
                <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('platform_label')}
                </Label>

                {videoConnections.length > 0 ? (
                  <Select onValueChange={setSelectedConnectionId} value={selectedConnectionId}>
                    <SelectTrigger className={cn(
                      "bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 h-12 transition-all",
                      selectedConnectionId && "border-indigo-500/50 bg-indigo-50 dark:bg-indigo-500/5 focus:ring-indigo-500/20"
                    )}>
                      <SelectValue placeholder={t('platform_placeholder')} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                      {videoConnections.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()} className="focus:bg-slate-100 dark:focus:bg-slate-800">
                          <div className="flex items-center gap-3">
                            {getPlatformIcon(c.platform)}
                            <div className="flex flex-col text-left">
                              <span className="font-semibold capitalize text-slate-900 dark:text-white">{c.platform}</span>
                              {c.username && (
                                <span className="text-xs text-slate-500 dark:text-slate-400">@{c.username}</span>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-0.5">
                        {t('no_accounts_title')}
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-300">
                        {t('no_accounts_desc')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {selectedConnection?.platform === 'youtube' && (
                <div className="space-y-3">
                  <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('privacy_label')}
                  </Label>
                  <Select value={privacyStatus} onValueChange={(v: any) => setPrivacyStatus(v)}>
                    <SelectTrigger className="bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                      <SelectItem value="public">
                        <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-emerald-500" /> {t('privacy_public')} <span className="text-xs text-slate-500 ml-1">- {t('privacy_public_desc')}</span></div>
                      </SelectItem>
                      <SelectItem value="unlisted">
                        <div className="flex items-center gap-2"><LinkIcon className="w-4 h-4 text-amber-500" /> {t('privacy_unlisted')} <span className="text-xs text-slate-500 ml-1">- {t('privacy_unlisted_desc')}</span></div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-red-500" /> {t('privacy_private')} <span className="text-xs text-slate-500 ml-1">- {t('privacy_private_desc')}</span></div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </motion.div>

            {/* Column 2: Date & Validation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t('datetime_title')}
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <Input
                  type="datetime-local"
                  value={publishAt}
                  onChange={e => setPublishAt(e.target.value)}
                  className={cn(
                    "bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 pl-11 h-12 transition-all",
                    "focus:border-indigo-500 focus:ring-indigo-500/20",
                    publishAt ? !validationError ? "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/5" : "" : "",
                    validationError ? "border-red-500/50 bg-red-50 dark:bg-red-500/5 focus:border-red-500 focus:ring-red-500/20" : ""
                  )}
                />
              </div>

              <AnimatePresence>
                {validationError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2 text-red-600 dark:text-red-400 text-xs bg-red-50 dark:bg-red-500/10 p-3 rounded-lg border border-red-200 dark:border-red-500/20"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{validationError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {t('timezone_info')} {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </p>
            </motion.div>

          </div>

          {/* Summary Card */}
          {selectedConnection && publishAt && !validationError && videoTitle && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-500/20"
            >
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2 text-left">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('summary_title')}
                  </p>
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <p className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                      {videoTitle.substring(0, 40)}{videoTitle.length > 40 ? '...' : ''}
                    </p>
                    <p className="flex items-center gap-2">
                      {getPlatformIcon(selectedConnection.platform)}
                      <span className="capitalize">{selectedConnection.platform}</span>
                      {selectedConnection.username && (
                        <span className="text-slate-500">@{selectedConnection.username}</span>
                      )}
                      {selectedConnection.platform === 'youtube' && (
                        <Badge variant="outline" className="ml-1 h-5 text-[10px] bg-white/50 dark:bg-slate-900/50">
                          {privacyStatus}
                        </Badge>
                      )}
                    </p>
                    <p className="flex items-center gap-2">
                      <CalendarClock className="w-3 h-3 text-slate-400" />
                      {new Date(publishAt).toLocaleString('es-MX', {
                        dateStyle: 'full',
                        timeStyle: 'short'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </div>

        {/* Footer */}
        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isScheduling}
            className="flex-1 sm:flex-none border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {t('cancel_btn')}
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={
              isScheduling ||
              !selectedConnectionId ||
              !publishAt ||
              !videoTitle ||
              !!validationError ||
              videoConnections.length === 0
            }
            className={cn(
              "flex-1 sm:flex-none min-w-[160px] font-bold transition-all duration-300 shadow-sm",
              schedulingStep === 'success'
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            )}
          >
            <AnimatePresence mode="wait">
              {schedulingStep === 'uploading' && (
                <motion.div
                  key="uploading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </motion.div>
              )}
              {schedulingStep === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('schedule_loading')}
                </motion.div>
              )}
              {schedulingStep === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {t('schedule_success')}
                </motion.div>
              )}
              {schedulingStep === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {t('schedule_idle')}
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};