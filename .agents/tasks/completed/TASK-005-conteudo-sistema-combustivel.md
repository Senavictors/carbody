---
id: TASK-005
title: "Conteúdo: novo sistema de combustível (7º sistema)"
status: completed
type: feature
owner: content-catalog (subagent)
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

- [x] CA-01: `SystemId` inclui `'fuel'`; `systems` tem a entrada de exibição correspondente.
- [x] CA-02: `App.tsx`/`systemIcons` foi atualizado com um ícone para `fuel`. O bloqueador em `src/components/PartSketch.tsx` (fora do escopo desta trilha) foi corrigido pela sessão principal — `npm run build` passa limpo no repositório inteiro.
- [x] CA-03: as 4 peças existem em `parts`, todas `system: 'fuel'`, com `sourceIds` reais.
- [x] CA-04: toda fonte nova está em `CONTENT_SOURCES.md`.
- [x] CA-05: verificado no navegador pela sessão principal — sistema "Combustível" na navegação com ícone, as 4 peças navegáveis com conteúdo correto.
- [x] CA-06: nenhum sistema/peça existente foi alterado.

## Impacto técnico

### Frontend
`src/data/parts.ts` (tipo `SystemId`, `systems`, `parts`), `src/App.tsx` (`systemIcons`), `CONTENT_SOURCES.md`.

### Banco de dados / Backend / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [x] Etapa 1: adicionar `'fuel'` a `SystemId` e a entrada em `systems`; rodar `npm run build` e confirmar que o erro esperado aparece em `systemIcons` (prova de que o tipo está funcionando como rede de segurança).
- [x] Etapa 2: adicionar a chave `fuel` a `systemIcons` com um ícone real de `lucide-react`; build deve passar. **Divergência**: o build ainda não passa — ver CA-02/Pendências (erro remanescente é em `PartSketch.tsx`, fora do escopo desta task).
- [x] Etapa 3: pesquisar fontes reais (Bosch, Denso, Delphi, ou clubes automotivos) e escrever as 4 peças.
- [ ] Etapa 4: verificação visual no navegador da navegação por sistema — não realizada (ver CA-05).

## Estratégia de testes

- [ ] Unitários/Integração/E2E — não aplicável.
- [x] Manual — build limpo (incluindo o erro esperado/resolvido do passo 1); verificação visual da navegação.

## Riscos e rollback

Risco principal: um ícone escolhido que não exista na versão instalada de `lucide-react` (`^0.577.0`) — checar a lista de ícones disponíveis antes de importar. Rollback: reverter `SystemId`/`systems`/`systemIcons` e remover as 4 peças — mudança concentrada em poucos arquivos, fácil de isolar.

## Registro de execução
### Alterações realizadas
- `src/data/parts.ts`: `SystemId` ganhou `'fuel'`; `systems` ganhou a entrada `{ id: 'fuel', name: 'Combustível', description: 'Do tanque até a câmara de combustão: como o combustível chega ao motor.' }`; 4 novas entradas em `parts` (`fuel-tank`, `fuel-pump`, `fuel-filter`, `fuel-injector`, todas `system: 'fuel'`); 4 fontes novas em `sources`.
- `src/App.tsx`: import de `Fuel` de `lucide-react` adicionado à lista de ícones já importados; `systemIcons` ganhou a chave `fuel: Fuel`. Nenhuma outra linha de `App.tsx` foi tocada (fora do escopo autorizado).
- `CONTENT_SOURCES.md`: 4 linhas novas na tabela de fontes; contagem de peças/sistemas no topo do arquivo atualizada (19→34 peças, 6→7 sistemas).

### Arquivos principais
- `src/data/parts.ts`
- `src/App.tsx` (só a linha de `systemIcons` e o import de `Fuel`)
- `CONTENT_SOURCES.md`

