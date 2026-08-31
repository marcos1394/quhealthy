"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import {
  MessageSquare,
  Search,
  Send,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Mail,
  Bot,
  Filter,
  ArrowRight,
  ShieldCheck,
  Tag,
  Star,
  Zap,
  Check,
  Flame,
  ChevronRight,
  Layers,
  Inbox,
  Kanban,
  Radar,
  SlidersHorizontal,
  ExternalLink,
  HelpCircle,
  Plus,
  X,
  Copy,
  MessageCircle,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { adminService } from "@/services/admin.service";

// Iconos Oficiales SVG
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
      <radialGradient id="ig-crm-grad" cx="20%" cy="100%" r="150%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </radialGradient>
      <path
        fill="url(#ig-crm-grad)"
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

export type FunnelStage =
  | "NEW_LEAD"
  | "CONTACTED"
  | "QUALIFIED"
  | "DEMO_SCHEDULED"
  | "PROPOSAL_SENT"
  | "WON"
  | "LOST";

export interface CrmConversation {
  id: string;
  providerId: number;
  platform: string;
  contactName?: string;
  senderName?: string;
  externalContactId: string;
  senderPhone?: string;
  senderEmail?: string;
  contactPhone?: string;
  contactEmail?: string;
  lastMessage?: string;
  lastMessagePreview?: string;
  lastMessageAt: string;
  unreadCount?: number;
  isRead: boolean;
  status: string;
  funnelStage: FunnelStage;
  leadSource?: string;
  leadScore: number;
  interestedPlan?: string;
  aiSummary?: string;
  aiSuggestedAction?: string;
  aiAutoResponderEnabled?: boolean;
}

export interface CrmMessage {
  id: string;
  conversationId?: string;
  direction?: "INBOUND" | "OUTBOUND";
  senderType?: "USER" | "AGENT" | "AI";
  senderName?: string;
  type?: string;
  content: string;
  mediaUrl?: string;
  status?: string;
  createdAt: string;
}

export interface ProspectLead {
  conversationId?: string;
  platform: string;
  authorName: string;
  authorId: string;
  postUrlOrId: string;
  commentText: string;
  leadScore: number;
  interestedPlan: string;
  intentSummary: string;
  suggestedAction: string;
  suggestedReply: string;
  detectedAt: string;
}

