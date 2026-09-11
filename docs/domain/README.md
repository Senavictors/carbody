---
estado: real
fonte: src/data/parts.ts
ultima-revisao: bootstrap-init, 2026-09-11
---

# Domínio

O domínio de Carbody é o catálogo educativo de peças automotivas, definido inteiramente em `src/data/parts.ts`.

## Linguagem/entidades principais

- **`SystemId`** — um dos 6 sistemas do carro (`engine`, `transmission`, `brakes`, `suspension`, `electrical`, `cooling`) mais o valor especial `'all'` usado como filtro de visão geral. Cada sistema tem `id`, `name` (nome em pt-BR) e `description`.
- **`Part`** — uma peça do catálogo (19 no total). Campos: `id`, `system` (um `SystemId` exceto `'all'`), `name`/`shortName`, `summary`, `function` (o que faz), `how` (como funciona), `analogy` (analogia didática), `signs` (sinais de desgaste — pistas, nunca diagnóstico), `care` (cuidado essencial), `attention` (categoria editorial: `'Desgaste natural' | 'Manutenção preventiva' | 'Atenção aos sinais'`), `difficulty` (`'Essencial' | 'Para ir além'`), `sourceIds` (referências).
- **Fonte (`sources`)** — uma referência real (fabricante ou clube automotivo) citada por uma ou mais peças via `sourceIds`: `id`, `title`, `url`, `organization`.

## Invariantes

- Toda `Part.sourceIds` deve apontar para ids que existem em `sources` (ver regra em `.claude/agents/content-catalog.md`).
- `attention` e `difficulty` são enums fechados — não têm um quarto/terceiro valor.
- Peças de pneu (`tire`) estão classificadas em `suspension` por conveniência de navegação — decisão editorial documentada em `CONTENT_SOURCES.md`, não um erro de categorização.

## Fluxos orientados a objetivo (use-cases)

Não há uma pasta `use-cases/` separada ainda — os fluxos reais (explorar por sistema, marcar peça como aprendida, buscar por sintoma) são simples o bastante para viverem descritos em `docs/architecture/components.md` e no próprio código de `App.tsx`. Criar `use-cases/*.md` individuais se a lógica de navegação crescer em complexidade.

Cada arquivo novo criado aqui segue a convenção de frontmatter de estado do [`../README.md`](../README.md) (`estado`/`fonte`/`ultima-revisao`).
