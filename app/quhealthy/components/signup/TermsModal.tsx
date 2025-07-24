"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsModalProps {
  onAccept: () => void;
  children: React.ReactNode;
}

export const TermsModal: React.FC<TermsModalProps> = ({ onAccept, children }) => {
  const [open, setOpen] = useState(false);
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 10) {
      setIsScrolledToEnd(true);
    }
  };

  const handleAcceptAndClose = () => {
    onAccept();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)} className="cursor-pointer">
        {children}
      </span>
      <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-3xl w-[95vw] h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl text-purple-400">Términos, Condiciones y Aviso de Privacidad</DialogTitle>
        </DialogHeader>

        {/* --- INICIO DE LA CORRECCIÓN --- */}
        {/* Se le da una altura calculada explícitamente al área de scroll */}
        <ScrollArea 
          className="flex-1 px-6 h-[calc(90vh-140px)]" // 140px es un aprox. para el header y footer
          onScroll={handleScroll}
        >
          <div className="space-y-4 text-gray-300 pb-6">
            <p className="text-xs text-gray-400">Última actualización: 24 de Julio de 2025</p>
            
            <h3 className="font-bold text-xl text-purple-300 pt-2">Términos y Condiciones de Uso</h3>
            <p className="leading-relaxed">Bienvenido a QuHealthy. Estos Términos y Condiciones rigen el uso de nuestra plataforma. Al acceder o utilizar nuestro servicio, usted acepta estar sujeto a estos términos. Si no está de acuerdo, no debe utilizar la plataforma.</p>
            
            <h4 className="font-semibold text-lg text-white pt-2">1. Descripción del Servicio</h4>
            <p className="leading-relaxed">QuHealthy ("la Plataforma") es un mercado digital que facilita la conexión entre usuarios ("Clientes") que buscan servicios de salud y belleza, y profesionales, clínicas o establecimientos ("Proveedores") que ofrecen dichos servicios. QuHealthy actúa como un intermediario tecnológico y no es un proveedor de servicios médicos, de salud o de belleza, ni emplea a dichos Proveedores. La calidad, seguridad y legalidad de los servicios ofrecidos son responsabilidad exclusiva del Proveedor.</p>

            <h4 className="font-semibold text-lg text-white pt-2">2. Cuentas y Elegibilidad</h4>
            <p className="leading-relaxed">Para utilizar la Plataforma, debe registrarse y crear una cuenta, garantizando que toda la información proporcionada es veraz, precisa y completa. Usted es el único responsable de mantener la confidencialidad de sus credenciales de acceso. Debe tener al menos 18 años para crear una cuenta.</p>

            <h4 className="font-semibold text-lg text-white pt-2">3. Pagos y Suscripciones</h4>
            <p className="leading-relaxed">Los pagos por servicios y suscripciones se realizarán a través de las pasarelas de pago integradas. Las tarifas, comisiones y términos de suscripción se especifican en la sección de Planes. QuHealthy utiliza tecnología segura para procesar todos los pagos.</p>
            
            <h3 className="font-bold text-xl mb-2 pt-6 text-purple-300">Aviso de Privacidad Integral</h3>
            <p className="leading-relaxed">De conformidad con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), QuHealthy S.A. de C.V. ("QuHealthy"), con domicilio fiscal en [Tu Domicilio Fiscal Completo, Ciudad, Estado, C.P.], es el responsable del tratamiento de sus datos personales.</p>

            <h4 className="font-semibold text-lg text-white pt-2">1. Datos Personales que Recabamos</h4>
            <ul className="list-disc list-inside space-y-2 pl-4">
                <li><strong>Datos de Identificación y Contacto:</strong> Nombre completo, correo electrónico, número de teléfono, domicilio.</li>
                <li><strong>Datos de Ubicación:</strong> Ubicación geográfica para la búsqueda y prestación de servicios.</li>
                <li><strong>Datos Financieros:</strong> Información de pago procesada a través de nuestras pasarelas de pago seguras. No almacenamos datos de tarjetas de crédito.</li>
                <li><strong>Datos Profesionales (Proveedores):</strong> Cédula profesional, certificaciones, y datos de identidad para el proceso de verificación (KYC).</li>
            </ul>

            <h4 className="font-semibold text-lg text-white pt-2">2. Finalidades del Tratamiento</h4>
            <p className="leading-relaxed">Sus datos serán utilizados para: (a) crear y gestionar su cuenta; (b) facilitar la conexión y agendamiento de citas; (c) procesar pagos; (d) enviar comunicaciones transaccionales; y (e) mejorar la seguridad y la calidad de la plataforma.</p>

            <h4 className="font-semibold text-lg text-white pt-2">3. Ejercicio de Derechos ARCO</h4>
            <p className="leading-relaxed">Usted tiene derecho a Acceder, Rectificar, Cancelar sus datos personales, así como a Oponerse a su tratamiento. Para ejercerlos, puede enviar una solicitud a: <a href="mailto:privacidad@quhealthy.com" className="text-purple-400 hover:underline">privacidad@quhealthy.com</a>.</p>
            
            <p className="font-bold mt-6">Al hacer clic en "He leído y acepto los términos", usted confirma que ha leído, comprende y está de acuerdo con los Términos y Condiciones y el Aviso de Privacidad aquí establecidos.</p>
          </div>
        </ScrollArea>
        {/* --- FIN DE LA CORRECCIÓN --- */}

        <DialogFooter className="p-6 pt-4 border-t border-gray-700">
          <Button variant="outline" onClick={() => setOpen(false)} className="border-gray-600 hover:bg-gray-700">Cerrar</Button>
          <Button 
            onClick={handleAcceptAndClose} 
            disabled={!isScrolledToEnd}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isScrolledToEnd ? "He leído y acepto los términos" : "Desliza hasta el final para aceptar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};