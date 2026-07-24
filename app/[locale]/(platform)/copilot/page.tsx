'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHealthOSStore } from '@/stores/useHealthOSStore';
import { healthOSService } from '@/services/healthOS.service';
import { useSessionStore } from '@/stores/SessionStore';
import { WidgetRenderer } from '@/components/engine/WidgetRenderer';
import { Button } from '@/components/ui/button';
import { 
  Send, 
  User, 
  Sparkles, 
  BrainCircuit, 
  Stethoscope, 
  Search, 
  Calendar,
  RotateCcw,
  MessageSquare,
  Plus,
  Trash2,
  Clock,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function CopilotPage() {
  const [inputText, setInputText] = useState('');
  const [showSlashCommands, setShowSlashCommands] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
  }, []);

  const { user } = useSessionStore();
  const userName = user?.firstName || 'Usuario';

  const { 
    conversation, 
    streamingState, 
    sessions,
    activeSessionId,
    addUserMessage, 
    updateAssistantStream, 
    finalizeStream,
    resetConversation,
    loadSession,
    deleteSession
  } = useHealthOSStore();

  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, streamingState]);

  // Auto-ajuste de altura y detectar comandos slash
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
    setShowSlashCommands(inputText === '/');
  }, [inputText]);

  // Interceptar CustomEvent desde Engine
  useEffect(() => {
    const handleIntent = (e: CustomEvent) => {
      sendIntentToAgent(e.detail);
    };
    window.addEventListener('healthos:send_intent', handleIntent as EventListener);
    return () => window.removeEventListener('healthos:send_intent', handleIntent as EventListener);
  }, [streamingState]);

  const sendIntentToAgent = async (text: string) => {
    if (!text.trim() || streamingState !== 'idle') return;

    setInputText('');
    setShowSlashCommands(false);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    addUserMessage(text);

    try {
      updateAssistantStream({ text: 'Analizando tu petición clínica...' });

      const response = await healthOSService.sendIntent(text);
      
      setTimeout(() => {
        updateAssistantStream(response);
        finalizeStream();
      }, 600);

    } catch (error) {
      console.error('Error fetching intent:', error);
      updateAssistantStream({ 
        text: 'Ocurrió un inconveniente al procesar tu solicitud. Por favor intenta de nuevo.' 
      });
      finalizeStream();
    }
  };

  const handleSend = () => sendIntentToAgent(inputText);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { label: "Buscar especialista", cmd: "/buscar pediatras en cdmx", icon: Search },
    { label: "Agendar cita", cmd: "/agendar", icon: Calendar },
    { label: "Analizar síntomas", cmd: "/analizar dolor de cabeza constante", icon: Stethoscope },
  ];

  const slashCommands = [
    { cmd: "/buscar", desc: "Encontrar médicos o especialidades", icon: Search },
    { cmd: "/agendar", desc: "Agendar una cita rápidamente", icon: Calendar },
    { cmd: "/historial", desc: "Consultar tus expedientes médicos (próximamente)", icon: Clock },
  ];

  return (
    <div className="flex h-[calc(100vh-5rem)] max-w-6xl mx-auto w-full p-3 sm:p-6 font-sans gap-4 selection:bg-emerald-100 dark:selection:bg-emerald-950/30 overflow-hidden">
      
      {/* ── SIDEBAR HISTORIAL ──────────────────────── */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden absolute inset-0 z-10 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        {isSidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0, marginRight: 0 }}
            animate={{ width: 288, opacity: 1, marginRight: 16 }}
            exit={{ width: 0, opacity: 0, marginRight: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-y-3 left-3 z-20 lg:static lg:inset-auto flex flex-col bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl lg:shadow-sm overflow-hidden shrink-0"
          >
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-[#050505]">
              <h2 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" /> Consultas
              </h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={resetConversation}
                className="h-8 w-8 rounded-full hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1 p-2">
              <div className="space-y-1">
                {sessions.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">No hay consultas previas.</p>
                ) : (
                  sessions.map((session) => (
                    <div 
                      key={session.id} 
                      className={cn(
                        "group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all",
                        activeSessionId === session.id 
                          ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400" 
                          : "hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300"
                      )}
                      onClick={() => { 
                        loadSession(session.id); 
                        if (window.innerWidth < 1024) setIsSidebarOpen(false);
                      }}
                    >
                      <div className="flex flex-col min-w-0 overflow-hidden">
                        <span className="text-xs font-semibold truncate">{session.title}</span>
                        <span className="text-[10px] text-gray-400 truncate">
                          {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true, locale: es })}
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 shrink-0 rounded-full transition-opacity"
                        onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CONTENEDOR PRINCIPAL CHAT ──────────────────────── */}
      <div className="flex-1 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden flex flex-col transition-all relative">
        
        {/* ── ENCABEZADO COPILOT ─────────────────────────────────────────── */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 shrink-0 items-center justify-center"
              title={isSidebarOpen ? "Ocultar historial" : "Mostrar historial"}
            >
              {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
            </Button>
            
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm shrink-0">
              <BrainCircuit className="w-5 h-5" strokeWidth={2} />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white tracking-tight">
                  Qu
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-900/40">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>IA Clínica</span>
                </span>
              </div>
              <p className="text-xs font-medium text-gray-400">
                Tu asistente médico y de bienestar personalizado
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetConversation}
            className="rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 h-9 px-3 flex items-center gap-1.5 transition-colors lg:hidden"
            title="Nueva conversación"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nueva Consulta</span>
          </Button>
        </div>

        {/* ── ÁREA DE CONVERSACIÓN Y WIDGETS ──────────────────────────────── */}
        <ScrollArea className="flex-1 p-4 sm:p-6">
          <div className="space-y-6">
            
            {conversation.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full min-h-[340px] flex flex-col items-center justify-center text-center p-6 space-y-5"
              >
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                  <BrainCircuit className="w-8 h-8" strokeWidth={2} />
                </div>

                <div className="space-y-1.5 max-w-md">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    ¿En qué puedo ayudarte hoy, {userName}?
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-gray-400 leading-relaxed">
                    Puedo buscar especialistas, agendar tus citas médicas o asistirte en el seguimiento de tu salud.
                  </p>
                </div>

                {/* Sugerencias Rápidas Iniciales */}
                <div className="flex flex-wrap justify-center gap-2 pt-2 max-w-lg">
                  {quickActions.map((sugg, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => sendIntentToAgent(sugg.cmd)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-gray-50/80 dark:bg-[#050505] border border-gray-200/80 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:border-emerald-500/40 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all shadow-2xs"
                    >
                      <sugg.icon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{sugg.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence initial={false}>
              {conversation.map((msg, idx) => (
                <motion.div 
                  key={msg.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={cn(
                    "flex gap-3 items-start",
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {msg.role === 'assistant' && (
                    <Avatar className="h-8 w-8 rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 shadow-2xs">
                      <AvatarFallback className="bg-transparent text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                        AI
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className={cn(
                    "flex flex-col max-w-[95%] lg:max-w-[85%] space-y-2",
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  )}>
                    {msg.content && (
                      <div className={cn(
                        "px-4 py-3 text-sm font-medium leading-relaxed whitespace-pre-wrap shadow-2xs break-words max-w-full overflow-hidden",
                        msg.role === 'user' 
                          ? 'bg-quhealthy-green text-white rounded-2xl rounded-tr-xs dark:bg-emerald-700' 
                          : 'bg-gray-50/90 dark:bg-[#050505] text-gray-900 dark:text-white border border-gray-100 dark:border-gray-800 rounded-2xl rounded-tl-xs'
                      )} style={msg.role === 'user' ? { color: 'white' } : {}}>
                        {msg.content}
                      </div>
                    )}

                    {msg.response?.text && (
                      <div className="px-4 py-3 rounded-2xl rounded-tl-xs bg-gray-50/90 dark:bg-[#050505] text-gray-900 dark:text-white border border-gray-100 dark:border-gray-800 text-sm font-medium leading-relaxed shadow-2xs whitespace-pre-wrap break-words max-w-full overflow-hidden">
                        {msg.response.text}
                      </div>
                    )}

                    {msg.response?.widgets && msg.response.widgets.length > 0 && (
                      <div className="mt-2 w-full max-w-full overflow-hidden">
                        <WidgetRenderer widgets={msg.response.widgets} />
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <Avatar className="h-8 w-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 shrink-0 mt-0.5 shadow-2xs">
                      <AvatarFallback className="bg-transparent font-bold text-xs">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {streamingState === 'processing' && (
              <motion.div 
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 justify-start items-center"
              >
                <Avatar className="h-8 w-8 rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
                  <AvatarFallback className="bg-transparent text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                    AI
                  </AvatarFallback>
                </Avatar>
                
                <div className="px-4 py-2.5 rounded-2xl rounded-tl-xs bg-gray-50/90 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white flex items-center gap-2.5 shadow-2xs">
                  <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
                    Procesando intención clínica...
                  </span>
                </div>
              </motion.div>
            )}

            <div ref={endOfMessagesRef} />
          </div>
        </ScrollArea>

        {/* ── ÁREA DE ENTRADA Y ACCIÓN (TEXTAREA AMPLIADA) ───────────────── */}
        <div className="p-3 sm:p-5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shrink-0 relative">
          
          {/* Menú de Comandos Slash */}
          <AnimatePresence>
            {showSlashCommands && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-4 mb-2 w-72 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden z-20"
              >
                <div className="p-2 bg-gray-50/80 dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2">Comandos Rápidos</span>
                </div>
                <div className="p-1">
                  {slashCommands.map((cmd, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInputText(cmd.cmd + " ");
                        setShowSlashCommands(false);
                        textareaRef.current?.focus();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors group"
                    >
                      <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-lg group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
                        <cmd.icon className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">{cmd.cmd}</span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">{cmd.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Action Chips en conversación activa */}
          {conversation.length > 0 && streamingState === 'idle' && !showSlashCommands && (
            <div className="flex gap-2 pb-3 overflow-x-auto scrollbar-none">
              {quickActions.map((sugg, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => sendIntentToAgent(sugg.cmd)}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                >
                  {sugg.label}
                </button>
              ))}
            </div>
          )}

          <div className="relative flex items-end gap-2 p-2 rounded-2xl bg-gray-50/80 dark:bg-[#050505] border border-gray-200/80 dark:border-gray-800 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-sm">
            
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Escribe tu consulta o usa '/' para ver comandos..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={streamingState !== 'idle'}
              className="flex-1 bg-transparent border-none outline-none resize-none text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 px-3 py-2 max-h-40 min-h-[44px] custom-scrollbar leading-relaxed"
            />

            <Button 
              type="button"
              onClick={handleSend} 
              disabled={!inputText.trim() || streamingState !== 'idle'}
              className="h-10 w-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white p-0 shrink-0 shadow-sm transition-all disabled:opacity-40 mb-0.5"
            >
              {streamingState !== 'idle' ? (
               <QhSpinner size="sm" className="text-white" />
              ) : (
                <Send className="w-4 h-4" strokeWidth={2} />
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between px-1.5 pt-2 text-[11px] text-gray-400 font-medium">
            <span>Qu analiza intenciones clínicas y de bienestar en tiempo real.</span>
            <span className="hidden sm:inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 font-mono text-[10px] border border-gray-200 dark:border-gray-700">Enter ↵</kbd> enviar • 
              <kbd className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 font-mono text-[10px] border border-gray-200 dark:border-gray-700">Shift + Enter</kbd> salto de línea
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}