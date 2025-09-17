/* eslint-disable @next/next/no-img-element */
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Calendar, Users, Sparkles, Star, ArrowRight } from 'lucide-react';
import { StaffMember } from '@/app/quhealthy/types/marketplace';

interface StaffSectionProps {
  staff: StaffMember[];
}

export const StaffSection: React.FC<StaffSectionProps> = ({ staff }) => {
  if (!staff || staff.length === 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl mx-auto flex items-center justify-center border border-purple-500/20">
            <Users className="w-10 h-10 text-purple-400" />
          </div>
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full p-2">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-3">
          Nuestro equipo se presenta pronto
        </h3>
        <p className="text-slate-400 text-lg max-w-md mx-auto">
          Estamos preparando los perfiles de nuestros especialistas certificados para que los conozcas mejor.
        </p>
      </motion.section>
    );
  }

  return (
    <section>
      {/* Enhanced Header */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl border border-purple-500/20">
            <Users className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            Nuestro Equipo de Especialistas
          </h2>
        </div>
        <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl">
          Profesionales certificados y dedicados a tu bienestar, con años de experiencia y pasión por la excelencia.
        </p>
      </motion.div>
      
      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {staff.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.15 }}
            className="group cursor-pointer"
          >
            <div className="relative bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 text-center overflow-hidden group-hover:shadow-2xl group-hover:shadow-purple-500/20">
              
              {/* Background decorative elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-blue-600/0 group-hover:from-purple-600/5 group-hover:to-blue-600/5 transition-all duration-700" />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Star className="w-3 h-3 text-white" />
                </div>
              </div>
              
              {/* Profile Image Section */}
              <div className="relative inline-block mb-6">
                <div className="relative group/avatar">
                  {/* Glow effect */}
                  <div className="absolute -inset-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                  
                  {/* Image container */}
                  <div className="relative w-36 h-36 rounded-3xl mx-auto bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-purple-500/20 overflow-hidden shadow-2xl">
                    {member.imageUrl ? (
                      <img 
                        src={member.imageUrl} 
                        alt={member.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-600/30 to-blue-600/30 flex items-center justify-center">
                        <span className="text-3xl font-bold bg-gradient-to-br from-white to-purple-200 bg-clip-text text-transparent">
                          {member.name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Professional badge */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + (index * 0.1), type: "spring", stiffness: 200 }}
                    className="absolute -bottom-3 left-1/2 transform -translate-x-1/2"
                  >
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-full p-3 border-4 border-slate-900 shadow-xl">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                  </motion.div>
                </div>
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                <h3 className="font-bold text-xl md:text-2xl text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">
                  {member.name}
                </h3>
                
                <div className="mb-4">
                  <p className="text-purple-400 font-semibold text-sm md:text-base mb-2">
                    {member.title}
                  </p>
                  
                  {/* Professional indicator */}
                  <div className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-3 py-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-purple-300 font-medium">Especialista Certificado</span>
                  </div>
                </div>
                
                {member.bio && (
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3 min-h-[60px]">
                    {member.bio}
                  </p>
                )}
                
                {/* CTA Button */}
                <button className="group/btn w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-purple-600 hover:to-blue-600 text-white py-4 rounded-2xl font-semibold transition-all duration-500 border border-slate-600 hover:border-transparent hover:shadow-2xl hover:shadow-purple-500/40 transform hover:scale-105">
                  <div className="flex items-center justify-center gap-3">
                    <Calendar className="w-5 h-5" />
                    <span>Agendar con {member.name.split(' ')[0]}</span>
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Call to action footer */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-16 text-center"
      >
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="text-xl font-semibold text-white">¿No sabes con quién agendar?</h3>
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-slate-400 mb-6">
            Todos nuestros especialistas están altamente calificados. Podemos recomendarte al profesional ideal según tus necesidades.
          </p>
          <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            Obtener Recomendación
          </button>
        </div>
      </motion.div>
    </section>
  );
};