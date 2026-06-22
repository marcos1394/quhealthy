import re

file_path = "/Users/marcossandovalruiz/Documents/quhealthy/app/[locale]/(platform)/provider/store/page.tsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Remove hover from the "Catálogo e Inventario" container
content = content.replace(
    '<div className="lg:col-span-2 border-b border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col group transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] hover:border-black dark:hover:border-white relative hover:z-10">',
    '<div className="lg:col-span-2 border-b border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col">'
)

# 2. Add black background hover to the 4 sub-items inside "Catálogo"
sub_items = [
    ("Stethoscope", "activeServices", "Servicios"),
    ("Pill", "activeProducts", "Productos"),
    ("GraduationCap", "activeCourses", "Cursos"),
    ("Package", "activePackages", "Paquetes")
]

for icon, var, label in sub_items:
    # Find the div containing this icon
    pattern = r'<div className="([^"]+ flex flex-col items-center justify-center)">\s*<' + icon + r' className="w-5 h-5 mb-4 text-gray-400" strokeWidth=\{1\.5\} />\s*<p className="text-3xl font-semibold tracking-tighter mb-2">\{' + var + r'\}</p>\s*<p className="text-\[9px\] font-bold text-gray-500 uppercase tracking-widest">' + label + r'</p>\s*</div>'
    
    replacement = (
        '<div onClick={() => router.push("/provider/store/catalog")} className="\\1 cursor-pointer group/card transition-all duration-300 hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10">\n'
        '                  <' + icon + ' className="w-5 h-5 mb-4 text-gray-400 group-hover/card:text-white dark:group-hover/card:text-black transition-colors" strokeWidth={1.5} />\n'
        '                  <p className="text-3xl font-semibold tracking-tighter mb-2 text-black dark:text-white group-hover/card:text-white dark:group-hover/card:text-black transition-colors">{' + var + '}</p>\n'
        '                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest group-hover/card:text-gray-300 dark:group-hover/card:text-gray-600 transition-colors">' + label + '</p>\n'
        '                </div>'
    )
    content = re.sub(pattern, replacement, content)

# 3. Add black background hover to other main cards
def replace_card(icon_tag, title_text, router_path, original_button_text, is_first=False):
    pattern = (
        r'<div className="([^"]+) bg-white dark:bg-\[#0a0a0a\] flex flex-col group[^"]*">\s*'
        r'<div className="p-8 border-b border-gray-200 dark:border-gray-800 flex items-center ([^"]+)">\s*'
        r'(<div className="flex items-center gap-4">\s*)?'
        r'<' + icon_tag + r' className="w-5 h-5 text-black dark:text-white" strokeWidth=\{1\.5\} />\s*'
        r'<h3 className="text-sm font-bold uppercase tracking-widest">' + title_text + r'</h3>'
    )
    
    # We use a regex to match the start, but we also want to invert texts.
    pass

