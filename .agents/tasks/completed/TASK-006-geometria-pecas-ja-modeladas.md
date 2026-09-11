---
id: TASK-006
title: "Geometria: marcar escape e direção como peças clicáveis"
status: active
type: enhancement
owner: three-scene (subagent)
created_at: 2026-09-11
updated_at: 2026-09-11
affected_modules: [three-scene]
related_use_cases: []
related_adrs: [ADR-003]
---

# TASK-006 — Geometria: marcar escape e direção como peças clicáveis

## Contexto

Parte da trilha "geometria" de `ADR-003`, par de `TASK-003` (conteúdo). O tubo de escape/silencioso (`CarScene.tsx:147`) e o volante (`CarScene.tsx:287`, variável `steering`) já existem como geometria, mas foram construídos com `system`/`part` vazios (decorativos).

## Problema

Essas duas peças são visíveis no modelo 3D mas não respondem a clique nem participam da lógica de opacidade por sistema (`appearance()`), porque os helpers foram chamados sem `system`/`part`.

## Objetivo

Registrar `system: 'engine'`, `part: 'exhaust'` no tubo de escape e no silencioso; `system: 'suspension'`, `part: 'steering'` no volante — os mesmos ids que `TASK-003` usa em `parts.ts`.

## Fora de escopo

- Qualquer mudança de conteúdo/catálogo — é `TASK-003`.
- Adicionar um pino (`PINS`) para essas peças — opcional, avaliar depois de ver como fica sem pino dedicado (a peça já fica selecionável clicando diretamente na malha 3D, como várias outras peças que não têm pino próprio).

## Comportamento atual

```ts
// linha 147-149
tube([[-1.5, .5, -.3], [-1, .3, -.29], [-.4, .28, -.16], [.6, .28, -.23], [1.75, .3, -.32], [2.57, .33, -.46]], .047, '#a29885');
box([.74, .2, .4], [1.58, .29, -.35], '#b6b3a9', '', '', .1);
```
```ts
// linha 287
const steering = torus(.17, .018, [-.4, 1.18, .47], '#455e63', '', '', { rotation: [0, Math.PI / 2 - .5, 0] });
```
Os parâmetros `system`/`part` (4º/5º argumentos de `tube`/`torus`) estão vazios.

## Comportamento esperado

```ts
tube([...], .047, '#a29885', 'engine', 'exhaust');
box([.74, .2, .4], [1.58, .29, -.35], '#b6b3a9', 'engine', 'exhaust', .1);
```
```ts
const steering = torus(.17, .018, [-.4, 1.18, .47], '#455e63', 'suspension', 'steering', { rotation: [0, Math.PI / 2 - .5, 0] });
```
Nenhuma posição, cor ou geometria muda — só os dois argumentos de `system`/`part`. Ambos os meshes passam a estar em `pickables` (clicáveis) e `appearances` (respondem à opacidade por sistema).

## Regras de negócio

- RN-01: os ids usados devem ser exatamente `exhaust` e `steering`, os mesmos que `TASK-003` cadastra em `parts.ts` (fixados em `ADR-003`) — sem isso, clicar na peça abriria um painel vazio/inexistente.
- RN-02 (regra já existente do papel `three-scene`): toda peça pickável precisa de `userData.part`/`userData.system` preenchidos — esta task é exatamente isso.

## Critérios de aceitação

