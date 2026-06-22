import re

file_path = "/Users/marcossandovalruiz/Documents/quhealthy/app/[locale]/(platform)/provider/dashboard/cash-register/page.tsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Update the 3 Metric Cards
content = content.replace(
    '<div className="border-b border-r border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col justify-between min-h-[140px]">',
    '<div className="border-b border-r border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col justify-between min-h-[140px] group transition-all duration-300 hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10 cursor-pointer">'
)

content = content.replace(
    '<p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2">BALANCE INICIAL</p>',
    '<p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors mb-2">BALANCE INICIAL</p>'
)
content = content.replace(
    '<p className="text-3xl font-semibold tracking-tight text-black dark:text-white leading-none">${register.initialBalance.toFixed(2)}</p>',
    '<p className="text-3xl font-semibold tracking-tight text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors leading-none">${register.initialBalance.toFixed(2)}</p>'
)

content = content.replace(
    '<p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2">INGRESOS DEL DÍA</p>',
    '<p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors mb-2">INGRESOS DEL DÍA</p>'
)
# (INGRESOS text color stays the same)

content = content.replace(
    '<p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2">EGRESOS DEL DÍA</p>',
    '<p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors mb-2">EGRESOS DEL DÍA</p>'
)
# (EGRESOS text color stays the same)

# 2. Transactions List Row
content = content.replace(
    '<div key={tx.id} className="p-6 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors group">',
    '<div key={tx.id} className="p-6 hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white transition-all duration-300 group hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10 cursor-pointer">'
)

content = content.replace(
    '<p className="font-semibold text-sm uppercase tracking-widest text-black dark:text-white">{tx.description}</p>',
    '<p className="font-semibold text-sm uppercase tracking-widest text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors">{tx.description}</p>'
)

content = content.replace(
    '<span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 border border-black/20 dark:border-white/20 px-2 py-0.5 bg-gray-50 dark:bg-[#050505]">',
    '<span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 border border-black/20 dark:border-white/20 px-2 py-0.5 bg-gray-50 dark:bg-[#050505] group-hover:bg-transparent group-hover:text-white dark:group-hover:text-black group-hover:border-white/30 dark:group-hover:border-black/30 transition-colors">'
)

content = content.replace(
    '<span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">\n                              {new Date(tx.createdAt).toLocaleTimeString()} HRS\n                            </span>',
    '<span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">\n                              {new Date(tx.createdAt).toLocaleTimeString()} HRS\n                            </span>'
)

# 3. History List Row
content = content.replace(
    '<tr key={h.id} className="hover:bg-gray-50 dark:hover:bg-[#111] transition-colors group">',
    '<tr key={h.id} className="hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white transition-all duration-300 group hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10 cursor-pointer">'
)

# For history row texts:
content = content.replace(
    '<span className="text-xs font-bold text-black dark:text-white">{format(new Date(h.openedAt), "PP p", { locale: es })}</span>',
    '<span className="text-xs font-bold text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors">{format(new Date(h.openedAt), "PP p", { locale: es })}</span>'
)

content = content.replace(
    '<span className="text-xs font-bold text-black dark:text-white">{h.closedAt ? format(new Date(h.closedAt), "PP p", { locale: es }) : \'--\'}</span>',
    '<span className="text-xs font-bold text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors">{h.closedAt ? format(new Date(h.closedAt), "PP p", { locale: es }) : \'--\'}</span>'
)

content = content.replace(
    '<span className="text-sm font-semibold text-black dark:text-white">${h.initialBalance.toFixed(2)}</span>',
    '<span className="text-sm font-semibold text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors">${h.initialBalance.toFixed(2)}</span>'
)

content = content.replace(
    '<span className="text-sm font-semibold text-black dark:text-white">${h.expectedBalance?.toFixed(2) || \'0.00\'}</span>',
    '<span className="text-sm font-semibold text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors">${h.expectedBalance?.toFixed(2) || \'0.00\'}</span>'
)

content = content.replace(
    '<span className="text-sm font-semibold text-black dark:text-white">${h.actualBalance?.toFixed(2) || \'0.00\'}</span>',
    '<span className="text-sm font-semibold text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors">${h.actualBalance?.toFixed(2) || \'0.00\'}</span>'
)

# MoreHorizontal icon in history table
content = content.replace(
    '<Eye className="h-4 w-4 text-gray-500 hover:text-black dark:hover:text-white" strokeWidth={1.5} />',
    '<Eye className="h-4 w-4 text-gray-500 group-hover:text-white dark:group-hover:text-black hover:text-white dark:hover:text-black transition-colors" strokeWidth={1.5} />'
)

with open(file_path, "w") as f:
    f.write(content)

print("Done patching cash-register/page.tsx")
