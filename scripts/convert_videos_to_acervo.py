#!/usr/bin/env python3
"""
PASTORAL DA CATEQUESE — SANTUÁRIO IMACULADO CORAÇÃO DE MARIA
Módulo: Conversor e Otimizador de Vídeos da Base de Conhecimento
Arquivo: scripts/convert_videos_to_acervo.py
"""

import os
import sys
import glob
import subprocess
import unicodedata
import re

SOURCE_DIR = "/Users/thiagocarvalho/Public/Crisma de Adultos/Mandamentos - 5º"
PROJECT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DEST_DIR = os.path.join(PROJECT_DIR, "acervo", "videos")

def to_safe_slug(text):
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii')
    text = re.sub(r'[^\w\s-]', '', text).strip().lower()
    return re.sub(r'[-\s]+', '-', text)

def main():
    os.makedirs(DEST_DIR, exist_ok=True)
    mov_files = glob.glob(os.path.join(SOURCE_DIR, "*.mov"))
    print(f"🎬 Encontrados {len(mov_files)} vídeos em {SOURCE_DIR}")

    for src_path in sorted(mov_files):
        fname = os.path.basename(src_path)
        base_name = re.sub(r'\.mov$', '', fname, flags=re.I)
        slug = to_safe_slug(base_name)
        out_mp4 = os.path.join(DEST_DIR, f"{slug}.mp4")
        
        # Se for o Fulldoc (836MB), precisamos comprimir para caber no limite estrito de 100MB do GitHub
        is_fulldoc = "fulldoc" in slug.lower()
        
        if is_fulldoc:
            print(f"\n🔄 Processando Fulldoc (otimização para limite web/GitHub < 90MB): {fname} -> {slug}.mp4")
            # 640x360 @ 110k video + 40k audio com +faststart resulta em ~88MB para 81 minutos
            cmd = [
                "/opt/homebrew/bin/ffmpeg", "-y",
                "-i", src_path,
                "-s", "640x360",
                "-c:v", "libx264",
                "-b:v", "110k",
                "-maxrate", "140k",
                "-bufsize", "280k",
                "-preset", "veryfast",
                "-c:a", "aac",
                "-b:a", "40k",
                "-movflags", "+faststart",
                out_mp4
            ]
        else:
            print(f"\n⚡ Remuxando vídeo com +faststart: {fname} -> {slug}.mp4")
            cmd = [
                "/opt/homebrew/bin/ffmpeg", "-y",
                "-i", src_path,
                "-c", "copy",
                "-movflags", "+faststart",
                out_mp4
            ]
        
        subprocess.run(cmd, check=True)
        sz_mb = os.path.getsize(out_mp4) / (1024 * 1024)
        print(f"✅ Gerado: {os.path.basename(out_mp4)} ({sz_mb:.1f} MB)")

    print("\n🎉 Todos os vídeos foram convertidos e otimizados com sucesso em acervo/videos/!")

if __name__ == "__main__":
    main()
