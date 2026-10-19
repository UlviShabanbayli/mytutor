"""Builds the app's Plus Jakarta Sans files without contextual alternates ('calt').

The font's 'calt' turns "x" after a digit into "×" and "-" into a minus sign. In a maths app
"2x" must stay a variable, and React Native on iOS/Android cannot switch the feature off, so
the shipped fonts simply do not have it. Run from apps/mobile after updating the package:

    python3 scripts/strip-font-calt.py
"""

from pathlib import Path

from fontTools.ttLib import TTFont

SOURCE = Path("../../node_modules/@expo-google-fonts/plus-jakarta-sans")
TARGET = Path("assets/fonts")
WEIGHTS = ["400Regular", "600SemiBold", "700Bold", "800ExtraBold"]

for weight in WEIGHTS:
    font = TTFont(SOURCE / weight / f"PlusJakartaSans_{weight}.ttf")
    for record in font["GSUB"].table.FeatureList.FeatureRecord:
        if record.FeatureTag == "calt":
            record.Feature.LookupListIndex = []
            record.Feature.LookupCount = 0
    font.save(TARGET / f"PlusJakartaSans_{weight}.ttf")
    print("wrote", TARGET / f"PlusJakartaSans_{weight}.ttf")
