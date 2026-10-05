#!/usr/bin/env bash
# ==============================================================================
# PASTORAL DA CATEQUESE — SANTUÁRIO IMACULADO CORAÇÃO DE MARIA
# Launcher do Assistente Local de Ingestão do OneDrive (Base de Conhecimento)
# ==============================================================================

# Garante que o diretório de execução seja a raiz do projeto (onde o .command está)
cd "$(dirname "$0")"

clear
echo "======================================================================"
echo "⛪ SANTUÁRIO IMACULADO CORAÇÃO DE MARIA — CATEQUESE ICM"
echo "📚 Assistente Local de Ingestão do Acervo (OneDrive)"
echo "======================================================================"
echo ""
echo "📂 Pasta padrão do OneDrive:"
echo "   $HOME/Library/CloudStorage/OneDrive-Pessoal/Catequese 1"
echo ""
echo "🚀 Iniciando servidor local na porta 8080..."
echo "🌐 A interface web abrirá automaticamente no seu navegador."
echo "======================================================================"
echo ""

# Verifica se o Python 3 está instalado
if ! command -v python3 >/dev/null 2>&1; then
  echo "❌ ERRO: Python 3 não foi encontrado no seu sistema."
  echo "Por favor, instale o Python 3 para executar o assistente."
  read -p "Pressione Enter para fechar..."
  exit 1
fi

# Abre o navegador automaticamente no macOS após 1.5s
if command -v open >/dev/null 2>&1; then
  (sleep 1.5 && open "http://localhost:8080") &
fi

# Executa o servidor Python
python3 "scripts/knowledge_importer.py" 8080

# Se o servidor for interrompido
echo ""
echo "======================================================================"
echo "Servidor encerrado."
read -p "Pressione Enter para fechar esta janela..."
