"use client";

import React from "react";
import { User, CalendarCheck, Calendar, MapPin, FileText } from "lucide-react";

interface Props {
  t: any;
  appointment: any;
  formattedDateTime: string;
}

export function AppointmentSummary({
  t,
  appointment,
  formattedDateTime,
}: Props) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-quhealthy-green/10 dark:bg-emerald-900/30 p-2 rounded-xl text-quhealthy-green dark:text-emerald-400">
          <FileText className="w-5 h-5" strokeWidth={1.5} />
        </div>
        <h2 className="text-base font-bold text-gray-900 dark:text-white">
          {t("cart_summary", { defaultValue: "Resumen de tu Cita" })}
        </h2>
      </div>

      <div className="bg-white dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Grid de Datos */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-800">
          {/* Especialista */}
          <div className="p-5 md:p-6 flex items-start gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center shrink-0 mt-0.5">
              <User className="w-4 h-4 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                {t("label_provider", { defaultValue: "Especialista" })}
              </p>
              <p className="font-bold text-sm text-gray-900 dark:text-white">
                {appointment.providerNameSnapshot || "Especialista Asignado"}
              </p>
              {appointment.providerPhoneSnapshot && (
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1.5">
                  Tel: {appointment.providerPhoneSnapshot}
                </p>
              )}
            </div>
          </div>

          {/* Servicio */}
          <div className="p-5 md:p-6 flex items-start gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center shrink-0 mt-0.5">
              <CalendarCheck className="w-4 h-4 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                {t("label_service", { defaultValue: "Servicio" })}
              </p>
              <p className="font-bold text-sm text-gray-900 dark:text-white">
                {appointment.serviceNameSnapshot || appointment.serviceName}
              </p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1.5">
                Duración:{" "}
                {appointment.durationMinutes
                  ? `${appointment.durationMinutes} min`
                  : "Estándar"}{" "}
                · Modalidad:{" "}
                {appointment.type === "ONLINE" ? "Teleconsulta" : "Presencial"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-800 border-t border-gray-100 dark:border-gray-800">
          {/* Fecha */}
          <div className="p-5 md:p-6 flex items-start gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center shrink-0 mt-0.5">
              <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                {t("label_date", { defaultValue: "Fecha y Hora" })}
              </p>
              <p className="font-bold text-sm text-gray-900 dark:text-white">
                {formattedDateTime}
              </p>
            </div>
          </div>

          {/* Ubicación */}
          <div className="p-5 md:p-6 flex items-start gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                {t("label_location", { defaultValue: "Ubicación" })}
              </p>
              <p className="font-bold text-sm text-gray-900 dark:text-white leading-relaxed">
                {appointment.type === "ONLINE"
                  ? "Enlace de teleconsulta remota"
                  : appointment.locationAddress ||
                    "Por definir. Contacte al proveedor."}
              </p>
            </div>
          </div>
        </div>

        {/* Resumen Financiero */}
        <div className="p-5 md:p-6 bg-gray-50 dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              {t("label_price", { defaultValue: "Total Pagado" })}
            </p>
            <p className="text-3xl font-bold text-quhealthy-green dark:text-emerald-400">
              $
              {(
                appointment.totalPrice ||
                appointment.price ||
                0
              ).toLocaleString("es-MX")}
              <span className="text-base font-medium text-gray-500 dark:text-gray-400 ml-2">
                {appointment.currency || "MXN"}
              </span>
            </p>
          </div>

          <span className="bg-quhealthy-green text-white dark:bg-emerald-600 rounded-full px-4 py-1.5 text-xs font-bold shadow-sm">
            Transacción Aprobada
          </span>
        </div>
      </div>
    </div>
  );
}
