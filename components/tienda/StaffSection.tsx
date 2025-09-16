"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Calendar, Users } from 'lucide-react';
import { StaffMember } from '@/app/quhealthy/types/marketplace'; // 1. Importamos el tipo desde el archivo central

// 2. Definimos las props usando la interfaz importada
interface StaffSectionProps {
  staff: StaffMember[];
}

export const StaffSection: React.FC<StaffSectionProps> = ({ staff }) => {
  // Si no hay miembros del equipo, no renderizamos nada (o un estado vacío)
  if (!staff || staff.length === 0) {
    return null; // Opcional: podrías devolver un mensaje como "Nuestro equipo se presentará pronto."
  }

  return (
    <section>
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-white mb-3 flex items-center">
          <Users className="w-8 h-8 mr-4 text-purple-400" />
          Nuestro Equipo de Especialistas
        </h2>
        <p className="text-gray-400 text-lg">
          Profesionales certificados y dedicados a tu bienestar.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {staff.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="group cursor-pointer"
          >
            <div className="relative bg-gray-900/50 rounded-3xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-blue-600/0 group-hover:from-purple-600/5 group-hover:to-blue-600/5 transition-all duration-500" />
              
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 rounded-2xl mx-auto bg-gray-800 border-2 border-gray-700 overflow-hidden relative">
                  {member.imageUrl ? (
                    <img 
                      src={member.imageUrl} 
                      alt={member.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {member.name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="bg-purple-600 rounded-full p-2 border-4 border-gray-900">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="relative z-10">
                <h3 className="font-bold text-xl text-white mb-1 group-hover:text-purple-300 transition-colors">
                  {member.name}
                </h3>
                
                <p className="text-purple-400 font-semibold text-sm mb-4">
                  {member.title}
                </p>
                
                {member.bio && (
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 min-h-[60px]">
                    {member.bio}
                  </p>
                )}
                
                <button className="w-full bg-gray-800 hover:bg-purple-600 text-white py-3 rounded-xl font-medium transition-all duration-300 border border-gray-600 hover:border-transparent hover:shadow-lg hover:shadow-purple-500/25">
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Agendar con {member.name.split(' ')[0]}
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};