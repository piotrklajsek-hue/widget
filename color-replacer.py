#!/usr/bin/env python3
import sys
import re

# Read file
with open('src/app/pages/Home.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all variations of yellow-400 with #FADA00
# Order matters - replace more specific patterns first
replacements = [
    ('hover:bg-yellow-400', 'hover:bg-[#FADA00]'),
    ('hover:text-yellow-400', 'hover:text-[#FADA00]'),
    ('focus:ring-yellow-400', 'focus:ring-[#FADA00]'),
    ('disabled:bg-yellow-400', 'disabled:bg-[#FADA00]'),
    ('bg-yellow-400', 'bg-[#FADA00]'),
    ('text-yellow-400', 'text-[#FADA00]'),
    ('fill-yellow-400', 'fill-[#FADA00]'),
    ('border-yellow-400', 'border-[#FADA00]'),
    ('ring-yellow-400', 'ring-[#FADA00]'),
]

for old, new in replacements:
    content = content.replace(old, new)

# Replace rgba colors
content = content.replace('rgba(250,204,21', 'rgba(250,218,0')
content = content.replace('rgba(250, 204, 21', 'rgba(250, 218, 0')

# Write file
with open('src/app/pages/Home.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Replaced all colors")
