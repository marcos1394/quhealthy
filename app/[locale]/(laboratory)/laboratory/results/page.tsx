"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Search,
  Plus,
  Trash2,
  Award,
  RefreshCw,
  User,
  ArrowRight,
  ClipboardCheck,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  laboratoryOperationsService,
} from "@/services/laboratory-operations.service";
import {
  LaboratoryOrder,
  LaboratoryOrderItem,
  CaptureLaboratoryResultPayload,
  ResultParameterEntryPayload,
} from "@/types/laboratory";

function ResultsCaptureContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("orderId");

  const [orders, setOrders] = useState<LaboratoryOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<LaboratoryOrder | null>(null);
  const [selectedItem, setSelectedItem] = useState<LaboratoryOrderItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [qfbLicense, setQfbLicense] = useState("");
  const [methodology, setMethodology] = useState("Espectrofotometría Automatizada");
  const [generalNotes, setGeneralNotes] = useState("");

  // Parámetros capturados en el formulario
  const [parameters, setParameters] = useState<ResultParameterEntryPayload[]>([
    {
      parameterName: "Glucosa en Suero",
      measuredValue: "",
      unit: "mg/dL",
      referenceMin: 70,
      referenceMax: 100,
      referenceRangeText: "70.0 - 100.0 mg/dL",
      isOutOfRange: false,
      isCriticalAlert: false,
    },
  ]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await laboratoryOperationsService.getOrders({ size: 30 });
      const list = res.content || [];
      setOrders(list);

      if (initialOrderId) {
        const found = list.find((o) => o.id.toString() === initialOrderId);
        if (found) {
          setSelectedOrder(found);
          if (found.items && found.items.length > 0) {
            setSelectedItem(found.items[0]);
          }
        }
      } else if (list.length > 0) {
        setSelectedOrder(list[0]);
        if (list[0].items && list[0].items.length > 0) {
          setSelectedItem(list[0].items[0]);
        }
      }
    } catch (err) {
      console.error("Error al cargar órdenes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [initialOrderId]);

  // Sincronizar parámetros si el ítem ya tiene resultados capturados
  useEffect(() => {
    if (selectedItem?.resultEntries && selectedItem.resultEntries.length > 0) {
      setParameters(
        selectedItem.resultEntries.map((r) => ({
          parameterCode: r.parameterCode,
          parameterName: r.parameterName,
          measuredValue: r.measuredValue,
          unit: r.unit,
          referenceMin: r.referenceMin,
          referenceMax: r.referenceMax,
          referenceRangeText: r.referenceRangeText,
          isOutOfRange: r.isOutOfRange,
          isCriticalAlert: r.isCriticalAlert,
          methodology: r.methodology,
          notes: r.notes,
        }))
      );
    } else if (selectedItem) {
      // Plantilla por defecto según categoría
      setParameters([
        {
          parameterName: selectedItem.studyName,
          measuredValue: "",
          unit: "mg/dL",
          referenceMin: undefined,
          referenceMax: undefined,
          referenceRangeText: "Valores habituales en adultos",
          isOutOfRange: false,
          isCriticalAlert: false,
        },
      ]);
    }
  }, [selectedItem]);

  const addParameter = () => {
    setParameters((prev) => [
      ...prev,
      {
        parameterName: "",
        measuredValue: "",
        unit: "mg/dL",
        referenceMin: undefined,
        referenceMax: undefined,
        referenceRangeText: "",
        isOutOfRange: false,
        isCriticalAlert: false,
      },
    ]);
  };

  const removeParameter = (index: number) => {
    setParameters((prev) => prev.filter((_, i) => i !== index));
  };

  const updateParameter = (index: number, field: keyof ResultParameterEntryPayload, value: any) => {
    setParameters((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Si el valor o referencias cambian, checar automáticamente si está fuera de rango
      if (field === "measuredValue" || field === "referenceMin" || field === "referenceMax") {
        const numVal = parseFloat(updated[index].measuredValue);
        const min = updated[index].referenceMin;
        const max = updated[index].referenceMax;

        if (!isNaN(numVal) && min !== undefined && max !== undefined) {
          updated[index].isOutOfRange = numVal < min || numVal > max;
        }
      }

      return updated;
    });
  };

  const handleSaveResults = async (markValidated: boolean) => {
    if (!selectedItem) return;

    try {
      setSubmitting(true);
      const payload: CaptureLaboratoryResultPayload = {
        results: parameters,
        methodology,
        notes: generalNotes,
        validatedByLicense: qfbLicense || undefined,
        markValidated,
      };

      await laboratoryOperationsService.captureResults(selectedItem.id, payload);
      alert(
        markValidated
          ? "Resultados validados y liberados exitosamente conforme a NOM-007."
          : "Resultados guardados en fase analítica."
      );

      // Recargar orden actual
      if (selectedOrder) {
        const updatedOrder = await laboratoryOperationsService.getOrderDetails(selectedOrder.id);
        setSelectedOrder(updatedOrder);
        const updatedItem = updatedOrder.items.find((i) => i.id === selectedItem.id);
        if (updatedItem) setSelectedItem(updatedItem);
      }
    } catch (err: any) {
      console.error("Error al guardar resultados:", err);
      alert("Error al guardar los resultados analíticos.");
    } finally {
      setSubmitting(false);
    }
  };

  const hasPanicValue = parameters.some((p) => p.isCriticalAlert);

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* ── ENCABEZADO ────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0a0a0a] p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>NOM-007-SSA3-2011 • Validación Analítica</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Captura & Validación de Resultados
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Registro paramétrico por analito, detección de valores de pánico y validación digital por Químico Farmacéutico Biólogo (QFB).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/laboratory/orders">
            <Button variant="outline" className="rounded-2xl text-xs font-bold h-11 border-gray-200 dark:border-gray-800 cursor-pointer">
              <span>Volver a Órdenes</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ── ALERTA DE PÁNICO ACTIVA ───────────────────────────────────────── */}
      {hasPanicValue && (
        <div className="p-5 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500 text-rose-900 dark:text-rose-200 flex items-start gap-4 shadow-lg animate-pulse">
          <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-wide text-rose-700 dark:text-rose-300">
              ⚠️ Alerta de Valor de Pánico Fisiológico Detectado (NOM-007)
            </h3>
            <p className="text-xs leading-relaxed">
              Uno o más parámetros se encuentran en niveles que comprometen la vida del paciente. Es obligación sanitaria contactar de inmediato al médico tratante o al paciente para notificación urgente.
            </p>
          </div>
        </div>
      )}

      {/* ── CONTENIDO PRINCIPAL: WORKLIST IZQUIERDA Y CAPTURA DERECHA ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Columna Izquierda: Selector de Órdenes (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Órdenes Pendientes de Resultados
            </h3>
            <span className="text-[11px] font-mono text-gray-400 font-bold">
              {orders.length} órdenes
            </span>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2">
              <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin" />
              <span className="text-xs text-gray-400">Cargando...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              No hay órdenes disponibles para captura.
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {orders.map((order) => {
                const isSelected = selectedOrder?.id === order.id;
                return (
                  <div
                    key={order.id}
                    onClick={() => {
                      setSelectedOrder(order);
                      if (order.items && order.items.length > 0) {
                        setSelectedItem(order.items[0]);
                      }
                    }}
                    className={cn(
                      "p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5",
                      isSelected
                        ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-xs"
                        : "bg-gray-50/60 dark:bg-[#121212] border-gray-200 dark:border-gray-800 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">
                        {order.orderFolio}
                      </span>
                      {order.hasCriticalAlert && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      )}
                    </div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {order.patientFullName}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">
                      {order.items?.map((i) => i.studyName).join(", ")}
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <span className="text-emerald-600 font-bold">
                        {order.status === "COMPLETED" ? "✓ Liberado" : "En Proceso"}
                      </span>
                      <span className="text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString("es-MX", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Columna Derecha: Formulario de Captura Paramétrica (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedOrder ? (
            <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 shadow-sm space-y-6">
              {/* Encabezado del Paciente y Estudio */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-600">
                    {selectedOrder.orderFolio}
                  </span>
                  <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                    {selectedOrder.patientFullName}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {selectedOrder.patientAge ? `${selectedOrder.patientAge} años` : "Edad no reg."} •{" "}
                    {selectedOrder.patientGender === "M" ? "Masculino" : "Femenino"} •{" "}
                    {selectedOrder.fastingVerified
                      ? `Ayuno verificado (${selectedOrder.fastingHoursDeclared} hrs)`
                      : "Sin verificación de ayuno"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">Estudio:</span>
                  <select
                    value={selectedItem?.id ?? ""}
                    onChange={(e) => {
                      const item = selectedOrder.items.find((i) => i.id.toString() === e.target.value);
                      if (item) setSelectedItem(item);
                    }}
                    className="p-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                  >
                    {selectedOrder.items?.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.studyName} ({item.studyCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Parámetros Analíticos Dinámicos */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Parámetros Analíticos & Referencias Fisiológicas</span>
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addParameter}
                    className="rounded-xl text-xs font-bold gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Añadir Analito</span>
                  </Button>
                </div>

                <div className="space-y-3">
                  {parameters.map((param, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-4 rounded-2xl border transition-all space-y-3",
                        param.isCriticalAlert
                          ? "bg-rose-50/40 border-rose-400 dark:bg-rose-950/20"
                          : param.isOutOfRange
                          ? "bg-amber-50/40 border-amber-300 dark:bg-amber-950/20"
                          : "bg-gray-50/40 dark:bg-[#121212] border-gray-200 dark:border-gray-800"
                      )}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs">
                        {/* Nombre del Parámetro */}
                        <div className="sm:col-span-4">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                            Parámetro / Analito
                          </label>
                          <input
                            type="text"
                            value={param.parameterName}
                            onChange={(e) => updateParameter(index, "parameterName", e.target.value)}
                            placeholder="Ej. Glucosa"
                            className="w-full p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black font-semibold text-gray-900 dark:text-white"
                          />
                        </div>

                        {/* Valor Medido */}
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                            Resultado Obtenido *
                          </label>
                          <input
                            type="text"
                            value={param.measuredValue}
                            onChange={(e) => updateParameter(index, "measuredValue", e.target.value)}
                            placeholder="Ej. 104"
                            className="w-full p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black font-black text-gray-900 dark:text-white"
                          />
                        </div>

                        {/* Unidad de Medida */}
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                            Unidad
                          </label>
                          <input
                            type="text"
                            value={param.unit || ""}
                            onChange={(e) => updateParameter(index, "unit", e.target.value)}
                            placeholder="mg/dL"
                            className="w-full p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white"
                          />
                        </div>

                        {/* Rango de Referencia */}
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                            Rango Ref.
                          </label>
                          <input
                            type="text"
                            value={param.referenceRangeText || ""}
                            onChange={(e) => updateParameter(index, "referenceRangeText", e.target.value)}
                            placeholder="70 - 100"
                            className="w-full p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white"
                          />
                        </div>

                        {/* Botón Eliminar */}
                        <div className="sm:col-span-1 flex justify-end pt-4 sm:pt-0">
                          <button
                            type="button"
                            onClick={() => removeParameter(index)}
                            disabled={parameters.length === 1}
                            className="text-gray-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Toggles de Alerta */}
                      <div className="flex flex-wrap items-center gap-4 text-xs pt-1 border-t border-gray-100 dark:border-gray-800/60">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={param.isOutOfRange || false}
                            onChange={(e) => updateParameter(index, "isOutOfRange", e.target.checked)}
                            className="rounded text-amber-600 focus:ring-amber-500"
                          />
                          <span className="font-semibold text-amber-700 dark:text-amber-300 text-[11px]">
                            Fuera de intervalo de referencia
                          </span>
                        </label>

                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={param.isCriticalAlert || false}
                            onChange={(e) => updateParameter(index, "isCriticalAlert", e.target.checked)}
                            className="rounded text-rose-600 focus:ring-rose-500"
                          />
                          <span className="font-bold text-rose-700 dark:text-rose-400 text-[11px] flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Valor Crítico / Pánico
                          </span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metodología y Cédula Profesional QFB (NOM-007) */}
              <div className="p-5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 space-y-4 text-xs">
                <h4 className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Validación Sanitaria & Firma QFB (NOM-007-SSA3-2011)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Metodología / Equipo Analítico
                    </label>
                    <input
                      type="text"
                      value={methodology}
                      onChange={(e) => setMethodology(e.target.value)}
                      placeholder="Ej. Espectrofotometría Automatizada"
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Cédula Profesional Químico Responsable (DGP) *
                    </label>
                    <input
                      type="text"
                      value={qfbLicense}
                      onChange={(e) => setQfbLicense(e.target.value)}
                      placeholder="Ej. 11849203 / Cédula QFB"
                      className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-black font-bold text-gray-900 dark:text-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Observaciones Pre-analíticas o Clínicas
                  </label>
                  <input
                    type="text"
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                    placeholder="Ej. Muestra sin hemólisis ni lipemia. Procesada dentro del tiempo establecido."
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting}
                  onClick={() => handleSaveResults(false)}
                  className="rounded-2xl text-xs font-bold h-11 border-gray-200 dark:border-gray-800 cursor-pointer"
                >
                  Guardar Borrador Analítico
                </Button>

                <Button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSaveResults(true)}
                  className="rounded-2xl text-xs font-bold h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <ClipboardCheck className="w-4 h-4" />
                  )}
                  <span>Validar & Liberar Resultado Oficial</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-xs text-gray-400">
              Seleccione una orden para capturar sus resultados.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function LaboratoryResultsPage() {
  return (
    <Suspense fallback={
      <div className="py-16 text-center text-xs text-gray-400">
        Cargando módulo de resultados...
      </div>
    }>
      <ResultsCaptureContent />
    </Suspense>
  );
}
