import re

inv_path = "/Users/marcossandovalruiz/Documents/quhealthy/app/[locale]/(platform)/provider/dashboard/inventory/page.tsx"
with open(inv_path, "r") as f:
    inv_content = f.read()

inv_content = inv_content.replace(
    '<Pill className="w-5 h-5 text-gray-500" strokeWidth={1.5} />',
    '<Pill className="w-5 h-5 text-gray-500 group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={1.5} />'
)

with open(inv_path, "w") as f:
    f.write(inv_content)
