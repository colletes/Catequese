---
description: Regras de deploy e proteção de dados no GitHub do projeto Catequese
trigger: always_on
---

# Regras de Deploy no GitHub — Projeto Catequese

## ⚠️ Proteção do Banco de Dados (Firestore)

Sempre que qualquer operação envolver **push, deploy ou sincronização com o GitHub** do projeto Catequese:

1. **Nunca sobrescreva nem remova dados existentes no Firestore sem antes perguntar ao usuário.**
2. Prefira sempre uma estratégia de **merge construtivo**: mescle os dados novos com os existentes, preservando registros já gravados.
3. Se houver conflito entre dados locais e remotos (GitHub/Firestore), **apresente o conflito ao usuário e aguarde a decisão dele** antes de prosseguir.
4. Isso se aplica a qualquer script de importação, migração, seed, ou atualização em massa de dados.
5. Em caso de dúvida, pergunte: nunca assuma que dados remotos podem ser descartados ou substituídos.

### Exemplos de ações que exigem confirmação explícita:
- Executar `firebase deploy` com regras ou dados que possam sobrescrever registros do Firestore
- Rodar scripts de seed/migração que usam `set()` ou `delete()` em vez de `update()` / `merge: true`
- Reescrever arquivos de dados (`catequistas-data.js` ou similares) que alimentam o banco
- Fazer push de novas versões de `firestore.rules` que restrinjam acesso a dados existentes
