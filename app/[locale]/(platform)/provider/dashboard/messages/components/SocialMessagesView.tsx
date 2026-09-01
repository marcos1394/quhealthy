"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-nested-functions */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  MessageSquare,
  Sparkles,
  Search,
  RefreshCw,
  UserPlus,
  CheckCircle2,
  Mail,
  X,
  Loader2,
  CheckCheck,
  Link2,
  Kanban,
  Inbox,
  Flame,
  Star,
  Tag,
  Phone,
  User,
  ShieldCheck,
  Bot,
  Layers,
  Calendar,
  FileText,
  CreditCard,
  Pill,
  Trash2,
  SlidersHorizontal,
  ChevronRight,
  Clock,
  Plus,
  ExternalLink,
  ChevronDown,
  Copy,
  MessageCircle,
} from "lucide-react";
import { toast } from "react-toastify";

import { socialService } from "@/services/social.service";
import { patientDirectoryService } from "@/services/patientDirectory.service";
import {
  ConversationDTO,
  MessageDTO,
  CustomFunnelStage,
  FunnelStats,
  DirectMessageRequest,
} from "@/types/social";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ── ICONOS OFICIALES SVG ────────────────────────────────────────────────
function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <radialGradient id="ig-crm-pvd-grad" cx="20%" cy="100%" r="150%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </radialGradient>
      <path
        fill="url(#ig-crm-pvd-grad)"
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
      />
    </svg>
  );
}

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#25D366">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.45 1.03 2.61.13.17 1.77 2.71 4.3 3.8 2.52 1.09 2.52.73 2.98.69.46-.04 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3" />
    </svg>
  );
}

// ── PLANTILLAS OFICIALES DE META APROBADAS ──────────────────────────────
export interface MetaTemplateDef {
  key: string;
  name: string;
  category: "Utilidad" | "Marketing";
  title: string;
  badge: string;
  description: string;
  variables: Array<{ id: number; label: string; placeholder: string; defaultVal?: string }>;
  renderText: (params: Record<number, string>) => string;
}

export const META_APPROVED_TEMPLATES: MetaTemplateDef[] = [
  {
    key: "confirmacion_cita_paciente",
    name: "confirmacion_cita_paciente",
    category: "Utilidad",
    title: "📅 Confirmación Inmediata de Consulta",
    badge: "Utilidad / Citas",
    description: "Notificación de confirmación enviada al paciente al agendar o pagar su consulta médica.",
    variables: [
      { id: 1, label: "Nombre del Paciente", placeholder: "Ej: Carlos Sánchez", defaultVal: "" },
      { id: 2, label: "Nombre del Médico(a)", placeholder: "Ej: Dr. Omar Avilés", defaultVal: "" },
      { id: 3, label: "Fecha", placeholder: "Ej: 15 de Octubre", defaultVal: "" },
      { id: 4, label: "Hora", placeholder: "Ej: 04:00 PM", defaultVal: "" },
      { id: 5, label: "Consultorio / Modalidad", placeholder: "Ej: Consultorio 102 / Videollamada", defaultVal: "Consultorio Principal" },
    ],
    renderText: (p) =>
      `Hola ${p[1] || "{{1}}"}, su cita médica con ${p[2] || "{{2}}"} ha sido confirmada con éxito.\n\n` +
      `📅 Fecha: ${p[3] || "{{3}}"}\n` +
      `⏰ Hora: ${p[4] || "{{4}}"}\n` +
      `📍 Modalidad / Lugar: ${p[5] || "{{5}}"}\n\n` +
      `Puede consultar los detalles de su cita y su historial médico en Quhealthy.\n\n` +
      `Gracias por confiar su salud en Quhealthy.`,
  },
  {
    key: "recordatorio_cita_paciente",
    name: "recordatorio_cita_paciente",
    category: "Utilidad",
    title: "⏰ Recordatorio de Cita Médica (24h antes)",
    badge: "Utilidad / Citas",
    description: "Recordatorio automático para reducir el ausentismo y confirmar asistencia.",
    variables: [
      { id: 1, label: "Nombre del Paciente", placeholder: "Ej: María González", defaultVal: "" },
      { id: 2, label: "Nombre del Doctor(a)", placeholder: "Ej: Dra. Amanda Fretes", defaultVal: "" },
      { id: 3, label: "Fecha de la Cita", placeholder: "Ej: 25 de Septiembre", defaultVal: "" },
      { id: 4, label: "Hora", placeholder: "Ej: 10:30 AM", defaultVal: "" },
      { id: 5, label: "Ubicación / Modalidad", placeholder: "Ej: Consultorio 402", defaultVal: "Consultorio Quhealthy" },
    ],
    renderText: (p) =>
      `Hola ${p[1] || "{{1}}"}, le recordamos su cita médica programada con ${p[2] || "{{2}}"} para el día ${p[3] || "{{3}}"} a las ${p[4] || "{{4}}"}.\n\n` +
      `📍 Modalidad / Ubicación: ${p[5] || "{{5}}"}\n\n` +
      `Por favor, confirme su asistencia respondiendo a este mensaje o desde su portal de paciente.`,
  },
  {
    key: "receta_digital_expediente",
    name: "receta_digital_expediente",
    category: "Utilidad",
    title: "💊 Receta Médica Digital & Resumen con QR",
    badge: "Utilidad / Clínico",
    description: "Envío seguro de receta médica con firma electrónica y enlace seguro de descarga.",
    variables: [
      { id: 1, label: "Nombre del Paciente", placeholder: "Ej: Alejandro Pérez", defaultVal: "" },
      { id: 2, label: "Nombre del Médico(a)", placeholder: "Ej: Dr. Marcos Sandoval", defaultVal: "" },
      { id: 3, label: "Enlace Seguro de Descarga", placeholder: "https://quhealthy.org/receta/...", defaultVal: "https://quhealthy.org/r/receta-demo" },
    ],
    renderText: (p) =>
      `Hola ${p[1] || "{{1}}"}, ${p[2] || "{{2}}"} ha generado su receta médica digital y resumen de consulta oficial.\n\n` +
      `Su receta cuenta con firma electrónica y código QR de validación médica.\n` +
      `Puede visualizarla y descargarla en el siguiente enlace seguro:\n${p[3] || "{{3}}"}\n\n` +
      `Quedamos a sus órdenes para el seguimiento de su salud.`,
  },
  {
    key: "prospeccion_salud_universal",
    name: "prospeccion_salud_universal",
    category: "Marketing",
    title: "🩺 Primer Contacto & Valoración de Salud",
    badge: "Marketing / Cierre",
    description: "Contacto inicial para prospectos interesados en tratamientos o paquetes de salud.",
    variables: [
      { id: 1, label: "Nombre del Paciente / Prospecto", placeholder: "Ej: Lic. Elena Morales", defaultVal: "" },
      { id: 2, label: "Especialidad / Servicio", placeholder: "Ej: Consulta de Nutrición y Longevidad", defaultVal: "Valoración Médica Especializada" },
      { id: 3, label: "Enfoque o Tratamiento", placeholder: "Ej: optimización metabólica y chequeo general", defaultVal: "diagnóstico integral y plan de tratamiento personalizado" },
    ],
    renderText: (p) =>
      `Hola ${p[1] || "{{1}}"}, un gusto saludarle.\n\n` +
      `Le escribimos para brindarle información sobre su solicitud de ${p[2] || "{{2}}"}.\n` +
      `Nuestro equipo se especializa en ${p[3] || "{{3}}"}.\n\n` +
      `Si desea agendar su valoración médica o tiene alguna consulta previa, estamos a su total disposición.`,
  },
];

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  blue: { bg: "bg-sky-50 dark:bg-sky-950/20", text: "text-sky-700 dark:text-sky-400", border: "border-sky-200 dark:border-sky-900/40", badge: "bg-sky-500" },
  amber: { bg: "bg-amber-50 dark:bg-amber-950/20", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-900/40", badge: "bg-amber-500" },
  purple: { bg: "bg-purple-50 dark:bg-purple-950/20", text: "text-purple-700 dark:text-purple-400", border: "border-purple-200 dark:border-purple-900/40", badge: "bg-purple-500" },
  cyan: { bg: "bg-cyan-50 dark:bg-cyan-950/20", text: "text-cyan-700 dark:text-cyan-400", border: "border-cyan-200 dark:border-cyan-900/40", badge: "bg-cyan-500" },
  indigo: { bg: "bg-indigo-50 dark:bg-indigo-950/20", text: "text-indigo-700 dark:text-indigo-400", border: "border-indigo-200 dark:border-indigo-900/40", badge: "bg-indigo-500" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/20", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-900/40", badge: "bg-emerald-500" },
  rose: { bg: "bg-rose-50 dark:bg-rose-950/20", text: "text-rose-700 dark:text-rose-400", border: "border-rose-200 dark:border-rose-900/40", badge: "bg-rose-500" },
};

