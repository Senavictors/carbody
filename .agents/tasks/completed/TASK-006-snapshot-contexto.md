# Snapshot — TASK-006

Gerado em: 2026-09-11
Task: `.agents/tasks/backlog/TASK-006-geometria-pecas-ja-modeladas.md`

## ADR de referência

`.agents/decisions/ADR-003-expansao-do-catalogo-de-pecas.md` — par exato de `TASK-003` (conteúdo), na trilha geometria.

## Assinaturas de código necessárias

- `const tube = function tube(points: Vec[], radius: number, color: string, system = '', part = '', options = {})` — `src/components/CarScene.tsx:117`.
- `const box = (size, position, color, system = '', part = '', radius = .045, options = {})` — `src/components/CarScene.tsx:114`.
- `const torus = (radius, tube, position, color, system = '', part = '', options = {})` — `src/components/CarScene.tsx:116`.
- Bloco do escape, hoje sem `system`/`part` (linhas 147-149):
  ```ts
  tube([[-1.5, .5, -.3], [-1, .3, -.29], [-.4, .28, -.16], [.6, .28, -.23], [1.75, .3, -.32], [2.57, .33, -.46]], .047, '#a29885');
  box([.74, .2, .4], [1.58, .29, -.35], '#b6b3a9', '', '', .1);
  ```
- Volante, hoje sem `system`/`part` (linha 287):
  ```ts
  const steering = torus(.17, .018, [-.4, 1.18, .47], '#455e63', '', '', { rotation: [0, Math.PI / 2 - .5, 0] });
  ```

## Restrições ativas

- Ids exatos: `'engine'`/`'exhaust'` para o bloco de escape; `'suspension'`/`'steering'` para o volante — precisam bater com os ids que `TASK-003` cadastra em `parts.ts` (mesma tabela do `ADR-003`).
- Não mudar nenhuma coordenada/cor/geometria — só os 2 argumentos de sistema/peça em cada chamada.

## Próximo passo imediato

Editar as 2 chamadas do bloco de escape (linhas 147-149) e a chamada do volante (linha 287) para incluir `system`/`part`, depois verificar no navegador que clicar em cada peça é registrado (`onSelectPart` dispara). Atenção: `App.tsx` resolve `selectedPart` com `parts.find(part=>part.id===selectedId) || parts[0]` — se `TASK-003` ainda não tiver rodado, clicar em `exhaust`/`steering` vai abrir o painel do `parts[0]` (hoje, `engine`) em vez de dar erro, porque o id ainda não existe no catálogo. Não é bug desta task; só confirma visualmente que o painel muda para a peça certa depois que `TASK-003` também rodar.

---
Para retomar: abra uma sessão nova e peça para ler este arquivo antes de continuar a task `TASK-006`.
