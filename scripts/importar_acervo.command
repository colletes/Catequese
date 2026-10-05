#!/usr/bin/env bash
# Redireciona para o launcher principal na raiz do projeto
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$DIR/../importar_acervo.command"
