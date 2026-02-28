"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Loader2,
  CalendarClock,
  Instagram,
  Facebook,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  Sparkles,
  Clock,
  Send,
  Twitter,
  Linkedin
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
  generatedImageUrl?: string;
  prompt?: string;
}

export interface SocialConnection {
  id: number;
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin';
  username?: string;
}

interface ImageScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduled: () => void;
  content: GeneratedContent | null;
  connections: SocialConnection[];
}

export const ImageScheduleModal: React.FC<ImageScheduleModalProps> = ({
  isOpen,
  onClose,
  onScheduled,
  content,
  connections
}) => {
  const t = useTranslations('DashboardMarketing.imageModal');
  const [publishAt, setPublishAt] = useState('');
  const [selectedConnectionId, setSelectedConnectionId] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [schedulingStep, setSchedulingStep] = useState<'idle' | 'uploading' | 'success'>('idle');

  const imageConnections = connections.filter(c =>
    ['instagram', 'facebook', 'linkedin', 'twitter'].includes(c.platform)
  );

  // Reset al abrir
  useEffect(() => {
    if (isOpen) {
      setPublishAt('');
      setSelectedConnectionId('');
      setValidationError(null);
      setSchedulingStep('idle');
      setShowPreview(false);
    }
  }, [isOpen]);

  // Validación en tiempo real
  useEffect(() => {
    if (!publishAt || !selectedConnectionId) {
      setValidationError(null);
      return;
    }

    const selectedDate = new Date(publishAt);
    const now = new Date();

    if (selectedDate <= now) {
      setValidationError(t('err_date_past'));
    } else if (selectedDate.getTime() - now.getTime() < 5 * 60 * 1000) {
      setValidationError(t('err_date_min'));
    } else {
      setValidationError(null);
    }
  }, [publishAt, selectedConnectionId, t]);

  // Helper para iconos de plataforma
  const getPlatformIcon = (platform: string) => {
    const icons = {
      instagram: <Instagram className="w-4 h-4 text-pink-500" />,
      facebook: <Facebook className="w-4 h-4 text-[#1877F2]" />,
      twitter: <Twitter className="w-4 h-4 text-sky-500" />,
      linkedin: <Linkedin className="w-4 h-4 text-[#0A66C2]" />
    };
    return icons[platform as keyof typeof icons] || <ImageIcon className="w-4 h-4" />;
  };

  // Handler de submit
  const handleSubmit = async () => {
    if (!content || !selectedConnectionId || !publishAt) {
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
      await axios.post('/api/social/schedule-post', {
        socialConnectionId: parseInt(selectedConnectionId),
        content: content.generatedText,
        imageUrl: content.generatedImageUrl,
        publishAt: new Date(publishAt).toISOString(),
      }, { withCredentials: true });

      setSchedulingStep('success');
      toast.success(t('toast_success'), {
        icon: <span>"✨"</span>
      });

      // Esperar animación de éxito
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

  // Obtener conexión seleccionada
  const selectedConnection = imageConnections.find(
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
                className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-100 dark:border-medical-500/20 shadow-sm"
              >
                <CalendarClock className="w-6 h-6 text-medical-600 dark:text-medical-400" />
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
                className="text-medical-600 hover:text-medical-700 hover:bg-medical-50 dark:text-medical-400 dark:hover:text-medical-300 dark:hover:bg-medical-500/10 h-8"
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
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                    {content.generatedImageUrl && (
                      <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                        <img
                          src={content.generatedImageUrl}
                          alt="Preview"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                    <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                      "{content.generatedText}"
                    </p>
                    {content.generatedText && (
                      <Badge variant="outline" className="bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 font-medium">
                        {content.generatedText.length} caracteres
                      </Badge>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Copy para referencia */}
            {!showPreview && (
              <Textarea
                value={content.generatedText || ''}
                readOnly
                className="bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-300 min-h-[100px] resize-none focus-visible:ring-0"
              />
            )}
          </motion.div>

          {/* Platform Selection */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('platform_title')}
            </Label>

            {imageConnections.length > 0 ? (
              <Select onValueChange={setSelectedConnectionId} value={selectedConnectionId}>
                <SelectTrigger className={cn(
                  "bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 h-12 transition-all",
                  selectedConnectionId && "border-medical-500/50 bg-medical-50 dark:bg-medical-500/5 focus:ring-medical-500/20"
                )}>
                  <SelectValue placeholder={t('platform_placeholder')} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  {imageConnections.map(c => (
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
          </motion.div>

          {/* Date/Time Selection */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
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
                  "focus:border-medical-500 focus:ring-medical-500/20",
                  publishAt ? !validationError ? "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/5" : "" : "",
                  validationError ? "border-red-500/50 bg-red-50 dark:bg-red-500/5 focus:border-red-500 focus:ring-red-500/20" : ""
                )}
              />
            </div>

            {/* Validation Error */}
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

            {/* Timezone info */}
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {t('timezone_info')} {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </p>
          </motion.div>

          {/* Summary Card */}
          {selectedConnection && publishAt && !validationError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-medical-50 dark:bg-medical-500/10 p-4 rounded-xl border border-medical-100 dark:border-medical-500/20"
            >
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-medical-600 dark:text-medical-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2 text-left">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('summary_title')}
                  </p>
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <p className="flex items-center gap-2">
                      {getPlatformIcon(selectedConnection.platform)}
                      <span className="capitalize">{selectedConnection.platform}</span>
                      {selectedConnection.username && (
                        <span className="text-slate-500">@{selectedConnection.username}</span>
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
              !!validationError ||
              imageConnections.length === 0
            }
            className={cn(
              "flex-1 sm:flex-none min-w-[160px] font-bold transition-all duration-300 shadow-sm",
              schedulingStep === 'success'
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-medical-600 hover:bg-medical-700 text-white"
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