---
id: ADR-003
title: Expandir o catálogo de peças em duas trilhas paralelas por papel (conteúdo x geometria 3D)
status: accepted
date: 2026-09-11
deciders: [Senavictors]
related_tasks: [TASK-003, TASK-004, TASK-005, TASK-006, TASK-007, TASK-008]
---

# ADR-003 — Expandir o catálogo de peças em duas trilhas paralelas por papel (conteúdo x geometria 3D)

## Contexto

O usuário perguntou quais outros componentes de carro seriam interessantes de cobrir. Levantamento contra o código real (`src/data/parts.ts`, `src/components/CarScene.tsx`) encontrou:

1. **Duas peças já modeladas em 3D, mas sem `system`/`part` e sem entrada no catálogo**: o conjunto de escape/catalisador (`CarScene.tsx`, bloco "Exhaust", linha ~147) e o volante de direção (`CarScene.tsx`, variável `steering`, linha ~287). Hoje são só decoração — não clicáveis, sem conteúdo educativo.
2. **Nove peças que completariam sistemas já existentes**: filtro de ar e correia auxiliar (Motor); freio de mão e pinça de freio (Freios); bobina de ignição e fusíveis/relés (Elétrica); rolamento de roda e barra estabilizadora (Suspensão); reservatório de expansão (Arrefecimento).
3. **Um sistema inteiro ainda não coberto**: sistema de combustível (tanque, bomba de combustível, filtro de combustível, bico injetor) — exigiria um 7º valor no tipo `SystemId` (`src/data/parts.ts`) e uma entrada nova em `systems`, além de um ícone novo em `App.tsx` (`systemIcons: Record<SystemId, LucideIcon>` — o TypeScript já força essa atualização por construção, já que o tipo é um `Record` sobre `SystemId`).

Nenhuma restrição da Constituição (`.agents/test-onboarding.md`) impede essa expansão — mas toda peça nova precisa de fonte real em `sources`, sem exceção, e o modelo deve continuar genérico (sem geometria que implique um veículo comercial específico).

## Decisão

Organizar o trabalho em **duas trilhas paralelas por papel**, não por prioridade/fase:

- **Trilha conteúdo** (`content-catalog`, arquivo `src/data/parts.ts` + `CONTENT_SOURCES.md`): `TASK-003`, `TASK-004`, `TASK-005`.
- **Trilha geometria 3D** (`three-scene`, arquivo `src/components/CarScene.tsx`): `TASK-006`, `TASK-007`, `TASK-008`.

Cada trilha tem 3 tasks, agrupadas pelo mesmo recorte (peças já modeladas / peças que completam sistemas existentes / sistema de combustível novo), para que o par de tasks equivalente entre as trilhas (`TASK-003`↔`TASK-006`, `TASK-004`↔`TASK-007`, `TASK-005`↔`TASK-008`) possa ser implementado em qualquer ordem — não há dependência de compilação entre eles, já que `userData.part` (`CarScene.tsx`) e `Part.id` (`parts.ts`) são apenas strings combinadas por convenção, não um tipo compartilhado.

## Alternativas consideradas

### Alternativa A — Faseado por valor incremental
Três fases sequenciais (peças já modeladas → peças que completam sistemas → sistema de combustível), cada fase cruzando os dois papéis antes de avançar para a próxima. Não escolhida: o usuário preferiu paralelismo real entre conteúdo e geometria em vez de convergência por fase.

### Alternativa B — Tudo de uma vez, sem estrutura
Gerar as ~15 tasks (uma por peça) de uma vez, sem agrupamento. Não escolhida: o usuário quis uma estrutura por papel, e uma task por peça isolada teria sido granularidade demais para itens triviais (ex.: reservatório de expansão sozinho).

## Consequências

### Positivas
- Aproveita a separação de papéis já estabelecida (`.claude/agents/content-catalog.md`, `.claude/agents/three-scene.md`) — cada trilha pode ser implementada por quem/o que for especialista naquele arquivo, sem esperar a outra trilha.
- Nenhuma dependência de build entre as trilhas — qualquer uma pode começar primeiro.

### Negativas
- Janela temporária em que uma peça existe no catálogo sem representação 3D (ou vice-versa) até as duas trilhas convergirem — aceito conscientemente pelo usuário como trade-off desta opção.

### Riscos
- Se as trilhas divergirem nos **ids** escolhidos para cada peça (ex.: conteúdo usa `parking-brake` e geometria usa `handbrake`), a peça fica órfã (catálogo sem 3D clicável, ou mesh sem conteúdo ao clicar). Mitigação: os ids exatos de cada peça nova estão fixados nesta ADR e replicados nas 6 tasks — nenhuma trilha deve inventar um id diferente do combinado aqui.
- O sistema de combustível (`TASK-005`/`TASK-008`) é a maior mudança de escopo (novo `SystemId`, nova entrada de navegação, ícone novo) — maior risco de quebrar o typecheck (`Record<SystemId, LucideIcon>` em `App.tsx` força a atualização, o que é uma rede de segurança, não um risco extra).

## Plano de adoção

Ids fixados para as 15 peças novas (uso obrigatório nas duas trilhas):

| Sistema | Peça | id |
|---|---|---|
| — (já modelada) | Sistema de escape | `exhaust` |
| — (já modelada) | Direção | `steering` |
| Motor | Filtro de ar | `air-filter` |
| Motor | Correia auxiliar | `accessory-belt` |
| Freios | Freio de mão | `parking-brake` |
| Freios | Pinça de freio | `brake-caliper` |
| Elétrica | Bobina de ignição | `ignition-coil` |
| Elétrica | Fusíveis e relés | `fuses` |
| Suspensão | Rolamento de roda | `wheel-bearing` |
| Suspensão | Barra estabilizadora | `sway-bar` |
| Arrefecimento | Reservatório de expansão | `coolant-reservoir` |
| Combustível (novo) | Tanque de combustível | `fuel-tank` |
| Combustível (novo) | Bomba de combustível | `fuel-pump` |
| Combustível (novo) | Filtro de combustível | `fuel-filter` |
| Combustível (novo) | Bico injetor | `fuel-injector` |

`SystemId` novo: `'fuel'`, nome de exibição "Combustível".

## Validação

Depois das 6 tasks concluídas: `npm run build` sem erros; todo id de `parts.ts` tem um mesh correspondente com `userData.part` igual em `CarScene.tsx` (e vice-versa, exceto peças deliberadamente decorativas de tasks anteriores); toda peça nova tem `sourceIds` apontando para fonte real cadastrada em `sources`.

## Revisão

Reavaliar se, ao implementar `TASK-005`/`TASK-008`, o sistema de combustível se mostrar mais complexo do que o previsto aqui (ex.: exigir mudanças de layout não triviais em `App.tsx`) — nesse caso, considerar quebrar em uma ADR própria.
