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
  Stethoscope, 
  Search, 
  Calendar,
  RotateCcw,
  MessageSquare,
  Plus,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  Paperclip,
  X,
  FileText
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// ── TIPOS DE ESTADO DE LA MASCOTA QU ─────────────────────────────────────────
type MascotState = 'idle' | 'attending' | 'thinking' | 'searching' | 'success' | 'wink';

interface QuMascotProps {
  state?: MascotState;
  size?: number;
  className?: string;
  onClick?: () => void;
}

// ── COMPONENTE MASCOTA "QU" (PUNTO) CON REACTIVIDAD DINÁMICA ─────────────────
function QuMascot({ state = 'idle', size = 24, className = '', onClick }: QuMascotProps) {
  const [internalState, setInternalState] = useState<MascotState>(state);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setInternalState(state);
  }, [state]);

  const activeState = isHovered && internalState === 'idle' ? 'wink' : internalState;

  // Cálculo dinámico de coordenadas geométricas de la boca
  const getMouthPoints = () => {
    switch (activeState) {
      case 'thinking':
      case 'searching':
        return { leftY: 16.2, centerY: 16.2, rightY: 16.2 }; // Boca neutra / recta
      case 'attending':
        return { leftY: 15.6, centerY: 18.2, rightY: 15.6 }; // Sonrisa atenta
      case 'success':
      case 'wink':
        return { leftY: 14.8, centerY: 18.8, rightY: 14.8 }; // Gran sonrisa feliz
      case 'idle':
      default:
        return { leftY: 16.2, centerY: 18.0, rightY: 16.2 }; // Sonrisa suave estándar
    }
  };

  const { leftY, centerY, rightY } = getMouthPoints();

  return (
    <svg 
      className={cn("qu-mascot cursor-pointer transition-transform duration-200 active:scale-90", className)} 
      data-state={activeState} 
      viewBox="0 0 24 24" 
      width={size} 
      height={size}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        setInternalState('wink');
        setTimeout(() => setInternalState(state), 1200);
        if (onClick) onClick();
      }}
    >
      <rect className="qp-bezel" x="1.2" y="1.2" width="21.6" height="21.6" rx="6" />
      
      {/* Matriz LED exterior */}
      <circle className="qp-dot" style={{ '--i': 0 } as React.CSSProperties} cx="3" cy="3" r="0.85" />
      <circle className="qp-dot" style={{ '--i': 1 } as React.CSSProperties} cx="12" cy="3" r="0.85" />
      <circle className="qp-dot" style={{ '--i': 2 } as React.CSSProperties} cx="21" cy="3" r="0.85" />
      <circle className="qp-dot" style={{ '--i': 3 } as React.CSSProperties} cx="3" cy="12" r="0.85" />
      <circle className="qp-dot" style={{ '--i': 4 } as React.CSSProperties} cx="21" cy="12" r="0.85" />
      <circle className="qp-dot" style={{ '--i': 5 } as React.CSSProperties} cx="3" cy="21" r="0.85" />
      <circle className="qp-dot" style={{ '--i': 6 } as React.CSSProperties} cx="12" cy="21" r="0.85" />
      <circle className="qp-dot" style={{ '--i': 7 } as React.CSSProperties} cx="21" cy="21" r="0.85" />
      
      {/* Ojos (Guiño si el estado es 'wink') */}
      <circle className="qp-eye" cx="7.5" cy="7.5" r="1.05" />
      {activeState === 'wink' ? (
        <line x1="15" y1="7.5" x2="18" y2="7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      ) : (
        <circle className="qp-eye" cx="16.5" cy="7.5" r="1.05" />
      )}
      
      {/* Boca sonriente dinámica */}
      <circle className="qp-mouth" cx="7.5" cy={leftY} r="0.85" />
      <circle className="qp-mouth" cx="12" cy={centerY} r="0.85" />
      <circle className="qp-mouth" cx="16.5" cy={rightY} r="0.85" />
      
      {/* Barra de escaneo para búsqueda / análisis */}
      <rect className="qp-scan" x="1.5" y="1" width="21" height="2" />
    </svg>
  );
}

