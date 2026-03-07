"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Send, 
  Paperclip, 
  Facebook, 
  Instagram, 
  MessageCircle, 
  Loader2, 
  CheckCheck,
  UserCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // Para fechas legibles "Hace 2 min" o "10:30 AM"

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useSocial } from '@/hooks/useSocial';
import { SocialPlatform } from '@/types/social';

export function SocialInbox() {
  const t = useTranslations('DashboardMarketing');
  const { 
    conversations, 
    messages, 
    activeConversationId, 
    loadConversations, 
    loadMessages, 
    sendCrmMessage,
    loading
  } = useSocial();

  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar la bandeja de entrada al montar el componente
  useEffect(() => {
    loadConversations(0, 50);
  }, []);

  // Auto-scroll hacia abajo cuando entran nuevos mensajes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Mapeo visual de plataformas a íconos y colores
  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case 'FACEBOOK': return <Facebook className="w-4 h-4 text-[#1877F2]" />;
      case 'INSTAGRAM': return <Instagram className="w-4 h-4 text-[#E1306C]" />;
      case 'WHATSAPP': return <MessageCircle className="w-4 h-4 text-[#25D366]" />;
      default: return <MessageCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeConversationId) return;

    setIsSending(true);
    try {
      await sendCrmMessage(activeConversationId, {
        type: 'TEXT',
        content: messageText.trim()
      });
      setMessageText(''); // Limpiamos el input tras enviar
    } catch (error) {
      // El error ya es manejado por el hook, pero evitamos que crashee aquí
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  // Manejar el "Enter" para enviar (Shift+Enter para salto de línea)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const activeChat = conversations.find(c => c.id === activeConversationId);

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex h-[600px] overflow-hidden">
      
      {/* ========================================== */}
      {/* PANEL IZQUIERDO: BANDEJA DE ENTRADA (INBOX) */}
      {/* ========================================== */}
      <div className="w-full md:w-1/3 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
            {t('inbox_title') || 'Mensajes'}
            <Badge className="bg-medical-100 text-medical-700 hover:bg-medical-200 dark:bg-medical-900/30 dark:text-medical-400">
              {conversations.filter(c => !c.isRead).length} Nuevos
            </Badge>
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && !loading && (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
              {t('inbox_empty') || 'No tienes mensajes pendientes.'}
            </div>
          )}

          {conversations.map((conv) => (
            <div 
              key={conv.id}
              onClick={() => loadMessages(conv.id, 0)}
              className={`p-4 border-b border-slate-100 dark:border-slate-800/50 cursor-pointer transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
                activeConversationId === conv.id ? 'bg-medical-50 dark:bg-medical-900/10 border-l-4 border-l-medical-500' : 'border-l-4 border-l-transparent'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white truncate">
                  {getPlatformIcon(conv.platform)}
                  <span className="truncate">{conv.contactName}</span>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                  {format(new Date(conv.lastMessageAt), "HH:mm")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className={`text-sm truncate pr-2 ${!conv.isRead ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                  {conv.lastMessagePreview || 'Archivo adjunto'}
                </p>
                {!conv.isRead && (
                  <div className="w-2.5 h-2.5 bg-medical-500 rounded-full flex-shrink-0"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================== */}
      {/* PANEL DERECHO: CHAT ACTIVO */}
      {/* ========================================== */}
      <div className="hidden md:flex flex-col w-2/3 bg-white dark:bg-slate-950">
        {!activeConversationId ? (
          // ESTADO VACÍO (Ningún chat seleccionado)
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
            <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
            <p>{t('select_chat') || 'Selecciona una conversación para empezar'}</p>
          </div>
        ) : (
          // CHAT ABIERTO
          <>
            {/* Header del Chat */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-slate-500" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {activeChat?.contactName}
                  {activeChat && getPlatformIcon(activeChat.platform)}
                </h4>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  En línea (IA activa)
                </p>
              </div>
            </div>

            {/* Historial de Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-[#0B141A]">
              {messages.map((msg) => {
                const isDoctor = msg.direction === 'OUTBOUND';
                return (
                  <div key={msg.id} className={`flex ${isDoctor ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[75%] rounded-2xl p-3 text-sm relative shadow-sm ${
                        isDoctor 
                          ? 'bg-medical-600 text-white rounded-tr-none' 
                          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isDoctor ? 'text-medical-200' : 'text-slate-400'}`}>
                        {format(new Date(msg.createdAt), "HH:mm")}
                        {isDoctor && <CheckCheck className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* Elemento invisible para forzar el scroll hasta abajo */}
              <div ref={messagesEndRef} />
            </div>

            {/* Input para Escribir */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-end gap-2">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex-shrink-0">
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Textarea 
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('type_message') || 'Escribe un mensaje...'}
                  className="min-h-[44px] max-h-[120px] resize-none bg-slate-50 dark:bg-slate-950/50 border-transparent focus:border-medical-500 focus:ring-medical-500/20 py-3"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || isSending}
                  className="bg-medical-600 hover:bg-medical-700 text-white flex-shrink-0 h-11 w-11 rounded-full p-0"
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-[10px] text-center text-slate-400 mt-2">
                Presiona Enter para enviar. Shift + Enter para salto de línea.
              </p>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}