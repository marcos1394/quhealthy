"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Loader2, Check } from 'lucide-react';

// --- NUEVAS INTERFACES ALINEADAS CON EL BACKEND ---
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

  // Carga TODA la data inicial (categorías y tags) en paralelo
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Hacemos las dos llamadas a la API en paralelo para más eficiencia
        const [categoriesResponse, tagsResponse] = await Promise.all([
          axios.get<ParentCategory[]>(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`),
          axios.get<Tag[]>(`${process.env.NEXT_PUBLIC_API_URL}/api/tags`)
        ]);
        
        const parentCategoryName = serviceType === 'health' ? 'Salud' : 'Belleza';
        const filteredCategories = categoriesResponse.data.find(p => p.name === parentCategoryName)?.categories || [];
        
        setCategories(filteredCategories);
        setAllTags(tagsResponse.data);

      } catch (err) {
        setError('No se pudieron cargar los datos de categoría. Intenta de nuevo.');
        toast.error('Error al cargar datos.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [serviceType]);

  // Maneja el cambio en el selector de Categoría
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    const selected = categories.find(c => c.id === parseInt(categoryId));
    setSubCategories(selected?.subcategories || []);
    // Resetea las selecciones posteriores
    setSelectedSubCategoryId(undefined);
    setSelectedTagIds([]);
  };

  // Maneja el cambio en el selector de Subcategoría
  const handleSubCategoryChange = (subCategoryId: string) => {
    setSelectedSubCategoryId(subCategoryId);
  };
  
  // Maneja el clic en un Tag (añadir o quitar)
  const handleTagToggle = (tagId: number) => {
    setSelectedTagIds(prevSelectedIds =>
      prevSelectedIds.includes(tagId)
        ? prevSelectedIds.filter(id => id !== tagId)
        : [...prevSelectedIds, tagId]
    );
  };
  
  // Notifica al componente padre cada vez que la selección cambia y está completa
  useEffect(() => {
    if (selectedCategoryId && selectedSubCategoryId) {
      onSelectionChange(parseInt(selectedCategoryId), parseInt(selectedSubCategoryId), selectedTagIds);
    }
  }, [selectedCategoryId, selectedSubCategoryId, selectedTagIds, onSelectionChange]);

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
      {/* 1. Selector de Categoría */}
      <div>
        <label className="block text-sm font-medium text-teal-400 mb-2">1. Elige la Categoría</label>
        <Select value={selectedCategoryId} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full bg-gray-700 border-gray-600"><SelectValue placeholder="Selecciona..." /></SelectTrigger>
          <SelectContent className="bg-gray-800 text-white border-gray-700">
            {categories.map((category) => <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* 2. Selector de Subcategoría */}
      <AnimatePresence>
        {selectedCategoryId && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <label className="block text-sm font-medium text-teal-400 mb-2">2. Elige tu Especialidad Principal</label>
            <Select value={selectedSubCategoryId} onValueChange={handleSubCategoryChange} disabled={subCategories.length === 0}>
              <SelectTrigger className="w-full bg-gray-700 border-gray-600"><SelectValue placeholder="Selecciona..." /></SelectTrigger>
              <SelectContent className="bg-gray-800 text-white border-gray-700">
                {subCategories.map((sub) => <SelectItem key={sub.id} value={sub.id.toString()}>{sub.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Selector de Tags (Etiquetas) */}
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
                      backgroundColor: isSelected ? tag.color : '#4b5563', // Gris si no está seleccionado
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