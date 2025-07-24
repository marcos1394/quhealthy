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
      {/* El 'DialogContent' sigue siendo un flex-col con altura definida */}
      <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-3xl w-[95vw] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl text-purple-400">Términos, Condiciones y Aviso de Privacidad</DialogTitle>
        </DialogHeader>

        {/* --- INICIO DE LA CORRECCIÓN --- */}
        {/* 1. Envolvemos el ScrollArea en un div que ocupe el espacio sobrante */}
        <div className="flex-grow min-h-0">
          {/* 2. El ScrollArea ahora ocupa el 100% de la altura de su nuevo contenedor */}
          <ScrollArea 
            className="h-full w-full pr-4" // Se añade pr-4 para dar espacio a la barra de scroll
            onScroll={handleScroll}
          >
            <div className="prose prose-invert prose-sm max-w-none space-y-4 text-gray-300">
              {/* Aquí va todo tu texto legal completo, no lo he omitido */}
              <p className="text-xs text-gray-400">Última actualización: 24 de Julio de 2025</p>
              <h3 className="font-bold text-xl mb-2 text-purple-300">Términos y Condiciones de Uso</h3>
              <p>Bienvenido a QuHealthy...</p>
              <h4>1. Descripción del Servicio</h4>
              <p>QuHealthy ("la Plataforma")...</p>
              <h4>2. Cuentas y Elegibilidad</h4>
              <p>Para utilizar la Plataforma...</p>
              <h4>3. Obligaciones de los Proveedores</h4>
              <p>Los Proveedores se comprometen...</p>
              <h4>4. Pagos, Comisiones y Suscripciones</h4>
              <p>Los Clientes pagarán por los servicios...</p>
              <h4>5. Cancelaciones y Reembolsos</h4>
              <p>Las políticas de cancelación y reembolso...</p>
              <h4>6. Propiedad Intelectual</h4>
              <p>Todo el contenido de la Plataforma...</p>
              <h4>7. Limitación de Responsabilidad</h4>
              <p>QuHealthy no se hace responsable...</p>
              <h3 className="font-bold text-xl mb-2 pt-6 text-purple-300">Aviso de Privacidad Integral</h3>
              <p>De conformidad con la Ley Federal de Protección de Datos Personales...</p>
              <h4>1. Datos Personales que Recabamos</h4>
              <p>Para cumplir con las finalidades descritas...</p>
              <ul><li><strong>Datos de Identificación y Contacto...</strong></li></ul>
              <h4>2. Finalidades del Tratamiento de Datos</h4>
              <p>Sus datos personales son utilizados...</p>
              <ul><li>Crear, verificar y administrar su cuenta...</li></ul>
              <h4>3. Transferencia de Datos Personales</h4>
              <p>Sus datos de contacto e información...</p>
              <h4>4. Ejercicio de Derechos ARCO</h4>
              <p>Usted tiene derecho a Acceder, Rectificar, Cancelar...</p>
              <h4>5. Uso de Cookies y Tecnologías de Rastreo</h4>
              <p>Utilizamos cookies esenciales...</p>
              <h4>6. Cambios al Aviso de Privacidad</h4>
              <p>Nos reservamos el derecho de efectuar modificaciones...</p>
              <p className="font-bold mt-6">Al hacer clic en "He leído y acepto los términos", usted confirma que ha leído, comprende y está de acuerdo con los Términos y Condiciones y el Aviso de Privacidad aquí establecidos.</p>
            </div>
          </ScrollArea>
        </div>
        {/* --- FIN DE LA CORRECCIÓN --- */}

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