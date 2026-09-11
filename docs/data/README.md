---
estado: real
fonte: src/App.tsx (STORAGE_KEY, loadLearned, toggleLearned), src/data/parts.ts
ultima-revisao: bootstrap-init, 2026-09-11
---

# Dados

Carbody não tem banco de dados. Há dois tipos de "dado" reais no projeto:

## 1. Catálogo estático (código, não dado de runtime)

`src/data/parts.ts` — `systems`, `parts`, `sources`. É TypeScript versionado no repositório, não um schema de banco. Ver `docs/domain/README.md` para o modelo completo.

## 2. Progresso do usuário (`localStorage`)

- **Chave**: `por-dentro:learned:v1`.
- **Formato**: array JSON de strings — cada string é um `Part.id` marcado como aprendido pelo usuário.
- **Propriedade**: pertence inteiramente ao navegador do usuário; a aplicação nunca envia esse dado a lugar nenhum.
- **Validação na leitura**: `loadLearned()` (`App.tsx`) filtra o array carregado para manter só ids que existem em `parts` e remove duplicatas — protege contra dado corrompido ou de uma versão anterior do catálogo.
- **Falha graciosa**: se `localStorage` não estiver disponível (ex.: modo privado restritivo), a aplicação continua funcionando com o progresso mantido só em memória (`storageAvailable = false`), avisando o usuário via toast.

Mudar a chave ou o formato quebra o progresso já salvo de usuários existentes — mudança assim exige ADR em `.agents/decisions/` (ver `.claude/agents/react-ui.md`).

## Ownership

Não se aplica (não há múltiplos módulos de backend disputando propriedade de tabelas) — `App.tsx` é o único ponto de leitura/escrita de `localStorage` no projeto.