// ── ESTILOS CSS GLOBAL / ANIMACIONES ─────────────────────────────────────────
const QuMascotStyles = () => (
  <style jsx global>{`
    .qu-mascot { color: currentColor; overflow: visible; display: block; }
    .qp-bezel { fill: none; stroke: currentColor; stroke-width: 1; opacity: .18; transition: opacity .4s ease; }
    .qp-dot { fill: currentColor; opacity: .15; }
    .qp-eye { fill: currentColor; transform-box: fill-box; transform-origin: center; transition: all .2s ease; }
    .qp-mouth { fill: currentColor; opacity: .9; transition: cy .25s ease; }
    .qp-scan { fill: currentColor; opacity: 0; }

    svg[data-state="idle"] .qp-bezel { opacity: .18; }
    svg[data-state="attending"] .qp-bezel { opacity: .3; }
    svg[data-state="thinking"] .qp-bezel { opacity: .22; }
    svg[data-state="searching"] .qp-bezel { opacity: .35; }
    svg[data-state="success"] .qp-bezel { opacity: .45; stroke-width: 1.5; }

    svg[data-state="idle"] .qp-dot { animation: qp-shimmer 3s ease-in-out infinite; animation-delay: calc(var(--i) * -0.2s); }
    svg[data-state="attending"] .qp-dot { animation: qp-shimmer-bright 2.4s ease-in-out infinite; animation-delay: calc(var(--i) * -0.16s); }
    svg[data-state="thinking"] .qp-dot { animation: qp-flash 1.2s ease-in-out infinite; animation-delay: calc(var(--i) * -0.15s); }
    svg[data-state="searching"] .qp-dot { opacity: .2; animation: none; }
    svg[data-state="success"] .qp-dot { animation: qp-burst .6s ease-out 1; animation-delay: calc(var(--i) * 0.04s); }

    @keyframes qp-shimmer { 0%,100%{opacity:.12;} 50%{opacity:.22;} }
    @keyframes qp-shimmer-bright { 0%,100%{opacity:.18;} 50%{opacity:.35;} }
    @keyframes qp-flash { 0%,100%{opacity:.15;} 6%{opacity:.9;} 25%{opacity:.15;} }
    @keyframes qp-burst { 0%{opacity:.15;} 50%{opacity:1;} 100%{opacity:.25;} }

    svg[data-state="idle"] .qp-eye { animation: qp-blink 4.2s ease-in-out infinite; }
    svg[data-state="attending"] .qp-eye { animation: qp-drift 3s ease-in-out infinite; }
    svg[data-state="thinking"] .qp-eye { animation: qp-look-up 1.8s ease-in-out infinite; }
    svg[data-state="searching"] .qp-eye { animation: qp-scan-eyes .8s ease-in-out infinite; }
    svg[data-state="success"] .qp-eye { animation: qp-pop .5s ease-out 1; }

    @keyframes qp-blink { 0%,82%,100%{transform:scaleY(1);} 88%{transform:scaleY(.1);} 94%{transform:scaleY(1);} }
    @keyframes qp-drift { 0%,100%{transform:translateX(-.8px);} 50%{transform:translateX(.8px);} }
    @keyframes qp-look-up { 0%,100%{transform:translate(0,0);} 30%{transform:translate(.6px,-1.6px);} 60%{transform:translate(-.6px,-1.6px);} }
    @keyframes qp-scan-eyes { 0%,100%{transform:translateX(-2px);} 50%{transform:translateX(2px);} }
    @keyframes qp-pop { 0%{transform:scale(1);} 40%{transform:scale(1.35);} 100%{transform:scale(1);} }

    svg[data-state="searching"] .qp-scan { opacity: .4; animation: qp-sweep 1.1s linear infinite; }
    @keyframes qp-sweep { from{transform:translateY(0);} to{transform:translateY(20px);} }

    @media (prefers-reduced-motion: reduce){
      .qp-dot, .qp-eye, .qp-scan, .qp-bezel { animation: none !important; }
    }
  `}</style>
);

