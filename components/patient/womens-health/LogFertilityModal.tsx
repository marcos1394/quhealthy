"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Loader2, Thermometer, TestTube2, Droplet, Heart, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { womensHealthService, FertilityLog } from "@/services/womensHealth.service";
import { toast } from "react-toastify";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  consumerId: number;
  onSuccess: () => void;
}

export function LogFertilityModal({ isOpen, onClose, consumerId, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [logDate, setLogDate] = useState<Date | undefined>(new Date());
  const [basalTemp, setBasalTemp] = useState<string>("");
  const [lhResult, setLhResult] = useState<FertilityLog['ovulationTestResult'] | undefined>(undefined);
  const [mucus, setMucus] = useState<FertilityLog['cervicalMucus'] | undefined>(undefined);
  const [intercourse, setIntercourse] = useState<boolean>(false);

  const lhOptions = [
    { value: 'NEGATIVE', label: 'Negativo' },
    { value: 'HIGH', label: 'Alto' },
    { value: 'PEAK', label: 'Pico (Peak)' },
    { value: 'POSITIVE', label: 'Positivo' }
  ] as const;

  const mucusOptions = [
    { value: 'DRY', label: 'Seco' },
    { value: 'STICKY', label: 'Pegajoso' },
    { value: 'CREAMY', label: 'Cremoso' },
    { value: 'WATERY', label: 'Acuoso' },
    { value: 'EGG_WHITE', label: 'Clara de Huevo' }
  ] as const;

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await womensHealthService.logFertility(consumerId, {
        logDate: format(logDate || new Date(), "yyyy-MM-dd"),
        basalTemperature: basalTemp ? parseFloat(basalTemp) : undefined,
        ovulationTestResult: lhResult,
        cervicalMucus: mucus,
        intercourse,
      });
      toast.success("Registro de fertilidad guardado");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar el registro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl p-6 bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-indigo-500" />
            Registro de Fertilidad
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Registra tus métricas diarias para mejorar las predicciones.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Fecha */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Fecha</label>
            <DatePicker
              value={logDate}
              onChange={setLogDate}
              placeholder="Selecciona la fecha"
              disabled={(date) => date > new Date()}
            />
          </div>

          {/* Temperatura Basal */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-orange-500" /> Temperatura Basal (°C)
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="Ej. 36.50"
              value={basalTemp}
              onChange={(e) => setBasalTemp(e.target.value)}
              className="rounded-xl border-gray-200 dark:border-gray-800 dark:bg-[#111111]"
            />
          </div>

          {/* Test de Ovulación */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <TestTube2 className="w-4 h-4 text-purple-500" /> Prueba de Ovulación (LH)
            </label>
            <div className="flex flex-wrap gap-2">
              {lhOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLhResult(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    lhResult === opt.value
                      ? "bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300"
                      : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 dark:bg-[#111111] dark:text-gray-400 dark:border-gray-800"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              {lhResult && (
                <button onClick={() => setLhResult(undefined)} className="text-gray-400 p-1">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Moco Cervical */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Droplet className="w-4 h-4 text-blue-500" /> Moco Cervical
            </label>
            <div className="flex flex-wrap gap-2">
              {mucusOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMucus(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    mucus === opt.value
                      ? "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
                      : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 dark:bg-[#111111] dark:text-gray-400 dark:border-gray-800"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              {mucus && (
                <button onClick={() => setMucus(undefined)} className="text-gray-400 p-1">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Relaciones */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Actividad Íntima
            </label>
            <Button
              type="button"
              variant={intercourse ? "default" : "outline"}
              className={`rounded-full h-8 px-4 text-xs ${intercourse ? 'bg-pink-500 hover:bg-pink-600 text-white' : ''}`}
              onClick={() => setIntercourse(!intercourse)}
            >
              <Heart className={`w-3 h-3 mr-2 ${intercourse ? 'fill-white' : ''}`} />
              {intercourse ? "Registrada" : "Registrar"}
            </Button>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 font-semibold"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar Registro"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
