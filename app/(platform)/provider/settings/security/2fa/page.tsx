/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  Shield,
  Smartphone,
  Copy,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lock,
  Download,
  LayoutDashboard,
  Loader2,
  
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

// ShadCN UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

export default function TwoFactorSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Paso 1: Obtener el Secreto para el QR
  const fetchSetupData = async () => {
    try {
      setInitializing(true);
      // Usamos ruta relativa para que funcione en prod y dev
      const response = await axios.get("/api/auth/2fa/setup"); 
      
      setSecret(response.data.secret);
      // Si el backend ya genera los backup codes al inicio, guárdalos, 
      // si no, quizas los genera al confirmar. Ajustar según tu backend.
      if (response.data.backupCodes) {
        setBackupCodes(response.data.backupCodes);
      }
      
    } catch (err) {
      console.error(err);
      toast.error("Error al iniciar la configuración de seguridad.");
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    fetchSetupData();
  }, []);

  // Paso 2: Verificar el código TOTP ingresado por el usuario
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) return;
    
    setLoading(true);

    try {
      const response = await axios.post("/api/auth/2fa/verify", {
        token: code, // Estandarizamos a 'token' o 'code' según tu API
        secret: secret // Algunos backends stateless piden reenviar el secreto temporal
      });

      if (response.data.success || response.status === 200) {
        toast.success("¡Autenticación de dos pasos activada!");
        
        // Si el backend devuelve los códigos de respaldo AQUI, actualizarlos
        if (response.data.backupCodes) {
            setBackupCodes(response.data.backupCodes);
        }
        
        setStep(3);
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || "Código incorrecto. Inténtalo de nuevo.";
      toast.error(msg);
      setCode(""); // Limpiar input para reintentar
    } finally {
      setLoading(false);
    }
  };

  // Utilidades
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  const downloadBackupCodes = () => {
    const text = `Códigos de Respaldo QuHealthy:\n\n${backupCodes.join('\n')}\n\nGuarda este archivo en un lugar seguro.`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quhealthy-backup-codes.txt';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Archivo descargado");
  };

  if (initializing) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo Decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-gray-950 to-gray-950 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        <Card className="bg-gray-900/90 backdrop-blur-xl border-gray-800 shadow-2xl">
          <CardHeader className="text-center border-b border-gray-800 pb-6">
            <div className="mx-auto w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4 border border-purple-500/20">
                <Shield className="w-8 h-8 text-purple-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Autenticación de Dos Pasos (2FA)</CardTitle>
            <CardDescription className="text-gray-400">
                Protege tu cuenta con una capa extra de seguridad.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
              
              {/* PASO 1: ESCANEAR QR */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Alert className="bg-purple-900/20 border-purple-800 text-purple-200">
                    <Smartphone className="h-4 w-4" />
                    <AlertTitle>Instrucciones</AlertTitle>
                    <AlertDescription>
                      Abre tu app de autenticación (Google Authenticator, Authy) y escanea el código.
                    </AlertDescription>
                  </Alert>

                  {secret ? (
                    <div className="flex flex-col items-center space-y-6">
                      <div className="bg-white p-4 rounded-xl shadow-inner">
                        <QRCodeSVG value={`otpauth://totp/QuHealthy:${"Usuario"}?secret=${secret}&issuer=QuHealthy`} size={180} />
                      </div>
                      
                      <div className="w-full bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                        <p className="text-xs text-gray-400 mb-2 uppercase font-semibold tracking-wider">¿No puedes escanear? Usa este código:</p>
                        <div className="flex items-center justify-between bg-gray-900 rounded px-3 py-2 border border-gray-700">
                          <code className="text-purple-400 font-mono text-sm tracking-widest">
                            {secret}
                          </code>
                          <Button variant="ghost" size="default" onClick={() => copyToClipboard(secret)} className="hover:text-purple-400 h-8 w-8">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-red-400">
                        Error cargando el secreto. Por favor recarga la página.
                    </div>
                  )}

                  <Button onClick={() => setStep(2)} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold h-12">
                    Continuar <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </motion.div>
              )}

              {/* PASO 2: VERIFICAR CÓDIGO */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-4 py-4">
                    <div className="mx-auto w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center animate-pulse">
                        <Lock className="w-6 h-6 text-purple-400" />
                    </div>
                    <p className="text-gray-300">
                      Ingresa el código de 6 dígitos que aparece en tu aplicación.
                    </p>
                  </div>

                  <form onSubmit={handleVerifyCode} className="space-y-6">
                    <Input 
                        type="text" 
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000 000"
                        className="text-center text-3xl tracking-[0.5em] h-16 bg-gray-800 border-gray-700 text-white focus:border-purple-500 font-mono placeholder:tracking-normal placeholder:text-gray-600"
                        maxLength={6}
                        autoFocus
                    />

                    <div className="flex flex-col gap-3">
                        <Button 
                            type="submit" 
                            disabled={loading || code.length < 6}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold h-12"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Verificar y Activar"}
                        </Button>
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => setStep(1)}
                            className="text-gray-400 hover:text-white"
                        >
                            Volver al QR
                        </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* PASO 3: ÉXITO Y CÓDIGOS DE RESPALDO */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white">
                      ¡2FA Configurado!
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Tu cuenta ahora es mucho más segura.
                    </p>
                  </div>

                  <Alert className="bg-yellow-900/20 border-yellow-800 text-yellow-200">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <AlertTitle className="text-yellow-500">IMPORTANTE</AlertTitle>
                    <AlertDescription className="text-xs">
                      Si pierdes tu teléfono, estos códigos son la única forma de recuperar tu cuenta. Guárdalos en un lugar seguro.
                    </AlertDescription>
                  </Alert>

                  <div className="bg-gray-950 rounded-lg p-4 border border-gray-800 grid grid-cols-2 gap-3">
                    {backupCodes.length > 0 ? backupCodes.map((code, index) => (
                      <div key={index} className="bg-gray-900 p-2 rounded text-center border border-gray-800">
                        <code className="font-mono text-emerald-400 text-sm">{code}</code>
                      </div>
                    )) : (
                        <p className="col-span-2 text-center text-gray-500 text-sm">No se generaron códigos de respaldo (Revisar Backend)</p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button 
                        onClick={downloadBackupCodes} 
                        variant="outline" 
                        className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      <Download className="w-4 h-4 mr-2" /> Descargar
                    </Button>
                    
                    <Button 
                        onClick={() => router.push("/dashboard")} 
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" /> Ir al Dashboard
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}