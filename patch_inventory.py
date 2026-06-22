import re

# 1. Patch BarcodeScanner.tsx
scanner_path = "/Users/marcossandovalruiz/Documents/quhealthy/components/ui/BarcodeScanner.tsx"
with open(scanner_path, "r") as f:
    scanner_content = f.read()

# Make sure to import cn if it's missing, wait we can just avoid cn and use string template, or import it.
if 'import { cn }' not in scanner_content:
    scanner_content = scanner_content.replace('import { Button } from \'./button\';', 'import { Button } from \'./button\';\nimport { cn } from "@/lib/utils";')

new_return = '''  return (
    <div className="w-full flex flex-col bg-white dark:bg-[#0a0a0a]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="font-bold text-[10px] uppercase tracking-widest text-black dark:text-white">METODOLOGÍA DE ESCANEO</h3>
        <div className="flex items-center gap-0 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505]">
          <button
            type="button"
            className={cn(
              "flex-1 px-4 py-2 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors min-w-[120px]",
              mode === 'physical'
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "text-gray-500 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
            )}
            onClick={() => setMode('physical')}
          >
            <Keyboard className="w-3.5 h-3.5" strokeWidth={1.5} /> FÍSICO
          </button>
          <button
            type="button"
            className={cn(
              "flex-1 px-4 py-2 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors min-w-[120px] border-l border-black/20 dark:border-white/20",
              mode === 'camera'
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "text-gray-500 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
            )}
            onClick={() => setMode('camera')}
          >
            <Camera className="w-3.5 h-3.5" strokeWidth={1.5} /> CÁMARA
          </button>
        </div>
      </div>

      {mode === 'physical' ? (
        <div className="flex flex-col gap-4">
          <div className="bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 p-6 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">LECTOR FÍSICO HABILITADO. ESCANEE EL CÓDIGO.</p>
          </div>
          <form onSubmit={handleManualSubmit} className="flex flex-col sm:flex-row gap-0 border border-black/20 dark:border-white/20">
            <input 
              placeholder="O INGRESE SKU / CÓDIGO..."
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="flex-1 h-12 px-4 bg-transparent border-0 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white focus:outline-none focus:ring-0 placeholder:text-gray-400 font-mono"
            />
            <button type="submit" className="h-12 px-6 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">BUSCAR</button>
          </form>
        </div>
      ) : (
        <div className="w-full border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505]">
          <div id="qr-reader" className="w-full" />
        </div>
      )}
    </div>
  );'''

# Replace the return block
scanner_content = re.sub(r'return \(\s*<div className="border border-slate-200.*?\);\s*}', new_return + '\n}', scanner_content, flags=re.DOTALL)

with open(scanner_path, "w") as f:
    f.write(scanner_content)

# 2. Patch inventory/page.tsx
inv_path = "/Users/marcossandovalruiz/Documents/quhealthy/app/[locale]/(platform)/provider/dashboard/inventory/page.tsx"
with open(inv_path, "r") as f:
    inv_content = f.read()

# Update the inventory rows
inv_content = inv_content.replace(
    'className="p-6 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-6 group"',
    'className="p-6 hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10 cursor-pointer"'
)

inv_content = inv_content.replace(
    '<div className="w-12 h-12 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0">',
    '<div className="w-12 h-12 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0 group-hover:bg-transparent group-hover:border-white/30 dark:group-hover:border-black/30 transition-colors">'
)

inv_content = inv_content.replace(
    'text-gray-500" strokeWidth={1.5} />}',
    'text-gray-500 group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={1.5} />}'
)

inv_content = inv_content.replace(
    '<h4 className="font-semibold text-sm uppercase tracking-widest text-black dark:text-white truncate mb-2">',
    '<h4 className="font-semibold text-sm uppercase tracking-widest text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors truncate mb-2">'
)

inv_content = inv_content.replace(
    'span className="border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400"',
    'span className="border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 group-hover:bg-transparent group-hover:border-white/30 dark:group-hover:border-black/30 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors"'
)

inv_content = inv_content.replace(
    '<span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">',
    '<span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">'
)

inv_content = inv_content.replace(
    '<p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">DISPONIBLE</p>',
    '<p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">DISPONIBLE</p>'
)

inv_content = inv_content.replace(
    'className="w-10 h-10 flex items-center justify-center border border-transparent hover:border-black/20 dark:hover:border-white/20 bg-transparent hover:bg-white dark:hover:bg-[#0a0a0a] transition-colors rounded-none"',
    'className="w-10 h-10 flex items-center justify-center border border-transparent hover:border-black/20 dark:hover:border-white/20 bg-transparent group-hover:text-white dark:group-hover:text-black hover:bg-white dark:hover:bg-[#0a0a0a] transition-colors rounded-none"'
)

inv_content = inv_content.replace(
    '<Edit className="h-4 w-4 text-gray-500" strokeWidth={1.5} />',
    '<Edit className="h-4 w-4 text-gray-500 group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={1.5} />'
)

with open(inv_path, "w") as f:
    f.write(inv_content)

print("Done patching inventory and barcode scanner")