# Instead of complex regex for the outer cards, let's just do targeted string replaces for the other 4 blocks.
blocks = [
    {
        "search": '<div className="border-b border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col group transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] hover:border-black dark:hover:border-white relative hover:z-10">\n              <div className="p-8 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">\n                <div className="flex items-center gap-4">\n                  <Users className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />\n                  <h3 className="text-sm font-bold uppercase tracking-widest">Personal</h3>',
        "replace": '<div className="border-b border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col group transition-all duration-300 hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10">\n              <div className="p-8 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between group-hover:border-white/20 dark:group-hover:border-black/20">\n                <div className="flex items-center gap-4">\n                  <Users className="w-5 h-5 text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={1.5} />\n                  <h3 className="text-sm font-bold uppercase tracking-widest group-hover:text-white dark:group-hover:text-black transition-colors">Personal</h3>'
    },
    {
        "search": '<span className="text-[9px] font-bold uppercase tracking-widest border border-gray-300 dark:border-gray-700 px-2 py-1 bg-white dark:bg-black">\n                  {activeStaffCount} Activos\n                </span>',
        "replace": '<span className="text-[9px] font-bold uppercase tracking-widest border border-gray-300 dark:border-gray-700 px-2 py-1 bg-white dark:bg-black group-hover:bg-transparent group-hover:text-white dark:group-hover:bg-transparent dark:group-hover:text-black group-hover:border-white/30 dark:group-hover:border-black/30 transition-colors">\n                  {activeStaffCount} Activos\n                </span>'
    },
    {
        "search": '<p className="text-xs text-gray-500 font-light leading-relaxed mb-6">\n                  Profesionales registrados para la atención y provisión de servicios.\n                </p>\n                <button onClick={() => router.push("/provider/store/staff")} className="w-full py-3 border border-black dark:border-white text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">\n                  Administrar Equipo\n                </button>',
        "replace": '<p className="text-xs text-gray-500 font-light leading-relaxed mb-6 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">\n                  Profesionales registrados para la atención y provisión de servicios.\n                </p>\n                <button onClick={() => router.push("/provider/store/staff")} className="w-full py-3 border border-black dark:border-white text-[10px] font-bold uppercase tracking-widest group-hover:border-white/20 group-hover:bg-white/10 dark:group-hover:border-black/20 dark:group-hover:bg-black/10 group-hover:text-white dark:group-hover:text-black transition-colors">\n                  Administrar Equipo\n                </button>'
    },
    {
        "search": '<div className="border-b lg:border-b-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col group hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors">\n              <div className="p-8 border-b border-gray-200 dark:border-gray-800 flex items-center gap-4">\n                <Palette className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />\n                <h3 className="text-sm font-bold uppercase tracking-widest">Identidad Visual</h3>',
        "replace": '<div className="border-b lg:border-b-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col group transition-all duration-300 hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10">\n              <div className="p-8 border-b border-gray-200 dark:border-gray-800 flex items-center gap-4 group-hover:border-white/20 dark:group-hover:border-black/20">\n                <Palette className="w-5 h-5 text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={1.5} />\n                <h3 className="text-sm font-bold uppercase tracking-widest group-hover:text-white dark:group-hover:text-black transition-colors">Identidad Visual</h3>'
    },
    {
        "search": '<p className="text-xs text-gray-500 font-light leading-relaxed mb-6">\n                  Logo, colores de marca, imágenes de portada y biografía de la tienda.\n                </p>\n                <button onClick={() => router.push("/provider/store/identity")} className="w-full py-3 border border-black dark:border-white text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">\n                  Editar Identidad\n                </button>',
        "replace": '<p className="text-xs text-gray-500 font-light leading-relaxed mb-6 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">\n                  Logo, colores de marca, imágenes de portada y biografía de la tienda.\n                </p>\n                <button onClick={() => router.push("/provider/store/identity")} className="w-full py-3 border border-black dark:border-white text-[10px] font-bold uppercase tracking-widest group-hover:border-white/20 group-hover:bg-white/10 dark:group-hover:border-black/20 dark:group-hover:bg-black/10 group-hover:text-white dark:group-hover:text-black transition-colors">\n                  Editar Identidad\n                </button>'
    },
    {
        "search": '<div className="border-b lg:border-b-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col group transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] hover:border-black dark:hover:border-white relative hover:z-10">\n              <div className="p-8 border-b border-gray-200 dark:border-gray-800 flex items-center gap-4">\n                <ShieldCheck className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />\n                <h3 className="text-sm font-bold uppercase tracking-widest">Legal y Políticas</h3>',
        "replace": '<div className="border-b lg:border-b-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col group transition-all duration-300 hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10">\n              <div className="p-8 border-b border-gray-200 dark:border-gray-800 flex items-center gap-4 group-hover:border-white/20 dark:group-hover:border-black/20">\n                <ShieldCheck className="w-5 h-5 text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={1.5} />\n                <h3 className="text-sm font-bold uppercase tracking-widest group-hover:text-white dark:group-hover:text-black transition-colors">Legal y Políticas</h3>'
    },
    {
        "search": '<p className="text-xs text-gray-500 font-light leading-relaxed mb-6">\n                  Políticas de cancelación, reembolsos y términos de venta.\n                </p>\n                <button onClick={() => router.push("/provider/store/policies")} className="w-full py-3 border border-black dark:border-white text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">\n                  Actualizar Políticas\n                </button>',
        "replace": '<p className="text-xs text-gray-500 font-light leading-relaxed mb-6 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">\n                  Políticas de cancelación, reembolsos y términos de venta.\n                </p>\n                <button onClick={() => router.push("/provider/store/policies")} className="w-full py-3 border border-black dark:border-white text-[10px] font-bold uppercase tracking-widest group-hover:border-white/20 group-hover:bg-white/10 dark:group-hover:border-black/20 dark:group-hover:bg-black/10 group-hover:text-white dark:group-hover:text-black transition-colors">\n                  Actualizar Políticas\n                </button>'
    },
    {
        "search": '<div className="border-b lg:border-b-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col group transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] hover:border-black dark:hover:border-white relative hover:z-10">\n              <div className="p-8 border-b border-gray-200 dark:border-gray-800 flex items-center gap-4">\n                <Share2 className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />\n                <h3 className="text-sm font-bold uppercase tracking-widest">Canales y Redes</h3>',
        "replace": '<div className="border-b lg:border-b-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col group transition-all duration-300 hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10">\n              <div className="p-8 border-b border-gray-200 dark:border-gray-800 flex items-center gap-4 group-hover:border-white/20 dark:group-hover:border-black/20">\n                <Share2 className="w-5 h-5 text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={1.5} />\n                <h3 className="text-sm font-bold uppercase tracking-widest group-hover:text-white dark:group-hover:text-black transition-colors">Canales y Redes</h3>'
    },
    {
        "search": '<p className="text-xs text-gray-500 font-light leading-relaxed mb-6">\n                  Conexiones a WhatsApp, Gmail, Calendario y Redes Sociales.\n                </p>\n                <button onClick={() => router.push("/provider/store/integrations")} className="w-full py-3 border border-black dark:border-white text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">\n                  Configurar Canales\n                </button>',
        "replace": '<p className="text-xs text-gray-500 font-light leading-relaxed mb-6 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">\n                  Conexiones a WhatsApp, Gmail, Calendario y Redes Sociales.\n                </p>\n                <button onClick={() => router.push("/provider/store/integrations")} className="w-full py-3 border border-black dark:border-white text-[10px] font-bold uppercase tracking-widest group-hover:border-white/20 group-hover:bg-white/10 dark:group-hover:border-black/20 dark:group-hover:bg-black/10 group-hover:text-white dark:group-hover:text-black transition-colors">\n                  Configurar Canales\n                </button>'
    }
]

