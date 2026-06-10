# Convertit les images raster d'assets/ en WebP redimensionné.
# Génère aussi favicon-64.png et og-image.jpg.
# Usage : python optimize-images.py
import os
from PIL import Image

ASSETS = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets')

# Largeur max par catégorie de fichier (suffisant pour un affichage retina)
def max_width(name):
    n = name.lower()
    if n.startswith('screenshot-'):
        return 1400
    if n.startswith('photo-'):
        return 1000
    if n.startswith(('icon-', 'logo')):
        return 512
    return 256  # logos de technos affichés en petit

converted = []
for name in sorted(os.listdir(ASSETS)):
    if not name.lower().endswith(('.png', '.jpg', '.jpeg')):
        continue
    src = os.path.join(ASSETS, name)
    base = name.rsplit('.', 1)[0]
    dst = os.path.join(ASSETS, base + '.webp')
    img = Image.open(src)
    w = max_width(name)
    if img.width > w:
        img = img.resize((w, round(img.height * w / img.width)), Image.LANCZOS)
    if img.mode not in ('RGB', 'RGBA'):
        img = img.convert('RGBA')
    img.save(dst, 'WEBP', quality=82, method=6)
    converted.append((name, base + '.webp',
                      os.path.getsize(src), os.path.getsize(dst)))

# Favicon dédié (64 px) depuis le portrait
portrait = Image.open(os.path.join(ASSETS, 'photo-roman-portrait.png')).convert('RGBA')
portrait.resize((64, 64), Image.LANCZOS).save(
    os.path.join(ASSETS, 'favicon-64.png'), 'PNG', optimize=True)

# Image Open Graph en JPEG (les réseaux sociaux gèrent mal le WebP)
og = Image.open(os.path.join(ASSETS, 'photo-roman.png'))
if og.width > 1200:
    og = og.resize((1200, round(og.height * 1200 / og.width)), Image.LANCZOS)
if og.mode == 'RGBA':
    bg = Image.new('RGB', og.size, (245, 246, 248))
    bg.paste(og, mask=og.split()[3])
    og = bg
else:
    og = og.convert('RGB')
og.save(os.path.join(ASSETS, 'og-image.jpg'), 'JPEG', quality=85, optimize=True)

total_before = sum(c[2] for c in converted)
total_after = sum(c[3] for c in converted)
for old, new, b, a in converted:
    print(f'{old:55s} {b/1024:7.0f} Ko -> {new:50s} {a/1024:6.0f} Ko')
print(f'\nTotal : {total_before/1024/1024:.1f} Mo -> {total_after/1024/1024:.1f} Mo')
