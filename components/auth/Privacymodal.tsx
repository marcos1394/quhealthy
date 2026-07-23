"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-static-value */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  const lastUpdated = "15 de Enero, 2025";

  const keyCommitments = [
    "Nunca vendemos ni comercializamos tu información personal",
    "Cifrado de grado médico de extremo a extremo",
    "Puedes solicitar la eliminación de tu cuenta en cualquier momento",
    "Cumplimiento integral con GDPR, HIPAA y legislación mexicana"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[88vh] font-sans">
        
        {/* --- HEADER --- */}
        <DialogHeader className="p-6 pb-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shrink-0 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              </div>
              <div>
                <DialogTitle className="text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-tight">
                  Aviso y Política de Privacidad
                </DialogTitle>
                <DialogDescription className="text-xs font-semibold text-gray-500 mt-0.5">
                  QuHealthy • Última actualización: {lastUpdated}
                </DialogDescription>
              </div>
            </div>

            <button 
              type="button"
              onClick={onClose} 
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
            >
              <X className="w-4 h-4 text-gray-500" strokeWidth={2} />
            </button>
          </div>

          {/* Tarjeta de Compromisos de Privacidad */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-4 h-4 text-emerald-700 dark:text-emerald-400" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1.5">
                  Nuestro Compromiso de Privacidad:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400/90">
                  {keyCommitments.map((commitment, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="leading-snug">{commitment}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </DialogHeader>

        {/* --- CONTENIDO SCROLLABLE --- */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/40 dark:bg-[#050505] custom-scrollbar">
          
          {/* Introducción */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-2">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
              En QuHealthy, tu privacidad es fundamental. Esta Política de Privacidad explica de forma transparente cómo recopilamos, usamos, compartimos y protegemos tu información personal y médica cuando utilizas nuestra plataforma.
            </p>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
              Al hacer uso de nuestros servicios, aceptas las prácticas descritas en este documento.
            </p>
          </div>

          {/* Sección 1: Recopilación */}
          <section className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Información que Recopilamos
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-8">
              <div className="bg-gray-50/50 dark:bg-[#050505] p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-1.5">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  1.1 Datos que Proporcionas Directamente:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  <li>Datos de registro: nombre, email, teléfono, contraseña</li>
                  <li>Información de perfil: foto, especialidad y cédula</li>
                  <li>Datos médicos opcionales: historial, alergias, antecedentes</li>
                  <li>Información para facturación y pagos</li>
                </ul>
              </div>

              <div className="bg-gray-50/50 dark:bg-[#050505] p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-1.5">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  1.2 Datos Recopilados Automáticamente:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  <li>Telemetría de uso y navegación en la plataforma</li>
                  <li>Información técnica del dispositivo e IP</li>
                  <li>Ubicación geográfica general para búsqueda local</li>
                  <li>Cookies esenciales de sesión</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sección 2: Uso de datos */}
          <section className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Cómo Utilizamos tu Información
              </h3>
            </div>
            
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-gray-600 dark:text-gray-300 pl-8">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" /><strong>Procesamiento de citas:</strong> Gestión de agendamiento y avisos.</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" /><strong>Mejora continua:</strong> Optimización de flujos y herramientas clínicas.</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" /><strong>Notificaciones:</strong> Recordatorios de consulta y confirmaciones.</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" /><strong>Seguridad activa:</strong> Prevención de fraude y protección de cuentas.</li>
            </ul>
          </section>

          {/* Sección 3: Compartir información */}
          <section className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Traspaso y Compartición de Datos
              </h3>
            </div>
            
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 pl-8">
              Garantía Estricta: Nunca vendemos ni rentamos tus datos a terceros con fines comerciales.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pl-8">
              <div className="bg-gray-50/50 dark:bg-[#050505] p-3 rounded-xl border border-gray-100 dark:border-gray-800 space-y-1">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Especialistas</h4>
                <p className="text-[11px] font-medium text-gray-500">Solo con los profesionales con quienes agendas cita activa.</p>
              </div>
              <div className="bg-gray-50/50 dark:bg-[#050505] p-3 rounded-xl border border-gray-100 dark:border-gray-800 space-y-1">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Procesadores de Pago</h4>
                <p className="text-[11px] font-medium text-gray-500">Pasarelas cifradas (Stripe) estrictamente para cobros.</p>
              </div>
              <div className="bg-gray-50/50 dark:bg-[#050505] p-3 rounded-xl border border-gray-100 dark:border-gray-800 space-y-1">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Requerimiento Legal</h4>
                <p className="text-[11px] font-medium text-gray-500">Exclusivamente bajo orden judicial o regulatoria válida.</p>
              </div>
            </div>
          </section>

          {/* Sección 4: Capas de Seguridad */}
          <section className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                4
              </span>
              <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Infraestructura de Seguridad
              </h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pl-8">
              <div className="bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-xl p-3 text-center space-y-1">
                <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" strokeWidth={2} />
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Cifrado TLS/SSL</h4>
                <p className="text-[10px] text-gray-400 font-medium">Tráfico protegido</p>
              </div>

              <div className="bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-xl p-3 text-center space-y-1">
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" strokeWidth={2} />
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Autenticación 2FA</h4>
                <p className="text-[10px] text-gray-400 font-medium">Capas de acceso</p>
              </div>

              <div className="bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-xl p-3 text-center space-y-1">
                <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" strokeWidth={2} />
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Bases Aisladas</h4>
                <p className="text-[10px] text-gray-400 font-medium">Cifrado en reposo</p>
              </div>

              <div className="bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-xl p-3 text-center space-y-1">
                <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" strokeWidth={2} />
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Auditoría Cómputo</h4>
                <p className="text-[10px] text-gray-400 font-medium">Logs de acceso</p>
              </div>
            </div>
          </section>

          {/* Sección 5: Derechos ARCO */}
          <section className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                5
              </span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Tus Derechos de Privacidad (Derechos ARCO)
              </h3>
            </div>
            
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-gray-600 dark:text-gray-300 pl-8">
              {[
                { title: 'Acceso', desc: 'Solicita copia de todos tus datos.' },
                { title: 'Rectificación', desc: 'Corrige información desactualizada.' },
                { title: 'Cancelación', desc: 'Solicita la eliminación total de tus registros.' },
                { title: 'Oposición', desc: 'Opónte a usos específicos de procesamiento.' }
              ].map((right, index) => (
                <li key={index} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2} />
                  <span><strong className="text-gray-900 dark:text-white">{right.title}:</strong> {right.desc}</span>
                </li>
              ))}
            </ul>
            
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 pl-8 pt-1">
              Para ejercer cualquiera de tus derechos escribe a: privacy@quhealthy.org
            </p>
          </section>

          {/* Sección 6: Contacto */}
          <section className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                6
              </span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Contacto Oficial de Privacidad
              </h3>
            </div>
            <div className="bg-gray-50 dark:bg-[#050505] rounded-xl p-3.5 border border-gray-100 dark:border-gray-800 space-y-1 text-xs font-semibold text-gray-700 dark:text-gray-300 ml-8">
              <p><span className="text-gray-400">Email:</span> privacy@quhealthy.org</p>
              <p><span className="text-gray-400">Oficial de Protección:</span> QuHealthy Data Protection Officer</p>
              <p><span className="text-gray-400">Dirección:</span> Av. Reforma 123, CDMX, México</p>
            </div>
          </section>

          {/* Cumplimiento normativo */}
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2} />
            <div className="text-xs font-medium text-emerald-800 dark:text-emerald-300 space-y-0.5">
              <p className="font-bold text-emerald-900 dark:text-emerald-200">
                Cumplimiento GDPR & Leyes Mexicanas (LFPDPPP)
              </p>
              <p>
                Esta política garantiza los más altos estándares normativos europeos e internacionales para el resguardo de información clínica sensible.
              </p>
            </div>
          </div>

        </div>

        {/* --- FOOTER --- */}
        <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-11 px-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold shadow-sm"
          >
            Cerrar
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="h-11 px-7 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" strokeWidth={2} />
            <span>Entendido</span>
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
}