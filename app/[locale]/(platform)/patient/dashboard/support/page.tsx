"use client";

import React, { useState } from "react";
import { MessageSquare, Mail, Smartphone, Loader2, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { sendSupportEmail } from "@/app/actions/support";

export default function SupportPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const res = await sendSupportEmail(formData);
    
    if (res.success) {
      toast.success("¡Solicitud enviada exitosamente! Nuestro equipo te contactará pronto.");
      (e.target as HTMLFormElement).reset();
    } else {
      toast.error(res.error || "Ocurrió un error al enviar tu mensaje.");
    }
    
    setIsSubmitting(false);
  };

  const handleChatwootOpen = () => {
    // @ts-ignore
    if (typeof window !== "undefined" && window.$chatwoot) {
      // @ts-ignore
      window.$chatwoot.toggle('open');
    } else {
      toast.info("El chat se está inicializando. Por favor espera un momento.");
    }
  };

  const handleComingSoon = (channel: string) => {
    toast.info(`La integración de ${channel} estará disponible próximamente.`);
  };

  return (
    <div className="max-w-4xl space-y-12">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
        <h1 className="text-3xl font-semibold text-black dark:text-white tracking-tight">
          Soporte y Ayuda
        </h1>
        <p className="text-gray-500 font-light mt-3 max-w-2xl text-sm leading-relaxed">
          Estamos aquí para ayudarte. Selecciona el canal de comunicación de tu preferencia para resolver cualquier duda o inconveniente técnico.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Formulario de Correo (Ocupa 2 columnas en pantallas grandes) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
            <div className="flex items-center gap-3 mb-8">
              <Mail className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                Ticket por Correo
              </h2>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="relative group">
                  <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 block group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
                    Nombre Completo
                  </label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    className="w-full bg-transparent border-b border-gray-300 dark:border-gray-800 py-3 text-sm text-black dark:text-white font-light focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700"
                    placeholder="Ej. Juan Pérez"
                  />
                </div>
                
                <div className="relative group">
                  <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 block group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
                    Correo de Contacto
                  </label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    className="w-full bg-transparent border-b border-gray-300 dark:border-gray-800 py-3 text-sm text-black dark:text-white font-light focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700"
                    placeholder="tu@correo.com"
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 block group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
                  Asunto del Ticket
                </label>
                <input 
                  type="text" 
                  name="subject"
                  required
                  className="w-full bg-transparent border-b border-gray-300 dark:border-gray-800 py-3 text-sm text-black dark:text-white font-light focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700"
                  placeholder="¿Sobre qué nos contactas?"
                />
              </div>

              <div className="relative group">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 block group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
                  Mensaje
                </label>
                <textarea 
                  name="message"
                  required
                  rows={4}
                  className="w-full bg-transparent border-b border-gray-300 dark:border-gray-800 py-3 text-sm text-black dark:text-white font-light focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700 resize-none"
                  placeholder="Describe tu consulta con el mayor detalle posible..."
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-black text-white dark:bg-white dark:text-black rounded-none h-12 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Procesando
                  </>
                ) : (
                  <>
                    Enviar Ticket <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column: Canales Rápidos */}
        <div className="space-y-6">
          {/* Chat */}
          <div className="p-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col justify-between h-48 group">
            <div>
              <div className="w-10 h-10 flex items-center justify-center border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] mb-4">
                <MessageSquare className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-1">
                Chat en Vivo
              </h3>
              <p className="text-xs text-gray-500 font-light">
                Resolución inmediata mediante soporte en tiempo real.
              </p>
            </div>
            <Button
              onClick={handleChatwootOpen}
              variant="outline"
              className="w-full rounded-none border border-gray-200 dark:border-gray-800 text-black hover:text-white hover:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black text-[9px] font-bold uppercase tracking-widest transition-colors h-10"
            >
              Abrir Chat
            </Button>
          </div>

          {/* WhatsApp */}
          <div className="p-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col justify-between h-48 group">
            <div>
              <div className="w-10 h-10 flex items-center justify-center border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] mb-4">
                <Smartphone className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-1">
                WhatsApp
              </h3>
              <p className="text-xs text-gray-500 font-light">
                Soporte vía WhatsApp para consultas rápidas.
              </p>
            </div>
            <Button
              onClick={() => handleComingSoon("WhatsApp")}
              variant="outline"
              className="w-full rounded-none border border-gray-200 dark:border-gray-800 text-gray-400 hover:text-black hover:border-black dark:hover:text-white dark:hover:border-white text-[9px] font-bold uppercase tracking-widest transition-colors h-10"
            >
              Próximamente
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
