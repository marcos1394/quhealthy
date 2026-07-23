"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-static-value */

import React from 'react';
import { motion } from 'framer-motion';
import { X, FileText, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export default function TermsModal({ isOpen, onClose, onAccept }: TermsModalProps) {
  const lastUpdated = "15 de Enero, 2025";

  const keyPoints = [
    "Uso profesional exclusivo para proveedores de salud y bienestar",
    "Protección y privacidad de datos personales garantizada",
    "Cancelación de servicios en cualquier momento",
    "Comisión del 10% por transacción exitosa procesada"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[88vh] font-sans">
        
        {/* --- HEADER --- */}
        <DialogHeader className="p-6 pb-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shrink-0 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              </div>
              <div>
                <DialogTitle className="text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-tight">
                  Términos y Condiciones de Servicio
                </DialogTitle>
                <DialogDescription className="text-xs font-semibold text-gray-500 mt-0.5">
                  QuHealthy Platform • Última actualización: {lastUpdated}
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

          {/* Tarjeta de Puntos Clave */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0 mt-0.5">
                <Shield className="w-4 h-4 text-emerald-700 dark:text-emerald-400" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1.5">
                  Resumen de Puntos Clave:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400/90">
                  {keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="leading-snug">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </DialogHeader>

        {/* --- CONTENIDO SCROLLABLE --- */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/40 dark:bg-[#050505] custom-scrollbar">
          
          {/* Sección 1 */}
          <section className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Aceptación de Términos
              </h3>
            </div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed pl-8">
              Al crear una cuenta en QuHealthy, usted acepta estar legalmente vinculado por estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestra plataforma.
            </p>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed pl-8">
              QuHealthy se reserva el derecho de modificar estos términos en cualquier momento. Los cambios significativos serán notificados a través de la plataforma o por correo electrónico con al menos 30 días de anticipación.
            </p>
          </section>

          {/* Sección 2 */}
          <section className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Uso de la Plataforma
              </h3>
            </div>
            <div className="space-y-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed pl-8">
              <p><strong className="text-gray-900 dark:text-white">2.1 Elegibilidad:</strong> Para utilizar QuHealthy como proveedor, debe ser un profesional de la salud o bienestar debidamente certificado y autorizado para ejercer en su jurisdicción.</p>
              <p><strong className="text-gray-900 dark:text-white">2.2 Cuenta del Usuario:</strong> Usted es responsable de mantener la confidencialidad de su cuenta y contraseña. Cualquier actividad que ocurra bajo su cuenta es su responsabilidad.</p>
              <p><strong className="text-gray-900 dark:text-white">2.3 Uso Prohibido:</strong> No puede utilizar la plataforma para actividades ilegales, fraudulentas o que violen derechos de terceros.</p>
            </div>
          </section>

          {/* Sección 3 */}
          <section className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Servicios y Tarifas
              </h3>
            </div>
            <div className="space-y-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed pl-8">
              <p><strong className="text-gray-900 dark:text-white">3.1 Comisiones:</strong> QuHealthy cobra una comisión del 10% sobre cada transacción exitosa realizada a través de la plataforma.</p>
              <p><strong className="text-gray-900 dark:text-white">3.2 Pagos:</strong> Los pagos se procesarán de forma automática y se depositarán en su cuenta bancaria registrada dentro de 5-7 días hábiles.</p>
              <p><strong className="text-gray-900 dark:text-white">3.3 Reembolsos:</strong> Las políticas de cancelación y reembolso establecidas por usted serán respetadas. QuHealthy no se hace responsable de disputas directas entre proveedores y pacientes.</p>
            </div>
          </section>

          {/* Sección 4 */}
          <section className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                4
              </span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Privacidad y Protección de Datos
              </h3>
            </div>
            <div className="space-y-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed pl-8">
              <p><strong className="text-gray-900 dark:text-white">4.1 Recopilación de Datos:</strong> Recopilamos información necesaria para proporcionar nuestros servicios, incluyendo datos de contacto, información profesional y datos de transacciones.</p>
              <p><strong className="text-gray-900 dark:text-white">4.2 Uso de Datos:</strong> Sus datos se utilizan exclusivamente para operar la plataforma, procesar pagos y mejorar nuestros servicios. Nunca vendemos información personal a terceros.</p>
              <p><strong className="text-gray-900 dark:text-white">4.3 Seguridad:</strong> Implementamos medidas de seguridad estándar de la industria para proteger su información, incluyendo encriptación SSL y autenticación de dos factores.</p>
            </div>
          </section>

          {/* Sección 5 */}
          <section className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                5
              </span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Responsabilidades del Proveedor
              </h3>
            </div>
            <div className="space-y-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed pl-8">
              <p><strong className="text-gray-900 dark:text-white">5.1 Licencias y Certificaciones:</strong> Usted garantiza que posee todas las licencias, permisos y certificaciones necesarias para ejercer su profesión.</p>
              <p><strong className="text-gray-900 dark:text-white">5.2 Calidad del Servicio:</strong> Es su responsabilidad proporcionar servicios de calidad profesional y mantener estándares éticos en su práctica.</p>
              <p><strong className="text-gray-900 dark:text-white">5.3 Disponibilidad:</strong> Debe mantener actualizado su calendario y confirmar o cancelar citas de manera oportuna.</p>
            </div>
          </section>

          {/* Sección 6 */}
          <section className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                6
              </span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Limitación de Responsabilidad
              </h3>
            </div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed pl-8">
              QuHealthy actúa como plataforma intermediaria y no asume responsabilidad por:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs font-medium text-gray-600 dark:text-gray-300 pl-12">
              <li>La calidad de los servicios proporcionados por los proveedores</li>
              <li>Disputas entre proveedores y pacientes</li>
              <li>Errores médicos o profesionales</li>
              <li>Pérdidas indirectas o consecuentes</li>
            </ul>
          </section>

          {/* Sección 7 */}
          <section className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                7
              </span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Terminación de Cuenta
              </h3>
            </div>
            <div className="space-y-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed pl-8">
              <p><strong className="text-gray-900 dark:text-white">7.1 Por el Usuario:</strong> Puede cancelar su cuenta en cualquier momento desde la configuración de su perfil. Los pagos pendientes serán procesados según lo acordado.</p>
              <p><strong className="text-gray-900 dark:text-white">7.2 Por QuHealthy:</strong> Nos reservamos el derecho de suspender o terminar cuentas que violen estos términos, con notificación previa de 15 días salvo en casos de fraude o actividad ilegal.</p>
            </div>
          </section>

          {/* Sección 8 */}
          <section className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                8
              </span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Ley Aplicable y Jurisdicción
              </h3>
            </div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed pl-8">
              Estos términos se rigen por las leyes de México. Cualquier disputa será resuelta en los tribunales competentes de la Ciudad de México.
            </p>
          </section>

          {/* Sección 9 */}
          <section className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                9
              </span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Contacto Legal
              </h3>
            </div>
            <div className="bg-gray-50 dark:bg-[#050505] rounded-xl p-3.5 border border-gray-100 dark:border-gray-800 space-y-1 text-xs font-semibold text-gray-700 dark:text-gray-300 ml-8">
              <p><span className="text-gray-400">Email:</span> legal@quhealthy.org</p>
              <p><span className="text-gray-400">Teléfono:</span> +52 55 1234 5678</p>
              <p><span className="text-gray-400">Dirección:</span> Av. Reforma 123, CDMX, México</p>
            </div>
          </section>

          {/* Aviso Importante */}
          <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" strokeWidth={2} />
            <div className="text-xs font-medium text-amber-800 dark:text-amber-300 space-y-0.5">
              <p className="font-bold text-amber-900 dark:text-amber-200">
                Aviso Importante
              </p>
              <p>
                Al hacer clic en "He leído y acepto", confirma que ha comprendido y acepta estar vinculado por estos Términos y Condiciones, así como por nuestra Política de Privacidad.
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
            onClick={onAccept ? onAccept : onClose}
            className="h-11 px-7 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
            <span>He Leído y Acepto</span>
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
}