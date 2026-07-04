"use client"
import React, { useState } from 'react';
import { GalleryImage } from '@/types/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, X } from 'lucide-react';

interface CertificationGridProps {
 images: GalleryImage[];
}

export function CertificationGrid({ images }: CertificationGridProps) {
 const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

 if (!images || images.length === 0) return null;

 const certifications = images.filter(img => img.galleryType === 'CERTIFICATION');
 if (certifications.length === 0) return null;

 return (
 <>
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
 {certifications.map((cert) => (
 <motion.div
 key={cert.id}
 whileHover={{ y: -5 }}
 onClick={() => setSelectedImage(cert)}
 className="group cursor-pointer bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
 >
 <div className="aspect-[4/3] bg-slate-50 relative p-4 flex items-center justify-center border-b">
 {/* Optional: Add a subtle patterned background or watermark effect here */}
 <img 
 src={cert.imageUrl} 
 alt={cert.caption || "Certificación"} 
 className="max-w-full max-h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-500"
 />
 </div>
 <div className="p-4 flex items-start gap-3 bg-gradient-to-b from-white to-slate-50 flex-1">
 <Award className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
 <p className="text-sm font-medium text-slate-800 line-clamp-2 leading-tight">
 {cert.caption || "Certificación Profesional"}
 </p>
 </div>
 </motion.div>
 ))}
 </div>

 {/* Lightbox for Certification */}
 <AnimatePresence>
 {selectedImage && (
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4"
 onClick={() => setSelectedImage(null)}
 >
 <button 
 className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
 onClick={() => setSelectedImage(null)}
 >
 <X size={24} />
 </button>
 
 <motion.div 
 initial={{ scale: 0.95, opacity: 0, y: 20 }}
 animate={{ scale: 1, opacity: 1, y: 0 }}
 exit={{ scale: 0.95, opacity: 0, y: 20 }}
 className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-3xl w-full"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="bg-slate-50 p-8 flex justify-center items-center relative overflow-hidden">
 <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
 style={{ backgroundImage: 'radial-gradient(circle at center, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
 </div>
 <img 
 src={selectedImage.imageUrl} 
 alt={selectedImage.caption || ""} 
 className="max-h-[60vh] object-contain relative z-10 drop-shadow-xl border border-slate-200/50"
 />
 </div>
 <div className="p-6 bg-white border-t flex items-start gap-4">
 <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
 <Award className="text-amber-600" size={24} />
 </div>
 <div>
 <h3 className="text-xl font-bold text-slate-900">{selectedImage.caption || "Certificación Profesional"}</h3>
 <p className="text-sm text-slate-500 mt-1">Documento verificado en la plataforma QuHealthy</p>
 </div>
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 </>
 );
}