export function SocialMessagesView() {
  const router = useRouter();

  // Estados Principales
  const [viewMode, setViewMode] = useState<"inbox" | "kanban">("inbox");
  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationDTO | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [funnelStages, setFunnelStages] = useState<CustomFunnelStage[]>([]);
  const [funnelStats, setFunnelStats] = useState<FunnelStats | null>(null);

  // Estados de Control & Carga
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [syncingMeta, setSyncingMeta] = useState(false);
  const [syncingGmail, setSyncingGmail] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Input de Mensaje & IA
  const [messageText, setMessageText] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<Array<{ tone: string; text: string }>>([]);
  const [generatingAi, setGeneratingAi] = useState(false);

  // Modales
  const [isDirectSendOpen, setIsDirectSendOpen] = useState(false);
  const [isStageManagerOpen, setIsStageManagerOpen] = useState(false);
  const [isPatientLinkOpen, setIsPatientLinkOpen] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [patientSearchResults, setPatientSearchResults] = useState<any[]>([]);
  const [searchingPatients, setSearchingPatients] = useState(false);

  // Estado del Formulario de Envío Directo
  const [directPlatform, setDirectPlatform] = useState<"WHATSAPP" | "INSTAGRAM" | "FACEBOOK" | "EMAIL">("WHATSAPP");
  const [directRecipient, setDirectRecipient] = useState("");
  const [directSendMode, setDirectSendMode] = useState<"custom" | "meta_template">("custom");
  const [selectedTemplateKey, setSelectedTemplateKey] = useState(META_APPROVED_TEMPLATES[0].key);
  const [templateParams, setTemplateParams] = useState<Record<number, string>>({});
  const [directCustomMessage, setDirectCustomMessage] = useState("");
  const [sendingDirect, setSendingDirect] = useState(false);

  // Referencia de Scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Cargar Datos Iniciales (Conversaciones, Estadísticas y Etapas)
  const loadCrmData = useCallback(async () => {
    try {
      setLoading(true);
      const [convRes, statsRes, stagesRes] = await Promise.all([
        socialService.getConversations(0, 100),
        socialService.getFunnelStats().catch(() => null),
        socialService.getFunnelStages().catch(() => []),
      ]);

      const convList = convRes?.content || (Array.isArray(convRes) ? convRes : []);
      setConversations(convList);
      if (statsRes) setFunnelStats(statsRes);
      if (stagesRes && stagesRes.length > 0) setFunnelStages(stagesRes);

      // Si no hay chat seleccionado, seleccionar el primero
      if (convList.length > 0 && !selectedConversation) {
        setSelectedConversation(convList[0]);
      }
    } catch (err) {
      console.error("Error cargando CRM de Provider:", err);
      toast.error("No se pudo cargar la bandeja del CRM");
    } finally {
      setLoading(false);
    }
  }, [selectedConversation]);

  useEffect(() => {
    loadCrmData();
  }, []);

  // 2. Cargar Mensajes al seleccionar conversación
  const loadConversationMessages = useCallback(async (convId: string) => {
    try {
      setLoadingMessages(true);
      const res = await socialService.getMessages(convId, 0, 100);
      const msgList = res?.content || (Array.isArray(res) ? res : []);
      // Orden cronológico ascendente
      setMessages([...msgList].reverse());
      setAiSuggestions([]);
    } catch (err) {
      console.error("Error al cargar mensajes:", err);
      toast.error("Error al obtener el historial de mensajes");
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (selectedConversation?.id) {
      loadConversationMessages(selectedConversation.id);
    }
  }, [selectedConversation?.id, loadConversationMessages]);

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 3. Conexión SSE en Tiempo Real
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("qh_auth_token") : null;
      if (token) {
        eventSource = new EventSource(`/api/social/crm/stream?token=${encodeURIComponent(token)}`);
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data?.conversationId) {
              loadCrmData();
              if (selectedConversation?.id === data.conversationId) {
                loadConversationMessages(data.conversationId);
              }
            }
          } catch (e) {
            console.error("Error parseando evento SSE:", e);
          }
        };
      }
    } catch (err) {
      console.error("Error inicializando SSE:", err);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [selectedConversation?.id, loadCrmData, loadConversationMessages]);

  // 4. Acciones de Mensajería
  const handleSendMessage = async () => {
    if (!selectedConversation || !messageText.trim() || sendingMessage) return;

    const content = messageText.trim();
    setMessageText("");
    setSendingMessage(true);

    try {
      const res = await socialService.sendMessage(selectedConversation.id, {
        type: "TEXT",
        content,
      });

      setMessages((prev) => [...prev, res]);
      loadCrmData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "No se pudo enviar el mensaje");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleAiSuggest = async (tone = "EMPATHIC") => {
    if (!selectedConversation || generatingAi) return;
    setGeneratingAi(true);

    try {
      const res = await socialService.getAiReplySuggestions({
        conversationId: selectedConversation.id,
        preferredTone: tone,
      });
      if (res?.suggestions) {
        setAiSuggestions(res.suggestions);
      }
    } catch {
      toast.error("No se pudieron generar sugerencias de IA");
    } finally {
      setGeneratingAi(false);
    }
  };

  // 5. Acciones de Lead y Funnel
  const handleUpdateStage = async (convId: string, newStage: string) => {
    try {
      const updated = await socialService.updateLeadStage(convId, { funnelStage: newStage });
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, funnelStage: updated.funnelStage } : c))
      );
      if (selectedConversation?.id === convId) {
        setSelectedConversation((prev) => (prev ? { ...prev, funnelStage: updated.funnelStage } : null));
      }
      toast.success("Etapa actualizada");
      loadCrmData();
    } catch {
      toast.error("Error al actualizar la etapa");
    }
  };

  const handleUpdateLeadScore = async (convId: string, newScore: number) => {
    try {
      await socialService.updateLeadStage(convId, { leadScore: newScore });
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, leadScore: newScore } : c))
      );
      if (selectedConversation?.id === convId) {
        setSelectedConversation((prev) => (prev ? { ...prev, leadScore: newScore } : null));
      }
      toast.success("Puntuación de lead actualizada");
    } catch {
      toast.error("Error al actualizar puntuación");
    }
  };

  const handleUpdateNotes = async (convId: string, notes: string) => {
    try {
      await socialService.updateLeadStage(convId, { notes });
      toast.success("Notas guardadas");
      loadCrmData();
    } catch {
      toast.error("Error al guardar notas");
    }
  };

  const handleToggleAutoResponder = async () => {
    if (!selectedConversation) return;
    const nextState = !selectedConversation.aiAutoResponderEnabled;
    try {
      const updated = await socialService.toggleAutoResponder(selectedConversation.id, nextState);
      setSelectedConversation((prev) => (prev ? { ...prev, aiAutoResponderEnabled: updated.aiAutoResponderEnabled } : null));
      setConversations((prev) =>
        prev.map((c) => (c.id === selectedConversation.id ? { ...c, aiAutoResponderEnabled: updated.aiAutoResponderEnabled } : c))
      );
      toast.success(nextState ? "🤖 Auto-Responder IA activado" : "Auto-Responder desactivado");
    } catch {
      toast.error("Error al cambiar estado del Auto-Responder");
    }
  };

  const handleDeleteConversation = async (convId: string) => {
    if (!confirm("¿Deseas eliminar esta conversación y todos sus mensajes del CRM?")) return;
    try {
      await socialService.deleteConversation(convId);
      toast.success("Conversación eliminada");
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (selectedConversation?.id === convId) {
        setSelectedConversation(null);
        setMessages([]);
      }
      loadCrmData();
    } catch {
      toast.error("Error al eliminar conversación");
    }
  };

  // 6. Sincronización Manual
  const handleSyncMeta = async () => {
    try {
      setSyncingMeta(true);
      await socialService.syncMessages();
      toast.success("Sincronización de Meta completada");
      loadCrmData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error al sincronizar con Meta");
    } finally {
      setSyncingMeta(false);
    }
  };

  const handleSyncGmail = async () => {
    try {
      setSyncingGmail(true);
      await socialService.syncEmails();
      toast.success("Sincronización de Gmail completada");
      loadCrmData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error al sincronizar correos");
    } finally {
      setSyncingGmail(false);
    }
  };

  // 7. Envío Directo / Detonador de Mensajes
  const handleSendDirectMessage = async () => {
    if (!directRecipient.trim()) {
      toast.error("Ingresa el destinatario (número o usuario)");
      return;
    }

    setSendingDirect(true);
    try {
      let payload: DirectMessageRequest;

      if (directSendMode === "meta_template") {
        const tmpl = META_APPROVED_TEMPLATES.find((t) => t.key === selectedTemplateKey);
        const varsArray = tmpl?.variables.map((v) => templateParams[v.id] || v.defaultVal || "") || [];

        payload = {
          platform: directPlatform,
          recipient: directRecipient.trim(),
          templateName: selectedTemplateKey,
          templateLanguage: "es_MX",
          templateVariables: varsArray,
          parameters: varsArray,
        };
      } else {
        if (!directCustomMessage.trim()) {
          toast.error("Ingresa el texto del mensaje");
          setSendingDirect(false);
          return;
        }
        payload = {
          platform: directPlatform,
          recipient: directRecipient.trim(),
          message: directCustomMessage.trim(),
        };
      }

      const res = await socialService.sendDirectMessage(payload);
      toast.success("Mensaje detonado con éxito");
      setIsDirectSendOpen(false);
      setDirectRecipient("");
      setDirectCustomMessage("");
      loadCrmData();

      if (res.conversationId) {
        const newConv = conversations.find((c) => c.id === res.conversationId);
        if (newConv) setSelectedConversation(newConv);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error al enviar mensaje directo");
    } finally {
      setSendingDirect(false);
    }
  };

  // 8. Búsqueda de Pacientes para Vinculación
  const handleSearchPatients = async (q: string) => {
    setPatientSearchQuery(q);
    if (!q.trim()) {
      setPatientSearchResults([]);
      return;
    }
    setSearchingPatients(true);
    try {
      const res = await patientDirectoryService.searchPatients(q);
      setPatientSearchResults(res || []);
    } catch {
      setPatientSearchResults([]);
    } finally {
      setSearchingPatients(false);
    }
  };

  const handleLinkPatient = async (patientId: number) => {
    if (!selectedConversation) return;
    try {
      await socialService.updateConversation(selectedConversation.id, {
        patientDirectoryId: patientId,
      });
      setSelectedConversation((prev) => (prev ? { ...prev, patientDirectoryId: patientId } : null));
      setConversations((prev) =>
        prev.map((c) => (c.id === selectedConversation.id ? { ...c, patientDirectoryId: patientId } : c))
      );
      toast.success("Paciente vinculado al expediente");
      setIsPatientLinkOpen(false);
    } catch {
      toast.error("Error al vincular paciente");
    }
  };

  // Filtrado de Conversaciones
  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      searchTerm === "" ||
      c.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.externalContactId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.lastMessagePreview?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPlatform = platformFilter === "ALL" || c.platform === platformFilter;
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "UNREAD" && !c.isRead) ||
      (statusFilter === "OPEN" && c.status === "OPEN") ||
      (statusFilter === "RESOLVED" && c.status === "RESOLVED");

    return matchesSearch && matchesPlatform && matchesStatus;
  });

  // Helper de icono de plataforma
  const renderPlatformIcon = (platform: string, className = "w-4 h-4") => {
    switch (platform) {
      case "WHATSAPP":
        return <WhatsAppIcon className={className} />;
      case "INSTAGRAM":
        return <InstagramIcon className={className} />;
      case "FACEBOOK":
        return <FacebookIcon className={className} />;
      case "EMAIL":
        return <Mail className={cn(className, "text-red-500")} />;
      default:
        return <MessageSquare className={cn(className, "text-emerald-500")} />;
    }
  };

  // Helper de badge de etapa
  const getStageBadge = (stageKey?: string) => {
    const stage = funnelStages.find((s) => s.stageKey.toUpperCase() === stageKey?.toUpperCase());
    const colorTheme = COLOR_MAP[stage?.color || "emerald"] || COLOR_MAP.emerald;

    return (
      <Badge
        className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs",
          colorTheme.bg,
          colorTheme.text,
          colorTheme.border
        )}
      >
        {stage?.name || stageKey || "Nuevo Prospecto"}
      </Badge>
    );
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 min-h-[450px] gap-3 bg-white dark:bg-[#0a0a0a]">
        <QhSpinner size="lg" className="text-emerald-600" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
          Cargando CRM Omnicanal y Funnels Médicos...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-white dark:bg-[#0a0a0a] font-sans">
      {/* ── 1. BARRA SUPERIOR DE MÉTRICAS Y HERRAMIENTAS ──────────────────── */}
      <div className="p-4 md:px-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0">
        {/* Métricas Rápidas */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 lg:pb-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-2xs shrink-0">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {funnelStats?.totalLeads ?? conversations.length}
            </span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Leads Activos</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-2xs shrink-0">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {funnelStats?.conversionRate ? `${funnelStats.conversionRate}%` : "100%"}
            </span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Conversión</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-2xs shrink-0">
            <Star className="w-3.5 h-3.5 text-purple-500" />
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {conversations.filter((c) => (c.leadScore || 0) >= 70).length}
            </span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Pacientes Calificados</span>
          </div>
        </div>

        {/* Acciones Globales & View Switcher */}
        <div className="flex items-center gap-2 shrink-0 justify-end">
          {/* Alternador Inbox / Kanban */}
          <div className="flex items-center bg-gray-200/60 dark:bg-gray-800/80 p-0.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs">
            <button
              onClick={() => setViewMode("inbox")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                viewMode === "inbox"
                  ? "bg-white dark:bg-[#0a0a0a] text-emerald-700 dark:text-emerald-400 shadow-2xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              )}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Inbox</span>
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                viewMode === "kanban"
                  ? "bg-white dark:bg-[#0a0a0a] text-emerald-700 dark:text-emerald-400 shadow-2xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              )}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Funnel Kanban</span>
            </button>
          </div>

          {/* Sincronizadores */}
          <Button
            variant="outline"
            size="sm"
            disabled={syncingMeta}
            onClick={handleSyncMeta}
            className="h-9 px-3 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold shadow-2xs gap-1.5"
            title="Sincronizar mensajes de Meta (Facebook e Instagram)"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", syncingMeta && "animate-spin text-emerald-600")} />
            <span className="hidden sm:inline">Sync Meta</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={syncingGmail}
            onClick={handleSyncGmail}
            className="h-9 px-3 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold shadow-2xs gap-1.5"
            title="Sincronizar correos con Gmail"
          >
            <Mail className={cn("w-3.5 h-3.5 text-red-500", syncingGmail && "animate-spin")} />
            <span className="hidden sm:inline">Sync Gmail</span>
          </Button>

          {/* Personalizar Etapas */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsStageManagerOpen(true)}
            className="h-9 px-3 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold shadow-2xs gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden md:inline">Personalizar Funnel</span>
          </Button>

          {/* Envío Directo */}
          <Button
            size="sm"
            onClick={() => setIsDirectSendOpen(true)}
            className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Mensaje</span>
          </Button>
        </div>
      </div>

      {/* ── 2. VISTA PRINCIPAL (INBOX O KANBAN) ───────────────────────────── */}
      {viewMode === "kanban" ? (
        /* ─── TABLERO KANBAN DE PACIENTES & FUNNEL ─── */
        <div className="flex-1 overflow-x-auto custom-scrollbar p-6 bg-gray-50/40 dark:bg-[#060606]">
          <div className="flex items-start gap-4 min-w-max h-full">
            {funnelStages.map((stage) => {
              const stageColor = COLOR_MAP[stage.color || "emerald"] || COLOR_MAP.emerald;
              const stageLeads = conversations.filter(
                (c) => (c.funnelStage || "NEW_LEAD").toUpperCase() === stage.stageKey.toUpperCase()
              );

              return (
                <div
                  key={stage.stageKey}
                  className="w-80 flex flex-col max-h-[calc(100vh-16rem)] bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-2xs overflow-hidden shrink-0"
                >
                  {/* Cabecera de Columna */}
                  <div className="p-3.5 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between bg-gray-50/60 dark:bg-[#080808]">
                    <div className="flex items-center gap-2">
                      <span className={cn("w-2.5 h-2.5 rounded-full", stageColor.badge)} />
                      <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {stage.name}
                      </span>
                    </div>
                    <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {stageLeads.length}
                    </Badge>
                  </div>

                  {/* Lista de Tarjetas de Leads */}
                  <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                    {stageLeads.length === 0 ? (
                      <div className="py-8 text-center border-2 border-dashed border-gray-100 dark:border-gray-800/60 rounded-xl">
                        <p className="text-[11px] font-medium text-gray-400">Sin pacientes en esta etapa</p>
                      </div>
                    ) : (
                      stageLeads.map((lead) => (
                        <motion.div
                          key={lead.id}
                          layout
                          onClick={() => {
                            setSelectedConversation(lead);
                            setViewMode("inbox");
                          }}
                          className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#070707] hover:border-emerald-500/40 dark:hover:border-emerald-500/30 shadow-2xs cursor-pointer transition-all space-y-2.5 group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {renderPlatformIcon(lead.platform, "w-4 h-4")}
                              <span className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                                {lead.contactName || "Paciente / Lead"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Flame className="w-3 h-3 text-amber-500" />
                              <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">
                                {lead.leadScore || 50}
                              </span>
                            </div>
                          </div>

                          <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                            {lead.lastMessagePreview || lead.lastMessage || "Sin mensajes recientes"}
                          </p>

                          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <span className="text-[10px] text-gray-400">
                              {lead.lastMessageAt ? new Date(lead.lastMessageAt).toLocaleDateString() : "Reciente"}
                            </span>

                            {/* Dropdown de cambio rápido de etapa */}
                            <select
                              value={lead.funnelStage || "NEW_LEAD"}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleUpdateStage(lead.id, e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[10px] font-bold bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-gray-700 dark:text-gray-300 outline-none"
                            >
                              {funnelStages.map((s) => (
                                <option key={s.stageKey} value={s.stageKey}>
                                  {s.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ─── VISTA INBOX: BANDEJA + CHAT + DOSSIER DE PACIENTE ─── */
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* PANEL IZQUIERDO: LISTA DE CHATS */}
          <div className="w-full md:w-80 lg:w-96 border-r border-gray-100 dark:border-gray-800 flex flex-col bg-white dark:bg-[#0a0a0a] shrink-0">
            {/* Buscador y Filtros */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar paciente o mensaje..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Filtro por Plataforma */}
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                {["ALL", "WHATSAPP", "INSTAGRAM", "FACEBOOK", "EMAIL"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatformFilter(p)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all",
                      platformFilter === p
                        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40"
                        : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                    )}
                  >
                    {p === "ALL" ? "Todos" : p}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de Conversaciones */}
            <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-gray-100 dark:divide-gray-800/60">
              {filteredConversations.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-2">
                  <MessageSquare className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto" />
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-300">No hay conversaciones</p>
                  <p className="text-[11px] text-gray-400">Detona un mensaje o sincroniza tus canales</p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = selectedConversation?.id === conv.id;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={cn(
                        "p-4 flex items-start gap-3 cursor-pointer transition-all relative group",
                        isSelected
                          ? "bg-emerald-50/40 dark:bg-emerald-950/20"
                          : "hover:bg-gray-50/60 dark:hover:bg-[#070707]"
                      )}
                    >
                      {/* Avatar / Canal */}
                      <div className="relative shrink-0 mt-0.5">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center font-bold text-xs text-gray-700 dark:text-gray-300">
                          {conv.contactName ? conv.contactName.charAt(0).toUpperCase() : "P"}
                        </div>
                        <div className="absolute -bottom-1 -right-1 p-0.5 bg-white dark:bg-[#0a0a0a] rounded-full shadow-2xs">
                          {renderPlatformIcon(conv.platform, "w-3.5 h-3.5")}
                        </div>
                      </div>

                      {/* Detalles del Chat */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            {conv.contactName || "Paciente / Lead"}
                          </span>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                          </span>
                        </div>

                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                          {conv.lastMessagePreview || conv.lastMessage || "Sin mensajes"}
                        </p>

                        <div className="flex items-center justify-between gap-1 pt-1">
                          {getStageBadge(conv.funnelStage)}

                          {/* Botón Borrar Chat */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConversation(conv.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-rose-600 transition-opacity p-1 rounded"
                            title="Eliminar chat"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* PANEL CENTRAL: CHAT EN VIVO */}
          {selectedConversation ? (
            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0a0a0a]">
              {/* Cabecera del Chat Activo */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 bg-gray-50/30 dark:bg-[#050505]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                    {selectedConversation.contactName?.charAt(0).toUpperCase() || "P"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {selectedConversation.contactName}
                      </h3>
                      {renderPlatformIcon(selectedConversation.platform, "w-4 h-4")}
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                      {selectedConversation.externalContactId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Selector de Etapa en Cabecera */}
                  <select
                    value={selectedConversation.funnelStage || "NEW_LEAD"}
                    onChange={(e) => handleUpdateStage(selectedConversation.id, e.target.value)}
                    className="text-xs font-bold bg-white dark:bg-[#070707] border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1.5 text-gray-800 dark:text-gray-200 shadow-2xs outline-none"
                  >
                    {funnelStages.map((s) => (
                      <option key={s.stageKey} value={s.stageKey}>
                        {s.name}
                      </option>
                    ))}
                  </select>

                  {/* Auto-Responder Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleAutoResponder}
                    className={cn(
                      "h-8 px-2.5 rounded-xl text-xs font-bold gap-1.5 shadow-2xs",
                      selectedConversation.aiAutoResponderEnabled
                        ? "bg-purple-50 dark:bg-purple-950/30 border-purple-200 text-purple-700 dark:text-purple-400"
                        : "text-gray-500"
                    )}
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Auto-IA</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteConversation(selectedConversation.id)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-rose-600 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Hilo de Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50/20 dark:bg-[#060606]">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-12">
                    <QhSpinner size="md" className="text-emerald-600" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-16 text-center space-y-2">
                    <p className="text-xs font-semibold text-gray-400">Sin mensajes en este chat</p>
                    <p className="text-[11px] text-gray-400">Envía un mensaje de saludo o cita médica abajo</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOutbound = msg.direction === "OUTBOUND";
                    return (
                      <div
                        key={msg.id}
                        className={cn("flex flex-col", isOutbound ? "items-end" : "items-start")}
                      >
                        <div
                          className={cn(
                            "max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs",
                            isOutbound
                              ? "bg-emerald-600 text-white rounded-br-none"
                              : "bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-bl-none"
                          )}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <div
                            className={cn(
                              "mt-1 flex items-center justify-end gap-1 text-[9px]",
                              isOutbound ? "text-emerald-100" : "text-gray-400"
                            )}
                          >
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                            {isOutbound && <CheckCheck className="w-3 h-3" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Barra de Sugerencias de IA */}
              {aiSuggestions.length > 0 && (
                <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-purple-50/40 dark:bg-purple-950/20 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-700 dark:text-purple-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Sugerencias de IA Copilot:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setMessageText(s.text)}
                        className="text-left text-xs bg-white dark:bg-[#0a0a0a] border border-purple-200 dark:border-purple-900/40 rounded-xl p-2 text-gray-800 dark:text-gray-200 hover:border-purple-400 transition-colors shadow-2xs"
                      >
                        {s.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Caja de Envío */}
              <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={generatingAi}
                    onClick={() => handleAiSuggest("EMPATHIC")}
                    className="text-[11px] font-bold text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded-lg h-7 px-2 gap-1"
                  >
                    <Sparkles className={cn("w-3 h-3", generatingAi && "animate-spin")} />
                    <span>Sugerir Respuesta IA</span>
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Escribe una respuesta médica..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 h-11 px-4 rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-emerald-500"
                  />
                  <Button
                    disabled={!messageText.trim() || sendingMessage}
                    onClick={handleSendMessage}
                    className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-sm"
                  >
                    {sendingMessage ? <QhSpinner size="sm" /> : <Send className="w-4 h-4" />}
                    <span>Enviar</span>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/20 dark:bg-[#050505] text-center p-8">
              <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-2" />
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Selecciona un chat del CRM</h3>
              <p className="text-xs text-gray-400 max-w-sm">Gestiona prospectos, responde dudas y envía recordatorios de citas.</p>
            </div>
          )}

          {/* PANEL DERECHO: DOSSIER DEL LEAD & ACCIONES CLÍNICAS */}
          {selectedConversation && (
            <div className="hidden xl:flex w-80 border-l border-gray-100 dark:border-gray-800 flex-col bg-white dark:bg-[#0a0a0a] p-5 space-y-6 overflow-y-auto custom-scrollbar shrink-0">
              {/* Perfil del Lead */}
              <div className="space-y-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-base shadow-2xs">
                    {selectedConversation.contactName?.charAt(0).toUpperCase() || "P"}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      {selectedConversation.contactName}
                    </h4>
                    <p className="text-[11px] text-gray-400">{selectedConversation.platform}</p>
                  </div>
                </div>

                {/* Lead Score Slider */}
                <div className="space-y-1.5 bg-gray-50 dark:bg-[#080808] p-3 rounded-xl border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span>Lead Scoring:</span>
                    </span>
                    <Badge className="bg-amber-500/10 text-amber-600 font-bold text-xs">
                      {selectedConversation.leadScore || 50} / 100
                    </Badge>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={selectedConversation.leadScore || 50}
                    onChange={(e) => handleUpdateLeadScore(selectedConversation.id, Number(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Acciones Médicas Rápidas */}
              <div className="space-y-2">
                <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Acciones Médicas</h5>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/es/provider/dashboard/calendar")}
                    className="justify-start text-xs font-bold rounded-xl border-gray-200 dark:border-gray-800 h-9 gap-2 shadow-2xs"
                  >
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Agendar Cita en Calendario</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/es/provider/dashboard/prescriptions")}
                    className="justify-start text-xs font-bold rounded-xl border-gray-200 dark:border-gray-800 h-9 gap-2 shadow-2xs"
                  >
                    <Pill className="w-4 h-4 text-sky-600" />
                    <span>Emitir Receta con QR</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/es/provider/dashboard/billing")}
                    className="justify-start text-xs font-bold rounded-xl border-gray-200 dark:border-gray-800 h-9 gap-2 shadow-2xs"
                  >
                    <CreditCard className="w-4 h-4 text-purple-600" />
                    <span>Enviar Link de Pago / Cobro</span>
                  </Button>
                </div>
              </div>

              {/* Vinculación con Expediente Clínico */}
              <div className="space-y-2">
                <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Expediente Quhealthy</h5>
                {selectedConversation.patientDirectoryId ? (
                  <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Expediente Vinculado</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/es/provider/dashboard/patients")}
                      className="w-full text-xs font-bold rounded-lg border-emerald-200 text-emerald-800 h-8"
                    >
                      Abrir Expediente Clínico
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPatientLinkOpen(true)}
                    className="w-full justify-start text-xs font-bold rounded-xl border-dashed border-gray-300 dark:border-gray-700 h-9 gap-2"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-600" />
                    <span>Vincular a Directorio de Pacientes</span>
                  </Button>
                )}
              </div>

              {/* Notas Internas de Consulta / Prospecto */}
              <div className="space-y-2">
                <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Notas del Consultorio</h5>
                <textarea
                  rows={4}
                  placeholder="Escribe notas clínicas o seguimiento comercial para tu equipo..."
                  defaultValue={selectedConversation.aiSummary || ""}
                  onBlur={(e) => handleUpdateNotes(selectedConversation.id, e.target.value)}
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 3. MODAL DE ENVÍO DIRECTO & PLANTILLAS OFICIALES META ─────────── */}
      <Dialog open={isDirectSendOpen} onOpenChange={setIsDirectSendOpen}>
        <DialogContent className="max-w-lg max-h-[88vh] flex flex-col p-0 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-2xl">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] flex items-center justify-between">
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 dark:text-white">
                🚀 Envío Directo & Plantillas Oficiales
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Detona mensajes oficiales por WhatsApp, Instagram o Facebook.
              </DialogDescription>
            </div>
            <button onClick={() => setIsDirectSendOpen(false)} className="text-gray-400 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
            {/* Selector de Plataforma */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Canal de Envío</label>
              <div className="grid grid-cols-4 gap-2">
                {(["WHATSAPP", "INSTAGRAM", "FACEBOOK", "EMAIL"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setDirectPlatform(p)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-bold transition-all",
                      directPlatform === p
                        ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-700 dark:text-emerald-400"
                        : "border-gray-200 dark:border-gray-800 hover:border-gray-300"
                    )}
                  >
                    {renderPlatformIcon(p, "w-4 h-4")}
                    <span className="text-[10px]">{p}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Destinatario */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {directPlatform === "WHATSAPP"
                  ? "Teléfono con código de país (Ej: +526681234567)"
                  : directPlatform === "EMAIL"
                  ? "Correo Electrónico del Paciente"
                  : "Nombre de Usuario o ID de Meta"}
              </label>
              <input
                type="text"
                placeholder={directPlatform === "WHATSAPP" ? "+52 668 184 2487" : "paciente@correo.com"}
                value={directRecipient}
                onChange={(e) => setDirectRecipient(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Modalidad de Mensaje */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Tipo de Contenido</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setDirectSendMode("meta_template")}
                  className={cn(
                    "flex-1 py-2 rounded-xl border text-xs font-bold transition-all",
                    directSendMode === "meta_template"
                      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-700 dark:text-emerald-400"
                      : "border-gray-200 dark:border-gray-800"
                  )}
                >
                  Plantilla Oficial Meta
                </button>
                <button
                  onClick={() => setDirectSendMode("custom")}
                  className={cn(
                    "flex-1 py-2 rounded-xl border text-xs font-bold transition-all",
                    directSendMode === "custom"
                      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-700 dark:text-emerald-400"
                      : "border-gray-200 dark:border-gray-800"
                  )}
                >
                  Texto Personalizado
                </button>
              </div>
            </div>

            {/* Selector de Plantillas */}
            {directSendMode === "meta_template" ? (
              <div className="space-y-3">
                <select
                  value={selectedTemplateKey}
                  onChange={(e) => setSelectedTemplateKey(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-800 dark:text-gray-200 outline-none"
                >
                  {META_APPROVED_TEMPLATES.map((tmpl) => (
                    <option key={tmpl.key} value={tmpl.key}>
                      {tmpl.title}
                    </option>
                  ))}
                </select>

                {/* Variables de la Plantilla */}
                {(() => {
                  const tmpl = META_APPROVED_TEMPLATES.find((t) => t.key === selectedTemplateKey);
                  return (
                    <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-[11px] font-bold text-gray-400 uppercase">Variables de la Plantilla:</span>
                      {tmpl?.variables.map((v) => (
                        <div key={v.id} className="space-y-1">
                          <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                            {`{{${v.id}}}`} {v.label}
                          </label>
                          <input
                            type="text"
                            placeholder={v.placeholder}
                            value={templateParams[v.id] ?? v.defaultVal ?? ""}
                            onChange={(e) =>
                              setTemplateParams((prev) => ({ ...prev, [v.id]: e.target.value }))
                            }
                            className="w-full h-9 px-3 rounded-lg bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white"
                          />
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Mensaje a Enviar</label>
                <textarea
                  rows={4}
                  placeholder="Escribe tu mensaje médico aquí..."
                  value={directCustomMessage}
                  onChange={(e) => setDirectCustomMessage(e.target.value)}
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDirectSendOpen(false)}
              className="rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold h-9"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              disabled={sendingDirect || !directRecipient.trim()}
              onClick={handleSendDirectMessage}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-9 px-5 gap-1.5"
            >
              {sendingDirect ? <QhSpinner size="sm" /> : <Send className="w-4 h-4" />}
              <span>Detonar Envío</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── 4. MODAL DE PERSONALIZACIÓN DE ETAPAS DEL FUNNEL ──────────────── */}
      <Dialog open={isStageManagerOpen} onOpenChange={setIsStageManagerOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-2xl">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] flex items-center justify-between">
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 dark:text-white">
                ⚙️ Personalizar Etapas del Funnel
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Ajusta las etapas del pipeline clínico a los flujos reales de tu consultorio.
              </DialogDescription>
            </div>
            <button onClick={() => setIsStageManagerOpen(false)} className="text-gray-400 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
            {funnelStages.map((stg, index) => (
              <div
                key={index}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#070707]"
              >
                <span className="text-xs font-bold text-gray-400 w-5">{index + 1}</span>

                <input
                  type="text"
                  value={stg.name}
                  onChange={(e) => {
                    const newStages = [...funnelStages];
                    newStages[index].name = e.target.value;
                    setFunnelStages(newStages);
                  }}
                  className="flex-1 h-9 px-3 rounded-lg bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white"
                />

                <select
                  value={stg.color}
                  onChange={(e) => {
                    const newStages = [...funnelStages];
                    newStages[index].color = e.target.value;
                    setFunnelStages(newStages);
                  }}
                  className="h-9 px-2 rounded-lg bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-800 dark:text-gray-200 outline-none"
                >
                  {Object.keys(COLOR_MAP).map((c) => (
                    <option key={c} value={c}>
                      {c.toUpperCase()}
                    </option>
                  ))}
                </select>

                {funnelStages.length > 2 && (
                  <button
                    onClick={() => {
                      setFunnelStages(funnelStages.filter((_, i) => i !== index));
                    }}
                    className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const nextIdx = funnelStages.length + 1;
                setFunnelStages([
                  ...funnelStages,
                  {
                    stageKey: `STAGE_${nextIdx}`,
                    name: `Nueva Etapa ${nextIdx}`,
                    color: "emerald",
                    orderIndex: nextIdx - 1,
                  },
                ]);
              }}
              className="w-full text-xs font-bold rounded-xl border-dashed border-gray-300 dark:border-gray-700 h-9 gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar Etapa al Funnel</span>
            </Button>
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsStageManagerOpen(false)}
              className="rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold h-9"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={async () => {
                try {
                  const saved = await socialService.saveFunnelStages(funnelStages);
                  setFunnelStages(saved);
                  toast.success("Etapas del Funnel guardadas con éxito");
                  setIsStageManagerOpen(false);
                  loadCrmData();
                } catch {
                  toast.error("Error al guardar etapas");
                }
              }}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-9 px-5"
            >
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── 5. MODAL DE VINCULACIÓN DE PACIENTE ───────────────────────────── */}
      <Dialog open={isPatientLinkOpen} onOpenChange={setIsPatientLinkOpen}>
        <DialogContent className="max-w-md p-5 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-2xl space-y-4">
          <div>
            <DialogTitle className="text-base font-bold text-gray-900 dark:text-white">
              Vincular a Directorio de Pacientes
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Asocia este lead con un expediente clínico existente en Quhealthy.
            </DialogDescription>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o teléfono..."
              value={patientSearchQuery}
              onChange={(e) => handleSearchPatients(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2">
            {searchingPatients ? (
              <div className="py-6 text-center">
                <QhSpinner size="sm" className="text-emerald-600" />
              </div>
            ) : patientSearchResults.length === 0 ? (
              <p className="text-xs text-center text-gray-400 py-4">Sin resultados</p>
            ) : (
              patientSearchResults.map((pat) => (
                <div
                  key={pat.id}
                  onClick={() => handleLinkPatient(pat.id)}
                  className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-emerald-500/50 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <h5 className="text-xs font-bold text-gray-900 dark:text-white">{pat.fullName || pat.name}</h5>
                    <p className="text-[10px] text-gray-400">{pat.phone || pat.email || "ID: " + pat.id}</p>
                  </div>
                  <Button size="sm" className="h-7 text-[10px] font-bold rounded-lg bg-emerald-600 text-white">
                    Vincular
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}