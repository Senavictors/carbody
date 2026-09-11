---
id: TASK-004
title: "Conteúdo: 9 peças que completam sistemas existentes"
status: backlog
type: feature
owner:
created_at: 2026-09-11
updated_at: 2026-09-11
affected_modules: [content-catalog]
related_use_cases: []
related_adrs: [ADR-003]
---

# TASK-004 — Conteúdo: 9 peças que completam sistemas existentes

## Contexto

Parte da trilha "conteúdo" de `ADR-003`. Nove peças comuns não estão cobertas em nenhum dos 6 sistemas já existentes (`engine`, `transmission`, `brakes`, `suspension`, `electrical`, `cooling`). A geometria 3D correspondente é `TASK-007`.

## Problema

O catálogo atual (19 peças) deixa de fora peças recorrentes que um iniciante frequentemente encontra ou ouve falar: filtro de ar, correia auxiliar, freio de mão, pinça de freio, bobina de ignição, fusíveis/relés, rolamento de roda, barra estabilizadora, reservatório de expansão.

## Objetivo

Adicionar 9 entradas em `parts`, uma por peça, com os ids fixados em `ADR-003` (tabela abaixo), cada uma no sistema correto e com fonte real.

| Sistema | Peça | id |
|---|---|---|
| `engine` | Filtro de ar | `air-filter` |
| `engine` | Correia auxiliar | `accessory-belt` |
| `brakes` | Freio de mão | `parking-brake` |
| `brakes` | Pinça de freio | `brake-caliper` |
| `electrical` | Bobina de ignição | `ignition-coil` |
| `electrical` | Fusíveis e relés | `fuses` |
| `suspension` | Rolamento de roda | `wheel-bearing` |
| `suspension` | Barra estabilizadora | `sway-bar` |
| `cooling` | Reservatório de expansão | `coolant-reservoir` |

## Fora de escopo

- Qualquer mudança em `CarScene.tsx` — é `TASK-007`.
- O sistema de combustível (novo `SystemId`) — é `TASK-005`.

## Comportamento atual

Nenhuma das 9 peças existe em `parts`.

## Comportamento esperado

9 novas entradas em `parts`, cada uma completa conforme a `interface Part`. Pontos de atenção editorial por peça:
- **`ignition-coil`**: hoje `spark-plug` já menciona "a bobina" na explicação de `how` — a nova entrada deve aprofundar sem duplicar o texto da vela; considerar referenciar a relação entre as duas.
- **`fuses`**: bom candidato a `difficulty: 'Essencial'` e `attention: 'Atenção aos sinais'` — é um dos problemas mais comuns e mais fáceis de autodiagnosticar/resolver com segurança (trocar um fusível), mas o texto não pode virar tutorial de reparo, só explicação + cuidado.
- **`parking-brake`**: cuidado para não descrever mecanismo específico demais (a mecânica varia bastante entre modelos — cabo, elétrico, etc.); manter no nível conceitual já usado no resto do catálogo.

## Regras de negócio

- RN-01 (herdada da Constituição): toda peça precisa de `sourceIds` real. Fabricantes já usados no projeto (Bosch, Brembo, Monroe, Gates, MANN-FILTER, HELLA, etc.) provavelmente cobrem várias dessas peças — verificar antes de procurar fabricantes novos.
- RN-02: os 9 ids devem ser exatamente os da tabela acima.
- RN-03: `attention`/`difficulty` continuam restritos aos enums já existentes na interface `Part` — não inventar uma categoria nova.

## Critérios de aceitação

- [ ] CA-01: as 9 entradas existem em `parts`, cada uma no sistema correto da tabela.
- [ ] CA-02: cada uma tem `sourceIds` real.
- [ ] CA-03: toda fonte nova está na tabela de `CONTENT_SOURCES.md`.
- [ ] CA-04: `npm run build` passa sem erros.
- [ ] CA-05: nenhuma peça existente foi alterada (incluindo `spark-plug`, cujo texto sobre a bobina não deve virar duplicata nem contradição do novo `ignition-coil`).

## Impacto técnico

### Frontend
`src/data/parts.ts`, `CONTENT_SOURCES.md`.

### Banco de dados / Backend / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [ ] Etapa 1: revisar as fontes já cadastradas em `sources` por sobreposição (ex.: Bosch/HELLA para elétrica, Brembo para pinça de freio, Gates/MANN para motor).
- [ ] Etapa 2: escrever as 9 entradas, uma de cada vez, checando `spark-plug` antes de escrever `ignition-coil` para não duplicar.
- [ ] Etapa 3: adicionar fontes novas a `sources`/`CONTENT_SOURCES.md`.
- [ ] Etapa 4: `npm run build`.

## Estratégia de testes

- [ ] Unitários/Integração/E2E — não aplicável.
- [x] Manual — build limpo; releitura cruzada de `spark-plug` + `ignition-coil` para checar consistência.

## Riscos e rollback

Risco: 9 peças de uma vez aumenta a chance de uma fonte fraca passar despercebida — mitigar revisando cada `sourceIds` individualmente antes de fechar a task, não em lote no fim. Rollback: remover as entradas problemáticas isoladamente (peças independentes entre si).

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
