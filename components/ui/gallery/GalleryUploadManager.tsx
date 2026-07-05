"use client"
import React, { useRef, useState } from 'react';
import { useGallery } from '@/hooks/useGallery';
import { GalleryType, GalleryImage } from '@/types/store';
import { motion, Reorder } from 'framer-motion';
import { UploadCloud, GripVertical, Trash2, Edit2, Check, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'react-toastify';

interface GalleryUploadManagerProps {
 galleryType: GalleryType;
 catalogItemId?: number;
 maxImages?: number;
 title?: string;
 description?: string;
}

export function GalleryUploadManager({ 
 galleryType, 
 catalogItemId, 
 maxImages = 10,
 title,
 description
}: GalleryUploadManagerProps) {
 const { 
 images, 
 isLoading, 
 isUploading, 
 addImages, 
 deleteImage, 
 reorderImages, 
 updateCaption 
 } = useGallery(galleryType, catalogItemId);
 
 const fileInputRef = useRef<HTMLInputElement>(null);
 const [editingCaptionId, setEditingCaptionId] = useState<number | null>(null);
 const [tempCaption, setTempCaption] = useState('');

 const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
 if (!e.target.files?.length) return;
 
 const newFiles = Array.from(e.target.files);
 
 if (images.length + newFiles.length > maxImages) {
 toast.error(`Puedes subir un máximo de ${maxImages} imágenes.`);
 return;
 }

 // Basic validation
 const validFiles = newFiles.filter(file => {
 const isImage = file.type.startsWith('image/');
 const isVideo = file.type.startsWith('video/') && (galleryType === 'SERVICE_WORK' || galleryType === 'OFFICE');
 const isValidSize = file.size <= 20 * 1024 * 1024; // 10MB
 
 if (!isImage && !isVideo) toast.error(`${file.name} no es un formato válido.`);
 if (!isValidSize) toast.error(`${file.name} excede el límite de 10MB.`);
 
 return (isImage || isVideo) && isValidSize;
 });

 if (validFiles.length) {
 await addImages(validFiles);
 }
 
 if (fileInputRef.current) fileInputRef.current.value = '';
 };

 const handleDragEnd = (newOrder: GalleryImage[]) => {
 const newOrderIds = newOrder.map(img => img.id);
 reorderImages(newOrderIds);
 };

 const startEditCaption = (img: GalleryImage) => {
 setEditingCaptionId(img.id);
 setTempCaption(img.caption || '');
 };

 const saveCaption = (img: GalleryImage) => {
 if (tempCaption !== img.caption) {
 updateCaption(img.id, tempCaption, img.imageUrl, img.galleryType);
 }
 setEditingCaptionId(null);
 };

 if (isLoading) return <div className="h-40 flex items-center justify-center">Cargando galería...</div>;

 return (
 <div className="space-y-6">
 {(title || description) && (
 <div>
 {title && <h3 className="text-lg font-semibold">{title}</h3>}
 {description && <p className="text-sm text-muted-foreground">{description}</p>}
 </div>
 )}

 {/* Upload Area */}
 <div 
 className={cn(
 "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
 images.length >= maxImages ? "border-muted bg-muted/50 cursor-not-allowed opacity-50" : "border-primary/20 bg-primary/5 hover:bg-primary/10 cursor-pointer"
 )}
 onClick={() => images.length < maxImages && fileInputRef.current?.click()}
 >
 <UploadCloud className="mx-auto h-12 w-12 text-primary/60 mb-4" />
 <p className="text-sm font-medium">
 {isUploading ? "Subiendo imágenes..." : "Haz clic o arrastra imágenes aquí"}
 </p>
 <p className="text-xs text-muted-foreground mt-2">
 JPG, PNG {galleryType === 'SERVICE_WORK' && 'o MP4 '}(máx 10MB). {images.length} / {maxImages} subidas.
 </p>
 <input 
 type="file" 
 ref={fileInputRef}
 className="hidden" 
 multiple 
 accept="image/png, image/jpeg, image/jpg" 
 onChange={handleFileChange}
 disabled={images.length >= maxImages || isUploading}
 />
 </div>

 {/* Reorderable Grid */}
 {images.length > 0 && (
 <Reorder.Group 
 axis="y" 
 values={images} 
 onReorder={handleDragEnd}
 className="grid gap-3"
 >
 {images.map((img) => (
 <Reorder.Item 
 key={img.id} 
 value={img}
 className="bg-card border rounded-lg p-3 flex flex-col sm:flex-row sm:items-center gap-4 group"
 >
 <div className="flex items-center gap-4 w-full sm:w-auto">
 <div className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground">
 <GripVertical size={20} />
 </div>
 
 <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0 relative">
 {img.isVideo ? (
 <video src={img.imageUrl} className="w-full h-full object-cover" />
 ) : (
 <img src={img.imageUrl} alt={img.caption || ""} className="w-full h-full object-cover" />
 )}
 </div>
 </div>

 <div className="flex-1 min-w-0 w-full">
 {editingCaptionId === img.id ? (
 <div className="flex items-center gap-2">
 <Input 
 value={tempCaption} 
 onChange={(e) => setTempCaption(e.target.value)}
 placeholder="Agrega una descripción..."
 className="h-8 text-sm"
 autoFocus
 onKeyDown={(e) => e.key === 'Enter' && saveCaption(img)}
 />
 <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => saveCaption(img)}>
 <Check size={16} />
 </Button>
 <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => setEditingCaptionId(null)}>
 <X size={16} />
 </Button>
 </div>
 ) : (
 <div className="flex items-center gap-2">
 <p className="text-sm font-medium truncate flex-1">
 {img.caption || <span className="text-muted-foreground italic">Sin descripción</span>}
 </p>
 <Button size="icon" variant="ghost" className="h-8 w-8 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => startEditCaption(img)}>
 <Edit2 size={14} />
 </Button>
 </div>
 )}
 </div>

 <div className="flex justify-end w-full sm:w-auto">
 <Button 
 size="icon" 
 variant="destructive" 
 className="h-8 w-8 flex-shrink-0"
 onClick={() => deleteImage(img.id)}
 >
 <Trash2 size={14} />
 </Button>
 </div>
 </Reorder.Item>
 ))}
 </Reorder.Group>
 )}
 </div>
 );
}
