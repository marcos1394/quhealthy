"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  KeyRound,
  Shield,
  Smartphone,
  Copy,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Lock,
  Download,
  Home
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

export default function TwoFactorAuthPage() {
  const [step, setStep] = useState(1);
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchQRCode = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3001/auth/setup-2fa");
      setSecret(response.data.secret);
      setBackupCodes(response.data.backupCodes);
      toast.success("Código QR generado exitosamente", {
        icon: <CheckCircle className="w-5 h-5 text-green-400" />
      });
    } catch (err) {
      console.error(err);
      toast.error("No se pudo generar el código QR", {
        icon: <AlertCircle className="w-5 h-5 text-red-400" />
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:3001/auth/verify-2fa", {
        code,
      });

      if (response.data.success) {
        toast.success("2FA configurado exitosamente", {
          icon: <CheckCircle className="w-5 h-5 text-green-400" />
        });
        setStep(3);
      } else {
        toast.error("Código incorrecto", {
          icon: <AlertCircle className="w-5 h-5 text-red-400" />
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al verificar el código", {
        icon: <AlertCircle className="w-5 h-5 text-red-400" />
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles", {
      icon: <CheckCircle className="w-5 h-5 text-green-400" />
    });
  };

  const downloadBackupCodes = () => {
    const text = backupCodes.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '2fa-backup-codes.txt';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Códigos de respaldo descargados", {
      icon: <CheckCircle className="w-5 h-5 text-green-400" />
    });
  };

  useEffect(() => {
    fetchQRCode();
  }, []);

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/20 blur-3xl rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 blur-3xl rounded-full animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl p-8">
            <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent flex items-center justify-center gap-3">
              <Shield className="w-8 h-8" />
              Configurar 2FA
            </h1>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-4">
                    <Smartphone className="w-12 h-12 text-teal-400 mx-auto" />
                    <p className="text-gray-300">
                      Escanea el código QR usando Google Authenticator o Authy
                    </p>
                  </div>

                  {secret && (
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="flex flex-col items-center space-y-4"
                    >
                      <div className="bg-white p-4 rounded-lg">
                        <QRCodeSVG value={secret} size={180} />
                      </div>
                      
                      <div className="relative w-full bg-gray-700/50 p-4 rounded-lg">
                        <p className="text-sm text-gray-300 mb-1">Clave secreta:</p>
                        <div className="flex items-center gap-2">
                          <code className="text-teal-400 font-mono text-sm break-all">
                            {secret}
                          </code>
                          <button
                            onClick={() => copyToClipboard(secret)}
                            className="text-gray-400 hover:text-teal-400 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <motion.button
                    onClick={() => setStep(2)}
                    className="w-full bg-teal-500 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-teal-600 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ArrowRight className="w-5 h-5" />
                    Continuar
                  </motion.button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <form onSubmit={handleVerifyCode} className="space-y-6">
                    <div className="text-center space-y-4">
                      <Lock className="w-12 h-12 text-teal-400 mx-auto" />
                      <p className="text-gray-300">
                        Ingresa el código de verificación de tu aplicación
                      </p>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="relative"
                    >
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full bg-gray-700/50 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                        placeholder="000000"
                        maxLength={6}
                        required
                      />
                      <KeyRound className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    </motion.div>

                    <motion.button
                      type="submit"
                      className="w-full bg-teal-500 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-teal-600 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                    >
                      <ArrowRight className="w-5 h-5" />
                      {loading ? "Verificando..." : "Verificar Código"}
                    </motion.button>
                  </form>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-4">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
                    <h2 className="text-xl font-semibold text-teal-400">
                      ¡2FA Configurado Exitosamente!
                    </h2>
                    <p className="text-gray-300">
                      Guarda estos códigos de respaldo en un lugar seguro
                    </p>
                  </div>

                  <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
                    {backupCodes.map((backupCode, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg"
                      >
                        <code className="font-mono text-teal-400">{backupCode}</code>
                        <button
                          onClick={() => copyToClipboard(backupCode)}
                          className="text-gray-400 hover:text-teal-400 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <motion.button
                      onClick={downloadBackupCodes}
                      className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-600 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Download className="w-5 h-5" />
                      Descargar Códigos
                    </motion.button>
                    
                    <motion.button
                      onClick={() => window.location.href = "/dashboard"}
                      className="flex-1 bg-teal-500 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-teal-600 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Home className="w-5 h-5" />
                      Ir al Dashboard
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}