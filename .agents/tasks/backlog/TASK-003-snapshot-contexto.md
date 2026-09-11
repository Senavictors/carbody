# Snapshot — TASK-003

Gerado em: 2026-09-11
Task: `.agents/tasks/backlog/TASK-003-conteudo-pecas-ja-modeladas.md`

## ADR de referência

`.agents/decisions/ADR-003-expansao-do-catalogo-de-pecas.md` — expandir o catálogo em duas trilhas paralelas por papel. Esta task é a primeira da trilha "conteúdo".

## Assinaturas de código necessárias

- `export type SystemId = 'all' | 'engine' | 'transmission' | 'brakes' | 'suspension' | 'electrical' | 'cooling';` — `src/data/parts.ts:1`. `steering` vai em `'suspension'`, `exhaust` vai em `'engine'` — ambos os valores já existem, nenhuma mudança de tipo nesta task.
- `export interface Part { id: string; system: Exclude<SystemId, 'all'>; name: string; shortName: string; summary: string; function: string; how: string; analogy: string; signs: string[]; care: string; attention: 'Desgaste natural' | 'Manutenção preventiva' | 'Atenção aos sinais'; difficulty: 'Essencial' | 'Para ir além'; sourceIds: string[]; }` — `src/data/parts.ts:13-27`. Toda entrada nova precisa preencher todos esses campos.
- `export const parts: Part[] = [...]` e `export const sources: { id: string; title: string; url: string; organization: string }[] = [...]` — mesmo arquivo, logo depois da interface. `sources` é a lista de fontes reais citáveis via `sourceIds`.
- Exemplo real de peça completa para copiar o padrão de tom/estrutura: entrada `engine` (primeira de `parts`).

## Restrições ativas

- Toda peça precisa de `sourceIds` real (fabricante ou clube automotivo) — nunca inventar uma URL. Se não achar fonte específica de "sistema de escape genérico" ou "sistemas de direção genérico", uma fonte de clube automotivo (comportamento geral) serve, mas registre a limitação no "Registro de execução" da task.
- Conteúdo em português brasileiro; sinais (`signs`) são pistas, nunca diagnóstico.
- Os ids das duas peças são fixos: `exhaust` e `steering` (tabela do `ADR-003`) — a `TASK-006` (par desta, na trilha geometria) usa os mesmos ids em `userData.part`. Não inventar id diferente.

## Próximo passo imediato

Pesquisar e confirmar 1-2 fontes reais para "sistema de escape/catalisador" e para "sistema de direção" (fabricantes como Bosal/Walker/ZF/TRW, ou clube automotivo já usado no projeto como The AA) antes de escrever qualquer texto — sem fonte confirmada, não escrever a entrada ainda.

---
Para retomar: abra uma sessão nova e peça para ler este arquivo antes de continuar a task `TASK-003`.
