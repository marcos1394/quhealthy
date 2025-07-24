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

  // Esta función detecta si el usuario ha llegado al final del área de scroll.
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Damos un pequeño margen de 10px para activar el botón un poco antes del final exacto.
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
      {/* El children (el texto del label) se convierte en el activador del modal */}
      <span onClick={() => setOpen(true)} className="cursor-pointer">
        {children}
      </span>
      <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-3xl w-[95vw] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl text-purple-400">Términos, Condiciones y Aviso de Privacidad</DialogTitle>
        </DialogHeader>
        <ScrollArea 
          className="flex-grow p-4 border border-gray-700 rounded-md bg-gray-900/50"
          onScroll={handleScroll}
        >
          {/* --- INICIO DEL CONTENIDO LEGAL COMPLETO --- */}
          <div className="prose prose-invert prose-sm max-w-none space-y-4 text-gray-300">
            <p className="text-xs text-gray-400">Última actualización: 23 de Julio de 2025</p>
            
            <h3 className="font-bold text-xl mb-2 text-purple-300">Términos y Condiciones de Uso</h3>
            <p>Bienvenido a QuHealthy. Estos Términos y Condiciones rigen el uso de nuestra plataforma. Al acceder o utilizar nuestro servicio, usted acepta estar sujeto a estos términos. Si no está de acuerdo, no debe utilizar la plataforma.</p>
            
            <h4>1. Descripción del Servicio</h4>
            <p>QuHealthy ("la Plataforma") es un mercado digital que facilita la conexión entre usuarios ("Clientes") que buscan servicios de salud y belleza, y profesionales, clínicas o establecimientos ("Proveedores") que ofrecen dichos servicios. QuHealthy actúa como un intermediario tecnológico y no es un proveedor de servicios médicos, de salud o de belleza, ni emplea a dichos Proveedores. La calidad, seguridad y legalidad de los servicios ofrecidos son responsabilidad exclusiva del Proveedor.</p>

            <h4>2. Cuentas y Elegibilidad</h4>
            <p>Para utilizar la Plataforma, debe registrarse y crear una cuenta, garantizando que toda la información proporcionada es veraz, precisa y completa. Usted es el único responsable de mantener la confidencialidad de sus credenciales de acceso. Debe tener al menos 18 años para crear una cuenta.</p>
            
            <h4>3. Obligaciones de los Proveedores</h4>
            <p>Los Proveedores se comprometen a mantener sus licencias, certificaciones y permisos actualizados y en regla. Son responsables de la veracidad de la información de su perfil, de la calidad de sus servicios y de cumplir con todas las leyes y regulaciones aplicables en México.</p>

            <h4>4. Pagos, Comisiones y Suscripciones</h4>
            <p>Los Clientes pagarán por los servicios a través de las pasarelas de pago integradas. QuHealthy cobrará una comisión por transacción a los Proveedores, cuyo porcentaje se define en el plan de suscripción elegido. Los planes de suscripción para Proveedores se renuevan automáticamente a menos que se cancelen.</p>

            <h4>5. Cancelaciones y Reembolsos</h4>
            <p>Las políticas de cancelación y reembolso para los servicios agendados son establecidas por cada Proveedor y deben ser comunicadas claramente en su perfil. QuHealthy podrá mediar en disputas, pero no es responsable de los reembolsos, salvo en casos de fallas técnicas de la plataforma.</p>

            <h4>6. Propiedad Intelectual</h4>
            <p>Todo el contenido de la Plataforma, incluyendo software, logos, textos y gráficos, es propiedad de QuHealthy. El contenido subido por los usuarios (fotos, descripciones) sigue siendo de su propiedad, pero otorgan a QuHealthy una licencia mundial y libre de regalías para usarlo dentro de la Plataforma.</p>

            <h4>7. Limitación de Responsabilidad</h4>
            <p>QuHealthy no se hace responsable de la calidad, seguridad o resultado de los servicios prestados por los Proveedores. Cualquier disputa o reclamo relacionado con un servicio debe dirigirse directamente al Proveedor. Nuestra responsabilidad se limita al correcto funcionamiento de la plataforma tecnológica.</p>

            <h3 className="font-bold text-xl mb-2 pt-6 text-purple-300">Aviso de Privacidad Integral</h3>
            <p>De conformidad con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), QuHealthy S.A. de C.V. ("QuHealthy"), con domicilio fiscal en [Tu Domicilio Fiscal Completo, Ciudad, Estado, C.P.], es el responsable del tratamiento de sus datos personales.</p>

            <h4>1. Datos Personales que Recabamos</h4>
            <p>Para cumplir con las finalidades descritas, recabamos las siguientes categorías de datos personales:</p>
            <ul>
                <li><strong>Datos de Identificación y Contacto:</strong> Nombre completo, correo electrónico, número de teléfono, domicilio.</li>
                <li><strong>Datos de Ubicación:</strong> Ubicación geográfica para la búsqueda y prestación de servicios.</li>
                <li><strong>Datos Financieros:</strong> Información de pago procesada a través de nuestras pasarelas de pago seguras (Stripe, MercadoPago). No almacenamos datos de tarjetas de crédito.</li>
                <li><strong>Datos Profesionales (Proveedores):</strong> Cédula profesional, certificaciones, especialidad, y datos de identidad para el proceso de verificación (KYC).</li>
                <li><strong>Datos de Uso:</strong> Información sobre cómo interactúa con nuestra plataforma, incluyendo historial de citas y comunicaciones.</li>
            </ul>

            <h4>2. Finalidades del Tratamiento de Datos</h4>
            <p>Sus datos personales son utilizados para las siguientes finalidades necesarias:</p>
            <ul>
                <li>Crear, verificar y administrar su cuenta de usuario.</li>
                <li>Facilitar la búsqueda, agendamiento y comunicación entre Clientes y Proveedores.</li>
                <li>Procesar transacciones y pagos de manera segura.</li>
                <li>Cumplir con los procesos de verificación de identidad y credenciales de los Proveedores.</li>
                <li>Enviar comunicaciones transaccionales sobre sus citas y cuenta.</li>
                <li>Prevenir fraudes y garantizar la seguridad de la Plataforma.</li>
            </ul>
            <p>Adicionalmente, si usted lo autoriza, podremos utilizar sus datos para finalidades secundarias como enviarle promociones y noticias relevantes.</p>

            <h4>3. Transferencia de Datos Personales</h4>
            <p>Sus datos de contacto e información relevante de la cita se compartirán entre el Cliente y el Proveedor para facilitar la prestación del servicio. No transferimos sus datos a terceros ajenos a la operación de QuHealthy sin su consentimiento, salvo que sea requerido por ley.</p>

            <h4>4. Ejercicio de Derechos ARCO</h4>
            <p>Usted tiene derecho a Acceder, Rectificar, Cancelar sus datos personales, así como a Oponerse a su tratamiento (Derechos ARCO). Para ejercer estos derechos, puede enviar una solicitud detallada a nuestro departamento de privacidad al correo electrónico: <a href="mailto:privacidad@quhealthy.com" className="text-purple-400">privacidad@quhealthy.com</a>.</p>
            
            <h4>5. Uso de Cookies y Tecnologías de Rastreo</h4>
            <p>Utilizamos cookies esenciales para el funcionamiento del sitio (autenticación, seguridad) y cookies analíticas (con su consentimiento) para entender cómo se utiliza la plataforma y mejorarla. Puede gestionar sus preferencias de cookies a través de la configuración de su navegador.</p>
            
            <h4>6. Cambios al Aviso de Privacidad</h4>
            <p>Nos reservamos el derecho de efectuar modificaciones al presente aviso de privacidad. Cualquier cambio será notificado a través de la plataforma o por correo electrónico.</p>
            
            <p className="font-bold mt-6">Al hacer clic en "He leído y acepto los términos", usted confirma que ha leído, comprende y está de acuerdo con los Términos y Condiciones y el Aviso de Privacidad aquí establecidos.</p>
          </div>
          {/* --- FIN DEL CONTENIDO LEGAL --- */}
        </ScrollArea>
        <DialogFooter className="mt-4 pt-4 border-t border-gray-700">
          <Button variant="outline" onClick={() => setOpen(false)}>Cerrar</Button>
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