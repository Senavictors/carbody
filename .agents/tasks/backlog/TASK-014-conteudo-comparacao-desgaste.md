---
id: TASK-014
title: "Conteúdo: comparação desgaste vs. novo (5 peças iniciais)"
status: backlog
type: feature
owner:
created_at: 2026-09-13
updated_at: 2026-09-13
affected_modules: [content-catalog]
related_use_cases: []
related_adrs: [ADR-007]
---

# TASK-014 — Conteúdo: comparação desgaste vs. novo (5 peças iniciais)

## Contexto

Parte 1/2 de `ADR-007`. Precede `TASK-015` (a UI e as ilustrações SVG que consomem este conteúdo).

## Objetivo

Adicionar um campo novo, opcional, à interface `Part` (`src/data/parts.ts`) descrevendo a comparação visual/textual entre o estado normal e desgastado, preenchido para 5 peças iniciais: `tire`, `brake-pad`, `brake-disc`, `timing-belt`, `spring` — escolhidas por já terem `signs` de desgaste bem concretos e visuais no catálogo atual.

## Fora de escopo

- As ilustrações SVG da versão "desgastada" e o toggle/slider de UI — é `TASK-015`.
- Aplicar às demais 29 peças do catálogo — decisão explícita do `ADR-007` de começar por um subconjunto, expandir depois como trabalho de conteúdo incremental.

## Comportamento atual

`Part` (linhas 13-27) não tem nenhum campo relacionado a comparação visual. As 5 peças escolhidas já têm `signs` descrevendo desgaste em texto (ex.: `tire.signs` inclui "Desgaste irregular ou indicador atingido").

## Comportamento esperado

- Novo campo opcional em `Part`, formato a definir nesta task (ex.: `wear?: { normalLabel: string; wornLabel: string; description: string }` — `normalLabel`/`wornLabel` são os rótulos dos dois estados no toggle, `description` explica textualmente o que muda visualmente).
- Preenchido para as 5 peças, com texto que **não** reintroduz diagnóstico nem estatística — descreve o que aparece visualmente diferente (ex.: "sulcos mais rasos e um desgaste mais uniforme na banda de rodagem" para o pneu), consistente com as fontes já citadas em `sourceIds` daquela peça (ex.: Michelin para `tire`, Brembo para `brake-pad`/`brake-disc`).
- Nenhuma fonte nova necessária a princípio — reaproveitar o que as 5 peças já citam; se precisar de uma afirmação não coberta pela fonte existente, seguir a regra normal (fonte real ou não escrever a afirmação).

## Regras de negócio

- RN-01 (herdada da Constituição): a comparação continua sendo exemplo ilustrativo — nunca "isto prova que a peça está no fim da vida útil", sempre "isto é como normalmente aparece desgastado".
- RN-02: o campo é opcional na interface `Part` — as outras 29 peças continuam válidas sem ele (não é obrigatório retroativamente).

## Critérios de aceitação

- [ ] CA-01: `Part` tem o campo novo, opcional, com formato definido e documentado (comentário no tipo, se ajudar).
- [ ] CA-02: as 5 peças (`tire`, `brake-pad`, `brake-disc`, `timing-belt`, `spring`) têm o campo preenchido.
- [ ] CA-03: nenhuma afirmação nova sem lastro na fonte já citada pela peça.
- [ ] CA-04: `npm run build` passa sem erros.
- [ ] CA-05: as demais 29 peças continuam válidas (campo opcional, sem quebrar o tipo).

## Impacto técnico

### Frontend
`src/data/parts.ts` — novo campo na interface `Part` + preenchimento em 5 entradas.

### Banco de dados / Backend / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [ ] Etapa 1: definir o formato exato do campo (conversar com quem for implementar `TASK-015`, já que a UI consome esse formato).
- [ ] Etapa 2: reler as fontes já citadas pelas 5 peças, extrair o que elas dizem sobre aparência de desgaste.
- [ ] Etapa 3: escrever o campo para as 5 peças.
- [ ] Etapa 4: `npm run build`.

## Estratégia de testes

- [ ] Unitários/Integração/E2E — não aplicável.
- [x] Manual — releitura contra as fontes já citadas, checagem de tom (sem diagnóstico).

## Riscos e rollback

Risco: descrever o desgaste de forma específica demais pode parecer diagnóstico — revisar tom com cuidado, mesmo padrão já usado em `signs`. Rollback: remover o campo das 5 peças e do tipo `Part` (é aditivo e opcional, não quebra nada existente).

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
