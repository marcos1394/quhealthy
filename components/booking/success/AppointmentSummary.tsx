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
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div className="w-8 h-8 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
          <FileText className="w-4 h-4" strokeWidth={1.5} />
        </div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">
          {t("cart_summary", { defaultValue: "Auditoría de Transacción" })}
        </h2>
      </div>

      <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
        {/* Grid Blueprint de Datos */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800 border-b border-gray-200 dark:border-gray-800">
          {/* Especialista */}
          <div className="p-6 md:p-8 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors">
            <User
              className="w-5 h-5 text-black dark:text-white mt-0.5"
              strokeWidth={1.5}
            />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                {t("label_provider", { defaultValue: "Proveedor Clínico" })}
              </p>
              <p className="font-bold text-sm uppercase tracking-wider text-black dark:text-white">
                {appointment.providerNameSnapshot || "ESPECIALISTA ASIGNADO"}
              </p>
              {appointment.providerPhoneSnapshot && (
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-2">
                  TEL: {appointment.providerPhoneSnapshot}
                </p>
              )}
            </div>
          </div>

          {/* Servicio */}
          <div className="p-6 md:p-8 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors">
            <CalendarCheck
              className="w-5 h-5 text-black dark:text-white mt-0.5"
              strokeWidth={1.5}
            />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                {t("label_service", { defaultValue: "Procedimiento" })}
              </p>
              <p className="font-bold text-sm uppercase tracking-wider text-black dark:text-white">
                {appointment.serviceNameSnapshot || appointment.serviceName}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-2">
                DURACIÓN:{" "}
                {appointment.durationMinutes
                  ? `${appointment.durationMinutes} MIN`
                  : "ESTÁNDAR"}{" "}
                | TIPO:{" "}
                {appointment.type === "ONLINE" ? "TELEMEDICINA" : "PRESENCIAL"}
              </p>
            </div>
          </div>

          {/* Fecha */}
          <div className="p-6 md:p-8 flex items-start gap-4 border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors">
            <Calendar
              className="w-5 h-5 text-black dark:text-white mt-0.5"
              strokeWidth={1.5}
            />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                {t("label_date", { defaultValue: "Parámetro Temporal" })}
              </p>
              <p className="font-bold text-sm uppercase tracking-wider text-black dark:text-white">
                {formattedDateTime}
              </p>
            </div>
          </div>

          {/* Ubicación */}
          <div className="p-6 md:p-8 flex items-start gap-4 border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors">
            <MapPin
              className="w-5 h-5 text-black dark:text-white mt-0.5"
              strokeWidth={1.5}
            />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                {t("label_location", { defaultValue: "Coordenadas" })}
              </p>
              <p className="font-bold text-xs uppercase tracking-wider text-black dark:text-white leading-relaxed">
                {appointment.type === "ONLINE"
                  ? "ENLACE DE TRANSMISIÓN REMOTA"
                  : appointment.locationAddress ||
                    "POR DEFINIR. CONTACTE AL PROVEEDOR."}
              </p>
            </div>
          </div>
        </div>

        {/* Resumen Financiero */}
        <div className="p-6 md:p-8 bg-gray-50 dark:bg-[#050505] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">
              {t("label_price", { defaultValue: "Liquidación Final" })}
            </p>
            <p className="text-3xl font-semibold tracking-tight text-black dark:text-white">
              $
              {(
                appointment.totalPrice ||
                appointment.price ||
                0
              ).toLocaleString("es-MX")}
              <span className="text-lg font-light text-gray-500 ml-2">
                {appointment.currency || "MXN"}
              </span>
            </p>
          </div>

          <div className="border border-black dark:border-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black">
            TRANSACCIÓN APROBADA
          </div>
        </div>
      </div>
    </div>
  );
}
