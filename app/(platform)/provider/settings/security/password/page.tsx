"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, CheckCircle2, AlertTriangle, Save, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PasswordRulesPage() {
  const [minLength, setMinLength] = useState(8);
  const [requireSpecial, setRequireSpecial] = useState(true);
  const [requireUppercase, setRequireUppercase] = useState(true);
  const [requireNumbers, setRequireNumbers] = useState(true);
  const [loading, setLoading] = useState(false);

  // Calcular nivel de seguridad visualmente
  const calculateStrength = () => {
    let score = 0;
    if (minLength >= 10) score++;
    if (minLength >= 12) score++;
    if (requireSpecial) score++;
    if (requireUppercase) score++;
    if (requireNumbers) score++;

    if (score >= 4) return { label: "Fuerte", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
    if (score >= 2) return { label: "Media", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" };
    return { label: "Débil", color: "bg-red-500/10 text-red-400 border-red-500/20" };
  };

  const strength = calculateStrength();

  const handleSave = async () => {
    setLoading(true);
    
    // Simular llamada API
    // await axios.put('/api/settings/security/password-policy', { ... });

    setTimeout(() => {
        setLoading(false);
        toast.success("Política de contraseñas actualizada", {
            icon: <CheckCircle2 className="text-emerald-500" />
        });
    }, 1000);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center space-x-4 mb-2">
        <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <Lock className="w-8 h-8 text-purple-500" />
        </div>
        <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Reglas de Contraseña</h1>
            <p className="text-gray-400 mt-1">Define los requisitos de complejidad para tu cuenta.</p>
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
                    <CardTitle className="text-white">Política de Complejidad</CardTitle>
                    <CardDescription className="mt-1">
                        Establece qué tan estrictas deben ser las contraseñas.
                    </CardDescription>
                </div>
                <Badge variant="outline" className={`${strength.color} px-3 py-1 text-xs uppercase tracking-wider`}>
                    Seguridad {strength.label}
                </Badge>
            </div>
          </CardHeader>
          
          <Separator className="bg-gray-800" />

          <CardContent className="space-y-6 pt-6">
            
            {/* Longitud Mínima */}
            <div className="space-y-3">
                <Label className="text-gray-300">Longitud Mínima de Caracteres</Label>
                <div className="flex items-center gap-4">
                    <Input 
                        type="number" 
                        min={6} 
                        max={32}
                        value={minLength}
                        onChange={(e) => setMinLength(Number(e.target.value))}
                        className="bg-gray-800 border-gray-700 text-white w-24 text-center text-lg font-bold focus:border-purple-500"
                    />
                    <div className="flex-1">
                        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-500 ${
                                    minLength < 8 ? "bg-red-500" : minLength < 12 ? "bg-yellow-500" : "bg-emerald-500"
                                }`} 
                                style={{ width: `${Math.min((minLength / 16) * 100, 100)}%` }} 
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Recomendamos al menos 12 caracteres.</p>
                    </div>
                </div>
            </div>

            <Separator className="bg-gray-800" />

            {/* Switches de Complejidad */}
            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base text-gray-200">Mayúsculas</Label>
                        <p className="text-xs text-gray-500">Requerir al menos una letra mayúscula (A-Z)</p>
                    </div>
                    <Switch 
                        checked={requireUppercase} 
                        onCheckedChange={setRequireUppercase}
                        className="data-[state=checked]:bg-purple-600"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base text-gray-200">Números</Label>
                        <p className="text-xs text-gray-500">Requerir al menos un número (0-9)</p>
                    </div>
                    <Switch 
                        checked={requireNumbers} 
                        onCheckedChange={setRequireNumbers}
                        className="data-[state=checked]:bg-purple-600"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-base text-gray-200">Caracteres Especiales</Label>
                        <p className="text-xs text-gray-500">Requerir símbolos (!@#$%)</p>
                    </div>
                    <Switch 
                        checked={requireSpecial} 
                        onCheckedChange={setRequireSpecial}
                        className="data-[state=checked]:bg-purple-600"
                    />
                </div>
            </div>

            {/* Advertencia */}
            {(!requireSpecial || !requireNumbers || minLength < 8) && (
                <Alert className="bg-yellow-900/10 border-yellow-900/50 text-yellow-500 mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        Una política débil hace que tu cuenta sea vulnerable a ataques de fuerza bruta.
                    </AlertDescription>
                </Alert>
            )}

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
                        <Save className="mr-2 h-4 w-4" /> Guardar Reglas
                    </>
                )}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}