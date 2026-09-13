---
id: ADR-006
title: Adicionar um glossário de termos técnicos como página própria
status: accepted
date: 2026-09-13
deciders: [Senavictors]
related_tasks: [TASK-012, TASK-013]
---

# ADR-006 — Adicionar um glossário de termos técnicos como página própria

## Contexto

O princípio "explicar termos na primeira ocorrência" (`PRODUCT.md`) já é seguido dentro do texto de cada peça, mas não existe um lugar central para buscar um termo (ex.: "o que é torque") sem já saber qual peça abrir. `App.tsx` tem hoje 4 páginas (`Page = 'explore' | 'mechanisms' | 'parts' | 'progress'`), nenhuma delas um glossário.

Nenhuma restrição da Constituição é tocada — o conteúdo do glossário segue as mesmas regras do catálogo (pt-BR, sem diagnóstico, termos explicados de forma didática).

## Decisão

Adicionar `'glossary'` a `Page` e uma página nova, com uma lista de termos mantida como um array próprio e curado em `content-catalog` (não gerado automaticamente a partir do texto das peças). Sem integração com a busca `Ctrl K` existente nesta rodada — é uma página separada, acessível pela navegação principal.

## Alternativas consideradas

### Alternativa B — Termos inline, sem página dedicada
Destacar o termo dentro do próprio texto da peça (tooltip/`<abbr>`) só na primeira ocorrência, sem lugar central de busca. Não escolhida: não resolve a motivação original ("quero buscar um termo sem lembrar qual peça"), só reforça o que já existe.

### Alternativa C — Glossário integrado à busca `Ctrl K` existente
Termos apareceriam misturados com peças no mesmo resultado de busca. Não escolhida: misturar dois tipos de resultado (peça vs. termo) na mesma lista exigiria uma UI de diferenciação que não foi considerada necessária agora — mais simples ter uma página própria primeiro.

## Consequências

### Positivas
- Resolve a busca centralizada de termo sem tocar o mecanismo de busca já existente (menor risco de regressão na busca de peças).
- Conteúdo do glossário é uma responsabilidade clara de `content-catalog`, isolada de `react-ui` (que só constrói a página).

### Negativas
- Duas fontes de verdade para "o que é X": o texto da peça (explica no contexto) e o glossário (define de forma isolada) — precisam ficar coerentes entre si, sem contradição.
- Sem integração de busca, o usuário precisa saber que a página de glossário existe (descoberta depende só da navegação principal).

### Riscos
- Nenhum termo deve virar afirmação técnica nova sem fonte — se um termo precisar de uma explicação que vá além do que já está sourced no catálogo, aplicar a mesma regra de `sourceIds` real.

## Plano de adoção

- `TASK-012` (`content-catalog`) — curar a lista de termos e suas definições.
- `TASK-013` (`react-ui`) — construir a página `Page: 'glossary'` e a navegação para ela.

## Validação

`npm run build` sem erros; verificação visual da página nova e da entrada na navegação; termos cobrem pelo menos os conceitos citados nas 34 peças do catálogo (torque, combustão, rolamento, etc.).

## Revisão

Reavaliar a integração com `Ctrl K` (Alternativa C) se o glossário passar despercebido pelos usuários por não estar na busca.
