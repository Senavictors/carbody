---
id: TASK-004
title: "Conteúdo: 9 peças que completam sistemas existentes"
status: completed
type: feature
owner: content-catalog (subagent)
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

- [x] CA-01: as 9 entradas existem em `parts`, cada uma no sistema correto da tabela.
- [x] CA-02: cada uma tem `sourceIds` real.
- [x] CA-03: toda fonte nova está na tabela de `CONTENT_SOURCES.md`.
- [x] CA-04: `npm run build` passa sem erros.
- [x] CA-05: nenhuma peça existente foi alterada (incluindo `spark-plug`, cujo texto sobre a bobina não deve virar duplicata nem contradição do novo `ignition-coil`).

## Impacto técnico

### Frontend
`src/data/parts.ts`, `CONTENT_SOURCES.md`.

### Banco de dados / Backend / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [x] Etapa 1: revisar as fontes já cadastradas em `sources` por sobreposição (ex.: Bosch/HELLA para elétrica, Brembo para pinça de freio, Gates/MANN para motor).
- [x] Etapa 2: escrever as 9 entradas, uma de cada vez, checando `spark-plug` antes de escrever `ignition-coil` para não duplicar.
- [x] Etapa 3: adicionar fontes novas a `sources`/`CONTENT_SOURCES.md`.
- [x] Etapa 4: `npm run build`.

## Estratégia de testes

- [ ] Unitários/Integração/E2E — não aplicável.
- [x] Manual — build limpo; releitura cruzada de `spark-plug` + `ignition-coil` para checar consistência.

## Riscos e rollback

Risco: 9 peças de uma vez aumenta a chance de uma fonte fraca passar despercebida — mitigar revisando cada `sourceIds` individualmente antes de fechar a task, não em lote no fim. Rollback: remover as entradas problemáticas isoladamente (peças independentes entre si).

## Registro de execução
### Alterações realizadas
Adicionadas as 9 entradas em `parts`, cada uma no sistema correto: `air-filter`/`accessory-belt` (`engine`), `parking-brake`/`brake-caliper` (`brakes`), `ignition-coil`/`fuses` (`electrical`), `wheel-bearing`/`sway-bar` (`suspension`), `coolant-reservoir` (`cooling`). Adicionadas 8 fontes novas em `sources` (nenhuma sobreposição direta de organização com id diferente foi usada — `sway-bar` reaproveita a fonte `zf-chassis-parts` já criada na TASK-003).

### Arquivos principais
- `src/data/parts.ts` (9 entradas em `parts`, 8 entradas em `sources`)
- `CONTENT_SOURCES.md` (8 linhas novas na tabela de fontes + nota sobre os 403/PDF)

### Decisões
- `ignition-coil`: reli `spark-plug` antes de escrever. O texto de `ignition-coil` foca no funcionamento interno da bobina (transformador, alta tensão) e explicita que os sintomas de bobina e vela se parecem, exigindo avaliação para diferenciar — sem repetir a frase "a bobina entrega alta tensão à vela" já usada em `spark-plug.how`.
- `fuses`: segui a orientação da task de manter `attention: 'Atenção aos sinais'` e `difficulty: 'Essencial'`, e evitei qualquer passo a passo de troca — o campo `care` menciona consultar o manual, mas não descreve como remover/inserir um fusível.
- `parking-brake`: mantive o texto no nível conceitual (mecanismo mecânico ou elétrico, sem detalhar cabo vs. atuador elétrico como implementação única), conforme alertado na task.
- Reaproveitei a fonte `zf-chassis-parts` (já criada na TASK-003) para `sway-bar`, em vez de criar uma fonte nova — a mesma página da ZF Aftermarket cobre peças de chassi/estabilizador de forma genérica.
- 3 das 8 fontes novas (`aa-parking-brake`, `rac-fuses`, `gates-accessory-belt`) responderam HTTP 403 na abertura direta (WebFetch), mas seu conteúdo foi confirmado via busca indexada (mesmo critério já documentado em `CONTENT_SOURCES.md` para `aa-starting`). `timken-wheel-bearing` resolve para um PDF técnico da Timken (confirmado via download binário bem-sucedido), padrão já existente com `hella-alternator`.

### Divergências
Nenhuma peça exigiu desvio do plano original da task além do já registrado em "Decisões".

### Pendências
Nenhuma pendência de conteúdo. A geometria correspondente é `TASK-007` (trilha paralela, `three-scene`), fora do escopo desta task.

## Validação
- `npx tsc -b --noEmit`: sem erros.
- `npm run build`: build de produção concluído sem erros (aviso pré-existente de chunk grande do Three.js, não relacionado a esta mudança).
- Releitura cruzada de `spark-plug` e `ignition-coil`: textos complementares, sem duplicação de frase nem contradição.
- Não foi feita verificação visual no navegador (fora do escopo desta task de conteúdo puro, e para não colidir com o outro subagente rodando `npm run dev`/preview em paralelo).

## Handoff
Não aplicável — task concluída nesta sessão.
