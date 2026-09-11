# Snapshot — TASK-008

Gerado em: 2026-09-11
Task: `.agents/tasks/backlog/TASK-008-geometria-sistema-combustivel.md`

## ADR de referência

`.agents/decisions/ADR-003-expansao-do-catalogo-de-pecas.md` — par exato de `TASK-005` (conteúdo), na trilha geometria. Depende do valor `'fuel'` existir em `SystemId`/`userData.system` (introduzido por `TASK-005`), mas não há dependência de compilação — `userData.system` é só uma string.

## Assinaturas de código necessárias

- Helpers (`src/components/CarScene.tsx:114-119`): `box`, `cyl`, `torus`, `tube` — assinaturas iguais às de `TASK-007`/`TASK-006`.
- Chassi longitudinal (âncora para `fuel-tank`, traseira do carro): `for (const z of [-.64, .64]) { box([4.6, .14, .14], [0, .38, z], ...); ... }` — `CarScene.tsx:140-141`. Rodas traseiras em `x = 1.68` (loop de rodas, `:152`).
- Mangueiras de arrefecimento (padrão para a linha de combustível): `tube([[-2.13, .98, -.39], ...], .043, '#547c86', 'cooling', 'thermostat');` — `CarScene.tsx:257-259`.
- Loop de velas (padrão para 1-por-cilindro, se for usar para `fuel-injector`): `for (let i = 0; i < 4; i++) { const x = -1.84 + i * .232; ... }` — `CarScene.tsx:209-217`.

## Restrições ativas

- Ids fixos: `fuel-tank`, `fuel-pump`, `fuel-filter`, `fuel-injector`, todos com `system: 'fuel'` — precisa bater exatamente com o que `TASK-005` cadastra.
- Formas genéricas, sem implicar fabricante/sistema de injeção específico.
- Se `TASK-005` ainda não tiver rodado, as peças ficam clicáveis mas o sistema "Combustível" ainda não aparece na navegação — comportamento esperado, não bug.

## Próximo passo imediato

Modelar o `fuel-tank` primeiro, calibrando posição/tamanho na traseira do chassi (perto de `x=1.68`, longe do escape que já ocupa parte dessa região — conferir `CarScene.tsx:147-149` antes de posicionar, para não colidir com o tubo de escape existente).

---
Para retomar: abra uma sessão nova e peça para ler este arquivo antes de continuar a task `TASK-008`.
