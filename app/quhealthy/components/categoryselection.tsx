"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Loader2, Check } from 'lucide-react';

// Interfaces (puedes moverlas a un archivo de tipos si prefieres)
interface ParentCategory {
  id: number;
  name: string;
  categories: CategoryProvider[]; // Estas son las Subcategorías
}
interface CategoryProvider {
  id: number;
  name: string;
  tags: Tag[];
}
interface Tag {
  id: number;
  name: string;
}
interface EnhancedCategorySelectionProps {
  serviceType: 'health' | 'beauty';
  // La función ahora pasará UN categoryId y UN ARRAY de tagIds
  onSelectionChange: (categoryId: number, tagIds: number[]) => void;
}

export default function EnhancedCategorySelection({
  serviceType,
  onSelectionChange
}: EnhancedCategorySelectionProps) {
  const [subCategories, setSubCategories] = useState<CategoryProvider[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | undefined>(undefined);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]); // Estado para múltiples tags

  // Carga las subcategorías basadas en el tipo de servicio
  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        setSelectedSubCategoryId(undefined);
        setSelectedTagIds([]);
        
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/categories`;
        const response = await axios.get<ParentCategory[]>(apiUrl);
        
        const parentCategoryName = serviceType === 'health' ? 'Salud' : 'Belleza';
        const filtered = response.data.find(p => p.name === parentCategoryName)?.categories || [];
        setSubCategories(filtered);
      } catch (err) {
        setError('No se pudieron cargar las categorías.');
        toast.error('No se pudieron cargar las categorías.');
      } finally {
        setLoading(false);
      }
    };
    fetchSubCategories();
  }, [serviceType]);

  // Maneja el cambio en el menú de Subcategoría
  const handleSubCategoryChange = (subCategoryId: string) => {
    setSelectedSubCategoryId(subCategoryId);
    const selected = subCategories.find(c => c.id === parseInt(subCategoryId));
    setAvailableTags(selected?.tags || []);
    // Resetea los tags seleccionados al cambiar de subcategoría
    setSelectedTagIds([]);
  };

  // Maneja el clic en un Tag (añadir o quitar)
  const handleTagToggle = (tagId: number) => {
    setSelectedTagIds(prevSelectedIds => {
      if (prevSelectedIds.includes(tagId)) {
        // Si ya está seleccionado, lo quitamos
        return prevSelectedIds.filter(id => id !== tagId);
      } else {
        // Si no está seleccionado, lo añadimos
        return [...prevSelectedIds, tagId];
      }
    });
  };
  
  // Notifica al componente padre cada vez que la selección cambia
  useEffect(() => {
    if (selectedSubCategoryId) {
      onSelectionChange(parseInt(selectedSubCategoryId), selectedTagIds);
    }
  }, [selectedSubCategoryId, selectedTagIds, onSelectionChange]);


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
      {/* Selector de Subcategoría (un solo select) */}
      <div>
        <label className="block text-sm font-medium text-teal-400 mb-2">1. Elige tu Área Principal</label>
        <Select value={selectedSubCategoryId} onValueChange={handleSubCategoryChange}>
          <SelectTrigger className="w-full bg-gray-700 border-gray-600">
            <SelectValue placeholder="Selecciona tu área..." />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 text-white border-gray-700">
            {subCategories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selector de Tags (selección múltiple con badges) */}
      <AnimatePresence>
        {selectedSubCategoryId && availableTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <label className="block text-sm font-medium text-teal-400 mb-2">2. Selecciona tus Especialidades (una o varias)</label>
            <div className="flex flex-wrap gap-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
              {availableTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <Badge
                    key={tag.id}
                    variant={isSelected ? "default" : "secondary"}
                    onClick={() => handleTagToggle(tag.id)}
                    className={`cursor-pointer transition-all ${isSelected ? 'bg-teal-500 text-white' : 'bg-gray-600 hover:bg-gray-500 text-gray-200'}`}
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