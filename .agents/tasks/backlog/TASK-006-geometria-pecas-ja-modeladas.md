---
id: TASK-006
title: "Geometria: marcar escape e direção como peças clicáveis"
status: backlog
type: enhancement
owner:
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

- [ ] CA-01: clicar no tubo de escape ou no silencioso, no modelo 3D, abre o painel de detalhe da peça `exhaust`.
- [ ] CA-02: clicar no volante abre o painel de detalhe da peça `steering`.
- [ ] CA-03: as duas peças respondem corretamente ao filtro por sistema (ficam com opacidade reduzida quando outro sistema está selecionado).
- [ ] CA-04: nenhuma posição/cor/geometria mudou — só os parâmetros de sistema/peça.
- [ ] CA-05: `npm run build` passa sem erros.

## Impacto técnico

### Frontend
`src/components/CarScene.tsx` — 3 chamadas de helper alteradas (2 no bloco de escape, 1 no volante).

### Banco de dados / Backend / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [ ] Etapa 1: adicionar `'engine'`/`'exhaust'` às duas chamadas do bloco de escape.
- [ ] Etapa 2: adicionar `'suspension'`/`'steering'` à chamada do volante.
- [ ] Etapa 3: verificar visualmente no navegador (clique em cada peça, filtro por sistema).

## Estratégia de testes

- [ ] Unitários/Integração/E2E — não aplicável.
- [x] Manual — clique direto nas duas peças; filtro por sistema (`engine`/`suspension`/`all`); `npm run build`.

## Riscos e rollback

Risco mínimo — mudança de 2 argumentos em 3 chamadas já existentes, sem geometria nova. Rollback trivial: reverter os argumentos para string vazia.

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
