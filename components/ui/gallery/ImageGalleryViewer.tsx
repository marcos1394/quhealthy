"use client"
import React, { useState } from 'react';
import { GalleryImage } from '@/types/store';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ImageGalleryViewerProps {
 images: GalleryImage[];
 className?: string;
}

export function ImageGalleryViewer({ images, className }: ImageGalleryViewerProps) {
 const [currentIndex, setCurrentIndex] = useState(0);
 const [isLightboxOpen, setIsLightboxOpen] = useState(false);

 if (!images || images.length === 0) return null;

 const handleNext = (e?: React.MouseEvent) => {
 e?.stopPropagation();
 setCurrentIndex((prev) => (prev + 1) % images.length);
 };

 const handlePrev = (e?: React.MouseEvent) => {
 e?.stopPropagation();
 setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
 };

 const currentImage = images[currentIndex];

 return (
 <div className={cn("flex flex-col space-y-4", className)}>
 {/* Main View */}
 <div 
 className="relative aspect-[16/9] w-full overflow-hidden rounded-xl cursor-pointer group bg-muted"
 onClick={() => setIsLightboxOpen(true)}
 >
 {currentImage.isVideo ? (
 <video 
 src={currentImage.imageUrl} 
 className="w-full h-full object-cover"
 controls={false}
 autoPlay
 muted
 loop
 />
 ) : (
 <img 
 src={currentImage.imageUrl} 
 alt={currentImage.caption || `Gallery image ${currentIndex + 1}`}
 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
 />
 )}
 
 {images.length > 1 && (
 <>
 <button 
 onClick={handlePrev}
 className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
 >
 <ChevronLeft size={20} />
 </button>
 <button 
 onClick={handleNext}
 className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
 >
 <ChevronRight size={20} />
 </button>
 </>
 )}
 
 {currentImage.caption && (
 <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
 <p className="text-white text-sm font-medium">{currentImage.caption}</p>
 </div>
 )}
 
 {currentImage.isVideo && (
 <div className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white">
 <Play size={16} />
 </div>
 )}
 </div>

 {/* Thumbnails */}
 {images.length > 1 && (
 <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
 {images.map((img, idx) => (
 <button
 key={img.id}
 onClick={() => setCurrentIndex(idx)}
 className={cn(
 "relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
 currentIndex === idx ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
 )}
 >
 {img.isVideo ? (
 <video src={img.imageUrl} className="w-full h-full object-cover" />
 ) : (
 <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
 )}
 {img.isVideo && (
 <div className="absolute inset-0 flex items-center justify-center bg-black/30">
 <Play size={16} className="text-white" />
 </div>
 )}
 </button>
 ))}
 </div>
 )}

 {/* Lightbox */}
 <AnimatePresence>
 {isLightboxOpen && (
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
 >
 <button 
 onClick={() => setIsLightboxOpen(false)}
 className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
 >
 <X size={24} />
 </button>

 {images.length > 1 && (
 <button onClick={handlePrev} className="absolute left-6 p-4 rounded-full bg-white/10 text-white hover:bg-white/20">
 <ChevronLeft size={32} />
 </button>
 )}

 <motion.div 
 initial={{ scale: 0.9, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0.9, opacity: 0 }}
 className="w-full max-w-5xl max-h-[85vh] p-4 flex flex-col items-center"
 >
 {currentImage.isVideo ? (
 <video 
 src={currentImage.imageUrl} 
 className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
 controls
 autoPlay
 />
 ) : (
 <img 
 src={currentImage.imageUrl} 
 alt={currentImage.caption || ""} 
 className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
 />
 )}
 {currentImage.caption && (
 <p className="mt-6 text-white text-lg">{currentImage.caption}</p>
 )}
 </motion.div>

 {images.length > 1 && (
 <button onClick={handleNext} className="absolute right-6 p-4 rounded-full bg-white/10 text-white hover:bg-white/20">
 <ChevronRight size={32} />
 </button>
 )}
 
 <div className="absolute bottom-6 text-white/50 text-sm">
 {currentIndex + 1} / {images.length}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}
