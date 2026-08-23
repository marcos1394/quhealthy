"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  ChevronDown,
  CreditCard,
  FileCheck,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ItemType } from "@/types/catalog";

interface MarketplaceFaqSectionProps {
  itemType?: ItemType | string;
  providerName?: string;
}

export function MarketplaceFaqSection({ itemType, providerName }: MarketplaceFaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const getFaqs = () => {
    const baseFaqs = [
      {
        question: "¿Qué métodos de pago son aceptados?",
        answer:
          "Aceptamos tarjetas de débito y crédito (Visa, Mastercard, American Express), transferencias electrónicas SPEI interbancarias, financiamiento a Meses Sin Intereses con tarjetas participantes y pagos en efectivo en tiendas de conveniencia OXXO.",
        icon: <CreditCard className="w-4 h-4 text-emerald-600" />,
      },
      {
        question: "¿Puedo solicitar factura fiscal CFDI 4.0 de mi compra?",
        answer:
          "Sí, todas las transacciones realizadas en QuHealthy cuentan con facturación electrónica automática conforme al SAT (CFDI 4.0). Al completar tu pago, podrás ingresar tu RFC, Razón Social y Régimen Fiscal para recibir tu XML y PDF directamente a tu correo.",
        icon: <FileCheck className="w-4 h-4 text-emerald-600" />,
      },
      {
        question: "¿Cómo se protege mi compra y la privacidad de mis datos?",
        answer:
          "Toda la información bancaria y médica está encriptada bajo el estándar bancario AES-256 y procesada de forma segura mediante Stripe. Cumplimos con la Norma Oficial Mexicana NOM-004-SSA3 y la Ley Federal de Protección de Datos Personales.",
        icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
      },
    ];

    if (itemType === "COURSE") {
      return [
        {
          question: "¿Cómo y cuándo tengo acceso al curso una vez realizado el pago?",
          answer:
            "El acceso es 100% inmediato y automático. En cuanto se confirma tu pago, se desbloquea tu aula virtual en QuHealthy y podrás ver todas las lecciones en video, descargar los manuales en PDF y comenzar a estudiar al instante desde cualquier computadora, tablet o smartphone.",
          icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
        },
        {
          question: "¿El curso incluye certificado con validez oficial?",
          answer:
            "Sí, al completar todas las lecciones y aprobar las evaluaciones prácticas con el puntaje mínimo requerido, el sistema genera automáticamente tu Certificado Digital con folio único y código QR de verificación curricular respaldado por el especialista emisor.",
          icon: <FileCheck className="w-4 h-4 text-emerald-600" />,
        },
        {
          question: "¿Por cuánto tiempo tendré acceso al material del curso?",
          answer:
            "El acceso es de por vida (vitalicio). Podrás repasar las clases, consultar las guías descargables y acceder a cualquier actualización futura del temario sin ningún costo adicional.",
          icon: <Clock className="w-4 h-4 text-emerald-600" />,
        },
        ...baseFaqs,
      ];
    }

    if (itemType === "PACKAGE") {
      return [
        {
          question: "¿Cómo funciona el agendamiento de las citas del paquete?",
          answer:
            "Tras adquirir el paquete, las sesiones quedan acreditadas en tu cuenta de paciente. Puedes agendar tu primera consulta de inmediato y programar las citas subsecuentes conforme avance tu tratamiento según tu conveniencia.",
          icon: <Clock className="w-4 h-4 text-emerald-600" />,
        },
        {
          question: "¿Qué vigencia tengo para canjear todas las sesiones del paquete?",
          answer:
            "Cuentas con una vigencia de hasta 12 meses naturales a partir de la fecha de compra para disfrutar de todas las consultas, estudios o procedimientos incluidos.",
          icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
        },
        ...baseFaqs,
      ];
    }

    if (itemType === "SERVICE") {
      return [
        {
          question: "¿Cómo confirmo la fecha y hora de mi cita médica?",
          answer:
            "Puedes seleccionar el horario disponible en tiempo real en el calendario del especialista al momento de la compra, o bien apartar la consulta y agendar el día que mejor te convenga desde tu panel de paciente.",
          icon: <Clock className="w-4 h-4 text-emerald-600" />,
        },
        {
          question: "¿Cuál es la política de cancelación o reagendamiento?",
          answer:
            "Puedes reagendar tu cita sin costo hasta 24 horas antes de la consulta directamente desde tu portal de paciente QuHealthy.",
          icon: <RotateCcw className="w-4 h-4 text-emerald-600" />,
        },
        ...baseFaqs,
      ];
    }

    return baseFaqs;
  };

  const faqs = getFaqs();

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c0c0c] border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6 font-sans select-none">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white tracking-tight">
            Preguntas Frecuentes & Garantías
          </h3>
          <p className="text-xs text-gray-500 font-medium">
            Respuestas a las dudas más comunes sobre tu compra y proceso de atención
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={cn(
                "rounded-2xl border transition-all overflow-hidden",
                isOpen
                  ? "border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/10"
                  : "border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-[#121212]"
              )}
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="shrink-0">{faq.icon}</div>
                  <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white">
                    {faq.question}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-gray-400 transition-transform shrink-0",
                    isOpen && "rotate-180 text-emerald-600"
                  )}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs text-gray-600 dark:text-gray-300 leading-relaxed border-t border-emerald-100/60 dark:border-emerald-900/30">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
