"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { NutritionAnalysis } from '@/types/nutrition';
import { toast } from 'react-toastify';
import { nutritionService } from '@/services/nutrition.service';

interface FoodAnalyzerProps {
  onComplete: (analysis: NutritionAnalysis) => void;
}

export default function FoodAnalyzer({ onComplete }: FoodAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Mostrar previsualización
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Iniciar análisis
    await analyzeFood(file);
  };

  const analyzeFood = async (file: File) => {
    setIsAnalyzing(true);

    try {
      const result = await nutritionService.analyzeFood(file);
      toast.success('Análisis completado');
      onComplete(result);
    } catch (error) {
      console.error(error);
      toast.error('Hubo un error al procesar la imagen. Intenta nuevamente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#050505] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 flex flex-col items-center justify-center min-h-[400px]">
      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileSelect}
        disabled={isAnalyzing}
      />
      
      {!previewUrl ? (
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-50 dark:bg-quhealthy-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Camera className="w-10 h-10 text-quhealthy-green" />
          </div>
          <h2 className="text-xl font-bold mb-3 text-black dark:text-white">Toma una foto a tu comida</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
            Nuestra IA analizará la imagen para detectar alimentos, porciones estimadas y calcular el valor nutricional de tu plato.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-quhealthy-green hover:bg-quhealthy-green/90 text-white rounded-full font-bold px-8"
            >
              <Camera className="w-4 h-4 mr-2" />
              Tomar Foto
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-lg text-center">
          <div className="relative rounded-xl overflow-hidden mb-6 aspect-video bg-gray-100 flex items-center justify-center border border-gray-200">
            <img src={previewUrl} alt="Comida" className="object-cover w-full h-full" />
            
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-quhealthy-green" />
                <p className="font-bold text-lg">Analizando plato...</p>
                <p className="text-sm opacity-80 mt-1">Identificando ingredientes y porciones</p>
              </div>
            )}
          </div>

          {!isAnalyzing && (
            <Button 
              variant="outline"
              onClick={() => {
                setPreviewUrl(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="rounded-full"
            >
              Intentar con otra foto
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
