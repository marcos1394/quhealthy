/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-toastify';
import { 
  Loader2, Check, Sparkles, Stethoscope, Brain, Apple, 
  Sticker, Hand, Wand, Scissors, Paintbrush, Activity
} from 'lucide-react';

// Interfaces
interface Category {
  id: number;
  name: string;
  subcategories: SubCategory[];
}
interface SubCategory {
  id: number;
  name: string;
}
interface Tag {
  id: number;
  name: string;
  color: string;
}

interface CategorySelectorProps {
  serviceType: 'health' | 'beauty'; // 'health' = médicos, 'beauty' = estética
  onSelectionChange: (categoryId: number, subCategoryId: number, tagIds: number[]) => void;
}

// Mapeo de Iconos
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
    // Fallback
    'default': Sparkles
};

export default function CategorySelector({ serviceType, onSelectionChange }: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedCatId, setSelectedCatId] = useState<string>();
  const [selectedSubId, setSelectedSubId] = useState<string>();
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  // 1. Cargar Datos (Simulados para que funcione YA)
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // NOTA: Aquí deberías descomentar tus llamadas reales a la API cuando el backend esté listo.
      // const res = await axios.get('/api/categories');
      
      // MOCK DATA (Para que veas la UI funcionando ahora mismo)
      await new Promise(r => setTimeout(r, 800)); // Simular latencia
      
      if (serviceType === 'health') {
          setCategories([
              { id: 1, name: 'Medicina General', subcategories: [{id: 101, name: 'Consulta'}, {id: 102, name: 'Urgencias'}] },
              { id: 2, name: 'Odontología', subcategories: [{id: 201, name: 'Ortodoncia'}, {id: 202, name: 'Limpieza'}] },
              { id: 3, name: 'Psicología', subcategories: [{id: 301, name: 'Terapia Cognitiva'}, {id: 302, name: 'Pareja'}] },
          ]);
      } else {
          setCategories([
              { id: 4, name: 'Estilismo', subcategories: [{id: 401, name: 'Corte'}, {id: 402, name: 'Color'}] },
              { id: 5, name: 'Estética Facial', subcategories: [{id: 501, name: 'Limpieza'}, {id: 502, name: 'Botox'}] },
          ]);
      }
      
      setAllTags([
          { id: 1, name: 'Atención a Niños', color: '#10B981' },
          { id: 2, name: 'Urgencias 24h', color: '#EF4444' },
          { id: 3, name: 'Acepta Seguro', color: '#3B82F6' },
          { id: 4, name: 'Visita a Domicilio', color: '#8B5CF6' },
      ]);

    } catch (err) {
      setError('Error al cargar catálogo.');
      toast.error('No se pudieron cargar las categorías.');
    } finally {
      setLoading(false);
    }
  }, [serviceType]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // 2. Manejo de Selección
  const handleCatChange = (val: string) => {
    setSelectedCatId(val);
    const cat = categories.find(c => c.id.toString() === val);
    setSubCategories(cat?.subcategories || []);
    setSelectedSubId(undefined); // Reset subcat
  };

  const handleTagToggle = (id: number) => {
    setSelectedTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  // 3. Notificar al Padre
  useEffect(() => {
    if (selectedCatId && selectedSubId) {
        onSelectionChange(parseInt(selectedCatId), parseInt(selectedSubId), selectedTags);
    }
  }, [selectedCatId, selectedSubId, selectedTags, onSelectionChange]);

  if (loading) return (
    <div className="flex items-center justify-center p-8 bg-gray-900/50 border border-gray-800 rounded-xl">
        <Loader2 className="animate-spin text-purple-500 mr-2" />
        <span className="text-gray-400 text-sm">Cargando especialidades...</span>
    </div>
  );

  return (
    <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 space-y-6 shadow-sm">
        
        {/* Categoría Principal */}
        <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Especialidad Principal</label>
            <Select value={selectedCatId} onValueChange={handleCatChange}>
                <SelectTrigger className="w-full bg-gray-950 border-gray-700 h-12">
                    <SelectValue placeholder="Selecciona tu área..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 text-gray-200">
                    {categories.map((cat) => {
                        const Icon = categoryIcons[cat.name] || categoryIcons['default'];
                        return (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4 text-purple-400" />
                                    <span>{cat.name}</span>
                                </div>
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>
        </div>

        {/* Subcategoría (Animada) */}
        <AnimatePresence>
            {selectedCatId && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    className="space-y-2"
                >
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Enfoque Específico</label>
                    <Select value={selectedSubId} onValueChange={setSelectedSubId}>
                        <SelectTrigger className="w-full bg-gray-950 border-gray-700 h-12">
                            <SelectValue placeholder="¿Cuál es tu enfoque principal?" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-700 text-gray-200">
                            {subCategories.map((sub) => (
                                <SelectItem key={sub.id} value={sub.id.toString()}>
                                    {sub.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Tags (Animados) */}
        <AnimatePresence>
            {selectedSubId && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    className="space-y-2 pt-2"
                >
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Etiquetas (Opcional)</label>
                    <div className="flex flex-wrap gap-2">
                        {allTags.map((tag) => {
                            const isSelected = selectedTags.includes(tag.id);
                            return (
                                <Badge
                                    key={tag.id}
                                    onClick={() => handleTagToggle(tag.id)}
                                    className={`
                                        cursor-pointer px-3 py-1.5 transition-all text-sm font-normal
                                        ${isSelected ? 'border-transparent text-white shadow-md' : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'}
                                    `}
                                    style={{ 
                                        backgroundColor: isSelected ? tag.color : undefined,
                                    }}
                                >
                                    {isSelected && <Check className="w-3 h-3 mr-1.5 inline-block" />}
                                    {tag.name}
                                </Badge>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

    </div>
  );
}