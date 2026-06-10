# Génère assets/cv-roman-rodriguez.pdf à partir du contenu du portfolio.
# CV une page, généré automatiquement — à remplacer par un CV personnalisé si besoin.
# Usage : python generate-cv.py
import os
from fpdf import FPDF

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'assets', 'cv-roman-rodriguez.pdf')

ACCENT = (79, 70, 229)   # indigo du site
DARK = (15, 23, 42)
GRAY = (100, 116, 139)

pdf = FPDF('P', 'mm', 'A4')
pdf.set_auto_page_break(True, margin=12)
pdf.add_page()
pdf.add_font('Segoe', '', r'C:\Windows\Fonts\segoeui.ttf')
pdf.add_font('Segoe', 'B', r'C:\Windows\Fonts\segoeuib.ttf')

L, R = 14, 196  # marges

# ---- En-tête
pdf.set_xy(L, 14)
pdf.set_font('Segoe', 'B', 24)
pdf.set_text_color(*DARK)
pdf.cell(0, 10, 'Roman Rodriguez')
pdf.set_xy(L, 25)
pdf.set_font('Segoe', '', 12)
pdf.set_text_color(*ACCENT)
pdf.cell(0, 6, 'Développeur full-stack & mobile — alternant chez KDS')
pdf.set_xy(L, 32)
pdf.set_font('Segoe', '', 9)
pdf.set_text_color(*GRAY)
pdf.cell(0, 5, 'Valence, France · 07 50 02 64 78 · roman.theo.rodriguez@gmail.com')
pdf.set_xy(L, 37)
pdf.cell(0, 5, 'linkedin.com/in/roman-rodriguez-b34a96376 · github.com/Vaxen69')

y = 46

def section(title, y):
    pdf.set_xy(L, y)
    pdf.set_font('Segoe', 'B', 11)
    pdf.set_text_color(*ACCENT)
    pdf.cell(0, 6, title.upper())
    pdf.set_draw_color(*ACCENT)
    pdf.set_line_width(0.4)
    pdf.line(L, y + 7, R, y + 7)
    return y + 10

def entry(period, title, sub, bullets, y):
    pdf.set_xy(L, y)
    pdf.set_font('Segoe', 'B', 10)
    pdf.set_text_color(*DARK)
    pdf.cell(120, 5, title)
    pdf.set_font('Segoe', '', 9)
    pdf.set_text_color(*GRAY)
    pdf.set_xy(L + 120, y)
    pdf.cell(R - L - 120, 5, period, align='R')
    y += 5
    if sub:
        pdf.set_xy(L, y)
        pdf.set_font('Segoe', '', 9)
        pdf.set_text_color(*GRAY)
        pdf.cell(0, 4.5, sub)
        y += 4.5
    pdf.set_font('Segoe', '', 9)
    pdf.set_text_color(51, 65, 85)
    for b in bullets:
        pdf.set_xy(L + 3, y)
        pdf.multi_cell(R - L - 6, 4.5, '•  ' + b)
        y = pdf.get_y()
    return y + 2

# ---- Expérience
y = section('Expérience', y)
y = entry('2025 — 2026', 'KDS — Développeur Mobile & CRM (alternance)', None, [
    "Application mobile PhotoKDS pour les audits de copropriétés (Flutter, React Native), architecture offline-first",
    "Carte KDS : carte interactive interne de visualisation des dossiers d'audit géolocalisés",
    "Mise en place d'un CRM Airtable : modélisation, automatisations, intégration aux flux internes",
], y)
y = entry('2024 — 2025', 'Dr J. Chandezon — Développeur Full-Stack (stage)', None, [
    "Maquette Figma puis développement du site et de l'espace patient (PHP, MySQL, HTML/CSS)",
    "Conception de la base de données relationnelle — site en ligne : drchandezon.fr",
], y)
y = entry('2025 — 2026', "Intermarché — Les Mousquetaires (SAÉ, IUT Valence)", None, [
    "Application mobile embarquée sur transpalette pour préparateurs en entrepôt réfrigéré (React, Symfony)",
], y)

# ---- Formation
y = section('Formation', y + 1)
y = entry('2023 — 2026', "BUT Informatique · Réalisation d'applications", 'IUT de Valence — Université Grenoble Alpes · 3e année en alternance', [], y)
y = entry('2022 — 2023', 'Baccalauréat général · Mention Assez Bien', 'Lycée les Catalins, Montélimar', [], y)

# ---- Compétences
y = section('Compétences', y + 1)
skills = [
    ('Web', 'HTML/CSS, JavaScript, TypeScript, PHP, React, Symfony'),
    ('Logiciel', 'Java, Python, C, C++, C#, Rust'),
    ('Mobile', 'Flutter, React Native, React Expo, Kotlin'),
    ('Données', 'SQL, Neo4j, Firestore, Power BI'),
    ('Outils', 'Docker, GitLab CI/CD, ESXi, Godot, Modélio'),
]
for label, items in skills:
    pdf.set_xy(L, y)
    pdf.set_font('Segoe', 'B', 9)
    pdf.set_text_color(*DARK)
    pdf.cell(24, 4.8, label)
    pdf.set_font('Segoe', '', 9)
    pdf.set_text_color(51, 65, 85)
    pdf.cell(0, 4.8, items)
    y += 4.8

# ---- Langues & intérêts
y = section('Langues & centres d’intérêt', y + 3)
pdf.set_xy(L, y)
pdf.set_font('Segoe', '', 9)
pdf.set_text_color(51, 65, 85)
pdf.multi_cell(R - L, 4.8,
    'Français (natif) · Anglais B2 · Espagnol A2\n'
    'Musique (jazz rap, soul, R&B) · Football · Journalisme & géopolitique · Culture audiovisuelle')

pdf.output(OUT)
print('Wrote', OUT, round(os.path.getsize(OUT) / 1024), 'Ko')
