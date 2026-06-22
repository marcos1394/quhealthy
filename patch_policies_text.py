import re

file_path = "/Users/marcossandovalruiz/Documents/quhealthy/components/marketplace/CancellationPolicySection.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Make the inner span explicit
content = content.replace(
    '<span className="text-[10px] font-bold uppercase tracking-widest">{template.name}</span>',
    '<span className="text-[10px] font-bold uppercase tracking-widest group-hover:text-white dark:group-hover:text-black transition-colors">{template.name}</span>'
)

# Explicitly make the icon transition
content = content.replace(
    '<Icon className="w-4 h-4" strokeWidth={isSelected ? 2 : 1.5} />',
    '<Icon className="w-4 h-4 group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={isSelected ? 2 : 1.5} />'
)

# And check icon
content = content.replace(
    '<CheckCircle2 className="w-4 h-4" strokeWidth={2} />',
    '<CheckCircle2 className="w-4 h-4 group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={2} />'
)

# Ensure the parent button text-inversion uses !important just in case 
content = content.replace(
    'group-hover:text-white dark:group-hover:text-black',
    'group-hover:!text-white dark:group-hover:!text-black'
)

with open(file_path, "w") as f:
    f.write(content)

print("Text explicitly inverted.")
