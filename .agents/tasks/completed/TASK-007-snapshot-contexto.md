# Snapshot — TASK-007

Gerado em: 2026-09-11
Task: `.agents/tasks/backlog/TASK-007-geometria-pecas-sistemas-existentes.md`

## ADR de referência

`.agents/decisions/ADR-003-expansao-do-catalogo-de-pecas.md` — par exato de `TASK-004` (conteúdo), na trilha geometria.

## Assinaturas de código necessárias

- Helpers (`src/components/CarScene.tsx:114-119`): `box(size, position, color, system='', part='', radius=.045, options={})`, `cyl(radius, length, position, color, system='', part='', axis='y', options={})`, `torus(radius, tube, position, color, system='', part='', options={})`, `tube(points, radius, color, system='', part='', options={})`.
- Âncoras de posição reais já no código (linhas conferidas em 2026-09-11 — usar como referência, não copiar exato; calibrar visualmente. Reconferir a linha antes de editar, pois tasks anteriores já deslocaram algumas):
  - Bloco do motor: `box([.94, .43, .69], [-1.49, .71, 0], ...)` em `:206` — para `air-filter`.
  - Alternador: `cyl(.113, .22, [-1.99, .64, .4], ...)` em `:266` — para `accessory-belt` (laço entre polia do motor e o alternador).
  - Console central: `box([.56, .23, .17], [.1, .6, 0], ...)` em `:286` — para `parking-brake`.
  - `const discZ = z - side * .145;` em `:180`, com `brake-disc`/`brake-pad` nas linhas `:181-187` — para `brake-caliper`.
  - Velas: `cyl(.028, .085, [x, 1.207, .105], ...)` dentro do loop `for (let i = 0; i < 4; i++)` (início em `:209`) em `:212` — para `ignition-coil`.
  - Bateria: `box([.47, .28, .31], [-1.26, .9, -.68], ...)` em `:262` — para `fuses`.
  - Hub da roda: `cyl(.033, .06, [x, .49, outer + side * .03], ...)` em `:174` — para `wheel-bearing`.
  - Bandeja de suspensão (manga de eixo/wishbone): `tube([[x - .27, .39, side * .41], ...], ...)` em `:189` — para `sway-bar` (barra atravessando entre os dois lados).
  - Topo do radiador: `box([.17, .06, 1.12], [-2.17, y, 0], ...)` (`y` em `[.47, 1.055]`) em `:241` — para `coolant-reservoir`.

## Restrições ativas

- 9 ids fixos (ver tabela completa na task ou em `ADR-003`): `air-filter`, `accessory-belt`, `parking-brake`, `brake-caliper`, `ignition-coil`, `fuses`, `wheel-bearing`, `sway-bar`, `coolant-reservoir` — precisam bater com os ids que `TASK-004` cadastra em `parts.ts`.
- Nenhuma peça existente muda de posição/escala/cor.
- Nenhuma geometria pode parecer logotipo/marca (Constituição).
- Cleanup automático: todo mesh criado via `solid()` (por baixo dos 4 helpers) já entra no `scene.traverse()` do cleanup do `useEffect` principal — não precisa de descarte manual adicional, só usar os helpers normalmente.

## Próximo passo imediato

Modelar `air-filter` primeiro (Etapa 1 da task) perto do bloco do motor, calibrando visualmente o tamanho/posição antes de seguir para as próximas 8 peças — não modelar as 9 de uma vez sem checar a primeira no navegador.

---
Para retomar: abra uma sessão nova e peça para ler este arquivo antes de continuar a task `TASK-007`.
