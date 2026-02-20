"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  ShieldAlert, 
  ShieldCheck,
  Shield,
  Info,
  CheckCircle2,
  TrendingDown,
  FileText
} from "lucide-react";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// --- PLANTILLAS LEGALES PREDEFINIDAS ---
const POLICY_TEMPLATES = [
  {
    id: "flexible",
    name: "Flexible",
    icon: Shield,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    text: "Las cancelaciones o reprogramaciones son gratuitas si se realizan con al menos 24 horas de anticipación a la cita programada. Las cancelaciones con menos de 24 horas de aviso podrían estar sujetas a un cargo del 50% del costo de la consulta para cubrir el tiempo reservado."
  },
  {
    id: "moderate",
    name: "Moderada",
    icon: ShieldCheck,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    text: "Se requiere un aviso mínimo de 48 horas para cancelar o reprogramar sin costo. Las cancelaciones realizadas entre 24 y 48 horas antes tendrán una penalización del 50%. Las cancelaciones con menos de 24 horas o inasistencias (no-shows) se cobrarán al 100%."
  },
  {
    id: "strict",
    name: "Estricta",
    icon: ShieldAlert,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    text: "Todas las citas requieren un depósito no reembolsable al momento de la reserva. Si necesitas reprogramar, debes hacerlo con 72 horas de anticipación para que tu depósito sea transferido a la nueva fecha. Las inasistencias perderán el depósito automáticamente."
  }
];

interface CancellationPolicyProps {
  policyText: string;
  onChange: (text: string) => void;
}

export function CancellationPolicySection({ policyText, onChange }: CancellationPolicyProps) {
  
  const charCount = policyText?.length || 0;
  const charLimit = 800;

  return (
    <Card className="bg-gray-900 border-gray-800 shadow-xl">
      <CardHeader>
        <div className="flex items-start gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="p-2 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl border border-red-500/20"
          >
            <ShieldAlert className="w-5 h-5 text-red-400" />
          </motion.div>
          <div>
            <CardTitle className="text-xl font-black text-white mb-1">
              Políticas de Cancelación
            </CardTitle>
            <CardDescription className="text-gray-400">
              Protege tu tiempo y reduce el ausentismo (No-shows).
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-2">
        
        {/* Plantillas Rápidas */}
        <div className="space-y-3">
          <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Plantillas Recomendadas
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {POLICY_TEMPLATES.map((template) => {
              const Icon = template.icon;
              const isSelected = policyText === template.text;

              return (
                <motion.button
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onChange(template.text)}
                  className={cn(
                    "flex flex-col items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200 relative overflow-hidden",
                    isSelected 
                      ? `${template.bgColor} border-${template.color.split('-')[1]}-500/50 shadow-lg shadow-${template.color.split('-')[1]}-500/10` 
                      : "bg-gray-950 border-gray-800 hover:border-gray-700"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn("w-5 h-5", template.color)} />
                    <span className="font-bold text-white">{template.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-3">
                    {template.text}
                  </p>
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className={cn("w-5 h-5", template.color)} />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Editor Personalizado */}
        <div className="space-y-3 pt-4">
          <div className="flex justify-between items-center">
            <Label className="flex items-center gap-2 text-sm font-bold text-white">
              <FileText className="w-4 h-4 text-purple-400" />
              Texto Legal Visible para el Paciente
            </Label>
            <span className={cn(
              "text-xs font-semibold",
              charCount > charLimit ? "text-red-400" : "text-gray-500"
            )}>
              {charCount}/{charLimit}
            </span>
          </div>
          
          <Textarea 
            value={policyText || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Escribe tus políticas de cancelación, reembolsos y reprogramación aquí..."
            className="bg-gray-950 border-gray-700 resize-none min-h-[150px] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-gray-300 leading-relaxed"
          />
          <p className="text-xs text-gray-500">
            Este texto se mostrará a los pacientes antes de confirmar su cita y en sus correos de confirmación.
          </p>
        </div>

        {/* Tip Educativo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3 mt-6"
        >
          <TrendingDown className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-300/80">
            <p className="font-semibold text-blue-400 mb-1">
              💡 Sabías que...
            </p>
            <p>
              Tener una política de cancelación clara visible al momento de agendar 
              <strong> reduce el ausentismo (no-shows) hasta en un 80%</strong>. Asegúrate de ser firme pero empático.
            </p>
          </div>
        </motion.div>

      </CardContent>
    </Card>
  );
}