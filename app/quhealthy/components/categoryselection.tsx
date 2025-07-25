"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from 'axios';
import { toast } from 'react-toastify';

// Interfaces (puedes moverlas a un archivo de tipos si prefieres)
interface ParentCategory {
  id: number;
  name: string;
  categories: CategoryProvider[];
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
  onCategorySelect: (categoryId: number, tagId: number) => void;
}

export default function EnhancedCategorySelection({
  serviceType,
  onCategorySelect
}: EnhancedCategorySelectionProps) {
  const [categories, setCategories] = useState<CategoryProvider[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedTagId, setSelectedTagId] = useState<string>('');

  // Carga todas las categorías una vez
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/categories`;
        const response = await axios.get<ParentCategory[]>(apiUrl);
        const parentCategoryName = serviceType === 'health' ? 'Salud' : 'Belleza';
        const filteredCategories = response.data.find(p => p.name === parentCategoryName)?.categories || [];
        setCategories(filteredCategories);
      } catch (err) {
        setError('No se pudieron cargar las categorías.');
        toast.error('No se pudieron cargar las categorías.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [serviceType]);

  // Actualiza los tags disponibles cuando cambia la categoría seleccionada
  useEffect(() => {
    if (selectedCategoryId) {
      const category = categories.find(c => c.id === parseInt(selectedCategoryId));
      setTags(category?.tags || []);
      setSelectedTagId(''); // Resetea la selección de tag
    } else {
      setTags([]);
    }
  }, [selectedCategoryId, categories]);

  // Informa a la página principal cuando la selección está completa
  useEffect(() => {
    if (selectedCategoryId && selectedTagId) {
      onCategorySelect(parseInt(selectedCategoryId), parseInt(selectedTagId));
    }
  }, [selectedCategoryId, selectedTagId, onCategorySelect]);


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
      className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-teal-400 mb-2">Categoría</label>
        <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
          <SelectTrigger className="w-full bg-gray-700 border-gray-600">
            <SelectValue placeholder="Selecciona una categoría..." />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-teal-400 mb-2">Especialidad</label>
        <Select value={selectedTagId} onValueChange={setSelectedTagId} disabled={!selectedCategoryId || tags.length === 0}>
          <SelectTrigger className="w-full bg-gray-700 border-gray-600">
            <SelectValue placeholder={!selectedCategoryId ? "Primero elige una categoría" : "Selecciona una especialidad..."} />
          </SelectTrigger>
          <SelectContent>
            {tags.map((tag) => (
              <SelectItem key={tag.id} value={tag.id.toString()}>
                {tag.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCategoryId && selectedTagId && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-green-400 pt-2">
          <Check size={16} />
          <p className="text-sm">Selección completa</p>
        </motion.div>
      )}
    </motion.div>
  );
};