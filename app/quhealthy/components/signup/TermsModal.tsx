/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, ScrollText, Shield, CheckCircle2, Clock } from 'lucide-react';

interface TermsModalProps {
  onAccept: () => void;
  children: React.ReactNode;
}

export const TermsModal: React.FC<TermsModalProps> = ({ onAccept, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!contentRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const scrollableHeight = scrollHeight - clientHeight;
    const progress = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 100;
    
    setReadingProgress(progress);
    
    // Consider "end" when user has scrolled 95% of the content
    if (progress >= 95) {
      setIsScrolledToEnd(true);
    }
  };

  const handleAcceptAndClose = () => {
    onAccept();
    setIsOpen(false);
    setIsScrolledToEnd(false);
    setReadingProgress(0);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsScrolledToEnd(false);
    setReadingProgress(0);
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) {
    return (
      <span onClick={() => setIsOpen(true)} className="cursor-pointer">
        {children}
      </span>
    );
  }

  return (
<div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/80 backdrop-blur-sm">
<div className="w-full max-w-4xl max-h-[90vh] bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <ScrollText className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Términos y Condiciones</h2>
              <p className="text-sm text-gray-400">QuHealthy - Marketplace de Salud y Belleza</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reading Progress Bar */}
        <div className="h-1 bg-gray-800">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${readingProgress}%` }}
          />
        </div>

        {/* Content */}
        <div 
          ref={contentRef}
          className="flex-1 overflow-y-auto p-6 text-gray-300 leading-relaxed"
          onScroll={handleScroll}
        >
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-4 border border-purple-500/20">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <p className="text-sm text-purple-400 font-medium">Última actualización: 5 de Septiembre de 2025</p>
              </div>
              <p className="text-sm text-gray-400">
                Al registrarte como proveedor en QuHealthy, aceptas cumplir con estos términos y condiciones.
              </p>
            </div>
            
            <section>
              <h3 className="text-2xl font-bold text-purple-300 mb-4 flex items-center">
                <Shield className="w-6 h-6 mr-2" />
                1. Términos y Condiciones de Uso
              </h3>
              
              <div className="space-y-4">
                <p className="text-base">
                  Bienvenido a QuHealthy, la plataforma líder que conecta profesionales de la salud y belleza con clientes que buscan servicios de calidad. Estos Términos y Condiciones rigen el uso de nuestra plataforma como proveedor de servicios.
                </p>

                <h4 className="text-xl font-semibold text-white mt-6 mb-3">1.1 Descripción del Servicio</h4>
                <p>
                  QuHealthy es un mercado digital que facilita la conexión entre usuarios ("Clientes") que buscan servicios de salud y belleza, y profesionales, clínicas o establecimientos ("Proveedores") que ofrecen dichos servicios. 
                </p>
                <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4 my-4">
                  <p className="text-amber-200 text-sm">
                    <strong>Importante:</strong> QuHealthy actúa únicamente como intermediario tecnológico. No somos proveedores de servicios médicos, de salud o de belleza, ni empleamos a dichos proveedores. La calidad, seguridad y legalidad de los servicios son responsabilidad exclusiva del proveedor.
                  </p>
                </div>

                <h4 className="text-xl font-semibold text-white mt-6 mb-3">1.2 Elegibilidad y Registro</h4>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Debes ser mayor de 18 años y estar legalmente autorizado para prestar los servicios que ofreces</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Toda la información proporcionada debe ser veraz, precisa y completa</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Eres responsable de mantener actualizados tus datos y credenciales profesionales</span>
                  </li>
                </ul>

                <h4 className="text-xl font-semibold text-white mt-6 mb-3">1.3 Obligaciones del Proveedor</h4>
                <p>Como proveedor en QuHealthy, te comprometes a:</p>
                <ul className="space-y-2 ml-4 mt-2">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-teal-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Prestar servicios profesionales de alta calidad</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-teal-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Mantener las licencias y certificaciones necesarias vigentes</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-teal-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Cumplir con todas las regulaciones sanitarias y legales aplicables</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-teal-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Mantener la confidencialidad de la información de los clientes</span>
                  </li>
                </ul>

                <h4 className="text-xl font-semibold text-white mt-6 mb-3">1.4 Pagos y Comisiones</h4>
                <p>
                  QuHealthy facilita los pagos entre clientes y proveedores. Cobramos una comisión del 8% sobre cada transacción exitosa. Los pagos se procesan de manera segura y se depositan en tu cuenta registrada según los términos de pago establecidos.
                </p>
              </div>
            </section>

            <section className="border-t border-gray-700 pt-6">
              <h3 className="text-2xl font-bold text-purple-300 mb-4">2. Política de Privacidad</h3>
              
              <p className="mb-4">
                De conformidad con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), QuHealthy S.A. de C.V. es responsable del tratamiento de tus datos personales.
              </p>

              <h4 className="text-xl font-semibold text-white mt-6 mb-3">2.1 Datos que Recopilamos</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/30 rounded-lg p-4">
                  <h5 className="font-medium text-teal-400 mb-2">Datos de Identificación</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Nombre completo</li>
                    <li>• Correo electrónico</li>
                    <li>• Número de teléfono</li>
                    <li>• Domicilio del negocio</li>
                  </ul>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-4">
                  <h5 className="font-medium text-teal-400 mb-2">Datos Profesionales</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Cédula profesional</li>
                    <li>• Certificaciones</li>
                    <li>• Especialidades</li>
                    <li>• Experiencia profesional</li>
                  </ul>
                </div>
              </div>

              <h4 className="text-xl font-semibold text-white mt-6 mb-3">2.2 Uso de los Datos</h4>
              <p>Utilizamos tus datos para:</p>
              <ul className="space-y-2 ml-4 mt-2">
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 mr-2 flex-shrink-0" />
                  <span>Verificar tu identidad y credenciales profesionales</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 mr-2 flex-shrink-0" />
                  <span>Facilitar la conexión con potenciales clientes</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 mr-2 flex-shrink-0" />
                  <span>Procesar pagos y generar reportes financieros</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-4 h-4 text-green-400 mt-1 mr-2 flex-shrink-0" />
                  <span>Mejorar nuestros servicios y experiencia de usuario</span>
                </li>
              </ul>

              <h4 className="text-xl font-semibold text-white mt-6 mb-3">2.3 Derechos ARCO</h4>
              <p>
                Tienes derecho a Acceder, Rectificar, Cancelar y Oponerte al tratamiento de tus datos personales. Para ejercer estos derechos, contacta a nuestro departamento de privacidad en: <span className="text-purple-400">privacidad@quhealthy.com</span>
              </p>
            </section>

            <section className="border-t border-gray-700 pt-6">
              <h3 className="text-2xl font-bold text-purple-300 mb-4">3. Responsabilidades y Limitaciones</h3>
              
              <h4 className="text-xl font-semibold text-white mt-4 mb-3">3.1 Responsabilidad del Proveedor</h4>
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 my-4">
                <p className="text-red-200 text-sm">
                  <strong>Importante:</strong> Como proveedor, eres completamente responsable de:
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• La calidad y seguridad de los servicios prestados</li>
                  <li>• El cumplimiento de todas las regulaciones sanitarias</li>
                  <li>• Mantener un seguro de responsabilidad profesional vigente</li>
                  <li>• Cualquier daño o perjuicio derivado de tus servicios</li>
                </ul>
              </div>

              <h4 className="text-xl font-semibold text-white mt-6 mb-3">3.2 Limitación de Responsabilidad de QuHealthy</h4>
              <p>
                QuHealthy no se hace responsable de la calidad, seguridad o resultado de los servicios prestados por los proveedores. Nuestra responsabilidad se limita al correcto funcionamiento de la plataforma tecnológica y la facilitación de conexiones entre proveedores y clientes.
              </p>

              <h4 className="text-xl font-semibold text-white mt-6 mb-3">3.3 Cancelaciones y Reembolsos</h4>
              <p>
                Cada proveedor debe establecer claramente sus políticas de cancelación y reembolso. QuHealthy puede mediar en disputas, pero la responsabilidad final recae en el proveedor del servicio.
              </p>
            </section>

            <section className="border-t border-gray-700 pt-6">
              <h3 className="text-2xl font-bold text-purple-300 mb-4">4. Uso de la Plataforma</h3>
              
              <h4 className="text-xl font-semibold text-white mt-4 mb-3">4.1 Contenido y Propiedad Intelectual</h4>
              <p>
                Todo el contenido de la plataforma es propiedad de QuHealthy. El contenido que subas (fotos, descripciones, etc.) sigue siendo de tu propiedad, pero nos otorgas una licencia para usarlo dentro de la plataforma para promocionar tus servicios.
              </p>

              <h4 className="text-xl font-semibold text-white mt-6 mb-3">4.2 Uso Prohibido</h4>
              <p>Está prohibido:</p>
              <ul className="space-y-2 ml-4 mt-2">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Proporcionar información falsa o engañosa</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Ofrecer servicios sin las licencias correspondientes</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Contactar a clientes fuera de la plataforma para evitar comisiones</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Usar la plataforma para actividades ilegales</span>
                </li>
              </ul>
            </section>

            <section className="border-t border-gray-700 pt-6">
              <h3 className="text-2xl font-bold text-purple-300 mb-4">5. Modificaciones y Terminación</h3>
              
              <h4 className="text-xl font-semibold text-white mt-4 mb-3">5.1 Modificaciones</h4>
              <p>
                Nos reservamos el derecho de modificar estos términos en cualquier momento. Te notificaremos sobre cambios importantes con al menos 30 días de anticipación.
              </p>

              <h4 className="text-xl font-semibold text-white mt-6 mb-3">5.2 Terminación</h4>
              <p>
                Cualquiera de las partes puede terminar este acuerdo en cualquier momento con un aviso de 30 días. QuHealthy puede suspender o terminar cuentas inmediatamente en caso de violación de estos términos.
              </p>
            </section>

            <section className="border-t border-gray-700 pt-6">
              <h3 className="text-2xl font-bold text-purple-300 mb-4">6. Disposiciones Finales</h3>
              
              <p className="mb-4">
                Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier disputa se resolverá en los tribunales competentes de Chihuahua, Chihuahua.
              </p>

              <div className="bg-gradient-to-r from-green-900/20 to-teal-900/20 rounded-xl p-6 border border-green-500/20 mt-8">
                <h4 className="text-lg font-bold text-green-400 mb-3 flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Confirmación de Aceptación
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Al hacer clic en "Acepto los términos y condiciones", confirmas que has leído, comprendes y estás de acuerdo con todos los términos establecidos en este documento. También confirmas que cumples con todos los requisitos legales y profesionales para ofrecer los servicios que planeas listar en QuHealthy.
                </p>
              </div>

              <div className="text-center mt-8 pt-6 border-t border-gray-700">
                <p className="text-sm text-gray-400">
                  ¿Tienes preguntas? Contacta a nuestro equipo de soporte en{' '}
                  <span className="text-purple-400">soporte@quhealthy.com</span>
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="p-6 border-t border-gray-700 bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isScrolledToEnd ? 'bg-green-400' : 'bg-gray-500'}`} />
              <span className="text-sm text-gray-400">
                {isScrolledToEnd ? 'Documento leído completamente' : `Progreso de lectura: ${Math.round(readingProgress)}%`}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-lg border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={handleAcceptAndClose}
                disabled={!isScrolledToEnd}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isScrolledToEnd
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isScrolledToEnd ? 'Acepto los términos y condiciones' : 'Lee hasta el final para continuar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};