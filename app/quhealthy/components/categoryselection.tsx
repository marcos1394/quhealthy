"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight, Loader2 } from 'lucide-react';
import axios from 'axios';

// TypeScript Interfaces
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

const categoryIcons: { [key in 'health' | 'beauty']: { [key: string]: string } } = {
  health: {
    'Médicos': '👨‍⚕️',
    'Terapeutas': '💆',
    'Salud Mental': '🧠'
  },
  beauty: {
    'Peluquería': '💇',
    'Estética': '💄',
    'Masajes': '💆‍♀️'
  }
};

const EnhancedCategorySelection: React.FC<EnhancedCategorySelectionProps> = ({
  serviceType,
  onCategorySelect
}) => {
  const [categories, setCategories] = useState<CategoryProvider[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryProvider | null>(null);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get<ParentCategory[]>('http://localhost:3001/api/categories');
        
        // Filter categories based on service type
        const filteredCategories = response.data.find(
          parent => (serviceType === 'health' && parent.name === 'Salud') ||
                    (serviceType === 'beauty' && parent.name === 'Belleza')
        )?.categories || [];

        setCategories(filteredCategories);
      } catch (err) {
        setError('No se pudieron cargar las categorías');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [serviceType]);

  const handleCategorySelect = (category: CategoryProvider) => {
    setSelectedCategory(category);
    setSelectedTag(null);
  };

  const handleTagSelect = (tag: Tag) => {
    setSelectedTag(tag);
    onCategorySelect(selectedCategory!.id, tag.id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-teal-400" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-8">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Categories Column */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-800/50 rounded-xl p-4 border border-gray-700"
      >
        <h3 className="text-lg font-semibold mb-4 text-teal-400">
          Elige una categoría
        </h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              onClick={() => handleCategorySelect(category)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                flex items-center justify-between p-3 rounded-lg cursor-pointer
                transition-all duration-300
                ${selectedCategory?.id === category.id 
                  ? 'bg-teal-500/20 border border-teal-500' 
                  : 'bg-gray-700/50 hover:bg-gray-700/70'}
              `}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {categoryIcons[serviceType][category.name] || '🏥'}
                </span>
                <span>{category.name}</span>
              </div>
              {selectedCategory?.id === category.id && (
                <Check className="text-teal-400" />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tags/Specialties Column */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-800/50 rounded-xl p-4 border border-gray-700"
      >
        <h3 className="text-lg font-semibold mb-4 text-teal-400">
          Selecciona tu especialidad
        </h3>
        {selectedCategory ? (
          <div className="space-y-2">
            {selectedCategory.tags.map((tag) => (
              <motion.div
                key={tag.id}
                onClick={() => handleTagSelect(tag)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex items-center justify-between p-3 rounded-lg cursor-pointer
                  transition-all duration-300
                  ${selectedTag?.id === tag.id 
                    ? 'bg-teal-500/20 border border-teal-500' 
                    : 'bg-gray-700/50 hover:bg-gray-700/70'}
                `}
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
          <div className="text-gray-500 text-center py-8">
            Selecciona primero una categoría
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default EnhancedCategorySelection;