### Decisões
- Ícone escolhido: `Fuel` de `lucide-react` — confirmado que existe no pacote instalado (`^0.577.0`, arquivo `dist/esm/icons/fuel.js` presente em `node_modules`) antes de importar.
- Segui a Etapa 1 do plano à risca: adicionei `SystemId`/`systems` primeiro e rodei `npx tsc -b --noEmit` só para confirmar o erro esperado em `systemIcons` antes de corrigi-lo — confirmado (`error TS2741 ... systemIcons`).
- Mantive as 4 peças em nível conceitual e genérico: nenhuma menciona um sistema de injeção eletrônica de marca específica, conforme a Constituição e o "Fora de escopo" da task.

### Divergências
**Descoberta não antecipada por `ADR-003`/`TASK-005`**: além de `App.tsx`/`systemIcons`, existe um SEGUNDO `Record<SystemId, string>` em `src/components/PartSketch.tsx` (`primaryPart`, linha 6-9) que também exige a chave `fuel` — o TypeScript aponta isso com o mesmo tipo de erro (`TS2741`). A task e o ADR afirmam explicitamente que "nenhuma outra mudança de JSX é necessária além de `systemIcons`", o que se mostrou incorreto.

`PartSketch.tsx` **não está** na lista de arquivos que esta sessão pode editar (só `src/data/parts.ts`, `CONTENT_SOURCES.md` e a linha de `systemIcons` em `src/App.tsx`), então **não editei esse arquivo**. Sinalizei o achado como uma tarefa de background (`spawn_task`, id `task_c45bff02`) com a sugestão concreta de correção (adicionar `fuel: '<id>'` ao `primaryPart`, escolhendo entre `fuel-tank`/`fuel-pump`/`fuel-filter`/`fuel-injector`, e verificar se `PartShape` precisa de um `case` novo).

### Pendências (resolvidas pela sessão principal em 2026-09-11)
- ~~Bloqueador de build~~: corrigido. `src/components/PartSketch.tsx`'s `primaryPart` ganhou `fuel: 'fuel-tank'`, seguindo exatamente o mesmo padrão já usado para `engine: 'engine'` (cai no ícone genérico do `case default` de `PartShape`, já que não existe `case 'fuel-tank':` — comportamento idêntico ao de `engine`, não é um caso especial). `npx tsc -b --noEmit` e `npm run build` confirmados limpos depois da correção.
- ~~Verificação visual (CA-05)~~: feita pela sessão principal no navegador — aba "Combustível" aparece na navegação lateral e nas abas de sistema com o ícone `Fuel`; as 4 peças aparecem corretamente na biblioteca ("Peças e cuidados" → filtro "Combustível") com conteúdo e ícone; abrir "Tanque de combustível" no modelo 3D mostra o painel de detalhe correto.

### Verificação da sessão principal (2026-09-11)
- CA-02 e CA-05 atualizados para `[x]` abaixo — ver acima.

## Validação
- `npx tsc -b --noEmit` logo após adicionar `'fuel'` a `SystemId`/`systems` (antes de tocar `systemIcons`): erro esperado confirmado em `src/App.tsx(14,7)` (`systemIcons`) — **e também**, já nessa mesma rodada, um erro em `src/components/PartSketch.tsx(6,7)` pelo mesmo motivo (não antecipado pela task).
- `npx tsc -b --noEmit` logo após adicionar `fuel: Fuel` a `systemIcons`: o erro de `App.tsx`/`systemIcons` desaparece; o erro de `PartSketch.tsx` permanece (esperado, é outro arquivo).
- `npm run build` (rodado por último, com as 4 peças e fontes já adicionadas): falha exclusivamente em `src/components/PartSketch.tsx(6,7)`, mesmo erro de tipo. Nenhum outro erro apareceu — ou seja, todo o conteúdo desta task (`parts.ts`, `systems`, `sources`, `systemIcons`) está correto do ponto de vista de tipos.
- Não foi possível rodar `npm run build` limpo até o fim nesta task, por um motivo fora do meu controle/escopo (ver Pendências).

## Handoff
Não há handoff de continuidade desta sessão — a pendência foi registrada como tarefa de background (`task_c45bff02`) para quem tiver escopo em `src/components/PartSketch.tsx` (trilha `react-ui`), e também reportada à sessão principal, responsável pelo `git push` final.
