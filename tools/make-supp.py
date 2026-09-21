from fontTools.subset import Subsetter, Options
from fontTools.ttLib import TTFont

SRC = "assets/portfolio-serif.woff2"      # has 概/览
OUT = "assets/portfolio-serif-cjk-supp.woff2"

font = TTFont(SRC)
opts = Options()
opts.glyph_names = False
opts.recalc_bounds = True
opts.notdef_outline = True
opts.name_IDs = []
opts.name_legacy = False
opts.layout_features = []      # drop GSUB/GPOS, not needed for 2 static glyphs
opts.drop_tables = ["GDEF", "GSUB", "GPOS", "BASE", "JSTF", "DSIG", "MVAR", "STAT", "HVAR", "VVAR"]
ss = Subsetter(options=opts)
ss.populate(text="概览")        # unicode codepoints U+6982, U+89C8
ss.subset(font)
font.save(OUT)

# verify
f2 = TTFont(OUT)
cmap = f2.getBestCmap()
print("output glyphs:", len(f2.getGlyphOrder()), "chars:", len(cmap))
for ch in ["概", "览"]:
    print(ch, "present:", ord(ch) in cmap)
