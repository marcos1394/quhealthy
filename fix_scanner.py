import re

# 1. Update BarcodeScanner.tsx
scanner_path = "/Users/marcossandovalruiz/Documents/quhealthy/components/ui/BarcodeScanner.tsx"
with open(scanner_path, "r") as f:
    scanner_content = f.read()

new_return = '''  return (
    <div className="w-full flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex w-full items-center border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a]">
        <button
          type="button"
          className={cn(
            "flex-1 h-12 px-4 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors",
            mode === 'physical'
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "text-gray-500 hover:bg-gray-50 dark:hover:bg-[#111]"
          )}
          onClick={() => setMode('physical')}
        >
          <Keyboard className="w-4 h-4" strokeWidth={1.5} /> LECTOR FÍSICO
        </button>
        <button
          type="button"
          className={cn(
            "flex-1 h-12 px-4 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors border-l border-black/20 dark:border-white/20",
            mode === 'camera'
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "text-gray-500 hover:bg-gray-50 dark:hover:bg-[#111]"
          )}
          onClick={() => setMode('camera')}
        >
          <Camera className="w-4 h-4" strokeWidth={1.5} /> CÁMARA
        </button>
      </div>

      {mode === 'physical' ? (
        <div className="flex flex-col gap-4">
          <div className="bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 p-6 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">LISTO PARA ESCANEAR CÓDIGO DE BARRAS</p>
          </div>
          <form onSubmit={handleManualSubmit} className="flex gap-0 border border-black/20 dark:border-white/20">
            <input 
              placeholder="O INGRESE SKU / CÓDIGO MANUALMENTE..."
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="flex-1 h-12 px-4 bg-transparent border-0 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white focus:outline-none focus:ring-0 placeholder:text-gray-400 font-mono"
            />
            <button type="submit" className="h-12 px-6 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors border-l border-black dark:border-white">
              BUSCAR
            </button>
          </form>
        </div>
      ) : (
        <div className="w-full border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] p-2">
          <div id="qr-reader" className="w-full" />
        </div>
      )}
    </div>
  );'''

# Replace the return block using regex
scanner_content = re.sub(r'return \(\s*<div className="w-full flex flex-col bg-white.*?\);\s*}', new_return + '\n}', scanner_content, flags=re.DOTALL)

with open(scanner_path, "w") as f:
    f.write(scanner_content)

# 2. Update inventory/page.tsx
inv_path = "/Users/marcossandovalruiz/Documents/quhealthy/app/[locale]/(platform)/provider/dashboard/inventory/page.tsx"
with open(inv_path, "r") as f:
    inv_content = f.read()

# Replace the wrapper around BarcodeScanner
old_wrapper = '''<div className="p-6 flex flex-col items-center justify-center min-h-[200px] bg-black/5 dark:bg-white/5 relative">
                {/* Asumiendo que BarcodeScanner renderiza un video. Aseguramos su contenedor. */}
                <div className="w-full relative rounded-none overflow-hidden border border-black/20 dark:border-white/20">
                  <BarcodeScanner onScan={handleScan} />
                </div>
              </div>'''

new_wrapper = '''<div className="p-6 flex flex-col relative min-h-[200px]">
                <BarcodeScanner onScan={handleScan} />
              </div>'''

inv_content = inv_content.replace(old_wrapper, new_wrapper)

with open(inv_path, "w") as f:
    f.write(inv_content)

print("Fix applied.")
