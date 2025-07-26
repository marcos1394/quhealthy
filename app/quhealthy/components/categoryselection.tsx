"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Loader2, Check, Sparkles, LucideIcon } from 'lucide-react';
import { Stethoscope, HeartPulse, Brain, Apple, Sticker, Hand, Wand, Scissors, Paintbrush } from 'lucide-react';

// Interfaces
interface ParentCategory {
  id: number;
  name: string;
  categories: Category[];
}
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
interface EnhancedCategorySelectionProps {
  serviceType: 'health' | 'beauty';
  onSelectionChange: (categoryId: number, subCategoryId: number, tagIds: number[]) => void;
}

// Objeto de iconos
const categoryIcons: { [key: string]: LucideIcon } = {
    'Medicina General': Stethoscope, 'Odontología': Sticker, 'Dermatología': Hand,
    'Psicología y Psiquiatría': Brain, 'Nutrición': Apple, 'Fisioterapia y Rehabilitación': HeartPulse,
    'Ginecología y Obstetricia': Sparkles, 'Pediatría': Sparkles, 'Cardiología': HeartPulse,
    'Oftalmología': Sparkles, 'Traumatología y Ortopedia': Sparkles, 'Laboratorios Clínicos': Sparkles,
    'Estilismo y Peluquería': Scissors, 'Cuidado Facial y Estética': Wand, 'Manicura y Pedicura': Paintbrush,
    'Maquillaje y Pestañas': Sparkles, 'Tratamientos Corporales': Sparkles, 'Depilación': Sparkles,
    'Tatuajes y Perforaciones': Sparkles,
};

export default function EnhancedCategorySelection({
  serviceType,
  onSelectionChange
}: EnhancedCategorySelectionProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | undefined>();
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [categoriesResponse, tagsResponse] = await Promise.all([
        axios.get<ParentCategory[]>(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`),
        axios.get<Tag[]>(`${process.env.NEXT_PUBLIC_API_URL}/api/tags`)
      ]);
      const parentCategoryName = serviceType === 'health' ? 'Salud' : 'Belleza';
      const filteredCategories = categoriesResponse.data.find(p => p.name === parentCategoryName)?.categories || [];
      setCategories(filteredCategories);
      setAllTags(tagsResponse.data);
    } catch (err) {
      setError('No se pudieron cargar los datos.');
      toast.error('Error al cargar datos.');
    } finally {
      setLoading(false);
    }
  }, [serviceType]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
    const selected = categories.find(c => c.id === parseInt(categoryId));
    setSubCategories(selected?.subcategories || []);
    setSelectedSubCategoryId(undefined);
    setSelectedTagIds([]);
  }, [categories]);

  const handleSubCategoryChange = useCallback((subCategoryId: string) => {
    setSelectedSubCategoryId(subCategoryId);
  }, []);
  
  const handleTagToggle = useCallback((tagId: number) => {
    setSelectedTagIds(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
  }, []);
  
  const stableOnSelectionChange = useCallback(onSelectionChange, []);

  useEffect(() => {
    if (selectedCategoryId && selectedSubCategoryId) {
      stableOnSelectionChange(parseInt(selectedCategoryId), parseInt(selectedSubCategoryId), selectedTagIds);
    }
  }, [selectedCategoryId, selectedSubCategoryId, selectedTagIds, stableOnSelectionChange]);

  if (loading) {
    return <div className="flex justify-center p-8 bg-gray-800/50 rounded-xl"><Loader2 className="animate-spin text-teal-400" /></div>;
  }
  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 space-y-6"
    >
      <div>
        <label className="block text-sm font-medium text-teal-400 mb-2">1. Elige la Categoría</label>
        <Select value={selectedCategoryId} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full bg-gray-700 border-gray-600">
            <SelectValue placeholder="Selecciona..." />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 text-white border-gray-700">
            {categories.map((category) => {
              const Icon = categoryIcons[category.name] || Sparkles;
              return (
                <SelectItem key={category.id} value={category.id.toString()}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{category.name}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <AnimatePresence>
        {selectedCategoryId && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <label className="block text-sm font-medium text-teal-400 mb-2">2. Elige tu Subcategoría (Especialidad Principal)</label>
            <Select value={selectedSubCategoryId} onValueChange={handleSubCategoryChange} disabled={subCategories.length === 0}>
              <SelectTrigger className="w-full bg-gray-700 border-gray-600"><SelectValue placeholder="Selecciona..." /></SelectTrigger>
              <SelectContent className="bg-gray-800 text-white border-gray-700">
                {subCategories.map((sub) => <SelectItem key={sub.id} value={sub.id.toString()}>{sub.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {selectedSubCategoryId && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <label className="block text-sm font-medium text-teal-400 mb-2">3. Añade etiquetas descriptivas (opcional)</label>
            <div className="flex flex-wrap gap-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700 min-h-[50px]">
              {allTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <Badge
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.id)}
                    className="cursor-pointer transition-all"
                    style={{ 
                      backgroundColor: isSelected ? tag.color : '#4b5563',
                      color: '#ffffff',
                      border: isSelected ? `1px solid ${tag.color}` : '1px solid #4b5563'
                    }}
                  >
                    {isSelected && <Check className="w-3 h-3 mr-1.5" />}
                    {tag.name}
                  </Badge>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};