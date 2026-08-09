"use client";

import React, { useState } from "react";
import { X, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import { womensHealthService, MenstrualSymptomLog } from "@/services/womensHealth.service";

interface LogSymptomModalProps {
  isOpen: boolean;
  onClose: () => void;
  consumerId: number;
  onSuccess: () => void;
}

const AVAILABLE_SYMPTOMS = [
  { id: "HEADACHE", label: "Dolor de cabeza" },
  { id: "CRAMPS", label: "Cólicos" },
  { id: "BLOATING", label: "Inflamación" },
  { id: "FATIGUE", label: "Fatiga" },
  { id: "ACNE", label: "Acné" },
  { id: "BACKACHE", label: "Dolor de espalda" },
];

export function LogSymptomModal({ isOpen, onClose, consumerId, onSuccess }: LogSymptomModalProps) {
  const [logDate, setLogDate] = useState(new Date().toISOString().split("T")[0]);
  const [painLevel, setPainLevel] = useState(0);
  const [mood, setMood] = useState<MenstrualSymptomLog["mood"]>("CALM");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logDate) {
      toast.error("La fecha es requerida");
      return;
    }

    setIsSubmitting(true);
    try {
      await womensHealthService.logSymptom(consumerId, {
        consumerId,
        logDate,
        painLevel,
        mood,
        symptoms: selectedSymptoms,
        notes,
      });
      toast.success("Síntomas registrados exitosamente");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Ocurrió un error al registrar los síntomas");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-[#0a0a0a] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-500" />
              Registrar Síntomas
            </h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              <div>
                <Label htmlFor="logDate">Fecha *</Label>
                <Input
                  id="logDate"
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label>Nivel de Dolor: {painLevel}/10</Label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={painLevel}
                  onChange={(e) => setPainLevel(parseInt(e.target.value))}
                  className="w-full mt-2 accent-rose-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Sin dolor</span>
                  <span>Insoportable</span>
                </div>
              </div>

              <div>
                <Label>Estado de Ánimo</Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-2">
                  {(["CALM", "HAPPY", "SAD", "IRRITABLE", "ANXIOUS"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        mood === m
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-[#121212] dark:text-gray-400 border border-transparent"
                      }`}
                    >
                      {m === "CALM" && "Calma"}
                      {m === "HAPPY" && "Feliz"}
                      {m === "SAD" && "Triste"}
                      {m === "IRRITABLE" && "Irritable"}
                      {m === "ANXIOUS" && "Ansiedad"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Síntomas Específicos</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {AVAILABLE_SYMPTOMS.map((symptom) => {
                    const isSelected = selectedSymptoms.includes(symptom.id);
                    return (
                      <button
                        key={symptom.id}
                        type="button"
                        onClick={() => toggleSymptom(symptom.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          isSelected
                            ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        }`}
                      >
                        {symptom.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notas Adicionales (Opcional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 resize-none"
                  placeholder="Escribe cómo te sientes hoy..."
                  rows={3}
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl">
                {isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
