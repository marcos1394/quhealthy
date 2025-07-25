"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Check, Loader2, Stethoscope, HeartPulse, Brain, Apple, 
  Sticker, Hand, Wand, Scissors, Paintbrush, Sparkles, LucideIcon
} from 'lucide-react';

// Interfaces
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

// Objeto de iconos corregido: Almacena la referencia al componente.
const categoryIcons: { [key: string]: LucideIcon } = {
    'Medicina General': Stethoscope,
    'Odontología': Sticker,
    'Dermatología': Hand,
    'Psicología y Psiquiatría': Brain,
    'Nutrición': Apple,
    'Fisioterapia y Rehabilitación': HeartPulse,
    'Ginecología y Obstetricia': Sparkles,
    'Pediatría': Sparkles,
    'Cardiología': HeartPulse,
    'Oftalmología': Sparkles,
    'Traumatología y Ortopedia': Sparkles,
    'Laboratorios Clínicos': Sparkles,
    'Estilismo y Peluquería': Scissors,
    'Cuidado Facial y Estética': Wand,
    'Manicura y Pedicura': Paintbrush,
    'Maquillaje y Pestañas': Sparkles,
    'Tratamientos Corporales': Sparkles,
    'Depilación': Sparkles,
    'Tatuajes y Perforaciones': Sparkles,
};

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

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSelectedCategoryId('');
      setSelectedTagId('');
      
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/categories`;
      const response = await axios.get<ParentCategory[]>(apiUrl);
      
      const parentCategoryName = serviceType === 'health' ? 'Salud' : 'Belleza';
      const filteredCategories = response.data.find(p => p.name === parentCategoryName)?.categories || [];

      setCategories(filteredCategories);
    } catch (err) {
      setError('No se pudieron cargar las categorías. Intenta de nuevo.');
      toast.error('No se pudieron cargar las categorías.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [serviceType]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (selectedCategoryId) {
      const category = categories.find(c => c.id === parseInt(selectedCategoryId));
      setTags(category?.tags || []);
      setSelectedTagId('');
    } else {
      setTags([]);
    }
  }, [selectedCategoryId, categories]);

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
          <SelectContent className="bg-gray-800 text-white border-gray-700">
            {categories.map((category) => {
              const Icon = categoryIcons[category.name] || Sparkles; // Obtiene la referencia al componente del icono
              return (
                <SelectItem key={category.id} value={category.id.toString()}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" /> {/* Renderiza el icono como un componente */}
                    <span>{category.name}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-teal-400 mb-2">Especialidad</label>
        <Select value={selectedTagId} onValueChange={setSelectedTagId} disabled={!selectedCategoryId || tags.length === 0}>
          <SelectTrigger className="w-full bg-gray-700 border-gray-600">
            <SelectValue placeholder={!selectedCategoryId ? "Primero elige una categoría" : "Selecciona una especialidad..."} />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 text-white border-gray-700">
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