"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle, AlertTriangle, ArrowLeft, User, Calendar, Clock } from "lucide-react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { appointmentService } from "@/services/appointment.service";
import { QhSpinner } from "@/components/ui/QhSpinner";

export default function CheckinPage() {
  const t = useTranslations("Dashboard");
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const id = Number(params.id);
  const token = searchParams.get("token");

  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Token de Check-in inválido o faltante.");
      setLoading(false);
      return;
    }

    const fetchAppointment = async () => {
      try {
        const data = await appointmentService.getAppointmentById(id);
        setAppointment(data);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching appointment for check-in:", err);
        setError("No se pudo cargar la información de la cita.");
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id, token]);

  const handleConfirmCheckin = async () => {
    if (!token) return;
    setProcessing(true);
    try {
      await appointmentService.processCheckIn(id, token);
      toast.success("Check-in completado exitosamente");
      // Redirect to provider dashboard
      router.push("/provider/dashboard");
    } catch (err: any) {
      console.error("Error processing check-in:", err);
      toast.error(err.response?.data?.message || "Error al procesar el check-in");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-qh-bg-dark text-qh-text-light">
        <QhSpinner size="lg" className="mb-4 text-qh-primary" />
        <p className="text-sm tracking-widest text-qh-text-muted">VERIFICANDO CITA...</p>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-qh-bg-dark px-4 text-center">
        <AlertTriangle className="mb-6 h-16 w-16 text-red-500" />
        <h1 className="mb-2 font-display text-2xl font-bold uppercase tracking-tight text-white">ERROR DE VALIDACIÓN</h1>
        <p className="mb-8 text-qh-text-muted">{error}</p>
        <button
          onClick={() => router.push("/provider/dashboard")}
          className="flex items-center gap-2 rounded-none bg-white px-6 py-3 font-mono text-sm font-bold text-black transition-transform hover:-translate-y-1 active:translate-y-0"
        >
          <ArrowLeft className="h-4 w-4" />
          VOLVER AL INICIO
        </button>
      </div>
    );
  }

  // Format date
  const startDate = new Date(appointment.startTime);
  const formattedDate = format(startDate, "EEEE d 'de' MMMM", { locale: es });
  const formattedTime = format(startDate, "h:mm a");

  return (
    <div className="min-h-screen w-full bg-qh-bg-dark font-sans text-qh-text-light selection:bg-qh-primary selection:text-white">
      {/* Header Minimalista */}
      <header className="sticky top-0 z-10 border-b border-qh-border-dark bg-qh-bg-dark/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <button 
            onClick={() => router.push("/provider/dashboard")}
            className="group flex items-center gap-2 text-qh-text-muted transition-colors hover:text-white"
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest">CANCELAR</span>
          </button>
          <div className="font-display text-sm font-bold uppercase tracking-widest text-qh-primary">
            CHECK-IN FÍSICO
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-6 py-12">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-qh-primary/30 bg-qh-primary/10">
            <User className="h-10 w-10 text-qh-primary" />
          </div>
          <h1 className="mb-2 font-display text-3xl font-bold uppercase tracking-tight text-white">
            NUEVO PACIENTE EN RECEPCIÓN
          </h1>
          <p className="text-qh-text-muted">Por favor confirma la llegada para marcar la cita en Sala de Espera.</p>
        </div>

        {/* Tarjeta Brutalista */}
        <div className="mb-10 border border-qh-border-dark bg-black p-6">
          <h2 className="mb-6 border-b border-qh-border-dark pb-4 font-mono text-xs font-bold uppercase tracking-widest text-qh-primary">
            Detalles de la Cita #{appointment.id}
          </h2>
          
          <div className="space-y-6">
            <div>
              <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-widest text-qh-text-muted">Paciente</p>
              <p className="font-display text-xl text-white">{appointment.consumerName || "Paciente Registrado"}</p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-widest text-qh-text-muted">Fecha</p>
                <div className="flex items-center gap-2 text-white">
                  <Calendar className="h-4 w-4 text-qh-primary" />
                  <span className="capitalize">{formattedDate}</span>
                </div>
              </div>
              
              <div>
                <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-widest text-qh-text-muted">Hora</p>
                <div className="flex items-center gap-2 text-white">
                  <Clock className="h-4 w-4 text-qh-primary" />
                  <span>{formattedTime}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-widest text-qh-text-muted">Estado Actual</p>
              <div className="inline-block border border-qh-border-dark bg-qh-bg-dark px-3 py-1 font-mono text-xs font-bold tracking-widest text-white">
                {appointment.status}
              </div>
            </div>
          </div>
        </div>

        {/* Acción Principal */}
        <button
          onClick={handleConfirmCheckin}
          disabled={processing || appointment.status === 'WAITING_ROOM'}
          className="group relative flex w-full items-center justify-center gap-3 border border-transparent bg-qh-primary p-4 font-display text-lg font-bold uppercase tracking-wider text-black transition-all hover:bg-qh-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {processing ? (
            <QhSpinner size="sm" className="text-black" />
          ) : appointment.status === 'WAITING_ROOM' ? (
            <>
              <CheckCircle className="h-6 w-6" />
              YA EN SALA DE ESPERA
            </>
          ) : (
            <>
              CONFIRMAR LLEGADA
              <div className="absolute inset-0 border border-transparent transition-all group-hover:-inset-1 group-hover:border-qh-primary" />
            </>
          )}
        </button>
      </main>
    </div>
  );
}
