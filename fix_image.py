import json

def add_translation(file_path, key, value):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if "Marketplace" in data and "services" in data["Marketplace"]:
        if key not in data["Marketplace"]["services"]:
            data["Marketplace"]["services"][key] = value
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            return True
    return False

es_added = add_translation('/Users/marcossandovalruiz/Documents/quhealthy/messages/es.json', 'image_label', 'Portada del Servicio')
en_added = add_translation('/Users/marcossandovalruiz/Documents/quhealthy/messages/en.json', 'image_label', 'Service Cover')

print(f"ES patched: {es_added}, EN patched: {en_added}")

# Now patch the ServiceItemCard component
import re

card_path = '/Users/marcossandovalruiz/Documents/quhealthy/components/marketplace/ServiceItemCard.tsx'
with open(card_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Change object-cover to object-contain, and change the container background when image is present from bg-black to something neutral
content = content.replace(
    'service.imageUrl \n                ? "border border-black dark:border-white bg-black" ',
    'service.imageUrl \n                ? "border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505]" '
)

content = content.replace(
    '<img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover group-hover:opacity-40 transition-opacity duration-300" />',
    '<img src={service.imageUrl} alt={service.name} className="w-full h-full object-contain group-hover:opacity-40 transition-opacity duration-300 p-2" />'
)

with open(card_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Card patched.")
