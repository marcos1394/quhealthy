/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { 
  Loader2, 
  Check, 
  Sparkles, 
  Stethoscope, 
  Brain, 
  Apple, 
  Sticker, 
  Hand, 
  Wand, 
  Scissors, 
  Paintbrush, 
  Activity,
  Search,
  X,
  Info,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  Star
} from 'lucide-react';
import { 
  CategoryResponse, 
  SubCategoryResponse, 
  TagResponse 
} from '@/types/onboarding';


interface CategorySelectorProps {
  categories: CategoryResponse[];
  tags: TagResponse[];
  selectedCategoryId?: number;
  selectedSubCategoryId?: number;
  selectedTagIds?: number[];
  onGetSubCategories: (catId: number) => Promise<SubCategoryResponse[]>;
  onSelectionChange: (catId: number, subId: number, tagIds: number[]) => void;
  error?: string | null; // ✅ Agregado para corregir "Cannot find name error"
}


export default function CategorySelector({ 
  categories,
  tags,
  selectedCategoryId,
  selectedSubCategoryId,
  selectedTagIds = [],
  onGetSubCategories,
  onSelectionChange,
  error // ✅ Desestructurado aquí
}: CategorySelectorProps) {
  
  const [subCategories, setSubCategories] = useState<SubCategoryResponse[]>([]);
  const [isLoadingSub, setIsLoadingSub] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState('');

  // 1. Cargar subcategorías si ya hay una categoría seleccionada (Modo Edición)
  const loadInitialSubCategories = useCallback(async () => {
    if (selectedCategoryId && selectedCategoryId > 0) {
      setIsLoadingSub(true);
      const subs = await onGetSubCategories(selectedCategoryId);
      setSubCategories(subs);
      setIsLoadingSub(false);
    }
  }, [selectedCategoryId, onGetSubCategories]);

  useEffect(() => {
    loadInitialSubCategories();
  }, [loadInitialSubCategories]);

  // 2. Handlers de Selección
  const handleCatChange = async (catId: number) => {
    if (catId === selectedCategoryId) return;

    setIsLoadingSub(true);
    const categoryName = categories.find(c => c.id === catId)?.name;
    
    // Notificamos al padre (reseteando subcategoría)
    onSelectionChange(catId, 0, selectedTagIds);
    
    try {
      const subs = await onGetSubCategories(catId);
      setSubCategories(subs);
      toast.success(`Especialidad: ${categoryName}`);
    } catch (error) {
      toast.error("No se pudieron cargar las subcategorías.");
    } finally {
      setIsLoadingSub(false);
    }
  };

  const handleSubChange = (subId: number) => {
    const subName = subCategories.find(s => s.id === subId)?.name;
    onSelectionChange(selectedCategoryId || 0, subId, selectedTagIds);
    if (subName) toast.success(`Enfoque: ${subName}`);
  };

  const handleTagToggle = (tagId: number) => {
    const newTags = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter(id => id !== tagId)
      : [...selectedTagIds, tagId];
    
    onSelectionChange(selectedCategoryId || 0, selectedSubCategoryId || 0, newTags);
  };

  // 3. Filtrado de Tags para la UI
  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase())
  );

  // 4. Cálculo de Progreso del Componente
  const completionSteps = [
    { label: 'Especialidad', completed: (selectedCategoryId || 0) > 0 },
    { label: 'Enfoque', completed: (selectedSubCategoryId || 0) > 0 },
    { label: 'Etiquetas', completed: selectedTagIds.length > 0 }
  ];
  const progress = (completionSteps.filter(s => s.completed).length / 3) * 100;

  // Loading State - Se activa cuando no hay categorías iniciales o carga el componente
  if (categories.length === 0 && !selectedCategoryId) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center p-12 bg-gray-900/50 border border-gray-800 rounded-2xl"
      >
        <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
        <p className="text-gray-400 font-semibold mb-1">Cargando especialidades...</p>
        <p className="text-gray-600 text-sm">Preparando catálogo personalizado</p>
      </motion.div>
    );
  }

  // Error State - Utiliza el error capturado en la lógica
  // Nota: Si 'error' viene de props o estado local
  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-400 font-bold mb-1">Error al Cargar</h3>
            <p className="text-sm text-gray-400 mb-3">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              size="sm"
              className="bg-red-600 hover:bg-red-700"
            >
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-6 border border-gray-800 space-y-6 shadow-xl">
      
      {/* Progress Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-white">Configura tu Especialidad</h3>
          <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
            {Math.round(progress)}% Completo
          </Badge>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        {/* Step Indicators */}
        <div className="flex gap-3">
          {completionSteps.map((step, index) => (
            <div 
              key={index}
              className={cn(
                "flex items-center gap-2 text-xs font-semibold transition-all",
                step.completed ? "text-emerald-400" : "text-gray-600"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all",
                step.completed 
                  ? "bg-emerald-500/10 border-emerald-500" 
                  : "bg-gray-800 border-gray-700"
              )}>
                {step.completed ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </div>
              <span className="hidden sm:inline">{step.label}</span>
              {index < completionSteps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-700 hidden sm:block" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Category */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/10 text-purple-400 text-xs font-black">
              1
            </span>
            Especialidad Principal
          </label>
          {(selectedCategoryId || 0) > 0 && (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          )}
        </div>
        
        <Select 
          value={selectedCategoryId?.toString()} 
          onValueChange={(val) => handleCatChange(Number(val))}
        >
          <SelectTrigger className={cn(
            "w-full h-14 text-base transition-all",
            "bg-gray-950 border-gray-700 text-white",
            (selectedCategoryId || 0) > 0 ? "border-emerald-500/30 ring-2 ring-emerald-500/10" : ""
          )}>
            <SelectValue placeholder="Selecciona tu área de especialidad..." />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700 text-gray-200">
            {categories.map((cat) => (
              <SelectItem 
                key={cat.id} 
                value={cat.id.toString()}
                className="py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Star className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="font-semibold">{cat.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Step 2: Subcategory */}
      <AnimatePresence>
        {(selectedCategoryId || 0) > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 text-xs font-black">
                  2
                </span>
                Enfoque Específico
              </label>
              {(selectedSubCategoryId || 0) > 0 && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            
            <Select 
              value={selectedSubCategoryId?.toString()} 
              onValueChange={(val) => handleSubChange(Number(val))}
              disabled={isLoadingSub}
            >
              <SelectTrigger className={cn(
                "w-full h-14 text-base transition-all",
                "bg-gray-950 border-gray-700 text-white",
                (selectedSubCategoryId || 0) > 0 ? "border-emerald-500/30 ring-2 ring-emerald-500/10" : ""
              )}>
                {isLoadingSub ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Cargando enfoques...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="¿Cuál es tu enfoque principal?" />
                )}
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700 text-gray-200">
                {subCategories.map((sub) => (
                  <SelectItem 
                    key={sub.id} 
                    value={sub.id.toString()}
                    className="py-3"
                  >
                    <div>
                      <p className="font-semibold">{sub.name}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 3: Tags */}
      <AnimatePresence>
        {(selectedSubCategoryId || 0) > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden pt-2"
          >
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-black">
                  3
                </span>
                Etiquetas
                <span className="text-gray-600 text-xs normal-case">(Opcional)</span>
              </label>
              <Badge className="bg-gray-800 text-gray-400 text-xs">
                {selectedTagIds.length} seleccionadas
              </Badge>
            </div>

            {/* Tag Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                value={tagSearchQuery}
                onChange={(e) => setTagSearchQuery(e.target.value)}
                placeholder="Buscar etiquetas..."
                className="pl-10 bg-gray-950 border-gray-700 h-11 text-white"
              />
              {tagSearchQuery && (
                <button
                  type="button"
                  onClick={() => setTagSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* All Tags Section */}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {filteredTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <motion.button
                      key={tag.id}
                      type="button"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleTagToggle(tag.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg transition-all text-sm font-medium border",
                        isSelected 
                          ? 'bg-purple-600 border-purple-500 text-white shadow-md' 
                          : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'
                      )}
                      style={{ 
    // ✅ Corrección: Forzamos a que sea string o undefined, nunca boolean
    backgroundColor: isSelected ? (tag.color ?? '#8B5CF6') : undefined,
    borderColor: isSelected ? (tag.color ?? '#8B5CF6') : undefined
  }}
                    >
                      {isSelected && <Check className="w-3 h-3 mr-1 inline-block" />}
                      {tag.name}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* No Results */}
            {tagSearchQuery && filteredTags.length === 0 && (
              <div className="text-center py-8">
                <Info className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  No se encontraron etiquetas con "{tagSearchQuery}"
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Summary */}
      {progress === 100 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3"
        >
          <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-emerald-400 mb-1">
              ¡Configuración Completa!
            </h4>
            <p className="text-xs text-emerald-300/80">
              Tu especialidad está configurada correctamente con {selectedTagIds.length} etiquetas.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )};