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
import Link from 'next/link';

// --- INICIO DE LA CORRECCIÓN #1: Conexión Directa ---
// Nos conectamos a la URL absoluta de tu API, no a través del proxy.
const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
// --- FIN DE LA CORRECCIÓN ---

interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

export const NotificationBell = () => {
  const { user } = useSessionStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // --- CORRECCIÓN #2: Lógica Condicional ---
    // Si no hay usuario, no hacemos nada.
    if (!user) {
      setIsLoading(false);
      return;
    }
    // -------------------------------------

    socket.connect();
    socket.emit('join_room', user.id);

    socket.on('new_notification', (newNotification: Notification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    axios.get('/api/notifications', { withCredentials: true })
      .then(res => {
        setNotifications(res.data);
        setUnreadCount(res.data.filter((n: Notification) => !n.isRead).length);
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
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-gray-800 border-gray-700 text-white">
        <h4 className="font-medium text-lg mb-2">Notificaciones</h4>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {isLoading ? <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div> :
           notifications.length > 0 ? notifications.map((n) => (
            <Link key={n.id} href={n.link || '#'} passHref>
              <div className={`p-3 rounded-lg cursor-pointer ${!n.isRead ? 'bg-purple-500/10' : 'hover:bg-gray-700/50'}`}>
                <p className="text-sm text-gray-200">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: es })}
                </p>
              </div>
            </Link>
          )) : <p className="text-sm text-gray-500 text-center py-4">No tienes notificaciones.</p>}
        </div>
      </PopoverContent>
    </Popover>
  );
};