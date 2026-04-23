"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSessionStore } from '@/stores/SessionStore';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, Loader2, CheckCheck } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Notification {
  id: number;
  title: string;
  body: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

interface UnreadCountResponse {
  count: number;
}

export const NotificationBell = ({ isCollapsed = false }: { isCollapsed?: boolean }) => {
  const { user } = useSessionStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 🔔 Fetch unread count on mount and periodically
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.get<UnreadCountResponse>('/api/notifications/unread-count');
      setUnreadCount(res.data.count);
    } catch {
      // Silently fail — sidebar must not break
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // 📨 Load notifications when popover opens
  const handleOpenChange = async (isOpen: boolean) => {
    if (isOpen && user) {
      setIsLoading(true);
      try {
        const res = await axiosInstance.get('/api/notifications?size=10');
        setNotifications(res.data.content || []);
      } catch {
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // ✅ Mark all as read
  const markAllAsRead = async () => {
    try {
      await axiosInstance.put('/api/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {
      // Silent fail
    }
  };

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl h-10 w-10 flex-shrink-0 shadow-sm transition-all"
          title="Notificaciones"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 items-center justify-center text-[9px] text-white font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl rounded-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Notificaciones</h4>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-medical-600 dark:text-medical-400 hover:underline flex items-center gap-1"
            >
              <CheckCheck className="w-3 h-3" /> Marcar todo
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {isLoading ? (
            <div className="flex justify-center p-6">
              <Loader2 className="animate-spin text-slate-400 w-5 h-5" />
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`px-4 py-3 cursor-pointer transition-colors ${
                  !n.read
                    ? 'bg-medical-50/50 dark:bg-medical-500/5'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <p className="text-sm text-slate-800 dark:text-slate-200 font-medium line-clamp-1">
                  {n.title || 'Notificación'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                  {n.body}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: es })}
                </p>
              </div>
            ))
          ) : (
            <div className="py-8 text-center">
              <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400 dark:text-slate-500">Sin notificaciones</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};