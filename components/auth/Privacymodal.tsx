"use client"
/* eslint-disable react-doctor/prefer-module-scope-static-value */
/* eslint-disable react-doctor/no-giant-component */;

import React from 'react';
import { motion } from 'framer-motion';
import { X, Shield, Lock, Eye, Database, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * PrivacyModal Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. CREDIBILIDAD
 *    - GDPR compliance mentions
 *    - Clear data usage
 *    - Security certifications
 *    - Professional language
 * 
 * 2. MINIMIZAR ANSIEDAD
 *    - Transparent data collection
 *    - User rights highlighted
 *    - No hidden clauses
 *    - Easy to understand
 * 
 * 3. RECONOCIMIENTO
 *    - Icon-based sections
 *    - Visual hierarchy
 *    - Scannable content
 *    - Quick summary
 */

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  const lastUpdated = "15 de Enero, 2025";

  const keyCommitments = [
    "Nunca vendemos tu información personal",
    "Cifrado de extremo a extremo",
    "Puedes eliminar tu cuenta en cualquier momento",
    "Cumplimiento total con GDPR y leyes mexicanas"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col overflow-hidden bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 rounded-none max-w-4xl max-h-[90vh] p-0">
        
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 dark:bg-[#111111] rounded-none">
                <Shield className="w-6 h-6 text-black dark:text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-black dark:text-white mb-1">
                  Política de Privacidad
                </DialogTitle>
                <DialogDescription className="text-gray-500 dark:text-gray-400">
                  QuHealthy - Última actualización: {lastUpdated}
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Key Commitments */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-none p-4"
          >
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-black dark:text-white flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-black dark:text-white mb-2">
                  Nuestro Compromiso Contigo:
                </p>
                <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                  {keyCommitments.map((commitment, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span>{commitment}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          <div className="space-y-6 py-6 text-gray-700 dark:text-gray-300">
            
            {/* Introduction */}
            <section className="space-y-3">
              <p className="text-sm leading-relaxed">
                En QuHealthy, tu privacidad es fundamental. Esta Política de Privacidad explica cómo recopilamos, usamos, compartimos y protegemos tu información personal cuando utilizas nuestra plataforma.
              </p>
              <p className="text-sm leading-relaxed">
                Al utilizar QuHealthy, aceptas las prácticas descritas en esta política. Si no estás de acuerdo, por favor no uses nuestros servicios.
              </p>
            </section>

            {/* Section 1: Data Collection */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500/10 text-black dark:text-white border-blue-500/20">
                  <Database className="w-3 h-3 mr-1" />
                  1
                </Badge>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  Información que Recopilamos
                </h3>
              </div>
              
              <div className="space-y-3 ml-4">
                <div>
                  <h4 className="text-sm font-semibold text-black dark:text-white mb-2">
                    1.1 Información que Proporcionas Directamente:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-500 dark:text-gray-400">
                    <li>Datos de registro: nombre, email, teléfono, contraseña</li>
                    <li>Información de perfil: foto, especialidad (para proveedores)</li>
                    <li>Datos médicos: historial, alergias, condiciones (opcional)</li>
                    <li>Información de pago: tarjetas, métodos de pago</li>
                    <li>Comunicaciones: mensajes, reseñas, comentarios</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-black dark:text-white mb-2">
                    1.2 Información Recopilada Automáticamente:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-500 dark:text-gray-400">
                    <li>Datos de uso: páginas visitadas, tiempo de uso, clicks</li>
                    <li>Información del dispositivo: IP, navegador, sistema operativo</li>
                    <li>Ubicación geográfica: ciudad, país (con tu permiso)</li>
                    <li>Cookies y tecnologías similares</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 2: Data Usage */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-black text-white dark:bg-white dark:text-black rounded-none border-0">
                  <Eye className="w-3 h-3 mr-1" />
                  2
                </Badge>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  Cómo Utilizamos tu Información
                </h3>
              </div>
              
              <p className="text-sm leading-relaxed ml-4">
                Utilizamos tu información personal para:
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-500 dark:text-gray-400 ml-8">
                <li><strong>Proporcionar servicios:</strong> Procesar citas, pagos y comunicaciones</li>
                <li><strong>Mejorar la plataforma:</strong> Analizar el uso y optimizar funcionalidades</li>
                <li><strong>Personalización:</strong> Recomendaciones de proveedores según tus necesidades</li>
                <li><strong>Comunicación:</strong> Recordatorios de citas, actualizaciones del servicio</li>
                <li><strong>Seguridad:</strong> Prevenir fraude y proteger tu cuenta</li>
                <li><strong>Cumplimiento legal:</strong> Responder a requisitos legales y regulatorios</li>
              </ul>
            </section>

            {/* Section 3: Data Sharing */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500/10 text-black dark:text-white border-emerald-500/20">
                  <UserCheck className="w-3 h-3 mr-1" />
                  3
                </Badge>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  Compartir tu Información
                </h3>
              </div>
              
              <p className="text-sm leading-relaxed ml-4">
                <strong>Nunca vendemos tu información personal.</strong> Solo compartimos datos en estos casos:
              </p>
              
              <div className="space-y-2 ml-4">
                <div className="bg-gray-50 dark:bg-[#111111] rounded-lg p-3 border border-gray-200 dark:border-gray-800">
                  <h4 className="text-sm font-semibold text-black dark:text-white mb-1">Con Proveedores de Servicios:</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Compartimos información necesaria con los profesionales de salud/belleza que reservas.
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-[#111111] rounded-lg p-3 border border-gray-200 dark:border-gray-800">
                  <h4 className="text-sm font-semibold text-black dark:text-white mb-1">Con Procesadores de Pago:</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Stripe y otros procesadores reciben solo la información necesaria para completar transacciones.
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-[#111111] rounded-lg p-3 border border-gray-200 dark:border-gray-800">
                  <h4 className="text-sm font-semibold text-black dark:text-white mb-1">Por Requerimiento Legal:</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Cuando sea requerido por ley, orden judicial o autoridades gubernamentales.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: Data Security */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-black text-white dark:bg-white dark:text-black rounded-none border-0">
                  <Lock className="w-3 h-3 mr-1" />
                  4
                </Badge>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  Seguridad de tus Datos
                </h3>
              </div>
              
              <p className="text-sm leading-relaxed ml-4">
                Implementamos múltiples capas de seguridad:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-4">
                <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-none p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-black dark:text-white" />
                    <h4 className="text-sm font-semibold text-black dark:text-white">Cifrado SSL</h4>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Todas las comunicaciones están cifradas
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-none p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="w-4 h-4 text-black dark:text-white" />
                    <h4 className="text-sm font-semibold text-black dark:text-white">Autenticación 2FA</h4>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Protección adicional disponible
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-none p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="w-4 h-4 text-black dark:text-white" />
                    <h4 className="text-sm font-semibold text-black dark:text-white">Almacenamiento Seguro</h4>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Servidores protegidos y monitoreados
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-none p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <UserCheck className="w-4 h-4 text-black dark:text-white" />
                    <h4 className="text-sm font-semibold text-black dark:text-white">Acceso Limitado</h4>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Solo personal autorizado
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5: Your Rights */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-black text-white dark:bg-white dark:text-black rounded-none border-0">
                  5
                </Badge>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  Tus Derechos
                </h3>
              </div>
              
              <p className="text-sm leading-relaxed ml-4">
                Tienes derecho a:
              </p>
              
              <ul className="space-y-2 text-sm ml-4">
                {[
                  { title: 'Acceso', desc: 'Solicitar una copia de tus datos personales' },
                  { title: 'Corrección', desc: 'Actualizar información incorrecta o incompleta' },
                  { title: 'Eliminación', desc: 'Solicitar la eliminación de tu cuenta y datos' },
                  { title: 'Portabilidad', desc: 'Recibir tus datos en formato estructurado' },
                  { title: 'Objeción', desc: 'Oponerte al procesamiento de tus datos' },
                  { title: 'Restricción', desc: 'Limitar cómo usamos tu información' }
                ].map((right, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-500 dark:text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-black dark:text-white flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-black dark:text-white">{right.title}:</strong> {right.desc}
                    </span>
                  </li>
                ))}
              </ul>
              
              <p className="text-sm text-blue-300 ml-4 mt-3">
                Para ejercer estos derechos, contáctanos en <strong>privacy@quhealthy.com</strong>
              </p>
            </section>

            {/* Section 6: Cookies */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-black text-white dark:bg-white dark:text-black rounded-none border-0">
                  6
                </Badge>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  Cookies y Tecnologías Similares
                </h3>
              </div>
              
              <p className="text-sm leading-relaxed ml-4">
                Utilizamos cookies para mejorar tu experiencia. Puedes controlarlas desde la configuración de tu navegador.
              </p>
              
              <div className="bg-gray-50 dark:bg-[#111111] rounded-lg p-3 border border-gray-200 dark:border-gray-800 ml-4">
                <h4 className="text-sm font-semibold text-black dark:text-white mb-2">Tipos de cookies:</h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-gray-500 dark:text-gray-400">
                  <li><strong>Esenciales:</strong> Necesarias para el funcionamiento básico</li>
                  <li><strong>Funcionales:</strong> Recuerdan tus preferencias</li>
                  <li><strong>Analíticas:</strong> Nos ayudan a entender el uso de la plataforma</li>
                  <li><strong>Publicitarias:</strong> Personalizan anuncios (puedes desactivarlas)</li>
                </ul>
              </div>
            </section>

            {/* Section 7: Children's Privacy */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-black text-white dark:bg-white dark:text-black rounded-none border-0">
                  7
                </Badge>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  Privacidad de Menores
                </h3>
              </div>
              
              <p className="text-sm leading-relaxed ml-4">
                QuHealthy no está dirigido a menores de 18 años. Si descubrimos que hemos recopilado información de un menor sin consentimiento parental, la eliminaremos inmediatamente.
              </p>
            </section>

            {/* Section 8: Changes */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-black text-white dark:bg-white dark:text-black rounded-none border-0">
                  8
                </Badge>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  Cambios a esta Política
                </h3>
              </div>
              
              <p className="text-sm leading-relaxed ml-4">
                Podemos actualizar esta política ocasionalmente. Te notificaremos de cambios significativos por email o mediante un aviso destacado en la plataforma.
              </p>
            </section>

            {/* Section 9: Contact */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-black text-white dark:bg-white dark:text-black rounded-none border-0">
                  9
                </Badge>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  Contacto
                </h3>
              </div>
              
              <p className="text-sm leading-relaxed ml-4">
                Para preguntas sobre privacidad:
              </p>
              
              <div className="bg-gray-50 dark:bg-[#111111] rounded-lg p-4 space-y-2 text-sm ml-4">
                <p><strong>Email:</strong> privacy@quhealthy.com</p>
                <p><strong>Responsable de Datos:</strong> QuHealthy Data Protection Officer</p>
                <p><strong>Teléfono:</strong> +52 55 1234 5678</p>
                <p><strong>Dirección:</strong> Av. Reforma 123, CDMX, México</p>
              </div>
            </section>

            {/* Important Notice */}
            <div className="bg-gray-50 dark:bg-[#111111] border-t border-gray-200 dark:border-gray-800 rounded-none p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-black dark:text-white flex-shrink-0 mt-0.5" />
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <p className="font-semibold text-black dark:text-white mb-1">
                  Cumplimiento GDPR y Leyes Mexicanas
                </p>
                <p>
                  Esta política cumple con el Reglamento General de Protección de Datos (GDPR) de la UE y la Ley Federal de Protección de Datos Personales en Posesión de Particulares de México.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3 flex-shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-800"
          >
            Cerrar
          </Button>
          <Button
            onClick={onClose}
            className="bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 rounded-none"
          >
            <Shield className="w-4 h-4 mr-2" />
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}