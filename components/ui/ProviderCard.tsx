import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Store, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Tipos importados o definidos aquí para el componente
interface Tag { name: string; }
interface Marketplace { storeName: string; storeSlug: string; storeBannerUrl: string | null; customDescription: string | null; }
interface ProviderData { id: number; name: string; marketplace: Marketplace; tags: Tag[]; }

interface ProviderCardProps {
  provider: ProviderData;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({ provider }) => {
  const { marketplace, tags } = provider;
  const publicProfileUrl = `/tienda/${marketplace.storeSlug || provider.id}`;

  return (
    <Link href={publicProfileUrl}>
      <motion.div 
        className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 h-full flex flex-col group transition-all duration-300 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/10"
        whileHover={{ y: -8 }}
      >
        {/* Banner */}
        <div className="h-32 bg-gray-700 bg-cover bg-center relative">
          {marketplace.storeBannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={marketplace.storeBannerUrl} alt={marketplace.storeName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
              <Store className="w-10 h-10 text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        </div>
        
        {/* Contenido */}
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="text-lg font-bold text-white truncate group-hover:text-purple-300 transition-colors">
            {marketplace.storeName || provider.name}
          </h3>
          <p className="text-sm text-gray-400 flex-grow mt-1 line-clamp-2">
            {marketplace.customDescription || 'Especialista en salud y bienestar.'}
          </p>

          {/* Tags / Especialidades */}
          {tags.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 2).map(tag => (
                  <Badge key={tag.name} variant="secondary" className="bg-purple-500/10 text-purple-300 border-purple-500/20">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer de la tarjeta */}
        <div className="p-4 border-t border-gray-700 mt-auto">
           <div className="flex justify-between items-center text-xs text-gray-400">
             <span>Ver Perfil</span>
             <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>Nuevo</span>
             </div>
           </div>
        </div>
      </motion.div>
    </Link>
  );
};