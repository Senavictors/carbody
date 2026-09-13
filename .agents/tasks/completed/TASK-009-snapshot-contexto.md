# Snapshot — TASK-009

Gerado em: 2026-09-13
Task: `.agents/tasks/backlog/TASK-009-mecanismo-freios-arrefecimento.md`

## ADR de referência

`.agents/decisions/ADR-004-mais-mecanismos-no-mechanism-lab.md` — parte 1/2 (com `TASK-010`).

## Assinaturas de código necessárias

- `type Mode = 'engine' | 'gears';` — `src/components/MechanismLab.tsx:5`.
- `const strokes = [...]` — `:8-33`, array de 4 objetos (`name`, `verb`, `text`, `valve`, `direction`, `color`, `detail`) — o padrão de dados a copiar para o mecanismo de freios/arrefecimento.
- `const ratios = [...]` — `:35-39`, array de 3 objetos (`input`, `output`, `label`, `title`, `text`, `example`) — outro exemplo do mesmo padrão (dado + diagrama).
- `function EngineDiagram({ angle, stroke }: { angle: number; stroke: number })` — `:55` — componente de diagrama que lê um parâmetro de progresso (`angle`) e o estado atual (`stroke`).
- `function GearDiagram({ angle, input, output }: { angle: number; input: number; output: number })` — `:109`.
- `export default function MechanismLab({ initialMode = 'engine' }: MechanismLabProps)` — `:137` — contém o `useEffect` de animação com checagem de `prefers-reduced-motion` (`window.matchMedia('(prefers-reduced-motion: reduce)')`) e as abas de modo com navegação por teclado (`onKeyDown`, `ArrowLeft`/`ArrowRight`/`Home`/`End`).

## Restrições ativas

- Diagramas esquemáticos e genéricos (Constituição) — sem representar sistema de marca/modelo específico.
- Toda animação nova precisa respeitar `prefers-reduced-motion`, seguindo o padrão já existente no mesmo `useEffect`.
- Tom didático consistente com `strokes`/`ratios` (verbo curto + texto + analogia).
- Esta task NÃO toca `CarScene.tsx` — é só o diagrama 2D em `MechanismLab.tsx`.

## Próximo passo imediato

Ler `MechanismLab.tsx` inteiro (229 linhas) para internalizar o padrão completo antes de escrever qualquer código, depois modelar primeiro o array de dados do mecanismo de freios (pressão hidráulica), seguindo a estrutura de `strokes`, antes de partir para o componente de diagrama SVG.

---
Para retomar: abra uma sessão nova e peça para ler este arquivo antes de continuar a task `TASK-009`.
