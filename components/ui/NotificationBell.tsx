/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import { useSessionStore } from '@/stores/SessionStore';
import io from 'socket.io-client';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, Loader2 } from 'lucide-react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const socket = io({
  path: '/api/socket.io', // Le decimos a Socket.IO que use la ruta del proxy
});
interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

export const NotificationBell = () => {
  const { user } = useSessionStore();
  const [notifications, setNotifications] = useState<Notification[]>([]); // <-- CORRECCIÓN
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Conectar al socket y unirse a la sala
    socket.connect();
    socket.emit('join_room', user.id);

    // Escuchar por nuevas notificaciones
    socket.on('new_notification', (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    // Cargar notificaciones iniciales
    axios.get('/api/notifications', { withCredentials: true })
      .then(res => {
        setNotifications(res.data);
        setUnreadCount(res.data.filter((n: { isRead: any; }) => !n.isRead).length);
      })
      .finally(() => setIsLoading(false));

    return () => {
      socket.off('new_notification');
      socket.disconnect();
    };
  }, [user]);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && unreadCount > 0) {
      axios.post('/api/notifications/mark-read', {}, { withCredentials: true })
        .then(() => setUnreadCount(0));
    }
  };

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="default" className="relative">
          <Bell />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-gray-800 border-gray-700 text-white">
        <h4 className="font-medium text-lg mb-2">Notificaciones</h4>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {isLoading ? <Loader2 className="animate-spin mx-auto" /> :
           notifications.length > 0 ? notifications.map((n: any) => (
            <div key={n.id} className="p-2 rounded-lg hover:bg-gray-700/50">
              <p className="text-sm">{n.message}</p>
              <p className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: es })}
              </p>
            </div>
          )) : <p className="text-sm text-gray-500 text-center py-4">No tienes notificaciones.</p>}
        </div>
      </PopoverContent>
    </Popover>
  );
};