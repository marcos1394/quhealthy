import re

file_path = "/Users/marcossandovalruiz/Documents/quhealthy/components/marketplace/CancellationPolicySection.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Update button classes
old_button_class = """                  className={cn(
                    "flex flex-col items-start gap-4 p-6 border-b border-r text-left transition-colors relative group",
                    isSelected ? template.selectedClass : template.unselectedClass
                  )}"""

new_button_class = """                  className={cn(
                    "flex flex-col items-start gap-4 p-6 border-b border-r text-left transition-all duration-300 relative group hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] hover:z-10 cursor-pointer group-hover:text-white dark:group-hover:text-black",
                    isSelected ? template.selectedClass : template.unselectedClass
                  )}"""

content = content.replace(old_button_class, new_button_class)

# Update paragraph classes
old_p_class = """                  <p className={cn(
                    "text-xs font-light leading-relaxed",
                    isSelected ? "text-gray-700 dark:text-gray-300" : "text-gray-500"
                  )}>"""

new_p_class = """                  <p className={cn(
                    "text-xs font-light leading-relaxed transition-colors group-hover:text-gray-300 dark:group-hover:text-gray-600",
                    isSelected ? "text-gray-700 dark:text-gray-300" : "text-gray-500"
                  )}>"""

content = content.replace(old_p_class, new_p_class)

# Update template classes just in case they interfere with text colors
# We don't want the static text color to override the hover, but Tailwind usually respects hover: over static.
# However, to be perfectly safe, let's just make sure it works. The group-hover on the button handles the main text.
# For the icon and span, it inherits. 
# BUT `cn` might strip group-hover if it clashes? No, `group-hover:text-white` doesn't clash with `text-black`.

with open(file_path, "w") as f:
    f.write(content)

print("Policies cards patched.")
