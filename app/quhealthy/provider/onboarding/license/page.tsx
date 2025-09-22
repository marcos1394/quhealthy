"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  FileText,
  Camera,
  Info,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileUpload } from '@/app/quhealthy/components/Fleupload';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function LicenseValidationPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    licenseNumber: '',
    frontImageUrl: '',
    backImageUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (e.target.name === 'licenseNumber' && e.target.value.trim() && currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const isFormValid = formData.licenseNumber.trim() && formData.frontImageUrl && formData.backImageUrl;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.warn("Por favor, completa todos los campos requeridos.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await axios.put('/api/providers/onboarding/license', formData, { withCredentials: true });
      toast.success("¡Documentos enviados exitosamente!");
      router.push('/quhealthyonboarding/checklist');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Error al procesar la solicitud.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Número de Cédula', completed: !!formData.licenseNumber.trim() },
    { number: 2, title: 'Frente', completed: !!formData.frontImageUrl },
    { number: 3, title: 'Reverso', completed: !!formData.backImageUrl }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gray-900/10 opacity-20"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-4xl"
      >
        {/* Header Section */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl shadow-2xl mb-6"
          >
            <Shield className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Validación Profesional
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            Verificamos tu cédula profesional para garantizar la confianza y seguridad de tus futuros pacientes
          </motion.p>
        </div>

        {/* Progress Steps */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center space-x-4 bg-slate-800/40 backdrop-blur-sm rounded-full px-6 py-3 border border-slate-700/50">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    step.completed 
                      ? 'bg-green-500 text-white' 
                      : currentStep >= step.number 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-slate-600 text-slate-400'
                  }`}>
                    {step.completed ? <CheckCircle className="w-4 h-4" /> : step.number}
                  </div>
                  <span className={`text-sm font-medium transition-colors duration-300 ${
                    step.completed ? 'text-green-400' : currentStep >= step.number ? 'text-white' : 'text-slate-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 transition-colors duration-300 ${
                    steps[index + 1].completed ? 'bg-green-500' : 'bg-slate-600'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="p-8">
            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6"
                >
                  <Alert variant="destructive" className="bg-red-900/20 border-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-200">{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-8">
              {/* License Number Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Número de Cédula Profesional</h3>
                    <p className="text-slate-400 text-sm">Ingresa tu número de cédula tal como aparece en el documento</p>
                  </div>
                </div>
                
                <div className="relative">
                  <input 
                    id="licenseNumber"
                    name="licenseNumber" 
                    value={formData.licenseNumber}
                    onChange={handleInputChange} 
                    required 
                    className="w-full p-4 bg-slate-700/50 rounded-xl border border-slate-600 text-white text-lg placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200" 
                    placeholder="Ej: 12345678"
                  />
                  {formData.licenseNumber.trim() && (
                    <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                </div>
              </motion.div>

              {/* File Upload Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                    <Camera className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Fotografías del Documento</h3>
                    <p className="text-slate-400 text-sm">Sube imágenes claras de ambos lados de tu cédula profesional</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <FileUpload
                      label="Frente de la Cédula"
                      currentUrl={formData.frontImageUrl}
                      onChange={(url) => setFormData(prev => ({...prev, frontImageUrl: url}))}
                    />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                  >
                    <FileUpload
                      label="Reverso de la Cédula"
                      currentUrl={formData.backImageUrl}
                      onChange={(url) => setFormData(prev => ({...prev, backImageUrl: url}))}
                    />
                  </motion.div>
                </div>

                {/* Tips Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="bg-blue-900/20 border border-blue-800/30 rounded-xl p-4"
                >
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-200 mb-2">Consejos para mejores resultados:</h4>
                      <ul className="text-sm text-blue-300 space-y-1">
                        <li>• Asegúrate de que el texto sea legible y no esté borroso</li>
                        <li>• Evita sombras o reflejos en la imagen</li>
                        <li>• Captura todo el documento dentro del marco</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Submit Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-8 pt-6 border-t border-slate-700"
            >
              <Button 
                type="submit" 
                disabled={loading || !isFormValid} 
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-xl shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="animate-spin w-5 h-5" />
                    <span>Procesando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Enviar para Verificación</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
              
              <div className="flex items-center justify-center space-x-2 mt-4 text-slate-400">
                <Clock className="w-4 h-4" />
                <p className="text-sm">
                  Tiempo de revisión: 24-48 horas hábiles
                </p>
              </div>
            </motion.div>
          </form>
        </motion.div>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="text-center mt-6"
        >
          <div className="inline-flex items-center space-x-2 bg-slate-800/40 backdrop-blur-sm rounded-full px-4 py-2 border border-slate-700/50">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm text-slate-300">Tus datos están protegidos con encriptación de grado militar</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}