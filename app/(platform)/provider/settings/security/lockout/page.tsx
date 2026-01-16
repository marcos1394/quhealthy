"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Save, AlertTriangle, Info, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LockoutSettingsPage() {
  const [maxAttempts, setMaxAttempts] = useState([5]); // Slider usa array
  const [loading, setLoading] = useState(false);

  // Determinar nivel de seguridad visualmente
  const getSecurityLevel = (val: number) => {
    if (val <= 3) return { label: "Estricto", color: "bg-red-500/10 text-red-400 border-red-500/20" };
    if (val <= 5) return { label: "Recomendado", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
    return { label: "Permisivo", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" };
  };

  const securityLevel = getSecurityLevel(maxAttempts[0]);

  const handleSave = async () => {
    setLoading(true);
    
    // Simulación de llamada a API
    // await axios.put('/api/settings/security', { lockoutAttempts: maxAttempts[0] });
    
    setTimeout(() => {
      setLoading(false);
      toast.success("Política de bloqueo actualizada correctamente");
    }, 1000);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center space-x-4 mb-2">
        <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <ShieldCheck className="w-8 h-8 text-purple-500" />
        </div>
        <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Bloqueo de Cuenta</h1>
            <p className="text-gray-400 mt-1">Protección contra ataques de fuerza bruta.</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="bg-gray-900/90 backdrop-blur-xl border-gray-800 shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-white">Umbral de Intentos Fallidos</CardTitle>
                    <CardDescription className="text-gray-400 mt-2">
                        Define cuántas veces puede un usuario intentar ingresar su contraseña incorrectamente antes de bloquear la cuenta temporalmente.
                    </CardDescription>
                </div>
                <Badge variant="outline" className={`${securityLevel.color} whitespace-nowrap ml-4`}>
                    Nivel: {securityLevel.label}
                </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            
            {/* Visualizador del Valor */}
            <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 flex items-center justify-between">
                <span className="text-gray-400 text-sm">Intentos permitidos:</span>
                <span className="text-4xl font-bold text-white tabular-nums">
                    {maxAttempts[0]}
                </span>
            </div>

            {/* Slider Control */}
            <div className="space-y-4">
                <Slider
                    defaultValue={[5]}
                    max={10}
                    min={1}
                    step={1}
                    value={maxAttempts}
                    onValueChange={setMaxAttempts}
                    className="py-4"
                />
                <div className="flex justify-between text-xs text-gray-500 px-1">
                    <span>1 (Muy Estricto)</span>
                    <span>5 (Estándar)</span>
                    <span>10 (Permisivo)</span>
                </div>
            </div>

            {/* Alerta Informativa */}
            {maxAttempts[0] < 3 && (
                <Alert className="bg-yellow-900/10 border-yellow-900/50 text-yellow-500">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        Un número muy bajo puede causar bloqueos frecuentes a usuarios legítimos que olvidan su contraseña.
                    </AlertDescription>
                </Alert>
            )}

            <div className="bg-blue-900/10 border border-blue-900/30 p-4 rounded-lg flex gap-3">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-200">
                    <strong>Nota:</strong> Cuando una cuenta se bloquea, el usuario deberá esperar 15 minutos o restablecer su contraseña vía email para recuperar el acceso.
                </p>
            </div>

          </CardContent>

          <CardFooter className="border-t border-gray-800 pt-6 flex justify-end">
            <Button 
                onClick={handleSave} 
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white min-w-[140px]"
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                    </>
                ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                    </>
                )}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}