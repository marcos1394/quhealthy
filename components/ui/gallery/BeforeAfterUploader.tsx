"use client"
import React, { useRef, useState } from 'react';
import { useGallery } from '@/hooks/useGallery';
import { UploadCloud, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';

interface BeforeAfterUploaderProps {
 catalogItemId?: number;
}

export function BeforeAfterUploader({ catalogItemId }: BeforeAfterUploaderProps) {
 const { images, isLoading, isUploading, addBeforeAfter, deleteImage } = useGallery('BEFORE_AFTER', catalogItemId);
 
 const [beforeFile, setBeforeFile] = useState<File | null>(null);
 const [afterFile, setAfterFile] = useState<File | null>(null);
 const [caption, setCaption] = useState('');
 
 const beforeInputRef = useRef<HTMLInputElement>(null);
 const afterInputRef = useRef<HTMLInputElement>(null);

 const handleUpload = async () => {
 if (!beforeFile || !afterFile) {
 toast.error('Debes subir ambas imágenes (antes y después)');
 return;
 }
 
 await addBeforeAfter(beforeFile, afterFile, caption);
 
 // Reset form
 setBeforeFile(null);
 setAfterFile(null);
 setCaption('');
 };

 const beforeUrl = beforeFile ? URL.createObjectURL(beforeFile) : null;
 const afterUrl = afterFile ? URL.createObjectURL(afterFile) : null;

 return (
 <div className="space-y-8">
 {/* Upload Form */}
 <div className="bg-muted/30 border rounded-xl p-6 space-y-6">
 <div>
 <h3 className="text-sm font-semibold mb-1">Nuevo caso clínico (Antes y Después)</h3>
 <p className="text-xs text-muted-foreground">Sube fotos comparativas para mostrar los resultados de tus procedimientos.</p>
 </div>

 <div className="grid grid-cols-2 gap-4">
 {/* Before Dropzone */}
 <div 
 className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors relative overflow-hidden h-40 flex flex-col items-center justify-center"
 onClick={() => beforeInputRef.current?.click()}
 >
 {beforeUrl ? (
 <>
 <img src={beforeUrl} alt="Preview Before" className="absolute inset-0 w-full h-full object-cover opacity-50" />
 <div className="relative z-10 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">Cambiar Antes</div>
 </>
 ) : (
 <>
 <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
 <span className="text-sm font-medium">Foto del Antes</span>
 </>
 )}
 <input 
 type="file" 
 ref={beforeInputRef} 
 className="hidden" 
 accept="image/*" 
 onChange={(e) => setBeforeFile(e.target.files?.[0] || null)}
 />
 </div>

 {/* After Dropzone */}
 <div 
 className="border-2 border-dashed border-primary/30 rounded-lg p-4 text-center cursor-pointer hover:bg-primary/5 transition-colors relative overflow-hidden h-40 flex flex-col items-center justify-center"
 onClick={() => afterInputRef.current?.click()}
 >
 {afterUrl ? (
 <>
 <img src={afterUrl} alt="Preview After" className="absolute inset-0 w-full h-full object-cover opacity-50" />
 <div className="relative z-10 bg-primary text-white px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">Cambiar Después</div>
 </>
 ) : (
 <>
 <ImageIcon className="mx-auto h-8 w-8 text-primary/50 mb-2" />
 <span className="text-sm font-medium text-primary">Foto del Después</span>
 </>
 )}
 <input 
 type="file" 
 ref={afterInputRef} 
 className="hidden" 
 accept="image/*" 
 onChange={(e) => setAfterFile(e.target.files?.[0] || null)}
 />
 </div>
 </div>

 <div className="space-y-2">
 <Label>Descripción del procedimiento (opcional)</Label>
 <Input 
 placeholder="Ej: Rinoplastia ultrasónica, 3 meses post-operatorio..." 
 value={caption}
 onChange={(e) => setCaption(e.target.value)}
 />
 </div>

 <Button 
 className="w-full" 
 onClick={handleUpload} 
 disabled={!beforeFile || !afterFile || isUploading}
 >
 {isUploading ? "Guardando caso..." : "Guardar Comparativa"}
 </Button>
 </div>

 {/* Existing Pairs */}
 {images.length > 0 && (
 <div className="space-y-4">
 <h4 className="text-sm font-semibold">Casos guardados ({images.length})</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {images.map(img => (
 <div key={img.id} className="border rounded-lg overflow-hidden bg-card flex flex-col">
 <div className="flex h-32">
 <div className="w-1/2 relative border-r">
 <img src={img.beforeImageUrl} alt="Antes" className="w-full h-full object-cover" />
 <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded uppercase">Antes</div>
 </div>
 <div className="w-1/2 relative">
 <img src={img.afterImageUrl} alt="Después" className="w-full h-full object-cover" />
 <div className="absolute top-2 right-2 bg-primary text-white text-[10px] px-2 py-0.5 rounded uppercase">Después</div>
 </div>
 </div>
 <div className="p-3 flex items-center justify-between gap-2">
 <p className="text-xs font-medium truncate" title={img.caption}>{img.caption || "Sin descripción"}</p>
 <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500 flex-shrink-0" onClick={() => deleteImage(img.id)}>
 <Trash2 size={12} />
 </Button>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 );
}
