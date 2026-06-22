import re

file_path = "/Users/marcossandovalruiz/Documents/quhealthy/app/[locale]/(platform)/provider/dashboard/patients/page.tsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Update TableRow className
content = content.replace(
    'className="hover:bg-gray-50 dark:hover:bg-[#111] transition-colors cursor-pointer group"',
    'className="hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white transition-all duration-300 cursor-pointer group hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10"'
)

# 2. Update patient name hover
content = content.replace(
    'group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors',
    'group-hover:text-white dark:group-hover:text-black transition-colors'
)

# 3. Update patient email hover
content = content.replace(
    'text-[9px] font-bold text-gray-500 uppercase tracking-widest truncate mt-1',
    'text-[9px] font-bold text-gray-500 uppercase tracking-widest truncate mt-1 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors'
)

# 4. Update appointment count box hover
content = content.replace(
    'className="inline-flex items-center justify-center w-8 h-8 border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] text-black dark:text-white font-bold text-xs"',
    'className="inline-flex items-center justify-center w-8 h-8 border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] text-black dark:text-white font-bold text-xs group-hover:bg-transparent group-hover:text-white dark:group-hover:bg-transparent dark:group-hover:text-black group-hover:border-white/30 dark:group-hover:border-black/30 transition-colors"'
)

# 5. Update last appointment date hover
content = content.replace(
    'className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white"',
    'className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors"'
)

# 6. Update Calendar icon
content = content.replace(
    '<Calendar className="w-3.5 h-3.5 text-gray-400" strokeWidth={1.5} />',
    '<Calendar className="w-3.5 h-3.5 text-gray-400 group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={1.5} />'
)

# 7. Update MoreHorizontal button hover text
content = content.replace(
    '<MoreHorizontal className="h-4 w-4 text-gray-500 hover:text-black dark:hover:text-white" strokeWidth={1.5} />',
    '<MoreHorizontal className="h-4 w-4 text-gray-500 group-hover:text-white dark:group-hover:text-black hover:text-white dark:hover:text-black transition-colors" strokeWidth={1.5} />'
)

with open(file_path, "w") as f:
    f.write(content)

print("Done patching patients/page.tsx")
