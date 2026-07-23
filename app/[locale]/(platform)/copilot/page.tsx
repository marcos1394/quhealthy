'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHealthOSStore } from '@/stores/useHealthOSStore';
import { healthOSService } from '@/services/healthOS.service';
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
  CornerDownLeft
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { cn } from '@/lib/utils';

export default function CopilotPage() {
  const [inputText, setInputText] = useState('');
  const { 
    conversation, 
    streamingState, 
    addUserMessage, 
    updateAssistantStream, 
    finalizeStream,
    resetConversation
  } = useHealthOSStore();

  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll suave al recibir mensajes o cambiar de estado
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, streamingState]);

  // Auto-ajuste de altura para el textarea según el contenido
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputText]);

  const handleSend = async () => {
    if (!inputText.trim() || streamingState !== 'idle') return;

    const text = inputText.trim();
    setInputText('');
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // 1. Agregar mensaje del usuario
    addUserMessage(text);

    try {
      // 2. Enviar intención al backend
      const response = await healthOSService.sendIntent(text);
      
      updateAssistantStream({ text: 'Analizando tu petición clínica...' });
      
      setTimeout(() => {
        updateAssistantStream(response);
        finalizeStream();
      }, 1200);

    } catch (error) {
      console.error('Error fetching intent:', error);
      updateAssistantStream({ 
        text: 'Ocurrió un inconveniente al procesar tu solicitud. Por favor intenta de nuevo.' 
      });
      finalizeStream();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-4xl mx-auto w-full p-3 sm:p-6 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30">
      
      {/* ── CONTENEDOR PRINCIPAL TIPO GLASSMORPHISM ──────────────────────── */}
      <div className="flex-1 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden flex flex-col transition-all">
        
        {/* ── ENCABEZADO COPILOT ─────────────────────────────────────────── */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm shrink-0">
              <BrainCircuit className="w-5 h-5" strokeWidth={2} />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white tracking-tight">
                  Health OS Copilot
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

          {/* Botón Reiniciar Conversación */}
          {conversation.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetConversation}
              className="rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 h-9 px-3 flex items-center gap-1.5 transition-colors"
              title="Nueva conversación"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nueva Consulta</span>
            </Button>
          )}
        </div>

        {/* ── ÁREA DE CONVERSACIÓN Y WIDGETS ──────────────────────────────── */}
        <ScrollArea className="flex-1 p-4 sm:p-6">
          <div className="space-y-6">
            
            {/* Estado Vacío / Pantalla de Bienvenida */}
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
                    ¿En qué puedo ayudarte hoy, Marcos?
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-gray-400 leading-relaxed">
                    Puedo buscar especialistas, agendar tus citas médicas o asistirte en el seguimiento de tu salud.
                  </p>
                </div>

                {/* Sugerencias Rápidas */}
                <div className="flex flex-wrap justify-center gap-2 pt-2 max-w-lg">
                  {[
                    { label: "Buscar un médico en Reforma", icon: Search },
                    { label: "Agendar cita de seguimiento", icon: Calendar },
                    { label: "Revisar mis padecimientos", icon: Stethoscope },
                  ].map((sugg, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setInputText(sugg.label);
                        textareaRef.current?.focus();
                      }}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-gray-50/80 dark:bg-[#050505] border border-gray-200/80 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:border-emerald-500/40 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all shadow-2xs"
                    >
                      <sugg.icon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{sugg.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Listado de Mensajes */}
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
                  {/* Avatar Asistente */}
                  {msg.role === 'assistant' && (
                    <Avatar className="h-8 w-8 rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 shadow-2xs">
                      <AvatarFallback className="bg-transparent text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                        AI
                      </AvatarFallback>
                    </Avatar>
                  )}

                  {/* Burbuja y Contenido */}
                  <div className={cn(
                    "flex flex-col max-w-[85%] space-y-2",
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  )}>
                    {msg.content && (
                      <div className={cn(
                        "px-4 py-3 text-sm font-medium leading-relaxed whitespace-pre-wrap shadow-2xs",
                        msg.role === 'user' 
                          ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-xs' 
                          : 'bg-gray-50/90 dark:bg-[#050505] text-gray-900 dark:text-white border border-gray-100 dark:border-gray-800 rounded-2xl rounded-tl-xs'
                      )}>
                        {msg.content}
                      </div>
                    )}

                    {msg.response?.text && (
                      <div className="px-4 py-3 rounded-2xl rounded-tl-xs bg-gray-50/90 dark:bg-[#050505] text-gray-900 dark:text-white border border-gray-100 dark:border-gray-800 text-sm font-medium leading-relaxed shadow-2xs whitespace-pre-wrap">
                        {msg.response.text}
                      </div>
                    )}

                    {/* Renderizador de Widgets Interactivos */}
                    {msg.response?.widgets && msg.response.widgets.length > 0 && (
                      <div className="mt-2 w-full">
                        <WidgetRenderer widgets={msg.response.widgets} />
                      </div>
                    )}
                  </div>

                  {/* Avatar Usuario */}
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

            {/* Indicador de Estado Procesando */}
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
        <div className="p-3 sm:p-5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shrink-0">
          <div className="relative flex items-end gap-2 p-2 rounded-2xl bg-gray-50/80 dark:bg-[#050505] border border-gray-200/80 dark:border-gray-800 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-sm">
            
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Escribe tu consulta detallada (ej. 'Necesito agendar cita con un pediatra', 'Revisar mi historial')..."
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
            <span>Health OS Copilot analiza intenciones clínicas en tiempo real.</span>
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