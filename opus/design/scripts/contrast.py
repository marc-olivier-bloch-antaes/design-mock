#!/usr/bin/env python3
"""Calcule les ratios de contraste WCAG 2.1 des paires de couleurs de la charte SiL.
Usage : python3 scripts/contrast.py [--md]   (--md = tableau Markdown pour DESIGN.md)"""
import sys

def lum(h):
    h = h.lstrip("#")
    r, g, b = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)

def ratio(a, b):
    la, lb = sorted([lum(a), lum(b)], reverse=True)
    return (la + 0.05) / (lb + 0.05)

# (texte/objet, fond, usage, seuil requis)  4.5 = texte courant, 3 = grand texte / composant UI
PAIRS = [
    ("#1d1d1b", "#ffffff", "Texte principal (neutral-900) sur blanc", 4.5),
    ("#1d1d1b", "#f6f6f4", "Texte principal sur fond alterné (neutral-50)", 4.5),
    ("#5f5f59", "#ffffff", "Texte secondaire (neutral-600) sur blanc", 4.5),
    ("#5f5f59", "#f6f6f4", "Texte secondaire sur neutral-50", 4.5),
    ("#5f5f59", "#eeeeeb", "Texte secondaire sur neutral-100", 4.5),
    ("#474743", "#ffffff", "Texte lead (neutral-700) sur blanc", 4.5),
    ("#7b7b74", "#ffffff", "Bordure de champ (neutral-500) sur blanc", 3.0),
    ("#ffffff", "#00734d", "Bouton primaire : blanc sur green-700", 4.5),
    ("#ffffff", "#065c3f", "Bouton primaire hover : blanc sur green-800", 4.5),
    ("#00734d", "#ffffff", "Lien (green-700) sur blanc", 4.5),
    ("#00734d", "#f6f6f4", "Lien sur neutral-50", 4.5),
    ("#065c3f", "#ecf8f2", "Texte green-800 sur green-50 (menu actif)", 4.5),
    ("#0a4a34", "#ecf8f2", "Texte callout green-900 sur green-50", 4.5),
    ("#ffffff", "#0a4a34", "Blanc sur green-900 (bandeau CTA, chiffres clés)", 4.5),
    ("#d2efe2", "#0a4a34", "green-100 sur green-900 (texte secondaire bandeau)", 4.5),
    ("#a6dfc6", "#0a4a34", "green-200 sur green-900 (préfixes chiffres clés)", 4.5),
    ("#ffb42e", "#0a4a34", "Icône alerte amber-400 sur green-900", 3.0),
    ("#1d1d1b", "#ffffff", "Bouton inverse : ink sur blanc", 4.5),
    ("#ffffff", "#111110", "Blanc sur footer (neutral-950)", 4.5),
    ("#c9c9c3", "#111110", "Liens footer (neutral-300) sur neutral-950", 4.5),
    ("#a3a39c", "#111110", "Texte discret footer (neutral-400) sur neutral-950", 4.5),
    ("#6fcaa5", "#111110", "Lien accent footer (green-300) sur neutral-950", 4.5),
    ("#e30613", "#111110", "Point rouge du logo sur neutral-950 (logo négatif)", 3.0),
    ("#e30613", "#ffffff", "Point rouge du logo sur blanc", 3.0),
    ("#e1313c", "#ffffff", "Rouge Lausanne red-500 sur blanc (décoratif uniquement)", 3.0),
    ("#c8202c", "#ffffff", "Texte rouge red-600 sur blanc (« À la une »)", 4.5),
    ("#a51d27", "#fdeeee", "Badge PDF / erreur : red-700 sur red-50", 4.5),
    ("#09a16d", "#ffffff", "Vert historique green-500 sur blanc (décoratif, rail)", 3.0),
    ("#ffffff", "#09a16d", "Blanc sur green-500 (INTERDIT pour texte < 24 px)", 3.0),
    ("#0080bf", "#ffffff", "Bleu historique blue-500 sur blanc (décoratif)", 3.0),
    ("#006fa6", "#ffffff", "Anneau de focus blue-600 sur blanc", 3.0),
    ("#006fa6", "#f6f6f4", "Anneau de focus sur neutral-50", 3.0),
    ("#7fd3ff", "#111110", "Anneau de focus inverse blue-300 sur neutral-950", 3.0),
    ("#7fd3ff", "#0a4a34", "Anneau de focus inverse sur green-900", 3.0),
    ("#005a87", "#e6f3fa", "Info : blue-700 sur blue-50", 4.5),
    ("#9a5b00", "#fff5e0", "Badge JSON / avertissement : amber-700 sur amber-50", 4.5),
    ("#1d1d1b", "#f69e01", "Ink sur amber-500", 4.5),
    ("#8a5200", "#fff3d6", "Univers Électricité : ink sur soft", 4.5),
    ("#b03a16", "#fdebe4", "Univers Chaleur : ink sur soft", 4.5),
    ("#00628f", "#e3f2fa", "Univers Gaz : ink sur soft", 4.5),
    ("#5f37b8", "#efe9fc", "Univers Multimédia : ink sur soft", 4.5),
    ("#0b6f70", "#e0f5f4", "Univers Mobilité : ink sur soft", 4.5),
    ("#7a6000", "#fff7d1", "Univers Solaire : ink sur soft", 4.5),
    ("#ffffff", "#707070", "Blanc sur overlay photo 60 % (pire cas : photo blanche)", 4.5),
    ("#ffffff", "#1d1d1b", "Onglet mobile actif : blanc sur neutral-900", 4.5),
]

md = "--md" in sys.argv
if md:
    print("| Premier plan | Fond | Usage | Ratio | Requis | Résultat |")
    print("|---|---|---|---:|---:|---|")
fails = 0
for fg, bg, use, req in PAIRS:
    r = ratio(fg, bg)
    ok = r >= req - 0.005
    fails += not ok
    verdict = ("AAA" if r >= 7 else "AA" if r >= 4.5 else "AA grand texte / UI" if r >= 3 else "échec") if ok else "ÉCHEC"
    if md:
        print(f"| `{fg}` | `{bg}` | {use} | {r:.2f}:1 | {req}:1 | {verdict} |")
    else:
        print(f"{fg} / {bg}  {r:5.2f}:1  (≥{req})  {verdict:22} {use}")
if not md:
    print(f"\n{len(PAIRS)} paires, {fails} échec(s)")