for block in blocks:
    content = content.replace(block["search"], block["replace"])


# 4. Asistente de Configuración (checklist)
# We need to change the hover effect to include hover:bg-black and text inversion for the entire row!
content = content.replace(
    '"border-b border-r border-gray-200 dark:border-gray-800 p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 cursor-pointer transition-all duration-300 group relative hover:z-10",\n                  isComplete ? "bg-gray-50 dark:bg-[#050505] hover:bg-gray-100 dark:hover:bg-[#0a0a0a]" : "bg-white dark:bg-[#0a0a0a] hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] hover:border-black dark:hover:border-white"',
    '"border-b border-r border-gray-200 dark:border-gray-800 p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 cursor-pointer transition-all duration-300 group relative hover:z-10",\n                  isComplete ? "bg-gray-50 dark:bg-[#050505] hover:bg-gray-100 dark:hover:bg-[#0a0a0a]" : "bg-white dark:bg-[#0a0a0a] hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] [&_*]:group-hover:text-white dark:[&_*]:group-hover:text-black"'
)

# And specifically handle the "Completado" vs "Continuar" text to make sure the icon also inherits text color properly.
# Actually, `[&_*]:group-hover:text-white` handles nested elements perfectly in Tailwind!

with open(file_path, "w") as f:
    f.write(content)

print("Done patching store/page.tsx")
