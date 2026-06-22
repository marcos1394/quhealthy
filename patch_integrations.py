import re

file_path = "/Users/marcossandovalruiz/Documents/quhealthy/components/marketplace/ContactIntegrationsSection.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Card hover classes
old_card_classes = """                  className={cn(
                    "p-6 md:p-8 flex flex-col justify-between transition-colors border-b border-gray-200 dark:border-gray-800 group",
                    // Aseguramos que la columna izquierda tenga borde derecho en desktop
                    index % 2 === 0 ? "md:border-r" : "",
                    isConnected 
                      ? "bg-gray-50 dark:bg-[#050505]" 
                      : "bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#050505]"
                  )}"""

new_card_classes = """                  className={cn(
                    "p-6 md:p-8 flex flex-col justify-between transition-all duration-300 border-b border-gray-200 dark:border-gray-800 group hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10 cursor-pointer",
                    // Aseguramos que la columna izquierda tenga borde derecho en desktop
                    index % 2 === 0 ? "md:border-r" : "",
                    isConnected 
                      ? "bg-gray-50 dark:bg-[#050505]" 
                      : "bg-white dark:bg-[#0a0a0a]"
                  )}"""

content = content.replace(old_card_classes, new_card_classes)

# Icon container
old_icon_container = """                    <div className={cn(
                      "w-12 h-12 flex items-center justify-center border transition-colors shrink-0",
                      isConnected 
                        ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black" 
                        : "border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white group-hover:border-black dark:group-hover:border-white"
                    )}>"""

new_icon_container = """                    <div className={cn(
                      "w-12 h-12 flex items-center justify-center border transition-colors shrink-0",
                      isConnected 
                        ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black group-hover:border-white/30 dark:group-hover:border-black/30 group-hover:bg-transparent group-hover:text-white dark:group-hover:text-black" 
                        : "border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white group-hover:bg-transparent group-hover:border-white/30 dark:group-hover:border-black/30 group-hover:text-white dark:group-hover:text-black"
                    )}>"""

content = content.replace(old_icon_container, new_icon_container)

# Title
content = content.replace(
    '<h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">{platform.name}</h3>',
    '<h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors">{platform.name}</h3>'
)

# Badge Enlazado
content = content.replace(
    '<span className="self-start border border-black bg-black text-white dark:border-white dark:bg-white dark:text-black px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 shrink-0">',
    '<span className="self-start border border-black bg-black text-white dark:border-white dark:bg-white dark:text-black group-hover:bg-transparent group-hover:border-white/30 dark:group-hover:border-black/30 group-hover:text-white dark:group-hover:text-black transition-colors px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 shrink-0">'
)

# Description
content = content.replace(
    '<p className="text-xs text-gray-500 font-light leading-relaxed">',
    '<p className="text-xs text-gray-500 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors font-light leading-relaxed">'
)

# Connected state box
content = content.replace(
    'className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">',
    'className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] group-hover:bg-transparent group-hover:border-white/30 dark:group-hover:border-black/30 transition-colors">'
)

# Connected text inside box
content = content.replace(
    '<span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white truncate max-w-[120px]">',
    '<span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors truncate max-w-[120px]">'
)

# Unconnected Button
content = content.replace(
    'className="w-full h-12 border border-black dark:border-white text-[10px] font-bold uppercase tracking-widest text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"',
    'className="w-full h-12 border border-black dark:border-white text-[10px] font-bold uppercase tracking-widest text-black dark:text-white group-hover:border-white/30 dark:group-hover:border-black/30 group-hover:text-white dark:group-hover:text-black hover:!bg-white hover:!text-black dark:hover:!bg-black dark:hover:!text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"'
)


with open(file_path, "w") as f:
    f.write(content)

print("Integrations cards patched.")
