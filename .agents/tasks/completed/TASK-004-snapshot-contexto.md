# Snapshot — TASK-004

Gerado em: 2026-09-11
Task: `.agents/tasks/backlog/TASK-004-conteudo-pecas-sistemas-existentes.md`

## ADR de referência

`.agents/decisions/ADR-003-expansao-do-catalogo-de-pecas.md`.

## Assinaturas de código necessárias

- `export interface Part { id, system, name, shortName, summary, function, how, analogy, signs, care, attention, difficulty, sourceIds }` — `src/data/parts.ts:13-27`.
- `export const parts: Part[]` / `export const sources: {...}[]` — mesmo arquivo.
- Entrada existente `spark-plug` (em `parts`) — o campo `how` já menciona "a bobina" ao explicar a faísca; ler antes de escrever `ignition-coil` para não duplicar/contradizer.

## Restrições ativas

- Toda peça precisa de `sourceIds` real. Fabricantes já cadastrados em `sources` (Bosch/HELLA/Brembo/Monroe/Gates/MANN-FILTER — conferir a lista completa em `src/data/parts.ts`) provavelmente cobrem várias das 9 peças — checar antes de procurar fabricante novo.
- 9 ids fixos (tabela completa na task): `air-filter`, `accessory-belt` (`engine`); `parking-brake`, `brake-caliper` (`brakes`); `ignition-coil`, `fuses` (`electrical`); `wheel-bearing`, `sway-bar` (`suspension`); `coolant-reservoir` (`cooling`). A `TASK-007` (par desta, trilha geometria) usa os mesmos ids.
- `attention`/`difficulty` são enums fechados — não inventar valor novo.

## Próximo passo imediato

Revisar a lista de `sources` já existente em `src/data/parts.ts` procurando sobreposição com as 9 peças (ex.: Bosch/HELLA para elétrica, Brembo para pinça de freio, Gates/MANN-FILTER para motor) antes de pesquisar fontes novas — evita duplicar organização já citada com um id de fonte diferente.

---
Para retomar: abra uma sessão nova e peça para ler este arquivo antes de continuar a task `TASK-004`.
