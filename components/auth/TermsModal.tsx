"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

/**
 * TermsModal Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. CREDIBILIDAD
 *    - Professional legal formatting
 *    - Clear section headers
 *    - Last updated date
 *    - Official language
 * 
 * 2. RECONOCIMIENTO
 *    - Table of contents
 *    - Section numbers
 *    - Visual hierarchy
 *    - Easy navigation
 * 
 * 3. MINIMIZAR CARGA COGNITIVA
 *    - Scannable content
 *    - Highlighted key points
 *    - Summary badges
 *    - Clear structure
 */

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  const lastUpdated = "15 de Enero, 2025";

  const keyPoints = [
    "Uso profesional exclusivo para proveedores de salud y belleza",
    "Protección de datos personales garantizada",
    "Cancelación de servicios en cualquier momento",
    "Comisión del 10% por transacción exitosa"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 max-w-4xl max-h-[90vh] p-0">
        
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-gray-800">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <FileText className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-white mb-1">
                  Términos y Condiciones de Servicio
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  QuHealthy Platform - Última actualización: {lastUpdated}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="default"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Key Points Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-400 mb-2">
                  Puntos Clave:
                </p>
                <ul className="space-y-1.5 text-xs text-blue-300/80">
                  {keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="h-[600px] px-6">
          <div className="space-y-6 py-6 text-gray-300">
            
            {/* Section 1 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                  1
                </Badge>
                <h3 className="text-lg font-bold text-white">
                  Aceptación de Términos
                </h3>
              </div>
              <p className="text-sm leading-relaxed">
                Al crear una cuenta en QuHealthy, usted acepta estar legalmente vinculado por estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestra plataforma.
              </p>
              <p className="text-sm leading-relaxed">
                QuHealthy se reserva el derecho de modificar estos términos en cualquier momento. Los cambios significativos serán notificados a través de la plataforma o por correo electrónico con al menos 30 días de anticipación.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                  2
                </Badge>
                <h3 className="text-lg font-bold text-white">
                  Uso de la Plataforma
                </h3>
              </div>
              <p className="text-sm leading-relaxed">
                <strong>2.1 Elegibilidad:</strong> Para utilizar QuHealthy como proveedor, debe ser un profesional de la salud o belleza debidamente certificado y autorizado para ejercer en su jurisdicción.
              </p>
              <p className="text-sm leading-relaxed">
                <strong>2.2 Cuenta del Usuario:</strong> Usted es responsable de mantener la confidencialidad de su cuenta y contraseña. Cualquier actividad que ocurra bajo su cuenta es su responsabilidad.
              </p>
              <p className="text-sm leading-relaxed">
                <strong>2.3 Uso Prohibido:</strong> No puede utilizar la plataforma para actividades ilegales, fraudulentas o que violen derechos de terceros.
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                  3
                </Badge>
                <h3 className="text-lg font-bold text-white">
                  Servicios y Tarifas
                </h3>
              </div>
              <p className="text-sm leading-relaxed">
                <strong>3.1 Comisiones:</strong> QuHealthy cobra una comisión del 10% sobre cada transacción exitosa realizada a través de la plataforma.
              </p>
              <p className="text-sm leading-relaxed">
                <strong>3.2 Pagos:</strong> Los pagos se procesarán de forma automática y se depositarán en su cuenta bancaria registrada dentro de 5-7 días hábiles.
              </p>
              <p className="text-sm leading-relaxed">
                <strong>3.3 Reembolsos:</strong> Las políticas de cancelación y reembolso establecidas por usted serán respetadas. QuHealthy no se hace responsable de disputas entre proveedores y pacientes.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                  4
                </Badge>
                <h3 className="text-lg font-bold text-white">
                  Privacidad y Protección de Datos
                </h3>
              </div>
              <p className="text-sm leading-relaxed">
                <strong>4.1 Recopilación de Datos:</strong> Recopilamos información necesaria para proporcionar nuestros servicios, incluyendo datos de contacto, información profesional y datos de transacciones.
              </p>
              <p className="text-sm leading-relaxed">
                <strong>4.2 Uso de Datos:</strong> Sus datos se utilizan exclusivamente para operar la plataforma, procesar pagos y mejorar nuestros servicios. Nunca vendemos información personal a terceros.
              </p>
              <p className="text-sm leading-relaxed">
                <strong>4.3 Seguridad:</strong> Implementamos medidas de seguridad estándar de la industria para proteger su información, incluyendo encriptación SSL y autenticación de dos factores.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                  5
                </Badge>
                <h3 className="text-lg font-bold text-white">
                  Responsabilidades del Proveedor
                </h3>
              </div>
              <p className="text-sm leading-relaxed">
                <strong>5.1 Licencias y Certificaciones:</strong> Usted garantiza que posee todas las licencias, permisos y certificaciones necesarias para ejercer su profesión.
              </p>
              <p className="text-sm leading-relaxed">
                <strong>5.2 Calidad del Servicio:</strong> Es su responsabilidad proporcionar servicios de calidad profesional y mantener estándares éticos en su práctica.
              </p>
              <p className="text-sm leading-relaxed">
                <strong>5.3 Disponibilidad:</strong> Debe mantener actualizado su calendario y confirmar o cancelar citas de manera oportuna.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                  6
                </Badge>
                <h3 className="text-lg font-bold text-white">
                  Limitación de Responsabilidad
                </h3>
              </div>
              <p className="text-sm leading-relaxed">
                QuHealthy actúa como plataforma intermediaria y no asume responsabilidad por:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                <li>La calidad de los servicios proporcionados por los proveedores</li>
                <li>Disputas entre proveedores y pacientes</li>
                <li>Errores médicos o profesionales</li>
                <li>Pérdidas indirectas o consecuentes</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                  7
                </Badge>
                <h3 className="text-lg font-bold text-white">
                  Terminación de Cuenta
                </h3>
              </div>
              <p className="text-sm leading-relaxed">
                <strong>7.1 Por el Usuario:</strong> Puede cancelar su cuenta en cualquier momento desde la configuración de su perfil. Los pagos pendientes serán procesados según lo acordado.
              </p>
              <p className="text-sm leading-relaxed">
                <strong>7.2 Por QuHealthy:</strong> Nos reservamos el derecho de suspender o terminar cuentas que violen estos términos, con notificación previa de 15 días salvo en casos de fraude o actividad ilegal.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                  8
                </Badge>
                <h3 className="text-lg font-bold text-white">
                  Ley Aplicable y Jurisdicción
                </h3>
              </div>
              <p className="text-sm leading-relaxed">
                Estos términos se rigen por las leyes de México. Cualquier disputa será resuelta en los tribunales competentes de la Ciudad de México.
              </p>
            </section>

            {/* Section 9 */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                  9
                </Badge>
                <h3 className="text-lg font-bold text-white">
                  Contacto
                </h3>
              </div>
              <p className="text-sm leading-relaxed">
                Para preguntas sobre estos términos, contáctenos en:
              </p>
              <div className="bg-gray-950 rounded-lg p-4 space-y-2 text-sm">
                <p><strong>Email:</strong> legal@quhealthy.com</p>
                <p><strong>Teléfono:</strong> +52 55 1234 5678</p>
                <p><strong>Dirección:</strong> Av. Reforma 123, CDMX, México</p>
              </div>
            </section>

            {/* Important Notice */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-300/80">
                <p className="font-semibold text-amber-400 mb-1">
                  Aviso Importante
                </p>
                <p>
                  Al hacer clic en "Aceptar", confirma que ha leído, comprendido y acepta estar vinculado por estos Términos y Condiciones, así como por nuestra Política de Privacidad.
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Cerrar
          </Button>
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            He Leído y Acepto
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}