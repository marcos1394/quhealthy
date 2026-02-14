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
  ChevronRight
} from 'lucide-react';

/**
 * CategorySelector Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. FEEDBACK INMEDIATO
 *    - Progress bar visual (0/3 pasos)
 *    - Tag counter dinámico
 *    - Selection confirmation
 *    - Step indicators
 * 
 * 2. JERARQUÍA VISUAL
 *    - Steps numerados y destacados
 *    - Active step con color
 *    - Icons por categoría
 *    - Visual grouping
 * 
 * 3. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Icons descriptivos
 *    - Search filter
 *    - Popular tags badge
 *    - Visual categories
 * 
 * 4. SATISFICING
 *    - Quick tag selection
 *    - Popular categories first
 *    - Search shortcut
 *    - One-click tags
 * 
 * 5. PRIMING
 *    - Success checkmarks
 *    - Progress indicator
 *    - Popular badges
 *    - Completion feedback
 * 
 * 6. AFFORDANCE
 *    - Clickable tags clara
 *    - Search filter visible
 *    - Hover effects
 *    - Interactive badges
 */

// Interfaces
interface Category {
  id: number;
  name: string;
  subcategories: SubCategory[];
  icon?: string;
  popular?: boolean;
}

interface SubCategory {
  id: number;
  name: string;
  description?: string;
}

interface Tag {
  id: number;
  name: string;
  color: string;
  popular?: boolean;
}

interface CategorySelectorProps {
  serviceType: 'health' | 'beauty';
  onSelectionChange: (categoryId: number, subCategoryId: number, tagIds: number[]) => void;
  initialCategory?: number;
  initialSubCategory?: number;
  initialTags?: number[];
}

// Icon mapping
const categoryIcons: Record<string, any> = {
  'Medicina General': Stethoscope, 
  'Odontología': Sticker, 
  'Dermatología': Hand,
  'Psicología': Brain, 
  'Nutrición': Apple, 
  'Fisioterapia': Activity,
  'Estilismo': Scissors, 
  'Estética Facial': Wand, 
  'Manicura': Paintbrush,
  'default': Sparkles
};

