import re

file_path = "/Users/marcossandovalruiz/Documents/quhealthy/app/[locale]/(platform)/provider/dashboard/billing/page.tsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Row Hover
content = content.replace(
    '<tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-[#111] transition-colors group">',
    '<tr key={tx.id} className="hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white transition-all duration-300 group hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10 cursor-pointer">'
)

# 2. Text Inversions
content = content.replace(
    'className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white"',
    'className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors"'
)

content = content.replace(
    '<CalendarDays className="w-3 h-3 text-gray-500" strokeWidth={1.5} />',
    '<CalendarDays className="w-3 h-3 text-gray-500 group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={1.5} />'
)
content = content.replace(
    'className="w-6 h-6 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0"',
    'className="w-6 h-6 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0 group-hover:bg-transparent group-hover:border-white/30 dark:group-hover:border-black/30 transition-colors"'
)

content = content.replace(
    'className="text-[9px] font-bold uppercase tracking-widest text-gray-500 ml-9 mt-1.5"',
    'className="text-[9px] font-bold uppercase tracking-widest text-gray-500 ml-9 mt-1.5 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors"'
)

content = content.replace(
    '<CreditCard className="w-4 h-4 text-gray-400" strokeWidth={1.5} />',
    '<CreditCard className="w-4 h-4 text-gray-400 group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={1.5} />'
)

content = content.replace(
    '<span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">',
    '<span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors">'
)

content = content.replace(
    '<p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-1.5 ml-7">',
    '<p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-1.5 ml-7 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">'
)

content = content.replace(
    '<span className="text-xl font-semibold tracking-tight text-black dark:text-white leading-none">',
    '<span className="text-xl font-semibold tracking-tight text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors leading-none">'
)

content = content.replace(
    '<span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">',
    '<span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-0.5 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">'
)

# 3. Buttons Inversion
content = content.replace(
    'className="w-10 h-10 flex items-center justify-center border border-black/20 dark:border-white/20 bg-white text-black dark:bg-[#0a0a0a] dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors rounded-none"',
    'className="w-10 h-10 flex items-center justify-center border border-black/20 dark:border-white/20 bg-white text-black dark:bg-[#0a0a0a] dark:text-white group-hover:bg-transparent group-hover:border-white/30 dark:group-hover:border-black/30 group-hover:text-white dark:group-hover:text-black transition-colors rounded-none"'
)

content = content.replace(
    '<FileTextIcon className="w-4 h-4" strokeWidth={1.5} />',
    '<FileTextIcon className="w-4 h-4 group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={1.5} />'
)

content = content.replace(
    'className="w-10 h-10 flex items-center justify-center border-y border-r border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-black dark:text-white hover:bg-black hover:border-black hover:text-white dark:hover:bg-white dark:hover:border-white dark:hover:text-black transition-colors rounded-none"',
    'className="w-10 h-10 flex items-center justify-center border-y border-r border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-black dark:text-white group-hover:bg-transparent group-hover:border-white/30 dark:group-hover:border-black/30 group-hover:text-white dark:group-hover:text-black transition-colors rounded-none"'
)

content = content.replace(
    '<ExternalLink className="w-4 h-4" strokeWidth={1.5} />',
    '<ExternalLink className="w-4 h-4 group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={1.5} />'
)

with open(file_path, "w") as f:
    f.write(content)

print("Done patching billing/page.tsx")
