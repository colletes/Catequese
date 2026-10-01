#!/usr/bin/env bash
# ==============================================================================
# PASTORAL DA CATEQUESE — SANTUÁRIO IMACULADO CORAÇÃO DE MARIA
# Launcher do Assistente Local de Ingestão do OneDrive (Incremento 6)
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$DIR")"

echo "======================================================================"
echo "⛪ Assistente Local de Ingestão do OneDrive (Catequese ICM)"
echo "======================================================================"
echo "📂 Pasta Base: $HOME/Library/CloudStorage/OneDrive-Pessoal/Catequese 1"
echo "🚀 Iniciando servidor em http://localhost:8080..."
echo "======================================================================"

# Abre o navegador automaticamente no macOS se disponível
if command -v open >/dev/null 2>&1; then
  (sleep 1 && open "http://localhost:8080") &
fi

python3 "$DIR/knowledge_importer.py" 8080
