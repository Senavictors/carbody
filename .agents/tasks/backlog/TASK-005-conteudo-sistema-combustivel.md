---
id: TASK-005
title: "Conteúdo: novo sistema de combustível (7º sistema)"
status: backlog
type: feature
owner:
created_at: 2026-09-11
updated_at: 2026-09-11
affected_modules: [content-catalog, react-ui]
related_use_cases: []
related_adrs: [ADR-003]
---

# TASK-005 — Conteúdo: novo sistema de combustível (7º sistema)

## Contexto

Parte da trilha "conteúdo" de `ADR-003`. É a maior mudança de escopo das 6 tasks: introduz um 7º valor em `SystemId` (`src/data/parts.ts`), hoje `'all' | 'engine' | 'transmission' | 'brakes' | 'suspension' | 'electrical' | 'cooling'`. A geometria 3D correspondente é `TASK-008`.

## Problema

O catálogo nunca explica de onde vem o combustível até a combustão — pula direto para a vela/ignição. Um sistema de combustível (tanque, bomba, filtro, injetores) fecha essa lacuna conceitual.

## Objetivo

Adicionar `'fuel'` a `SystemId`, uma entrada correspondente em `systems` (nome de exibição: "Combustível"), e 4 peças novas: `fuel-tank`, `fuel-pump`, `fuel-filter`, `fuel-injector`.

## Fora de escopo

- Geometria 3D das 4 peças — é `TASK-008`.
- Qualquer coisa que implique um sistema de injeção eletrônica específico de uma marca — manter genérico (motor a combustão/flex, como já estabelecido na Constituição).

## Comportamento atual

`SystemId` tem 6 sistemas + `'all'`. `systemIcons` (`App.tsx`) é `Record<SystemId, LucideIcon>` — só mapeia esses 6.

## Comportamento esperado

- `SystemId` em `src/data/parts.ts` ganha `'fuel'`.
- `systems` ganha uma entrada `{ id: 'fuel', name: 'Combustível', description: '<curta, no mesmo tom das outras> }`.
- 4 novas entradas em `parts`, todas com `system: 'fuel'`: `fuel-tank`, `fuel-pump`, `fuel-filter`, `fuel-injector`.
- **`App.tsx`**: `systemIcons` precisa ganhar a chave `fuel: <Icon>` — o TypeScript vai recusar compilar (`Record<SystemId, LucideIcon>`) até isso ser feito, então esse passo não pode ser esquecido silenciosamente. Sugestão de ícone: `Fuel`, de `lucide-react` (confirmar que o ícone existe na versão instalada antes de usar). Nenhuma outra mudança em `App.tsx` é necessária — a navegação por sistema (`sidebar-systems`, `system-tabs`) já é gerada dinamicamente a partir do array `systems`.

## Regras de negócio

- RN-01 (herdada da Constituição): fonte real para cada uma das 4 peças.
- RN-02: os ids devem ser exatamente `fuel-tank`, `fuel-pump`, `fuel-filter`, `fuel-injector`, e o `SystemId` novo deve ser exatamente `'fuel'` (fixado em `ADR-003`) — a `TASK-008` depende desses nomes exatos.
- RN-03: esta é uma mudança de contrato de dado (`SystemId` é consumido por `App.tsx` e por `CarScene.tsx`) — o registro de execução desta task deve confirmar explicitamente que `npm run build` passou depois de adicionar `'fuel'` a `systemIcons`.

## Critérios de aceitação

- [ ] CA-01: `SystemId` inclui `'fuel'`; `systems` tem a entrada de exibição correspondente.
- [ ] CA-02: `App.tsx`/`systemIcons` foi atualizado com um ícone para `fuel` — `npm run build` confirma isso (o TypeScript recusaria compilar sem essa chave).
- [ ] CA-03: as 4 peças existem em `parts`, todas `system: 'fuel'`, com `sourceIds` reais.
- [ ] CA-04: toda fonte nova está em `CONTENT_SOURCES.md`.
- [ ] CA-05: verificação visual no navegador — o novo sistema "Combustível" aparece na barra lateral e nas abas de sistema, com o ícone escolhido, sem quebrar o layout existente.
- [ ] CA-06: nenhum sistema/peça existente foi alterado.

## Impacto técnico

### Frontend
`src/data/parts.ts` (tipo `SystemId`, `systems`, `parts`), `src/App.tsx` (`systemIcons`), `CONTENT_SOURCES.md`.

### Banco de dados / Backend / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [ ] Etapa 1: adicionar `'fuel'` a `SystemId` e a entrada em `systems`; rodar `npm run build` e confirmar que o erro esperado aparece em `systemIcons` (prova de que o tipo está funcionando como rede de segurança).
- [ ] Etapa 2: adicionar a chave `fuel` a `systemIcons` com um ícone real de `lucide-react`; build deve passar.
- [ ] Etapa 3: pesquisar fontes reais (Bosch, Denso, Delphi, ou clubes automotivos) e escrever as 4 peças.
- [ ] Etapa 4: verificação visual no navegador da navegação por sistema.

## Estratégia de testes

- [ ] Unitários/Integração/E2E — não aplicável.
- [x] Manual — build limpo (incluindo o erro esperado/resolvido do passo 1); verificação visual da navegação.

## Riscos e rollback

Risco principal: um ícone escolhido que não exista na versão instalada de `lucide-react` (`^0.577.0`) — checar a lista de ícones disponíveis antes de importar. Rollback: reverter `SystemId`/`systems`/`systemIcons` e remover as 4 peças — mudança concentrada em poucos arquivos, fácil de isolar.

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
