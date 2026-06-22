import re

# 1. KanbanCard.tsx
kanban_path = "/Users/marcossandovalruiz/Documents/quhealthy/components/dashboard/KanbanCard.tsx"
with open(kanban_path, "r") as f:
    kanban_content = f.read()

kanban_content = kanban_content.replace(
    'hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-[#111] transition-colors mb-3"',
    'group hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10 mb-3"'
)

kanban_content = kanban_content.replace(
    'text-black dark:text-white',
    'text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors'
)

kanban_content = kanban_content.replace(
    'text-gray-500',
    'text-gray-500 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors'
)
kanban_content = kanban_content.replace(
    'text-gray-400',
    'text-gray-400 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors'
)

kanban_content = kanban_content.replace(
    'bg-gray-50 dark:bg-[#050505]',
    'bg-gray-50 dark:bg-[#050505] group-hover:bg-transparent transition-colors'
)

# Button inversion
kanban_content = kanban_content.replace(
    'bg-black text-white dark:bg-white dark:text-black border-0',
    'bg-black text-white dark:bg-white dark:text-black border-0 group-hover:border group-hover:border-white/30 dark:group-hover:border-black/30 group-hover:bg-transparent group-hover:text-white dark:group-hover:text-black transition-colors'
)

with open(kanban_path, "w") as f:
    f.write(kanban_content)


# 2. page.tsx
page_path = "/Users/marcossandovalruiz/Documents/quhealthy/app/[locale]/(platform)/provider/dashboard/appointments/page.tsx"
with open(page_path, "r") as f:
    page_content = f.read()

# Row hover
page_content = page_content.replace(
    'transition-colors hover:bg-gray-50 dark:hover:bg-[#111]"',
    'group hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10 cursor-pointer"'
)

# Metric cards hover
page_content = page_content.replace(
    'className="p-6 md:p-8 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a]">',
    'className="p-6 md:p-8 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] group hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10 cursor-pointer">'
)

page_content = page_content.replace(
    'className="p-6 md:p-8 flex flex-col justify-center bg-white dark:bg-[#0a0a0a]">',
    'className="p-6 md:p-8 flex flex-col justify-center bg-white dark:bg-[#0a0a0a] group hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10 cursor-pointer">'
)

# Fix text inside metric and row
page_content = page_content.replace(
    'className="text-3xl font-semibold tracking-tight text-black dark:text-white leading-none">',
    'className="text-3xl font-semibold tracking-tight text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors leading-none">'
)

page_content = page_content.replace(
    '<span className="text-sm font-bold text-gray-400 tracking-widest ml-1">MIN</span>',
    '<span className="text-sm font-bold text-gray-400 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors tracking-widest ml-1">MIN</span>'
)

# Fix list rows text colors
page_content = page_content.replace(
    '<h3 className="font-semibold text-sm uppercase tracking-widest text-black dark:text-white leading-none">',
    '<h3 className="font-semibold text-sm uppercase tracking-widest text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors leading-none">'
)

page_content = page_content.replace(
    '<strong className="text-black dark:text-white">',
    '<strong className="text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors">'
)

page_content = page_content.replace(
    '<div className="w-12 h-12 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-gray-500 flex items-center justify-center shrink-0">',
    '<div className="w-12 h-12 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-gray-500 group-hover:bg-transparent group-hover:border-white/30 dark:group-hover:border-black/30 group-hover:text-white dark:group-hover:text-black transition-colors flex items-center justify-center shrink-0">'
)

# Replace the text-gray-500 and text-gray-400 in spans inside the row (be careful to target the correct ones)
# Wait, this regex approach is safer for specific tags.
page_content = page_content.replace(
    '<span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">',
    '<span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">'
)

page_content = page_content.replace(
    '<span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">',
    '<span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors flex items-center gap-1.5">'
)

page_content = page_content.replace(
    '<Clock className="w-3 h-3 text-gray-400" strokeWidth={1.5} />',
    '<Clock className="w-3 h-3 text-gray-400 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors" strokeWidth={1.5} />'
)

# Let's fix the row buttons
page_content = page_content.replace(
    'className="h-10 px-4 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 rounded-none flex-1 md:flex-none justify-center">',
    'className="h-10 px-4 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] text-black dark:text-white group-hover:bg-transparent group-hover:border-white/30 dark:group-hover:border-black/30 group-hover:text-white dark:group-hover:text-black transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 rounded-none flex-1 md:flex-none justify-center">'
)

page_content = page_content.replace(
    'className="h-10 px-4 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 border-0 rounded-none flex-1 md:flex-none justify-center animate-pulse">',
    'className="h-10 px-4 bg-black text-white dark:bg-white dark:text-black group-hover:bg-transparent group-hover:border group-hover:border-white/30 dark:group-hover:border-black/30 group-hover:text-white dark:group-hover:text-black transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 border-0 rounded-none flex-1 md:flex-none justify-center animate-pulse">'
)


with open(page_path, "w") as f:
    f.write(page_content)

print("Appointments hover applied.")