export default function CategorySelector({ 
  serviceType, 
  onSelectionChange,
  initialCategory,
  initialSubCategory,
  initialTags = []
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedCatId, setSelectedCatId] = useState<string | undefined>(
    initialCategory?.toString()
  );
  const [selectedSubId, setSelectedSubId] = useState<string | undefined>(
    initialSubCategory?.toString()
  );
  const [selectedTags, setSelectedTags] = useState<number[]>(initialTags);
  const [tagSearchQuery, setTagSearchQuery] = useState('');

  // Progress calculation - FEEDBACK INMEDIATO
  const completionSteps = [
    { id: 1, label: 'Especialidad', completed: !!selectedCatId },
    { id: 2, label: 'Enfoque', completed: !!selectedSubId },
    { id: 3, label: 'Etiquetas', completed: selectedTags.length > 0 }
  ];
  const progress = (completionSteps.filter(s => s.completed).length / completionSteps.length) * 100;

  // Fetch data - CREDIBILIDAD
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(r => setTimeout(r, 800));
      
      if (serviceType === 'health') {
        setCategories([
          { 
            id: 1, 
            name: 'Medicina General', 
            popular: true,
            subcategories: [
              { id: 101, name: 'Consulta General', description: 'Diagnóstico y tratamiento' },
              { id: 102, name: 'Urgencias', description: 'Atención inmediata' },
              { id: 103, name: 'Medicina Preventiva', description: 'Check-ups y prevención' }
            ]
          },
          { 
            id: 2, 
            name: 'Odontología', 
            popular: true,
            subcategories: [
              { id: 201, name: 'Ortodoncia', description: 'Corrección dental' },
              { id: 202, name: 'Limpieza', description: 'Higiene bucal' },
              { id: 203, name: 'Endodoncia', description: 'Tratamiento de conductos' }
            ]
          },
          { 
            id: 3, 
            name: 'Psicología',
            subcategories: [
              { id: 301, name: 'Terapia Cognitiva', description: 'TCC' },
              { id: 302, name: 'Terapia de Pareja', description: 'Relaciones' },
              { id: 303, name: 'Terapia Infantil', description: 'Niños y adolescentes' }
            ]
          },
          { 
            id: 4, 
            name: 'Nutrición',
            subcategories: [
              { id: 401, name: 'Nutrición Deportiva', description: 'Atletas' },
              { id: 402, name: 'Control de Peso', description: 'Pérdida/ganancia' },
              { id: 403, name: 'Nutrición Clínica', description: 'Condiciones médicas' }
            ]
          },
        ]);
      } else {
        setCategories([
          { 
            id: 5, 
            name: 'Estilismo',
            popular: true,
            subcategories: [
              { id: 501, name: 'Corte', description: 'Corte y peinado' },
              { id: 502, name: 'Color', description: 'Tintes y mechas' },
              { id: 503, name: 'Tratamientos', description: 'Keratina, botox capilar' }
            ]
          },
          { 
            id: 6, 
            name: 'Estética Facial',
            popular: true,
            subcategories: [
              { id: 601, name: 'Limpieza Facial', description: 'Deep cleaning' },
              { id: 602, name: 'Botox', description: 'Toxina botulínica' },
              { id: 603, name: 'Rellenos', description: 'Ácido hialurónico' }
            ]
          },
        ]);
      }
      
      const tags = [
        { id: 1, name: 'Atención a Niños', color: '#10B981', popular: true },
        { id: 2, name: 'Urgencias 24h', color: '#EF4444', popular: true },
        { id: 3, name: 'Acepta Seguro', color: '#3B82F6', popular: true },
        { id: 4, name: 'Visita a Domicilio', color: '#8B5CF6' },
        { id: 5, name: 'Telemedicina', color: '#06B6D4' },
        { id: 6, name: 'Parking Gratuito', color: '#F59E0B' },
        { id: 7, name: 'Accesible Silla Ruedas', color: '#84CC16' },
        { id: 8, name: 'Inglés/Español', color: '#EC4899' },
      ];
      
      setAllTags(tags);
      setFilteredTags(tags);

    } catch (err) {
      setError('Error al cargar catálogo.');
      toast.error('No se pudieron cargar las categorías.');
    } finally {
      setLoading(false);
    }
  }, [serviceType]);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  // Filter tags - RECONOCIMIENTO
  useEffect(() => {
    if (tagSearchQuery) {
      const filtered = allTags.filter(tag => 
        tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase())
      );
      setFilteredTags(filtered);
    } else {
      setFilteredTags(allTags);
    }
  }, [tagSearchQuery, allTags]);

  // Handle category change - JERARQUÍA
  const handleCatChange = (val: string) => {
    setSelectedCatId(val);
    const cat = categories.find(c => c.id.toString() === val);
    setSubCategories(cat?.subcategories || []);
    setSelectedSubId(undefined);
    toast.success(`${cat?.name} seleccionada`);
  };

  // Handle subcategory change
  const handleSubChange = (val: string) => {
    setSelectedSubId(val);
    const sub = subCategories.find(s => s.id.toString() === val);
    toast.success(`Enfoque: ${sub?.name}`);
  };

  // Handle tag toggle - AFFORDANCE
  const handleTagToggle = (id: number) => {
    setSelectedTags(prev => {
      const newTags = prev.includes(id) 
        ? prev.filter(t => t !== id) 
        : [...prev, id];
      
      const tag = allTags.find(t => t.id === id);
      if (newTags.includes(id)) {
        toast.success(`✓ ${tag?.name} añadida`);
      }
      
      return newTags;
    });
  };

  // Notify parent - FEEDBACK
  useEffect(() => {
    if (selectedCatId && selectedSubId) {
      onSelectionChange(
        parseInt(selectedCatId), 
        parseInt(selectedSubId), 
        selectedTags
      );
    }
  }, [selectedCatId, selectedSubId, selectedTags, onSelectionChange]);

  // Loading State
  if (loading) {
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

  // Error State
  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl">
        <div className="flex items-start gap-3">
          <X className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-400 font-bold mb-1">Error al Cargar</h3>
            <p className="text-sm text-gray-400 mb-3">{error}</p>
            <Button
              onClick={() => fetchData()}
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
      
      {/* Progress Header - FEEDBACK INMEDIATO */}
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
              key={step.id}
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
                  <span className="text-xs">{step.id}</span>
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

      {/* Step 1: Category - JERARQUÍA VISUAL */}
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
          {selectedCatId && (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          )}
        </div>
        
        <Select value={selectedCatId} onValueChange={handleCatChange}>
          <SelectTrigger className={cn(
            "w-full h-14 text-base transition-all",
            "bg-gray-950 border-gray-700",
            selectedCatId && "border-emerald-500/30 ring-2 ring-emerald-500/10"
          )}>
            <SelectValue placeholder="Selecciona tu área de especialidad..." />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700 text-gray-200">
            {categories.map((cat) => {
              const Icon = categoryIcons[cat.name] || categoryIcons['default'];
              return (
                <SelectItem 
                  key={cat.id} 
                  value={cat.id.toString()}
                  className="py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Icon className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="font-semibold">{cat.name}</span>
                    {cat.popular && (
                      <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-xs">
                        Popular
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Step 2: Subcategory - RECONOCIMIENTO */}
      <AnimatePresence>
        {selectedCatId && (
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
              {selectedSubId && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            
            <Select value={selectedSubId} onValueChange={handleSubChange}>
              <SelectTrigger className={cn(
                "w-full h-14 text-base transition-all",
                "bg-gray-950 border-gray-700",
                selectedSubId && "border-emerald-500/30 ring-2 ring-emerald-500/10"
              )}>
                <SelectValue placeholder="¿Cuál es tu enfoque principal?" />
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
                      {sub.description && (
                        <p className="text-xs text-gray-500">{sub.description}</p>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 3: Tags - AFFORDANCE */}
      <AnimatePresence>
        {selectedSubId && (
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
                {selectedTags.length} seleccionadas
              </Badge>
            </div>

            {/* Tag Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                value={tagSearchQuery}
                onChange={(e) => setTagSearchQuery(e.target.value)}
                placeholder="Buscar etiquetas..."
                className="pl-10 bg-gray-950 border-gray-700 h-11"
              />
              {tagSearchQuery && (
                <button
                  onClick={() => setTagSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Popular Tags Section */}
            {!tagSearchQuery && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Populares
                </p>
                <div className="flex flex-wrap gap-2">
                  {filteredTags.filter(t => t.popular).map((tag) => {
                    const isSelected = selectedTags.includes(tag.id);
                    return (
                      <motion.button
                        key={tag.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleTagToggle(tag.id)}
                        className={cn(
                          "px-4 py-2 rounded-lg transition-all text-sm font-semibold border-2",
                          isSelected 
                            ? 'text-white shadow-lg' 
                            : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'
                        )}
                        style={{ 
                          backgroundColor: isSelected ? tag.color : undefined,
                          borderColor: isSelected ? tag.color : undefined
                        }}
                      >
                        {isSelected && <Check className="w-4 h-4 mr-1.5 inline-block" />}
                        {tag.name}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All Tags Section */}
            <div className="space-y-2">
              {!tagSearchQuery && (
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Todas las Etiquetas
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {filteredTags.filter(t => !t.popular || tagSearchQuery).map((tag) => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <motion.button
                      key={tag.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleTagToggle(tag.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg transition-all text-sm font-medium border",
                        isSelected 
                          ? 'text-white shadow-md' 
                          : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'
                      )}
                      style={{ 
                        backgroundColor: isSelected ? tag.color : undefined,
                        borderColor: isSelected ? tag.color : undefined
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
              Tu especialidad está configurada correctamente con {selectedTags.length} etiquetas.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}