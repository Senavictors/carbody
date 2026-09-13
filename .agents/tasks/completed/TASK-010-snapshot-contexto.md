# Snapshot — TASK-010

Gerado em: 2026-09-13
Task: `.agents/tasks/backlog/TASK-010-mecanismo-suspensao-eletrica.md`

## ADR de referência

`.agents/decisions/ADR-004-mais-mecanismos-no-mechanism-lab.md` — parte 2/2 (com `TASK-009`).

## Assinaturas de código necessárias

Mesmas de `TASK-009` (mesmo arquivo, mesmo padrão):
- `type Mode` — `src/components/MechanismLab.tsx:5`.
- `const strokes`/`const ratios` — `:8-39` — padrão de dado + diagrama a replicar.
- `EngineDiagram`/`GearDiagram` — `:55`, `:109`.
- `export default function MechanismLab` — `:137`, com o `useEffect` de animação e as abas de modo.

**Atenção**: se `TASK-009` já tiver rodado nesta árvore de trabalho, `Mode` já inclui `'brakes'`/`'cooling'` e as abas já foram estendidas para 4 valores — releia o arquivo real antes de editar, não assuma que ainda são só `'engine'`/`'gears'`. Se `TASK-009` ainda não rodou, esta task pode ser feita de qualquer forma (adicionar `'suspension'`/`'electrical'` direto aos 2 originais) — as duas tasks não têm dependência de build entre si, só compartilham o mesmo arquivo.

## Restrições ativas

Mesmas de `TASK-009`: diagramas esquemáticos/genéricos, `prefers-reduced-motion`, tom didático, não tocar `CarScene.tsx`.

## Próximo passo imediato

Reler o estado atual de `Mode` e das abas em `MechanismLab.tsx` (para saber se `TASK-009` já rodou ou não) antes de decidir se está adicionando 2 ou os últimos 2 dos 4 modos. Depois, modelar o array de dados do mecanismo de suspensão (mola comprimindo + amortecedor controlando o retorno) primeiro.

---
Para retomar: abra uma sessão nova e peça para ler este arquivo antes de continuar a task `TASK-010`.
