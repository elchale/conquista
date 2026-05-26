#!/usr/bin/env python3
"""Comprime un PDF escaneado (facsimil) reduciendo la resolucion de cada pagina
y recomprimiendo en JPEG. Pensado para los facsimiles ilustrados que superan el
limite de 100 MB/archivo de GitHub, conservando legibles los dibujos.

Uso:
    python scripts/comprimir_pdf.py ENTRADA SALIDA [--dpi 150] [--quality 72] [--gray]

Rasteriza cada pagina (pierde capa de texto/OCR, irrelevante en un facsimil de
imagenes) al DPI indicado y la inserta como JPEG.
"""
import argparse
import sys
import fitz  # PyMuPDF


def compress(inp: str, outp: str, dpi: int, quality: int, gray: bool) -> None:
    src = fitz.open(inp)
    out = fitz.open()
    zoom = dpi / 72.0
    mat = fitz.Matrix(zoom, zoom)
    cs = fitz.csGRAY if gray else fitz.csRGB
    n = src.page_count
    for i in range(n):
        page = src[i]
        pix = page.get_pixmap(matrix=mat, colorspace=cs, alpha=False)
        img = pix.tobytes("jpeg", jpg_quality=quality)
        rect = page.rect
        newpage = out.new_page(width=rect.width, height=rect.height)
        newpage.insert_image(rect, stream=img)
        if (i + 1) % 100 == 0 or i + 1 == n:
            print(f"  pagina {i + 1}/{n}", flush=True)
    out.save(outp, garbage=4, deflate=True)
    out.close()
    src.close()


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("entrada")
    ap.add_argument("salida")
    ap.add_argument("--dpi", type=int, default=150)
    ap.add_argument("--quality", type=int, default=72)
    ap.add_argument("--gray", action="store_true")
    a = ap.parse_args()
    print(f"Comprimiendo {a.entrada} -> {a.salida} @ {a.dpi}dpi q{a.quality}"
          f"{' gris' if a.gray else ''}")
    compress(a.entrada, a.salida, a.dpi, a.quality, a.gray)
    import os
    mb = os.path.getsize(a.salida) / 1024 / 1024
    print(f"Listo: {mb:.1f} MB")
