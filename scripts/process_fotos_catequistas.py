#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Processador de Fotos dos Catequistas
Identificação facial via OpenCV, recorte proporcional 3x4 (estilo passaporte pastoral),
compressão otimizada e codificação Base64 protegida por LGPD para o banco de dados.
"""

import os
import sys
import json
import base64
import datetime
import subprocess
import unicodedata
import numpy as np
import cv2
from PIL import Image, ImageOps
import openpyxl

DOWNLOADS_DIR = "/Users/thiagocarvalho/Downloads/Fotos Catequistas"
EXCEL_PATH = "/Users/thiagocarvalho/Downloads/Cadastro Catequese 21´-09-2026.xlsx"
OUTPUT_JSON = "/Users/thiagocarvalho/Public/Catequese/scripts/catequistas_com_fotos.json"
INDEX_HTML = "/Users/thiagocarvalho/Public/Catequese/index.html"

TARGET_WIDTH = 300
TARGET_HEIGHT = 400
JPEG_QUALITY = 82

def norm(text):
    if not text:
        return ""
    text = unicodedata.normalize("NFD", str(text))
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    return text.lower().strip()

def load_image(filepath):
    """Carrega imagem corrigindo orientação EXIF e tratando formatos HEIF/WebP."""
    # Se for HEIF mascarado ou webp corrompido, tenta converter via sips
    lower = filepath.lower()
    if lower.endswith(".pdf"):
        return None
        
    temp_converted = None
    try:
        pil_img = Image.open(filepath)
        pil_img = ImageOps.exif_transpose(pil_img)
        pil_img = pil_img.convert("RGB")
        return pil_img
    except Exception as e:
        # Tenta conversão via macOS sips
        try:
            temp_converted = f"/tmp/converted_{os.path.basename(filepath)}.jpg"
            subprocess.run(["sips", "-s", "format", "jpeg", filepath, "--out", temp_converted],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
            pil_img = Image.open(temp_converted)
            pil_img = ImageOps.exif_transpose(pil_img)
            pil_img = pil_img.convert("RGB")
            return pil_img
        except Exception as e2:
            print(f"  [ERRO LEITURA] Falha ao carregar {filepath}: {e2}")
            return None
        finally:
            if temp_converted and os.path.exists(temp_converted):
                try:
                    os.remove(temp_converted)
                except OSError:
                    pass

def detect_and_crop_3x4(pil_img):
    """
    Detecta face na imagem e realiza o corte na proporção 3x4 (retrato/passaporte).
    Retorna (processed_pil_img, face_detected_bool).
    Se não encontrar o rosto, retorna a imagem original redimensionada e False.
    """
    img_w, img_h = pil_img.size
    cv_img = np.array(pil_img)
    gray = cv2.cvtColor(cv_img, cv2.COLOR_RGB2GRAY)
    
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60))
    
    if len(faces) == 0:
        # Tenta parâmetros mais tolerantes
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.05, minNeighbors=3, minSize=(40, 40))
        
    if len(faces) == 0:
        # Tenta perfil
        profile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_profileface.xml")
        faces = profile_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(50, 50))

    if len(faces) == 0:
        # Sem rosto detectado: mantém a imagem como está, redimensionando proporcionalmente para max 600px
        scale = min(600.0 / img_w, 600.0 / img_h, 1.0)
        new_w = max(1, int(img_w * scale))
        new_h = max(1, int(img_h * scale))
        resized = pil_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        return resized, False

    # Escolhe a face mais proeminente (maior área w*h)
    best_face = max(faces, key=lambda f: f[2] * f[3])
    fx, fy, fw, fh = best_face
    
    # Enquadramento 3x4: altura da cabeça ocupa ~50% a 55% da foto 3x4
    target_h = int(fh / 0.52)
    target_w = int(target_h * 3.0 / 4.0)
    
    # Margem superior (cabelo/testa)
    top_margin = int(fh * 0.32)
    
    y1 = fy - top_margin
    y2 = y1 + target_h
    cx = fx + fw // 2
    x1 = cx - target_w // 2
    x2 = x1 + target_w
    
    # Ajusta transbordamentos verticais
    if y1 < 0:
        y2 += -y1
        y1 = 0
    if y2 > img_h:
        diff = y2 - img_h
        y1 = max(0, y1 - diff)
        y2 = img_h
        
    # Ajusta transbordamentos horizontais
    if x1 < 0:
        x2 += -x1
        x1 = 0
    if x2 > img_w:
        diff = x2 - img_w
        x1 = max(0, x1 - diff)
        x2 = img_w

    curr_w = x2 - x1
    curr_h = y2 - y1
    
    # Assegura a proporção exata de 3:4
    target_ratio = 3.0 / 4.0
    current_ratio = curr_w / float(curr_h)
    
    if current_ratio > target_ratio:
        # Muito largo -> diminui largura
        final_w = int(curr_h * target_ratio)
        offset = (curr_w - final_w) // 2
        x1 += offset
        x2 = x1 + final_w
    else:
        # Muito alto -> diminui altura
        final_h = int(curr_w / target_ratio)
        offset = (curr_h - final_h) // 2
        y1 += offset
        y2 = y1 + final_h
        
    # Clamping final
    x1 = max(0, min(x1, img_w - 1))
    y1 = max(0, min(y1, img_h - 1))
    x2 = max(x1 + 10, min(x2, img_w))
    y2 = max(y1 + 10, min(y2, img_h))
    
    cropped = pil_img.crop((x1, y1, x2, y2))
    resized = cropped.resize((TARGET_WIDTH, TARGET_HEIGHT), Image.Resampling.LANCZOS)
    return resized, True

def pil_to_base64_jpeg(pil_img):
    """Converte PIL Image para data URL base64 JPEG otimizada."""
    import io
    buffer = io.BytesIO()
    pil_img.save(buffer, format="JPEG", quality=JPEG_QUALITY, optimize=True)
    b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{b64_str}"

def match_files_to_sheet():
    """Mapeia os arquivos da pasta para as linhas da planilha."""
    wb = openpyxl.load_workbook(EXCEL_PATH)
    ws = wb.active
    
    files = [f for f in os.listdir(DOWNLOADS_DIR) if not f.startswith(".") and not f.lower().endswith(".pdf")]
    
    row_file_map = {}
    
    # 1. Mapeamento preciso por mtime/timestamp (diferença < 15 segundos)
    for f in files:
        fpath = os.path.join(DOWNLOADS_DIR, f)
        mtime = datetime.datetime.fromtimestamp(os.path.getmtime(fpath))
        best_row = None
        min_diff = 999999
        for r in range(2, ws.max_row + 1):
            ts = ws.cell(r, 1).value
            if isinstance(ts, datetime.datetime):
                diff1 = abs((ts - mtime).total_seconds())
                diff2 = abs((ts - (mtime + datetime.timedelta(hours=3))).total_seconds())
                diff = min(diff1, diff2)
                if diff < min_diff:
                    min_diff = diff
                    best_row = r
        if min_diff < 15 and best_row is not None:
            # Se a linha já tiver arquivo, prefere JPG/JPEG do que outro formato
            if best_row in row_file_map:
                existing = row_file_map[best_row]
                if "pdf" in existing.lower() or "webp" in existing.lower():
                    row_file_map[best_row] = f
            else:
                row_file_map[best_row] = f

    # 2. Mapeamento nominal como garantia adicional
    for f in files:
        base, _ = os.path.splitext(f)
        parts = base.split(" - ")
        name_part = parts[-1].strip() if len(parts) >= 2 else base.strip()
        clean = norm(name_part)
        for r in range(2, ws.max_row + 1):
            sheet_name = norm(ws.cell(r, 2).value)
            if clean and (clean in sheet_name or sheet_name in clean):
                if r not in row_file_map:
                    row_file_map[r] = f

    return row_file_map, ws

def main():
    print("Iniciando processamento das fotos dos catequistas...")
    row_file_map, ws = match_files_to_sheet()
    print(f"Total de linhas com fotos vinculadas: {len(row_file_map)}")
    
    processed_photos = {}
    stats = {"total": 0, "faces_detected": 0, "no_face": 0, "errors": 0}
    
    for row_idx, fname in sorted(row_file_map.items()):
        fpath = os.path.join(DOWNLOADS_DIR, fname)
        pil_img = load_image(fpath)
        if pil_img is None:
            stats["errors"] += 1
            continue
            
        cropped_img, face_detected = detect_and_crop_3x4(pil_img)
        b64_uri = pil_to_base64_jpeg(cropped_img)
        
        name = ws.cell(row_idx, 2).value
        processed_photos[row_idx] = {
            "filename": fname,
            "nome": name,
            "faceDetected": face_detected,
            "dataUri": b64_uri,
            "size": f"{cropped_img.size[0]}x{cropped_img.size[1]}"
        }
        stats["total"] += 1
        if face_detected:
            stats["faces_detected"] += 1
        else:
            stats["no_face"] += 1
            
        print(f"  [OK] Linha {row_idx:2d}: {name} (Rosto 3x4: {'SIM' if face_detected else 'NÃO (Fallback)'})")

    print("\nEstatísticas do Processamento:")
    print(f"  Total Processado: {stats['total']}")
    print(f"  Rostos Detectados (Corte 3x4): {stats['faces_detected']}")
    print(f"  Sem Rosto (Fallback 3x4 mantido): {stats['no_face']}")
    print(f"  Erros: {stats['errors']}")
    
    # Salva JSON intermediário
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(processed_photos, f, ensure_ascii=False, indent=2)
    print(f"\nSalvo cache intermediário em: {OUTPUT_JSON}")

if __name__ == "__main__":
    main()
