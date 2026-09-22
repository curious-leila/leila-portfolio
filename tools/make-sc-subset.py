# -*- coding: utf-8 -*-
"""生成 assets/portfolio-serif-sc.woff2：页面用到的简体中文子集（可变字体）。

源字体：Noto Serif SC 可变字体（默认取本机 C:/Windows/Fonts/NotoSerifSC-VF.ttf，
        也可用第一个命令行参数指定路径）。
字符集：现有子集 cmap ∪ 页面实际会渲染的字符（index.html + script.js + CSS content）。
        只增不减，避免删掉仍在用的字形。

⚠️ 两条踩过的坑，改动时别踩回去：
1. 必须保留 name 表（不要设 name_IDs=[]）。iOS Safari 不加载 name 表为空的补位字体，
   历史上用「unicode-range 补位子集」补「概/览」二字，就是因为 supp 字体缺 name 表
   在 iPhone 上直接不生效，字回退成系统宋体。方案已废弃，所有字形都并进这一份字体。
2. 页面上的文案会随迭代出现新字（脚本运行时还会改写按钮文案，如「预览简历」），
   所以每次改完文案都要重跑本脚本，否则新字回退系统字体、与周围字形不一致。

用法：python tools/make-sc-subset.py [源字体路径]
"""
import io
import os
import re
import sys

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'portfolio-serif-sc.woff2')
CURRENT = OUT
DEFAULT_SRC = 'C:/Windows/Fonts/NotoSerifSC-VF.ttf'


def page_chars():
    """页面实际会渲染的字符：html/js 全文 + CSS 的 content 值。
    不含 styles.css 正文（里面只有注释，注释里的汉字不会上屏，收进去白白撑大字体）。"""
    text = ''
    for name in ('index.html', 'script.js'):
        with io.open(os.path.join(ROOT, name), encoding='utf-8') as fh:
            text += fh.read()
    with io.open(os.path.join(ROOT, 'styles.css'), encoding='utf-8') as fh:
        text += ''.join(re.findall(r'content:"([^"]*)"', fh.read()))
    return {c for c in text if ord(c) >= 0x20}


def is_cjk(ch):
    """汉字或中文标点：这类字缺失会直接看得见，必须阻塞；其余符号（如 ✕）忽略。"""
    cp = ord(ch)
    return (
        0x3000 <= cp <= 0x303F      # 中文标点
        or 0x4E00 <= cp <= 0x9FFF   # CJK 统一表意文字
        or 0xFF00 <= cp <= 0xFFEF   # 全角形式
        or 0x3400 <= cp <= 0x4DBF   # 扩展 A
    )


def main():
    src_path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SRC
    if not os.path.exists(src_path):
        sys.exit(f'源字体不存在：{src_path}')

    keep = set()
    if os.path.exists(CURRENT):
        # 保留上一版子集的全部码位（含空格等空白字符，它们的宽度会影响行内间距）
        keep |= {chr(cp) for cp in TTFont(CURRENT).getBestCmap() if cp >= 0x20}
    wanted = keep | page_chars()

    font = TTFont(src_path, lazy=False)
    have = {chr(cp) for cp in font.getBestCmap()}
    missing = sorted(wanted - have)
    subset_chars = wanted & have

    opts = Options()
    opts.name_IDs = ['*']          # 见文件头坑 1：name 表必须留
    opts.name_legacy = False
    opts.name_languages = ['*']
    opts.layout_features = ['*']
    opts.notdef_outline = True
    opts.hinting = True
    opts.recalc_bounds = False     # 不改轮廓包围盒，保持与源一致
    opts.glyph_names = False
    opts.legacy_kern = False
    opts.drop_tables = []
    opts.ignore_missing_unicodes = True
    opts.retain_gids = False

    ss = Subsetter(options=opts)
    ss.populate(text=''.join(sorted(subset_chars)))
    ss.subset(font)

    tmp = OUT + '.tmp'
    font.flavor = 'woff2'
    font.save(tmp)

    new = TTFont(tmp)
    cmap = new.getBestCmap()
    uncovered = sorted(c for c in wanted if ord(c) not in cmap)
    blocking = [c for c in uncovered if is_cjk(c)]
    skipped = [c for c in uncovered if not is_cjk(c)]
    print(f'源字体：{src_path}')
    print(f'字符集：{len(wanted)} 个（其中原字体没有、跳过 {len(missing)} 个：{"".join(missing)}）')
    print(f'输出：{tmp}  {os.path.getsize(tmp)} bytes（原 {os.path.getsize(CURRENT)} bytes）')
    print(f'字形数 {new["maxp"].numGlyphs}，cmap {len(cmap)} 码位')
    print(f'name 表记录数：{len(new["name"].names)}（必须 > 0）')
    print(f'表：{sorted(t for t in new.keys() if t != "GlyphOrder")}')
    print(f'源字体没有的符号（一向上屏就回退系统字体，可接受）：{"".join(skipped) or "无"}')
    print(f'仍缺的汉字/中文标点：{"".join(blocking) or "无"}')
    for probe in ('预览简历', '概览', '剪贴板', '华东赛二等奖', '省', '冠', '军', '东'):
        ok_chars = ''.join(c for c in probe if ord(c) in cmap)
        print(f'  抽查「{probe}」：覆盖 {ok_chars}')
    if not blocking:
        os.replace(tmp, OUT)
        print(f'\n已写入 {OUT}')
    else:
        print('\n有汉字未被覆盖，未输出（先确认字符集）')


if __name__ == '__main__':
    main()
