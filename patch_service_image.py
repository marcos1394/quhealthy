import re

file_path = "/Users/marcossandovalruiz/Documents/quhealthy/components/marketplace/ServiceItemCard.tsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Imports
content = content.replace('import React, { useRef } from "react";', 'import React, { useRef, useState } from "react";')
if "UploadCloud" not in content:
    content = content.replace("GripVertical,", "GripVertical,\n  UploadCloud,")

# 2. Add State and Drag Handlers
hook_start = """  const t = useTranslations('Marketplace.services');
  const fileInputRef = useRef<HTMLInputElement>(null);"""

new_hook_start = """  const t = useTranslations('Marketplace.services');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(service.id, file);
    }
  };"""

content = content.replace(hook_start, new_hook_start)

# 3. Replace the image cell
old_cell = """        {/* Celda: Subida de Imagen */}
        <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 flex flex-col items-center justify-center shrink-0">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "w-28 h-28 flex flex-col items-center justify-center overflow-hidden transition-colors cursor-pointer group relative rounded-none",
              service.imageUrl 
                ? "border border-black/20 dark:border-white/20 bg-black" 
                : "border border-dashed border-black/30 dark:border-white/30 bg-gray-50 dark:bg-[#050505] hover:bg-black/5 dark:hover:bg-white/5"
            )}
          >
            {service.imageUrl ? (
              <>
                <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
              </>
            ) : (
              <>
                <Camera className="w-6 h-6 text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors mb-2" strokeWidth={1.5} />
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest group-hover:text-black dark:group-hover:text-white">
                  {t('photo', { defaultValue: 'FOTOGRAFÍA' })}
                </span>
              </>
            )}
          </div>
          <input 
            type="file" 
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && onImageUpload) {
                onImageUpload(service.id, file);
              }
              e.target.value = '';
            }}
          />
        </div>"""

new_cell = """        {/* Celda: Subida de Imagen */}
        <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 flex flex-col shrink-0 w-full md:w-64">
          <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">
            {t('image_label', { defaultValue: 'PORTADA DEL SERVICIO' })}
          </label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "w-full h-40 flex flex-col items-center justify-center overflow-hidden transition-all duration-300 cursor-pointer group relative rounded-none",
              service.imageUrl 
                ? "border border-black dark:border-white bg-black" 
                : "border border-dashed border-black/30 dark:border-white/30 bg-gray-50 dark:bg-[#050505] hover:border-black dark:hover:border-white hover:bg-white dark:hover:bg-[#0a0a0a]",
              isDragging && "border-black dark:border-white bg-black/5 dark:bg-white/5 scale-[1.02]"
            )}
          >
            {service.imageUrl ? (
              <>
                <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover group-hover:opacity-40 transition-opacity duration-300" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 border border-white flex items-center justify-center bg-black/50 backdrop-blur-sm mb-2">
                    <Camera className="w-5 h-5 text-white" strokeWidth={1.5} />
                  </div>
                  <span className="text-[9px] text-white font-bold uppercase tracking-widest bg-black px-2 py-1">
                    CAMBIAR FOTOGRAFÍA
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 border border-black/20 dark:border-white/20 flex items-center justify-center bg-white dark:bg-[#0a0a0a] group-hover:border-black dark:group-hover:border-white transition-colors mb-4 shadow-[4px_4px_0_0_rgba(0,0,0,0.05)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.05)]">
                  <UploadCloud className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                </div>
                <span className="text-[10px] text-black dark:text-white font-bold uppercase tracking-widest mb-1">
                  SUBIR IMAGEN
                </span>
                <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest text-center px-4 leading-relaxed">
                  ARRASTRE O HAGA CLIC<br />(JPG, PNG, WEBP)
                </span>
              </>
            )}
          </div>
          <input 
            type="file" 
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && onImageUpload) {
                onImageUpload(service.id, file);
              }
              e.target.value = '';
            }}
          />
        </div>"""

content = content.replace(old_cell, new_cell)

with open(file_path, "w") as f:
    f.write(content)

print("Service image cell patched.")