- [~] CA-01: clicar no tubo de escape ou no silencioso, no modelo 3D, abre o painel de detalhe da peça `exhaust`. Verificado por revisão de código (ambos os meshes agora têm `userData.part = 'exhaust'`/`userData.system = 'engine'` e estão em `pickables`, então o handler `up`/raycaster os encontra); não testado clicando no navegador nesta sessão (ver seção Validação).
- [~] CA-02: clicar no volante abre o painel de detalhe da peça `steering`. Mesma verificação por revisão de código (`torus(...)` agora recebe `'suspension'`, `'steering'`); não testado visualmente nesta sessão.
- [~] CA-03: as duas peças respondem corretamente ao filtro por sistema. Verificado por revisão de código: como ambas entram em `appearances` (via `solid()`, que só empurra para `appearances` quando o objeto não é `body`), a opacidade é recalculada em `appearance()` de acordo com `props.current.activeSystem` — não testado visualmente.
- [x] CA-04: nenhuma posição/cor/geometria mudou — só os parâmetros de sistema/peça (2 chamadas do bloco de escape, 1 do volante; diff confirma que só os argumentos 4/5 de cada helper mudaram).
- [x] CA-05: `npm run build` passa sem erros (rodado nesta sessão, saída limpa, mesmo warning pré-existente de chunk size).

## Impacto técnico

### Frontend
`src/components/CarScene.tsx` — 3 chamadas de helper alteradas (2 no bloco de escape, 1 no volante).

### Banco de dados / Backend / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [x] Etapa 1: adicionar `'engine'`/`'exhaust'` às duas chamadas do bloco de escape.
- [x] Etapa 2: adicionar `'suspension'`/`'steering'` à chamada do volante.
- [~] Etapa 3: verificar visualmente no navegador — não executado nesta sessão (servidor de dev não rodado deliberadamente, para não colidir com o outro subagente rodando em paralelo). Fica pendente para a sessão principal.

## Estratégia de testes

- [ ] Unitários/Integração/E2E — não aplicável.
- [~] Manual — clique direto nas duas peças; filtro por sistema (`engine`/`suspension`/`all`): não executado nesta sessão (sem navegador/servidor de dev, por instrução explícita). `npm run build`: executado, passou.

## Riscos e rollback

Risco mínimo — mudança de 2 argumentos em 3 chamadas já existentes, sem geometria nova. Rollback trivial: reverter os argumentos para string vazia.

## Registro de execução
### Alterações realizadas
Em `src/components/CarScene.tsx`: adicionados `system`/`part` a 3 chamadas de helper já existentes, sem alterar nenhuma coordenada, cor ou geometria:
- `tube([...], .047, '#a29885', 'engine', 'exhaust')` (tubo de escape).
- `box([.74, .2, .4], [1.58, .29, -.35], '#b6b3a9', 'engine', 'exhaust', .1)` (silencioso).
- `torus(.17, .018, [-.4, 1.18, .47], '#455e63', 'suspension', 'steering', { rotation: [0, Math.PI / 2 - .5, 0] })` (volante).

### Arquivos principais
- `src/components/CarScene.tsx`

### Decisões
- Nenhum pino (`PINS`) adicionado para `exhaust`/`steering` — conforme "Fora de escopo" da task, deixado como decisão a avaliar depois de ver como fica sem pino dedicado (ambas as peças já ficam selecionáveis clicando na malha).

### Divergências
Nenhuma — implementação seguiu exatamente o "Comportamento esperado" da task, sem colisão de geometria (não houve mudança de geometria, só os argumentos de sistema/peça).

### Pendências
- Verificação visual no navegador (clique nas duas peças, filtro por sistema) não foi feita nesta sessão — nenhum servidor de dev/preview foi iniciado deliberadamente, para não colidir com o outro subagente (trilha conteúdo) rodando em paralelo na mesma porta. Fica para a sessão principal, depois que as duas trilhas convergirem (ids `exhaust`/`steering` também precisam existir em `parts.ts`, via `TASK-003`, para o painel de detalhe abrir com conteúdo real).

## Validação
- `npx tsc -b --noEmit` — sem erros.
- `npm run build` — passou (typecheck + `vite build`), único aviso é o pré-existente de chunk size (`CarScene` > 500kB), não relacionado a esta mudança.
- Verificação visual: não realizada nesta sessão (ver Pendências acima) — só revisão de código.

## Handoff
Não há handoff separado — pendência de verificação visual está registrada acima e no relatório final ao usuário.
