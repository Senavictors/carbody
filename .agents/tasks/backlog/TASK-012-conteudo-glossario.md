---
id: TASK-012
title: "Conteúdo: glossário de termos técnicos"
status: backlog
type: feature
owner:
created_at: 2026-09-13
updated_at: 2026-09-13
affected_modules: [content-catalog]
related_use_cases: []
related_adrs: [ADR-006]
---

# TASK-012 — Conteúdo: glossário de termos técnicos

## Contexto

Parte 1/2 de `ADR-006`. Precede `TASK-013` (a página que renderiza este conteúdo).

## Objetivo

Criar um array novo em `src/data/parts.ts` (ou um arquivo próprio, ex. `src/data/glossary.ts` — decidir na implementação qual organização é mais limpa, já que hoje `parts.ts` já é um arquivo grande) com termos técnicos usados no catálogo e suas definições em português, no mesmo tom didático já estabelecido.

## Fora de escopo

- A página/UI que consome esse conteúdo — é `TASK-013`.
- Gerar os termos automaticamente a partir do texto das peças (decisão do `ADR-006`: conteúdo curado à parte).

## Comportamento esperado

- Uma lista de termos, cada um com: `id` (slug), `term` (o termo em si), `definition` (explicação curta, didática), e opcionalmente `relatedParts` (ids de `Part` onde o termo aparece, para eventual navegação cruzada).
- Cobrir pelo menos os termos usados nas 34 peças que um iniciante provavelmente não conhece: torque, combustão, rotação/RPM, hidráulico, viscosidade, oxidação, amortecimento, tração, embreagem (como conceito, não a peça), ignição, entre outros que aparecerem na releitura do catálogo.
- Mesma regra de fonte: se um termo precisar de uma afirmação técnica nova (além de uma definição de dicionário/didática simples), precisa de `sourceIds` real, igual às peças.

## Regras de negócio

- RN-01 (herdada da Constituição): conteúdo em português brasileiro, sem diagnóstico, termos explicados de forma didática.
- RN-02: nenhuma definição pode contradizer o que já está escrito no texto das peças que usam aquele termo — reler o campo `how`/`function` das peças relacionadas antes de escrever a definição do glossário.

## Critérios de aceitação

- [ ] CA-01: array de termos criado, cobrindo pelo menos 10-15 conceitos recorrentes no catálogo.
- [ ] CA-02: cada termo tem definição em pt-BR, tom didático, consistente com o texto das peças relacionadas.
- [ ] CA-03: `npm run build` passa sem erros (o tipo do array precisa estar bem formado para `TASK-013` consumir).
- [ ] CA-04: nenhuma peça existente foi alterada.

## Impacto técnico

### Frontend
`src/data/parts.ts` ou `src/data/glossary.ts` (novo arquivo — decidir na implementação).

### Banco de dados / Backend / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [ ] Etapa 1: reler as 34 peças e listar termos técnicos não explicados de forma autocontida.
- [ ] Etapa 2: decidir a organização do arquivo (dentro de `parts.ts` vs. `glossary.ts` próprio).
- [ ] Etapa 3: escrever as definições.
- [ ] Etapa 4: `npm run build`.

## Estratégia de testes

- [ ] Unitários/Integração/E2E — não aplicável.
- [x] Manual — releitura cruzada com o texto das peças.

## Riscos e rollback

Risco: um termo definido de forma vaga o suficiente para ficar tecnicamente incorreto — revisar contra o texto das peças relacionadas antes de fechar. Rollback: remover o array/arquivo novo, sem afetar `parts.ts` existente (se organizado em arquivo próprio) ou reverter a adição isolada (se dentro de `parts.ts`).

## Registro de execução
### Alterações realizadas
### Arquivos principais
### Decisões
### Divergências
### Pendências

## Validação
Comandos e resultados.

## Handoff
Link para o handoff ativo, quando aplicável.