const FUNNEL_STAGES_CONFIG: Array<{
  key: FunnelStage;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = [
  { key: "NEW_LEAD", label: "Nuevos Leads", color: "text-sky-700", bgColor: "bg-sky-50", borderColor: "border-sky-200" },
  { key: "CONTACTED", label: "Contactados", color: "text-indigo-700", bgColor: "bg-indigo-50", borderColor: "border-indigo-200" },
  { key: "QUALIFIED", label: "Calificados", color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
  { key: "DEMO_SCHEDULED", label: "Demo Agendada", color: "text-purple-700", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
  { key: "PROPOSAL_SENT", label: "Propuesta Enviada", color: "text-orange-700", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
  { key: "WON", label: "Ganados (Clientes)", color: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
  { key: "LOST", label: "Perdidos / Descartados", color: "text-slate-600", bgColor: "bg-slate-100", borderColor: "border-slate-300" },
];

export interface MetaTemplateDef {
  key: string;
  name: string;
  category: "Marketing" | "Utilidad";
  title: string;
  badge: string;
  description: string;
  variables: Array<{ id: number; label: string; placeholder: string; defaultVal?: string }>;
  renderText: (params: Record<number, string>) => string;
}

export const META_APPROVED_TEMPLATES: MetaTemplateDef[] = [
  {
    key: "prospeccion_salud_universal",
    name: "prospeccion_salud_universal",
    category: "Marketing",
    title: "🚀 Prospección Universal en Salud",
    badge: "Marketing / Outbound",
    description: "Para contactar en frío a cualquier médico, especialista o clínica con enlace a tu calendario.",
    variables: [
      { id: 1, label: "Nombre / Título del Profesional", placeholder: "Ej: Dra. Amanda Fretes", defaultVal: "" },
      { id: 2, label: "Especialidad / Negocio de Salud", placeholder: "Ej: Cirugía Plástica y Reconstructiva", defaultVal: "Cirugía Plástica y Reconstructiva" },
      { id: 3, label: "Retos o Procesos Clave del Área", placeholder: "Ej: el seguimiento clínico, consentimientos y cobro de anticipos", defaultVal: "el seguimiento clínico pre y post operatorio, expedientes con consentimiento informado y cobro de anticipos" },
    ],
    renderText: (p) =>
      `Hola ${p[1] || "{{1}}"}, un gusto saludarle. Le escribimos de parte del equipo de Quhealthy.\n\n` +
      `Sabemos que la gestión y atención médica en ${p[2] || "{{2}}"} tiene requerimientos muy particulares, especialmente en temas como ${p[3] || "{{3}}"}.\n\n` +
      `En Quhealthy contamos con un ecosistema digital de salud en producción, diseñado para adaptarse a los flujos de trabajo reales de su consulta y resolver sus principales cuellos de botella operativos y de atención.\n\n` +
      `Más que ofrecer una plataforma genérica, nos gustaría conocer cómo operan actualmente y cómo podemos apoyar a su práctica o negocio de salud.\n\n` +
      `Si le parece bien, le compartimos el enlace para agendar una breve videollamada de 15 minutos en el horario que mejor le acomode:\n` +
      `https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ3AGnGDThJxLcWIh94-E41kDGV7N7XyGfscB7foMmNGhcDmMaUZsl0joYCUTQ9N_I_nedLDWSTx\n\n` +
      `Quedamos a sus órdenes y que tenga un excelente día.`,
  },
  {
    key: "oferta_mes_gratis_medico",
    name: "oferta_mes_gratis_medico",
    category: "Marketing",
    title: "🎁 Oferta Mes Gratis Plan Premium ($1,800)",
    badge: "Marketing / Cierre",
    description: "Reactivación de prospectos médicos ofreciendo 30 días de prueba sin costo ni plazos.",
    variables: [
      { id: 1, label: "Nombre del Doctor(a)", placeholder: "Ej: Dr. Daniel Rodríguez", defaultVal: "" },
    ],
    renderText: (p) =>
      `Hola ${p[1] || "{{1}}"}, un gusto saludarle de nuevo de parte de Quhealthy.\n\n` +
      `Queremos obsequiarle su primer mes 100% gratis de nuestro Plan Premium ($1,800 MXN) para que pueda utilizar su consultorio digital activo: agenda en línea, recetas con firma electrónica y código QR verificable, y expediente clínico bajo la norma NOM-004.\n\n` +
      `No requiere plazos forzosos ni comisiones ocultas.\n\n` +
      `¿Le gustaría que le activemos su acceso sin costo o prefiere que le agendemos una breve llamada de orientación de 15 minutos?`,
  },
  {
    key: "recordatorio_cita_paciente",
    name: "recordatorio_cita_paciente",
    category: "Utilidad",
    title: "⏰ Recordatorio de Cita (Anti No-Show)",
    badge: "Utilidad / Citas",
    description: "Recordatorio 24h antes con botones interactivos de Confirmar y Reagendar.",
    variables: [
      { id: 1, label: "Nombre del Paciente", placeholder: "Ej: María González", defaultVal: "" },
      { id: 2, label: "Nombre del Doctor(a)", placeholder: "Ej: Dra. Amanda Fretes", defaultVal: "" },
      { id: 3, label: "Fecha de la Cita", placeholder: "Ej: 25 de Septiembre", defaultVal: "" },
      { id: 4, label: "Hora", placeholder: "Ej: 10:30 AM", defaultVal: "" },
      { id: 5, label: "Modalidad / Ubicación", placeholder: "Ej: Consultorio 402 / Videollamada", defaultVal: "Consultorio Principal" },
    ],
    renderText: (p) =>
      `Hola ${p[1] || "{{1}}"}, le recordamos su cita médica programada con ${p[2] || "{{2}}"} para el día ${p[3] || "{{3}}"} a las ${p[4] || "{{4}}"}.\n\n` +
      `📍 Modalidad / Ubicación: ${p[5] || "{{5}}"}\n\n` +
      `Por favor, confirme su asistencia seleccionando una de las opciones a continuación.`,
  },
  {
    key: "confirmacion_cita_paciente",
    name: "confirmacion_cita_paciente",
    category: "Utilidad",
    title: "📅 Confirmación Inmediata de Reserva",
    badge: "Utilidad / Citas",
    description: "Envío automático al paciente en cuanto agenda o paga su cita médica.",
    variables: [
      { id: 1, label: "Nombre del Paciente", placeholder: "Ej: Carlos Sánchez", defaultVal: "" },
      { id: 2, label: "Nombre del Doctor(a)", placeholder: "Ej: Dr. Omar Avilés", defaultVal: "" },
      { id: 3, label: "Fecha", placeholder: "Ej: 15 de Octubre", defaultVal: "" },
      { id: 4, label: "Hora", placeholder: "Ej: 04:00 PM", defaultVal: "" },
      { id: 5, label: "Lugar o Modalidad", placeholder: "Ej: Consultorio 102 / Videollamada", defaultVal: "Consultorio Quhealthy" },
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
    key: "receta_digital_expediente",
    name: "receta_digital_expediente",
    category: "Utilidad",
    title: "💊 Receta Médica Digital & Expediente QR",
    badge: "Utilidad / Salud",
    description: "Entrega instantánea de receta con firma electrónica y código QR de validación.",
    variables: [
      { id: 1, label: "Nombre del Paciente", placeholder: "Ej: María González", defaultVal: "" },
      { id: 2, label: "Nombre del Doctor(a)", placeholder: "Ej: Dr. Daniel Rodríguez", defaultVal: "" },
      { id: 3, label: "URL de la Receta", placeholder: "Ej: https://www.quhealthy.org/patient/prescription/rec_123", defaultVal: "https://www.quhealthy.org/patient/prescription/" },
    ],
    renderText: (p) =>
      `Hola ${p[1] || "{{1}}"}, ${p[2] || "{{2}}"} ha generado su receta médica digital y resumen de consulta oficial.\n\n` +
      `Su receta cuenta con firma electrónica y código QR de validación médica. Puede visualizarla y descargarla en el siguiente enlace seguro:\n` +
      `${p[3] || "{{3}}"}\n\n` +
      `Quedamos a sus órdenes para el seguimiento de su salud.`,
  },
];

export const TabAdminCrm: React.FC = () => {
  // Navigation
  const [activeTab, setActiveTab] = useState<"inbox" | "funnel" | "prospector">("inbox");

  // State
  const [conversations, setConversations] = useState<CrmConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<CrmConversation | null>(null);
  const [messages, setMessages] = useState<CrmMessage[]>([]);
  const [prospects, setProspects] = useState<ProspectLead[]>([]);
  const [funnelStats, setFunnelStats] = useState<any>(null);

  // Loadings
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [syncingMessages, setSyncingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [scanningProspects, setScanningProspects] = useState(false);

  // Filters & Inputs
  const [filterPlatform, setFilterPlatform] = useState<string>("ALL");
  const [filterStage, setFilterStage] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [inputText, setInputText] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<Array<{ tone: string; text: string }>>([]);
  const [showLeadDetails, setShowLeadDetails] = useState(true);

  // 🚀 Direct Messaging Modal State
  const [showDirectModal, setShowDirectModal] = useState<boolean>(false);
  const [directPlatform, setDirectPlatform] = useState<"WHATSAPP" | "INSTAGRAM" | "FACEBOOK" | "EMAIL">("WHATSAPP");
  const [directRecipient, setDirectRecipient] = useState<string>("");
  const [directRecipientName, setDirectRecipientName] = useState<string>("");
  const [directMessageText, setDirectMessageText] = useState<string>("");
  const [isSendingDirect, setIsSendingDirect] = useState<boolean>(false);
  const [directSuccessResult, setDirectSuccessResult] = useState<any | null>(null);

  // 🚀 Meta WhatsApp Template Selection & Variables
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>("prospeccion_salud_universal");
  const [showTemplatePreview, setShowTemplatePreview] = useState<boolean>(true);
  const [templateParams, setTemplateParams] = useState<Record<number, string>>({
    1: "",
    2: "Cirugía Plástica y Reconstructiva",
    3: "el seguimiento clínico pre y post operatorio, expedientes con consentimiento informado y cobro de anticipos",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. Cargar Conversaciones
  const loadConversations = useCallback(async (autoSelectFirst = true) => {
    try {
      setLoadingConversations(true);
      const res = await adminService.getAdminCrmConversations(0, 100);
      const list: CrmConversation[] = res?.content || res || [];
      setConversations(list);

      setSelectedConversation((prev) => {
        if (!prev && autoSelectFirst && list.length > 0) {
          return list[0];
        }
        if (prev) {
          const updated = list.find((c) => c.id === prev.id);
          if (
            updated &&
            (updated.funnelStage !== prev.funnelStage ||
              updated.lastMessagePreview !== prev.lastMessagePreview ||
              updated.leadScore !== prev.leadScore ||
              updated.contactName !== prev.contactName)
          ) {
            return updated;
          }
          return prev;
        }
        return null;
      });
    } catch (err) {
      console.error("Error cargando conversaciones CRM", err);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  // 2. Cargar Estadísticas del Funnel
  const loadFunnelStats = useCallback(async () => {
    try {
      const stats = await adminService.getAdminFunnelStats();
      setFunnelStats(stats);
    } catch (err) {
      console.error("Error cargando funnel stats", err);
    }
  }, []);

  // 3. Sincronización Manual con Meta (FB e IG)
  const handleSyncMetaMessages = async () => {
    try {
      setSyncingMessages(true);
      const res = await adminService.syncAdminCrmMessages();
      toast.success(
        `Sincronización completada: ${res.conversationsSynced || 0} chats y ${res.messagesSynced || 0} mensajes actualizados.`
      );
      await loadConversations(false);
      await loadFunnelStats();
    } catch (err) {
      console.error("Error sincronizando mensajes de Meta", err);
      toast.error("No se pudieron sincronizar los mensajes de Meta Graph API.");
    } finally {
      setSyncingMessages(false);
    }
  };

  useEffect(() => {
    loadConversations();
    loadFunnelStats();
  }, [loadConversations, loadFunnelStats]);

  // 4. Cargar Mensajes de una conversación
  const loadMessages = useCallback(async (convId: string) => {
    try {
      setLoadingMessages(true);
      const res = await adminService.getAdminCrmMessages(convId, 0, 100);
      const msgList = res?.content || res || [];
      // Orden cronológico (antiguos arriba, nuevos abajo)
      const sorted = [...msgList].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setMessages(sorted);
      setAiSuggestions([]);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Error cargando mensajes", err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (selectedConversation?.id) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation?.id, loadMessages]);

  // 5. Enviar Mensaje
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !selectedConversation) return;

    setInputText("");

    try {
      setSendingMessage(true);
      const newMsg = await adminService.sendAdminCrmMessage(selectedConversation.id, {
        text: text.trim(),
      });

      setMessages((prev) => [
        ...prev,
        newMsg || {
          id: `temp_${Date.now()}`,
          conversationId: selectedConversation.id,
          direction: "OUTBOUND",
          senderType: "AGENT",
          senderName: "Quhealthy",
          content: text.trim(),
          createdAt: new Date().toISOString(),
        },
      ]);
      setAiSuggestions([]);
      setTimeout(scrollToBottom, 100);
      loadConversations(false);
      loadFunnelStats();
    } catch (err) {
      console.error("Error enviando mensaje", err);
      toast.error("No se pudo enviar el mensaje a través del canal oficial.");
    } finally {
      setSendingMessage(false);
    }
  };

  // 🚀 5.1 Enviar Mensaje Directo Oficial (Modal)
  const handleSendDirectMessage = async () => {
    if (!directRecipient.trim()) {
      toast.warn("Ingresa el teléfono o nombre de usuario del destinatario.");
      return;
    }

    try {
      setIsSendingDirect(true);
      setDirectSuccessResult(null);

      const activeMetaTpl = (directPlatform === "WHATSAPP" && selectedTemplateKey !== "custom")
        ? META_APPROVED_TEMPLATES.find((t) => t.key === selectedTemplateKey)
        : null;

      let finalMessage = directMessageText.trim();
      let tplName: string | undefined = undefined;
      let tplParams: string[] | undefined = undefined;

      if (activeMetaTpl) {
        tplName = activeMetaTpl.name;
        tplParams = activeMetaTpl.variables.map((v) => templateParams[v.id]?.trim() || v.defaultVal || "");
        finalMessage = activeMetaTpl.renderText(templateParams);
      }

      if (!finalMessage) {
        toast.warn("El contenido del mensaje o plantilla no puede estar vacío.");
        setIsSendingDirect(false);
        return;
      }

      const res = await adminService.sendDirectCrmMessage({
        platform: directPlatform,
        recipient: directRecipient.trim(),
        recipientName: directRecipientName.trim() || undefined,
        message: finalMessage,
        templateName: tplName,
        templateLanguage: "es_MX",
        templateParameters: tplParams,
      });

      setDirectSuccessResult(res);
      toast.success(`Mensaje enviado exitosamente por ${directPlatform}${tplName ? ` con plantilla oficial (${tplName})` : ""}.`);

      // Recargar conversaciones y seleccionar la recién creada/actualizada
      await loadConversations(false);
      if (res.conversationId) {
        const found = conversations.find((c) => c.id === res.conversationId);
        if (found) {
          setSelectedConversation(found);
        }
      }
      loadFunnelStats();
    } catch (err: any) {
      console.error("Error al enviar mensaje directo", err);
      const errMsg = err?.response?.data?.message || err?.message || "Error al enviar mensaje por canal oficial.";
      toast.error(errMsg);
    } finally {
      setIsSendingDirect(false);
    }
  };

  // 🚀 5.2 Eliminar Conversación del CRM
  const handleDeleteConversation = async (conversationId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    if (!window.confirm("¿Estás seguro de que deseas eliminar este chat y todos sus mensajes del CRM?")) {
      return;
    }

    try {
      await adminService.deleteAdminCrmConversation(conversationId);
      toast.success("Conversación eliminada del CRM.");
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
      loadFunnelStats();
    } catch (err: any) {
      console.error("Error eliminando conversación", err);
      toast.error(err?.response?.data?.message || "No se pudo eliminar la conversación.");
    }
  };

  // 🚀 Inserción de Plantillas de Mensajes
  const insertDirectTemplate = (templateKey: "free_month" | "demo" | "nom004" | "followup") => {
    const name = directRecipientName.trim() || "Doctor(a)";
    if (templateKey === "free_month") {
      setDirectMessageText(
        `Hola ${name}, un gusto saludarle. Le escribo de parte del equipo de Quhealthy en www.quhealthy.org.\n\n` +
        `Quhealthy le permite digitalizar su consultorio médico con expediente clínico electrónico bajo la norma NOM-004-SSA3-2012, receta médica digital con firma y cédula verificable con QR, y agenda de citas online con cobro por anticipado.\n\n` +
        `Queremos ofrecerle su primer mes 100% gratis del Plan Premium ($1,800/mes) para que pruebe la plataforma a su propio ritmo y sin compromiso. ¿Le gustaría que le activemos su acceso hoy mismo?`
      );
    } else if (templateKey === "demo") {
      setDirectMessageText(
        `Hola ${name}, le comparto nuestro enlace para agendar una breve demostración en vivo de 15 minutos de Quhealthy: https://www.quhealthy.org/booking/demo\n\n` +
        `En la sesión revisaremos cómo automatizar sus recordatorios por WhatsApp y la emisión de recetas electrónicas con código QR.`
      );
    } else if (templateKey === "nom004") {
      setDirectMessageText(
        `Estimado(a) ${name}, ¿sabía que todas las notas y recetas emitidas en Quhealthy cumplen 100% con los estándares de COFEPRIS y la NOM-004-SSA3-2012 de expediente clínico?\n\n` +
        `Evite sanciones y blinde su práctica médica en minutos: https://www.quhealthy.org/provider/register?planId=3`
      );
    } else {
      setDirectMessageText(
        `Hola ${name}, le damos seguimiento a su interés en la plataforma Quhealthy. ¿Tiene alguna duda sobre la integración de su agenda o cobros en línea? Quedamos a sus órdenes.`
      );
    }
  };

  // 6. Generar Sugerencias de Copiloto IA (con contexto de Quhealthy)
  const handleAiSuggest = async () => {
    if (!selectedConversation) return;

    try {
      setGeneratingAi(true);
      const lastInbound = [...messages].reverse().find((m) => m.direction === "INBOUND" || m.senderType === "USER")?.content || selectedConversation.lastMessagePreview || "";
      const res = await adminService.getAdminAiSuggestedReply(selectedConversation.id, lastInbound);
      
      if (res?.suggestions && res.suggestions.length > 0) {
        setAiSuggestions(res.suggestions);
        toast.success("Sugerencias de IA con contexto de Quhealthy listas.");
      } else if (res?.suggestedReply || res?.reply) {
        setInputText(res.suggestedReply || res.reply);
        toast.success("Respuesta sugerida generada.");
      } else {
        toast.info("No se generaron sugerencias para este mensaje.");
      }
    } catch (err) {
      console.error("Error en sugerencia IA", err);
      toast.error("Servicio de IA ocupado o sin respuesta.");
    } finally {
      setGeneratingAi(false);
    }
  };

  // 7. Toggle Auto-Responder IA
  const handleToggleAutoResponder = async () => {
    if (!selectedConversation) return;
    const newState = !selectedConversation.aiAutoResponderEnabled;
    try {
      const updated = await adminService.toggleAdminAutoResponder(selectedConversation.id, newState);
      setSelectedConversation((prev) => (prev ? { ...prev, aiAutoResponderEnabled: newState } : null));
      setConversations((prev) =>
        prev.map((c) => (c.id === selectedConversation.id ? { ...c, aiAutoResponderEnabled: newState } : c))
      );
      toast.success(
        newState
          ? "🤖 Piloto Automático IA activado para este chat."
          : "⏹️ Piloto Automático IA desactivado."
      );
    } catch (err) {
      toast.error("No se pudo actualizar el modo auto-responder.");
    }
  };

  // 8. Actualizar Etapa de Funnel
  const handleUpdateStage = async (stage: FunnelStage, plan?: string) => {
    if (!selectedConversation) return;
    try {
      await adminService.updateAdminLeadStage(selectedConversation.id, {
        funnelStage: stage,
        interestedPlan: plan || selectedConversation.interestedPlan,
      });
      setSelectedConversation((prev) => (prev ? { ...prev, funnelStage: stage, interestedPlan: plan || prev.interestedPlan } : null));
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id ? { ...c, funnelStage: stage, interestedPlan: plan || c.interestedPlan } : c
        )
      );
      loadFunnelStats();
      toast.success(`Lead movido a: ${FUNNEL_STAGES_CONFIG.find((s) => s.key === stage)?.label || stage}`);
    } catch (err) {
      toast.error("No se pudo mover la etapa del lead.");
    }
  };

  // 9. Escanear Redes con IA (Radar de Leads)
  const handleScanProspects = async () => {
    try {
      setScanningProspects(true);
      const results = await adminService.scanAdminLeadProspects();
      setProspects(results || []);
      toast.success(`Radar IA: ${results?.length || 0} prospectos calificados en publicaciones.`);
      loadConversations(false);
      loadFunnelStats();
    } catch (err) {
      console.error("Error escaneando prospectos", err);
      toast.error("Error al escanear comentarios con IA.");
    } finally {
      setScanningProspects(false);
    }
  };

  // Filtrado de Conversaciones
  const filteredConversations = conversations.filter((c) => {
    const name = (c.contactName || c.senderName || "").toLowerCase();
    const phone = (c.contactPhone || c.senderPhone || c.externalContactId || "").toLowerCase();
    const lastMsg = (c.lastMessagePreview || c.lastMessage || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = name.includes(search) || phone.includes(search) || lastMsg.includes(search);
    const matchesPlatform = filterPlatform === "ALL" || c.platform?.toUpperCase() === filterPlatform;
    const matchesStage = filterStage === "ALL" || c.funnelStage === filterStage;

    return matchesSearch && matchesPlatform && matchesStage;
  });

  const getPlatformBadge = (platform: string) => {
    switch (platform?.toUpperCase()) {
      case "WHATSAPP":
        return <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">WhatsApp</span>;
      case "INSTAGRAM":
        return <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 text-[10px] font-bold">Instagram</span>;
      case "FACEBOOK":
        return <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">Facebook</span>;
      case "EMAIL":
      case "GMAIL":
        return <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">Gmail</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">{platform || "Chat"}</span>;
    }
  };

  const getStageBadge = (stage: FunnelStage) => {
    const config = FUNNEL_STAGES_CONFIG.find((s) => s.key === stage) || FUNNEL_STAGES_CONFIG[0];
    return (
      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${config.bgColor} ${config.color} ${config.borderColor}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header Principal con Selector de Modos y Acciones */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Centro de Leads & CRM Quhealthy
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
            Gestión Comercial & IA Omnicanal
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Inbox oficial con sincronización de Facebook, Instagram y WhatsApp, copiloto comercial con contexto de Quhealthy y pipeline de ventas.
          </p>
        </div>

        {/* Switcher de Vistas */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab("inbox")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "inbox"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Inbox className="w-3.5 h-3.5" /> Inbox & Chat
          </button>
          <button
            onClick={() => setActiveTab("funnel")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "funnel"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Kanban className="w-3.5 h-3.5" /> Pipeline Funnel
          </button>
          <button
            onClick={() => setActiveTab("prospector")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "prospector"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Radar className="w-3.5 h-3.5 text-amber-500" /> Radar Leads IA
          </button>
        </div>

        {/* Botones de Acción Global */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setDirectSuccessResult(null);
              setShowDirectModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Detonar Envío Directo</span>
          </button>

          <button
            onClick={handleSyncMetaMessages}
            disabled={syncingMessages}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95 disabled:opacity-50"
            title="Sincroniza conversaciones y mensajes antiguos de Facebook e Instagram"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingMessages ? "animate-spin text-amber-400" : ""}`} />
            <span>{syncingMessages ? "Sincronizando Meta..." : "Sincronizar Historial Meta"}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar (Visible en Funnel y accesible) */}
      {funnelStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500">Total Leads</span>
            <div className="text-xl font-bold text-slate-900">{funnelStats.totalLeads || 0}</div>
          </div>
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 shadow-xs">
            <span className="text-[11px] font-semibold text-sky-700">Nuevos</span>
            <div className="text-xl font-bold text-sky-900">{funnelStats.newLeads || 0}</div>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 shadow-xs">
            <span className="text-[11px] font-semibold text-indigo-700">Contactados</span>
            <div className="text-xl font-bold text-indigo-900">{funnelStats.contacted || 0}</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 shadow-xs">
            <span className="text-[11px] font-semibold text-amber-700">Calificados</span>
            <div className="text-xl font-bold text-amber-900">{funnelStats.qualified || 0}</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 shadow-xs">
            <span className="text-[11px] font-semibold text-purple-700">Demos</span>
            <div className="text-xl font-bold text-purple-900">{funnelStats.demoScheduled || 0}</div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 shadow-xs">
            <span className="text-[11px] font-semibold text-emerald-700">Ganados</span>
            <div className="text-xl font-bold text-emerald-900">{funnelStats.won || 0}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Conversión</span>
            <div className="text-xl font-bold text-indigo-600">{funnelStats.conversionRate || 0}%</div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 1: INBOX & CHAT OMNICANAL                                           */}
      {/* ========================================================================= */}
      {activeTab === "inbox" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[760px]">
          {/* Panel Izquierdo: Lista de Conversaciones */}
          <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col overflow-hidden">
            {/* Buscador y Filtros */}
            <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar lead, teléfono o mensaje..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <button
                  onClick={() => {
                    setDirectSuccessResult(null);
                    setShowDirectModal(true);
                  }}
                  className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-xl transition-all shadow-2xs shrink-0"
                  title="Nuevo Mensaje Directo"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Filtros de Plataforma */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
                {["ALL", "INSTAGRAM", "FACEBOOK", "WHATSAPP", "GMAIL"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilterPlatform(p)}
                    className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors ${
                      filterPlatform === p
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {p === "ALL" ? "Todos" : p}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista Scrolleable de Chats */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {loadingConversations ? (
                <div className="p-10 text-center text-slate-400 space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-500" />
                  <p className="text-xs">Cargando conversaciones...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto text-indigo-500">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">Sin mensajes en este filtro</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Pulsa &quot;Sincronizar Mensajes&quot; para importar los DMs de tu página de Facebook e Instagram.
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = selectedConversation?.id === conv.id;
                  const name = conv.contactName || conv.senderName || "Contacto";
                  const preview = conv.lastMessagePreview || conv.lastMessage || "Sin mensajes";

                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full p-3.5 text-left transition-all flex items-start gap-3 border-l-4 ${
                        isSelected
                          ? "bg-indigo-50/70 border-indigo-600"
                          : "border-transparent hover:bg-slate-50"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-slate-900 text-xs truncate">{name}</span>
                          <div className="flex items-center gap-1">
                            {conv.leadScore > 50 && (
                              <span className="flex items-center text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                                <Flame className="w-3 h-3 fill-amber-500 mr-0.5" />
                                {conv.leadScore}
                              </span>
                            )}
                            {getPlatformBadge(conv.platform)}
                            <button
                              type="button"
                              onClick={(e) => handleDeleteConversation(conv.id, e)}
                              className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              title="Eliminar chat del CRM"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate leading-relaxed">{preview}</p>
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/60">
                          {getStageBadge(conv.funnelStage || "NEW_LEAD")}
                          {conv.aiAutoResponderEnabled && (
                            <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                              <Bot className="w-3 h-3" /> Auto-IA
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Panel Central: Hilo de Mensajes */}
          <div className={`${showLeadDetails ? "lg:col-span-5" : "lg:col-span-8"} bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col overflow-hidden`}>
            {selectedConversation ? (
              <>
                {/* Header del Chat */}
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {(selectedConversation.contactName || selectedConversation.senderName || "U").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        {selectedConversation.contactName || selectedConversation.senderName}
                        {getPlatformBadge(selectedConversation.platform)}
                      </h3>
                      <p className="text-[10px] text-slate-500 truncate max-w-[200px]">
                        ID: {selectedConversation.externalContactId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Switch Auto-Responder */}
                    <button
                      onClick={handleToggleAutoResponder}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                        selectedConversation.aiAutoResponderEnabled
                          ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                          : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <Bot className="w-3 h-3" />
                      {selectedConversation.aiAutoResponderEnabled ? "Auto-IA ON" : "Auto-IA OFF"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteConversation(selectedConversation.id)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs transition-colors"
                      title="Eliminar este chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setShowLeadDetails(!showLeadDetails)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 text-xs"
                      title="Detalles del Lead"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Hilo de Mensajes */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40">
                  {loadingMessages ? (
                    <div className="p-10 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-500" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 space-y-2">
                      <p className="text-xs">No hay mensajes previos registrados.</p>
                      <p className="text-[11px] text-slate-400">Escribe una respuesta para iniciar el contacto.</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOutbound = msg.direction === "OUTBOUND" || msg.senderType === "AGENT" || msg.senderType === "AI";
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isOutbound ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs ${
                              isOutbound
                                ? "bg-slate-900 text-white rounded-br-xs"
                                : "bg-white border border-slate-200 text-slate-800 rounded-bl-xs"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                          <span className="text-[9px] text-slate-400 mt-1 px-1 flex items-center gap-1">
                            <span>
                              {(() => {
                                const raw = msg.createdAt;
                                const dateObj = typeof raw === "string" && !raw.endsWith("Z") && !raw.includes("+")
                                  ? new Date(raw + "Z")
                                  : new Date(raw);
                                return dateObj.toLocaleTimeString("es-MX", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                });
                              })()}
                            </span>
                            {isOutbound && (
                              <span
                                className="text-[10px] font-bold"
                                title={
                                  msg.status === "READ"
                                    ? "Leído / Visto"
                                    : msg.status === "DELIVERED"
                                    ? "Entregado al dispositivo"
                                    : "Enviado por servidor"
                                }
                              >
                                {msg.status === "READ" ? (
                                  <span className="text-sky-500">✓✓</span>
                                ) : msg.status === "DELIVERED" ? (
                                  <span className="text-slate-400">✓✓</span>
                                ) : (
                                  <span className="text-slate-400">✓</span>
                                )}
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Sugerencias de Copilot IA */}
                {aiSuggestions.length > 0 && (
                  <div className="p-3 bg-indigo-50/90 border-t border-indigo-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-indigo-900">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Sugerencias Copiloto Quhealthy
                      </span>
                      <button
                        onClick={() => setAiSuggestions([])}
                        className="text-slate-400 hover:text-slate-600 text-[10px]"
                      >
                        Cerrar
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {aiSuggestions.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(s.text)}
                          className="p-2 text-left bg-white border border-indigo-200/80 rounded-xl hover:border-indigo-500 hover:shadow-xs transition-all text-[11px] text-slate-700 leading-snug flex items-start justify-between gap-2 group"
                        >
                          <span className="flex-1">{s.text}</span>
                          <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-[9px] rounded uppercase shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            {s.tone} • Enviar
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input de Mensajes */}
                <div className="p-3 border-t border-slate-100 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleAiSuggest}
                      disabled={generatingAi}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold hover:bg-indigo-100 transition-colors disabled:opacity-50"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${generatingAi ? "animate-spin" : "text-amber-500"}`} />
                      {generatingAi ? "Consultando contexto..." : "Generar Sugerencia IA"}
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Escribe una respuesta institucional..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                      type="submit"
                      disabled={sendingMessage || !inputText.trim()}
                      className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-xs active:scale-95 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">Selecciona una conversación</h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  Elige un lead de la lista o sincroniza tus canales para ver los mensajes entrantes.
                </p>
              </div>
            )}
          </div>

          {/* Panel Derecho: Ficha del Lead en el CRM */}
          {showLeadDetails && selectedConversation && (
            <div className="lg:col-span-3 bg-white border border-slate-200/90 rounded-2xl shadow-xs p-4 flex flex-col space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" /> Ficha de Lead CRM
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  Score: {selectedConversation.leadScore}/100
                </span>
              </div>

              {/* Etapa del Funnel */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600">Etapa en el Funnel</label>
                <select
                  value={selectedConversation.funnelStage || "NEW_LEAD"}
                  onChange={(e) => handleUpdateStage(e.target.value as FunnelStage)}
                  className="w-full text-xs font-bold p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                >
                  {FUNNEL_STAGES_CONFIG.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Plan de Interés */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600">Plan de Interés</label>
                <select
                  value={selectedConversation.interestedPlan || "GENERAL"}
                  onChange={(e) => handleUpdateStage(selectedConversation.funnelStage, e.target.value)}
                  className="w-full text-xs font-bold p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="GENERAL">General / Indeciso</option>
                  <option value="BASIC_FREE">Básico Gratuito ($0/mes - 12% com.)</option>
                  <option value="BASIC">Básico ($450/mes - Facturación CFDI 4.0)</option>
                  <option value="STANDARD">Estándar ($900/mes - Copiloto IA) [Más Popular]</option>
                  <option value="PREMIUM">Premium ($1,800/mes - Chatbot WhatsApp)</option>
                  <option value="ENTERPRISE">Empresarial (A la Medida - Clínicas)</option>
                </select>
              </div>

              {/* Resumen / Análisis de IA */}
              {selectedConversation.aiSummary && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-amber-800 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" /> Resumen de Interés IA
                  </span>
                  <p className="text-[11px] text-amber-950 leading-relaxed">
                    {selectedConversation.aiSummary}
                  </p>
                </div>
              )}

              {/* Acción Sugerida */}
              {selectedConversation.aiSuggestedAction && (
                <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-indigo-800 flex items-center gap-1">
                    <ArrowRight className="w-3 h-3 text-indigo-600" /> Próxima Acción Comercial
                  </span>
                  <p className="text-[11px] text-indigo-950 font-medium">
                    {selectedConversation.aiSuggestedAction}
                  </p>
                </div>
              )}

              {/* Enlaces Rápidos de Conversión */}
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enlaces Oficiales de Conversión</span>
                <div className="flex flex-col gap-1.5 text-xs">
                  <a
                    href="https://www.quhealthy.org/provider/register?planId=5"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-medium"
                  >
                    <span>Básico Gratuito ($0/mes)</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                  <a
                    href="https://www.quhealthy.org/provider/register?planId=1"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-medium"
                  >
                    <span>Básico ($450/mes - CFDI)</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                  <a
                    href="https://www.quhealthy.org/provider/register?planId=2"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[11px] font-bold"
                  >
                    <span>Estándar ($900/mes - 14d Gratis)</span>
                    <ExternalLink className="w-3 h-3 text-indigo-500" />
                  </a>
                  <a
                    href="https://www.quhealthy.org/provider/register?planId=3"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-medium"
                  >
                    <span>Premium ($1,800/mes)</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                  <a
                    href="https://www.quhealthy.org/contact"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold"
                  >
                    <span>Empresarial / Agendar Demo</span>
                    <ExternalLink className="w-3 h-3 text-amber-600" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: PIPELINE FUNNEL KANBAN                                           */}
      {/* ========================================================================= */}
      {activeTab === "funnel" && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[1400px]">
            {FUNNEL_STAGES_CONFIG.map((stage) => {
              const stageLeads = conversations.filter((c) => (c.funnelStage || "NEW_LEAD") === stage.key);

              return (
                <div
                  key={stage.key}
                  className="flex-1 bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3.5 flex flex-col h-[680px]"
                >
                  {/* Stage Header */}
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                    <span className={`text-xs font-bold ${stage.color}`}>{stage.label}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] font-extrabold text-slate-700">
                      {stageLeads.length}
                    </span>
                  </div>

                  {/* Tarjetas de Leads */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                    {stageLeads.length === 0 ? (
                      <div className="h-28 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-[11px] text-slate-400 font-medium">
                        Sin prospectos
                      </div>
                    ) : (
                      stageLeads.map((lead) => {
                        const name = lead.contactName || lead.senderName || "Contacto";
                        return (
                          <div
                            key={lead.id}
                            className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all space-y-2"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-xs text-slate-900 truncate">{name}</span>
                              {getPlatformBadge(lead.platform)}
                            </div>

                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                              {lead.lastMessagePreview || lead.aiSummary || "Sin resumen"}
                            </p>

                            <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-100">
                              <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                                {lead.interestedPlan || "ESTÁNDAR"}
                              </span>
                              <span className="font-semibold text-slate-400">Score: {lead.leadScore}</span>
                            </div>

                            {/* Acciones de Tarjeta */}
                            <div className="flex items-center justify-between pt-1">
                              <button
                                onClick={() => {
                                  setSelectedConversation(lead);
                                  setActiveTab("inbox");
                                }}
                                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                              >
                                Abrir Chat <ChevronRight className="w-3 h-3" />
                              </button>

                              <select
                                value={lead.funnelStage}
                                onChange={(e) => {
                                  setSelectedConversation(lead);
                                  handleUpdateStage(e.target.value as FunnelStage);
                                }}
                                className="text-[10px] font-bold p-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                              >
                                {FUNNEL_STAGES_CONFIG.map((s) => (
                                  <option key={s.key} value={s.key}>
                                    Mover a {s.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 3: RADAR DE LEADS IA (OUTBOUND & COMENTARIOS)                        */}
      {/* ========================================================================= */}
      {activeTab === "prospector" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Radar className="w-5 h-5 text-amber-500" /> Radar de Leads IA en Redes Sociales
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                La IA escanea automáticamente comentarios y reacciones en tus publicaciones de Facebook e Instagram para descubrir médicos y clínicas interesados en Quhealthy.
              </p>
            </div>

            <button
              onClick={handleScanProspects}
              disabled={scanningProspects}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${scanningProspects ? "animate-spin text-white" : ""}`} />
              {scanningProspects ? "Analizando Comentarios..." : "Escanear Redes con IA"}
            </button>
          </div>

          {/* Resultados del Escaneo */}
          {prospects.length === 0 && !scanningProspects ? (
            <div className="text-center py-16 text-slate-400 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto text-amber-500">
                <Radar className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">Radar en espera</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Haz clic en &quot;Escanear Redes con IA&quot; para buscar comentarios comerciales y consultas de precios en tus publicaciones recientes.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prospects.map((p, idx) => {
                const isUrl = p.postUrlOrId && (p.postUrlOrId.startsWith("http://") || p.postUrlOrId.startsWith("https://"));
                return (
                  <div
                    key={idx}
                    className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 space-y-3 hover:border-indigo-300 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          {p.authorName}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            Score: {p.leadScore}
                          </span>
                          {getPlatformBadge(p.platform)}
                        </div>
                      </div>

                      {/* Enlace a la Publicación Original si está disponible */}
                      {isUrl ? (
                        <a
                          href={p.postUrlOrId}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          <span>Ver publicación en {p.platform}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-400">Post ID: {p.postUrlOrId}</span>
                      )}

                      <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 italic">
                        &quot;{p.commentText}&quot;
                      </div>

                      <div className="space-y-1 text-xs">
                        <span className="text-[10px] font-bold text-indigo-700 uppercase">Intención Comercial:</span>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{p.intentSummary}</p>
                      </div>

                      <div className="p-2.5 bg-indigo-50/80 border border-indigo-100 rounded-xl space-y-1 text-[11px]">
                        <span className="font-bold text-indigo-900 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" /> Respuesta IA Sugerida:
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(p.suggestedReply);
                              toast.success("Respuesta copiada al portapapeles.");
                            }}
                            className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 underline"
                          >
                            Copiar
                          </button>
                        </span>
                        <p className="text-slate-700 leading-snug">{p.suggestedReply}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500">Plan: {p.interestedPlan}</span>
                      <button
                        onClick={() => {
                          loadConversations(true);
                          setActiveTab("inbox");
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all"
                      >
                        Ver en Inbox
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🚀 MODAL: DETONACIÓN DIRECTA DE MENSAJES (WHATSAPP / INSTAGRAM / FACEBOOK) */}
      {/* ========================================================================= */}
      {showDirectModal && (
        <div
          onClick={() => setShowDirectModal(false)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 flex flex-col max-h-[88vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header del Modal (Sticky) */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                  <Send className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    Detonar Envío Directo Oficial
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Mensaje por API oficial de Meta / Gmail
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDirectModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
                title="Cerrar ventana"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido Scrollable */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
              {/* Selector de Canal Oficial (Pills compactas) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Canal Oficial de Salida:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDirectPlatform("WHATSAPP")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg border text-[11px] font-bold transition-all ${
                      directPlatform === "WHATSAPP"
                        ? "bg-emerald-50 border-emerald-400 text-emerald-900 ring-1 ring-emerald-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDirectPlatform("INSTAGRAM")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg border text-[11px] font-bold transition-all ${
                      directPlatform === "INSTAGRAM"
                        ? "bg-pink-50 border-pink-400 text-pink-900 ring-1 ring-pink-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <InstagramIcon className="w-3.5 h-3.5" />
                    <span>Instagram</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDirectPlatform("FACEBOOK")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg border text-[11px] font-bold transition-all ${
                      directPlatform === "FACEBOOK"
                        ? "bg-blue-50 border-blue-400 text-blue-900 ring-1 ring-blue-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <FacebookIcon className="w-3.5 h-3.5" />
                    <span>Messenger</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDirectPlatform("EMAIL")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg border text-[11px] font-bold transition-all ${
                      directPlatform === "EMAIL"
                        ? "bg-red-50 border-red-400 text-red-900 ring-1 ring-red-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5 text-red-600" />
                    <span>Email</span>
                  </button>
                </div>
              </div>

              {/* Formulario: Destinatario & Nombre */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                    <span>
                      {directPlatform === "WHATSAPP"
                        ? "Teléfono WhatsApp (con Lada)"
                        : directPlatform === "INSTAGRAM"
                        ? "Usuario Instagram"
                        : directPlatform === "FACEBOOK"
                        ? "ID Facebook"
                        : "Correo"}
                    </span>
                    <span className="text-[9px] text-indigo-600 font-semibold">Obligatorio</span>
                  </label>
                  <div className="relative">
                    {directPlatform === "WHATSAPP" && <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />}
                    {directPlatform === "INSTAGRAM" && <span className="text-slate-400 font-bold text-xs absolute left-3 top-1/2 -translate-y-1/2">@</span>}
                    {directPlatform === "FACEBOOK" && <MessageCircle className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />}
                    {directPlatform === "EMAIL" && <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />}
                    <input
                      type="text"
                      placeholder={
                        directPlatform === "WHATSAPP"
                          ? "Ej: 526688821862 o 595971959760"
                          : directPlatform === "INSTAGRAM"
                          ? "Ej: draluisareyna"
                          : directPlatform === "FACEBOOK"
                          ? "Ej: 10009283749281"
                          : "Ej: contacto@doctor.com"
                      }
                      value={directRecipient}
                      onChange={(e) => setDirectRecipient(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                    <span>Nombre / Doctor(a)</span>
                    <span className="text-[9px] text-slate-400 font-normal">Opcional</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Ej: Dra. Amanda Fretes"
                      value={directRecipientName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDirectRecipientName(val);
                        if (val && !templateParams[1]) {
                          setTemplateParams((prev) => ({ ...prev, 1: val }));
                        }
                      }}
                      className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Selector de Plantilla WhatsApp Meta (Dropdown Compacto) */}
              {directPlatform === "WHATSAPP" && (
                <div className="space-y-2 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-emerald-950 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <WhatsAppIcon className="w-3.5 h-3.5" />
                        Plantilla Aprobada de Meta:
                      </span>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                        Garantía Anti 24h
                      </span>
                    </label>
                    <select
                      value={selectedTemplateKey}
                      onChange={(e) => {
                        const key = e.target.value;
                        setSelectedTemplateKey(key);
                        if (key !== "custom") {
                          const tpl = META_APPROVED_TEMPLATES.find((t) => t.key === key);
                          if (tpl) {
                            const initial: Record<number, string> = { ...templateParams };
                            if (directRecipientName.trim() && !initial[1]) initial[1] = directRecipientName.trim();
                            tpl.variables.forEach((v) => {
                              if (!initial[v.id] && v.defaultVal) initial[v.id] = v.defaultVal;
                            });
                            setTemplateParams(initial);
                          }
                        }
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <optgroup label="Plantillas Aprobadas Meta (Recomendado)">
                        {META_APPROVED_TEMPLATES.map((tpl) => (
                          <option key={tpl.key} value={tpl.key}>
                            {tpl.title} ({tpl.badge})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Otros">
                        <option value="custom">💬 Texto Libre (Solo si ya te escribió)</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* Variables dinámicas de la plantilla */}
                  {selectedTemplateKey !== "custom" && (
                    <div className="space-y-1.5 pt-1.5 border-t border-emerald-200/70">
                      <span className="text-[10px] font-bold text-emerald-900 block">
                        Variables de la Plantilla:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {META_APPROVED_TEMPLATES.find((t) => t.key === selectedTemplateKey)?.variables.map((v) => (
                          <div key={v.id} className="space-y-0.5">
                            <label className="text-[9px] font-bold text-slate-600 truncate block">
                              &#123;&#123;{v.id}&#125;&#125; {v.label}
                            </label>
                            <input
                              type="text"
                              placeholder={v.placeholder}
                              value={templateParams[v.id] || ""}
                              onChange={(e) =>
                                setTemplateParams((prev) => ({ ...prev, [v.id]: e.target.value }))
                              }
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vista Previa Colapsable */}
                  {selectedTemplateKey !== "custom" && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowTemplatePreview(!showTemplatePreview)}
                        className="flex items-center justify-between w-full text-[10px] font-bold text-emerald-800 hover:text-emerald-950 py-1 transition-colors"
                      >
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          {showTemplatePreview ? "Ocultar Vista Previa" : "Ver Vista Previa del Mensaje"}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTemplatePreview ? "rotate-180" : ""}`} />
                      </button>
                      {showTemplatePreview && (
                        <div className="mt-1 p-2.5 bg-white/90 border border-emerald-200 rounded-lg text-[11px] text-slate-800 whitespace-pre-line leading-relaxed max-h-32 overflow-y-auto">
                          {META_APPROVED_TEMPLATES.find((t) => t.key === selectedTemplateKey)?.renderText(templateParams)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Editor de Texto Libre (para Instagram/Facebook/Email o WhatsApp custom) */}
              {(directPlatform !== "WHATSAPP" || selectedTemplateKey === "custom") && (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-500 mr-1">Chips:</span>
                    <button
                      type="button"
                      onClick={() => insertDirectTemplate("free_month")}
                      className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-[10px] font-semibold"
                    >
                      🎁 Mes Gratis
                    </button>
                    <button
                      type="button"
                      onClick={() => insertDirectTemplate("demo")}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold"
                    >
                      📅 Demo 15 min
                    </button>
                    <button
                      type="button"
                      onClick={() => insertDirectTemplate("nom004")}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold"
                    >
                      📋 NOM-004 & QR
                    </button>
                    <button
                      type="button"
                      onClick={() => insertDirectTemplate("followup")}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold"
                    >
                      ⚡ Seguimiento
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Escribe el mensaje oficial que recibirá el destinatario..."
                    value={directMessageText}
                    onChange={(e) => setDirectMessageText(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
                  />
                </div>
              )}

              {/* Feedback de Éxito */}
              {directSuccessResult && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-900 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ¡Mensaje despachado con éxito!
                    </span>
                    <span className="text-[9px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                      {directSuccessResult.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-0.5">
                    {directSuccessResult.directLink && directPlatform === "WHATSAPP" && (
                      <a
                        href={directSuccessResult.directLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                      >
                        <WhatsAppIcon className="w-3 h-3" />
                        <span>Abrir WhatsApp Web</span>
                      </a>
                    )}
                    {directSuccessResult.conversationId && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowDirectModal(false);
                          loadConversations(true);
                          setActiveTab("inbox");
                        }}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Ver en Inbox</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer del Modal (Sticky) */}
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowDirectModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-all"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleSendDirectMessage}
                disabled={isSendingDirect || !directRecipient.trim()}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none active:scale-95"
              >
                {isSendingDirect ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Detonar Envío</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
