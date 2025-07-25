"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Interfaces TypeScript (se mantienen igual)
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

// Los iconos se mantienen igual
const categoryIcons: { [key: string]: string } = {
  // Salud
  'Medicina General': '👨‍⚕️',
  'Odontología': '🦷',
  'Dermatología': '🧴',
  'Psicología y Psiquiatría': '🧠',
  'Nutrición': '🍎',
  'Fisioterapia y Rehabilitación': '💪',
  'Ginecología y Obstetricia': '🤰',
  'Pediatría': '👶',
  'Cardiología': '❤️',
  'Oftalmología': '👁️',
  'Traumatología y Ortopedia': '🦴',
  'Laboratorios Clínicos': '🔬',
  
  // Belleza
  'Estilismo y Peluquería': '💇‍♀️',
  'Cuidado Facial y Estética': '💄',
  'Manicura y Pedicura': '💅',
  'Maquillaje y Pestañas': '✨',
  'Tratamientos Corporales': '💆‍♂️',
  'Depilación': '🌸',
  'Tatuajes y Perforaciones': '✒️'
};

export default function EnhancedCategorySelection({
  serviceType,
  onCategorySelect
}: EnhancedCategorySelectionProps) {
  const [categories, setCategories] = useState<CategoryProvider[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryProvider | null>(null);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        setSelectedCategory(null); // Resetea la selección al cambiar de tipo
        setSelectedTag(null);
        
        // --- INICIO DE LA CORRECCIÓN ---
        // 1. Construye la URL de la API usando la variable de entorno
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/categories`;
        
        const response = await axios.get<ParentCategory[]>(apiUrl);
        // --- FIN DE LA CORRECCIÓN ---
        
        const parentCategoryName = serviceType === 'health' ? 'Salud' : 'Belleza';
        const filteredCategories = response.data.find(
          parent => parent.name === parentCategoryName
        )?.categories || [];

        setCategories(filteredCategories);
      } catch (err) {
        setError('No se pudieron cargar las categorías. Intenta de nuevo.');
        toast.error('No se pudieron cargar las categorías.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [serviceType]); // El efecto se ejecuta cada vez que cambia el tipo de servicio

  const handleCategorySelect = (category: CategoryProvider) => {
    setSelectedCategory(category);
    setSelectedTag(null);
  };

  const handleTagSelect = (tag: Tag) => {
    if (!selectedCategory) return;
    setSelectedTag(tag);
    onCategorySelect(selectedCategory.id, tag.id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 bg-gray-800/50 rounded-xl">
        <Loader2 className="animate-spin text-teal-400" size={32} />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Columna de Categorías */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-gray-800/50 rounded-xl p-4 border border-gray-700"
      >
        <h3 className="text-lg font-semibold mb-4 text-teal-400">Elige una categoría</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              onClick={() => handleCategorySelect(category)}
              whileHover={{ scale: 1.02 }}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                selectedCategory?.id === category.id 
                  ? 'bg-teal-500/20 border border-teal-500' 
                  : 'bg-gray-700/50 hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{categoryIcons[category.name] || '⭐'}</span>
                <span>{category.name}</span>
              </div>
              {selectedCategory?.id === category.id && <Check className="text-teal-400" />}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Columna de Especialidades (Tags) */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-gray-800/50 rounded-xl p-4 border border-gray-700"
      >
        <h3 className="text-lg font-semibold mb-4 text-teal-400">Selecciona tu especialidad</h3>
        {selectedCategory ? (
          <div className="space-y-2">
            {selectedCategory.tags.map((tag) => (
              <motion.div
                key={tag.id}
                onClick={() => handleTagSelect(tag)}
                whileHover={{ scale: 1.02 }}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                  selectedTag?.id === tag.id 
                    ? 'bg-teal-500/20 border border-teal-500' 
                    : 'bg-gray-700/50 hover:bg-gray-700'
                }`}
              >
                <span>{tag.name}</span>
                {selectedTag?.id === tag.id ? (
                  <Check className="text-teal-400" />
                ) : (
                  <ChevronRight className="text-gray-400" />
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center flex items-center justify-center h-full">
            <p>Selecciona primero una categoría</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};