// ── COPILOT PAGE ─────────────────────────────────────────────────────────────
export default function CopilotPage() {
  const [inputText, setInputText] = useState('');
  const [showSlashCommands, setShowSlashCommands] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [attachment, setAttachment] = useState<{ file: File; base64: string; url: string } | null>(null);
  const [selectedCommand, setSelectedCommand] = useState<{ cmd: string; desc: string; icon: any } | null>(null);
  const [justFinished, setJustFinished] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Determinar el estado visual dinámico de Qu
  const getMascotState = (): MascotState => {
    if (justFinished) return 'success';
    if (streamingState === 'processing') return 'thinking';
    if (attachment) return 'searching';
    if (inputText.trim().length > 0) return 'attending';
    return 'idle';
  };

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
    setShowSlashCommands(inputText.startsWith('/') && !selectedCommand);
  }, [inputText, selectedCommand]);

  // Interceptar CustomEvent desde Engine
  useEffect(() => {
    const handleIntent = (e: CustomEvent) => {
      sendIntentToAgent(e.detail);
    };
    window.addEventListener('healthos:send_intent', handleIntent as EventListener);
    return () => window.removeEventListener('healthos:send_intent', handleIntent as EventListener);
  }, [streamingState]);

  const sendIntentToAgent = async (payload: string | { text: string; hiddenContext?: string }, currentAttachment: typeof attachment = null) => {
    const isObj = typeof payload === 'object' && payload !== null;
    const text = isObj ? (payload as any).text : (payload as string);
    const hiddenContext = isObj ? (payload as any).hiddenContext : '';

    if ((!text.trim() && !currentAttachment) || streamingState !== 'idle') return;

    const attachmentToSend = currentAttachment;
    const textToSend = selectedCommand ? `${selectedCommand.cmd} ${text}` : text;
    
    setInputText('');
    setAttachment(null);
    setSelectedCommand(null);
    setShowSlashCommands(false);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    addUserMessage(textToSend + (attachmentToSend ? '\n[Imagen adjunta]' : ''));

    try {
      updateAssistantStream({ text: 'Analizando tu petición clínica...' });

      let attachmentsData = undefined;
      if (attachmentToSend) {
        attachmentsData = [{
          mimeType: attachmentToSend.file.type,
          base64Data: attachmentToSend.base64
        }];
      }

      const fullIntent = hiddenContext ? `${textToSend}\n[Contexto Oculto: ${hiddenContext}]` : (textToSend || 'Analiza esta imagen');
      const response = await healthOSService.sendIntent(fullIntent, {}, attachmentsData);
      
      setTimeout(() => {
        updateAssistantStream(response);
        finalizeStream();

        // Celebración de Qu al completar la respuesta
        setJustFinished(true);
        setTimeout(() => setJustFinished(false), 2200);
      }, 600);

    } catch (error) {
      console.error('Error fetching intent:', error);
      updateAssistantStream({ 
        text: 'Ocurrió un inconveniente al procesar tu solicitud. Por favor intenta de nuevo.' 
      });
      finalizeStream();
    }
  };

  const handleSend = () => sendIntentToAgent(inputText, attachment);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = (event.target?.result as string).split(',')[1];
        setAttachment({
          file,
          base64: base64String,
          url: URL.createObjectURL(file)
        });
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Backspace' && inputText === '' && selectedCommand) {
      e.preventDefault();
      setSelectedCommand(null);
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
    { cmd: "/boveda", desc: "Buscar documentos en tu expediente", icon: FileText },
    { cmd: "/analizar", desc: "Analizar síntomas o un documento", icon: Stethoscope },
  ];

  return (
    <div className="flex h-[calc(100vh-5rem)] max-w-6xl mx-auto w-full p-3 sm:p-6 font-sans gap-4 selection:bg-emerald-100 dark:selection:bg-emerald-950/30 overflow-hidden">
      <QuMascotStyles />

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
            
            {/* Avatar interactivo de Qu */}
            <div 
              className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm shrink-0 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
              title="¡Haz click sobre Qu para interactuar!"
            >
              <QuMascot state={getMascotState()} size={24} />
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
                {/* Avatar Hero Interactivo de Qu */}
                <div 
                  className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm hover:scale-105 transition-transform"
                  title="Haz click en Qu para saludar"
                >
                  <QuMascot state={getMascotState()} size={48} />
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
                    <Avatar className="h-8 w-8 rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 shadow-2xs flex items-center justify-center overflow-visible">
                      <QuMascot state="idle" size={20} />
                    </Avatar>
                  )}

                  <div className={cn(
                    "flex flex-col max-w-[95%] lg:max-w-[85%] space-y-2 min-w-0",
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
                      <div className="mt-2 w-full min-w-0" style={{ maxWidth: 'calc(100vw - 5rem)' }}>
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
                <Avatar className="h-8 w-8 rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs flex items-center justify-center overflow-visible">
                  <QuMascot state="thinking" size={20} />
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
                        setSelectedCommand(cmd);
                        setInputText('');
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

          <div className="relative flex items-end gap-2 p-2 rounded-2xl bg-gray-50/80 dark:bg-[#050505] border border-gray-200/80 dark:border-gray-800 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-sm flex-wrap">
            
            {attachment && (
              <div className="w-full flex mb-2 px-2">
                <div className="relative inline-flex items-center gap-2 p-1.5 pr-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                    <img src={attachment.url} alt="Adjunto" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col min-w-0 pr-6">
                    <span className="text-xs font-semibold text-gray-900 dark:text-white truncate max-w-[120px]">{attachment.file.name}</span>
                    <span className="text-[10px] text-gray-500">{(attachment.file.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <button 
                    onClick={() => setAttachment(null)}
                    className="absolute top-1 right-1 w-5 h-5 bg-white dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-end w-full gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="h-10 w-10 shrink-0 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl mb-0.5"
                title="Adjuntar archivo o foto"
              >
                <Paperclip className="w-5 h-5" />
              </Button>
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                accept="image/*,application/pdf"
                onChange={handleFileChange}
              />
              
              <div className="flex-1 bg-transparent flex items-center flex-wrap gap-2 min-h-[44px]">
                {selectedCommand && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-bold border border-emerald-200 dark:border-emerald-800 shrink-0 select-none shadow-sm h-8 self-center">
                    <selectedCommand.icon className="w-3.5 h-3.5" />
                    {selectedCommand.cmd}
                    <button 
                      onClick={() => {
                        setSelectedCommand(null);
                        textareaRef.current?.focus();
                      }}
                      className="ml-1 hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <textarea
                  ref={textareaRef}
                  rows={1}
                  placeholder={selectedCommand ? "Escribe tu consulta..." : "Escribe tu consulta, usa '/' para comandos o adjunta una receta..."}
                  value={inputText}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '/' && !selectedCommand) {
                      setShowSlashCommands(true);
                    } else if (showSlashCommands && !val.startsWith('/')) {
                      setShowSlashCommands(false);
                    }
                    setInputText(val);
                  }}
                  onKeyDown={handleKeyDown}
                  disabled={streamingState !== 'idle'}
                  className="flex-1 bg-transparent border-none outline-none resize-none text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 py-2.5 max-h-40 min-w-[150px] custom-scrollbar leading-relaxed"
                />
              </div>

              <Button 
                type="button"
                onClick={handleSend} 
                disabled={(!inputText.trim() && !attachment && !selectedCommand) || streamingState !== 'idle'}
                className="h-10 w-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white p-0 shrink-0 shadow-sm transition-all disabled:opacity-40 mb-0.5 self-end"
              >
                {streamingState !== 'idle' ? (
                 <QhSpinner size="sm" className="text-white" />
                ) : (
                  <Send className="w-4 h-4" strokeWidth={2} />
                )}
              </Button>
            </div>
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