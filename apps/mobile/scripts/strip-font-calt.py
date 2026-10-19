"""Builds the app's font files: Onest without contextual alternates ('calt'), Unbounded as is.

Onest's 'calt' rewrites characters next to digits. In a maths app "2x" must stay a variable,
and React Native on iOS/Android cannot switch the feature off, so the shipped Onest files
simply do not have it. Unbounded (headings and big numbers) has no 'calt'. Run from
apps/mobile after updating either package:

    python3 scripts/strip-font-calt.py
"""

import shutil
from pathlib import Path

from fontTools.ttLib import TTFont

PACKAGES = Path("../../node_modules/@expo-google-fonts")
TARGET = Path("assets/fonts")
ONEST = ["400Regular", "500Medium", "600SemiBold", "700Bold", "800ExtraBold"]
UNBOUNDED = ["600SemiBold", "700Bold", "800ExtraBold"]

for weight in ONEST:
    font = TTFont(PACKAGES / "onest" / weight / f"Onest_{weight}.ttf")
    for record in font["GSUB"].table.FeatureList.FeatureRecord:
        if record.FeatureTag == "calt":
            record.Feature.LookupListIndex = []
            record.Feature.LookupCount = 0
    font.save(TARGET / f"Onest_{weight}.ttf")
    print("wrote", TARGET / f"Onest_{weight}.ttf")

for weight in UNBOUNDED:
    name = f"Unbounded_{weight}.ttf"
    shutil.copyfile(PACKAGES / "unbounded" / weight / name, TARGET / name)
    print("wrote", TARGET / name)
