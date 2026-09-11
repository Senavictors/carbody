---
id: TASK-003
title: "Conteúdo: sistema de escape e direção (peças já modeladas em 3D)"
status: completed
type: feature
owner: content-catalog (subagent)
created_at: 2026-09-11
updated_at: 2026-09-11
affected_modules: [content-catalog]
related_use_cases: []
related_adrs: [ADR-003]
---

# TASK-003 — Conteúdo: sistema de escape e direção (peças já modeladas em 3D)

## Contexto

Parte da trilha "conteúdo" de `ADR-003`. Duas peças já existem como geometria em `CarScene.tsx` (tubo de escape + silencioso na linha ~147; volante de direção na variável `steering`, linha ~287) mas foram construídas com `system`/`part` vazios — são decoração, não peças do catálogo. Esta task escreve o conteúdo educativo; a geometria correspondente (registrar `system`/`part` nos meshes já existentes) é `TASK-006`.

## Problema

Um usuário pode ver o tubo de escape e o volante no modelo 3D, mas eles não são clicáveis e não têm nenhuma explicação — a experiência para no meio, ao contrário de toda outra peça visível no carro.

## Objetivo

Adicionar duas entradas em `parts` (`src/data/parts.ts`): `exhaust` (sistema de escape, sistema `engine`) e `steering` (direção, sistema `suspension` — mesmo critério de agrupamento já usado para `tire`, que reúne peças de "rodagem" dentro de "suspensão").

## Fora de escopo

- Qualquer mudança em `CarScene.tsx` — é `TASK-006`.
- Separar cataliticamente "catalisador" e "silencioso" em duas peças — o modelo 3D atual é um conjunto único (tubo + caixa do silencioso); o conteúdo deve descrever o sistema de escape como um todo, mencionando a função do catalisador no texto sem criar uma peça 3D própria para ele.

## Comportamento atual

`exhaust` e `steering` não existem em `parts`. Não há como o usuário aprender sobre essas peças no app.

## Comportamento esperado

Duas novas entradas em `parts`, seguindo exatamente a `interface Part` já existente (`id`, `system`, `name`, `shortName`, `summary`, `function`, `how`, `analogy`, `signs`, `care`, `attention`, `difficulty`, `sourceIds`):

- **`exhaust`** (`system: 'engine'`) — cobre o papel do sistema de escape (remover os gases da combustão, reduzir ruído) e mencionar a função do catalisador (reduzir poluentes) na narrativa, mesmo sem uma peça 3D própria para ele.
- **`steering`** (`system: 'suspension'`) — cobre volante, coluna de direção e caixa de direção conceitualmente (o modelo só representa o volante, mas o texto pode falar do sistema como um todo, do mesmo jeito que `cv-joint` fala de um conceito mais amplo que sua geometria isolada).

## Regras de negócio

- RN-01 (herdada da Constituição): toda peça precisa de `sourceIds` apontando para fonte real (fabricante de escapes/catalisadores, fabricante de sistemas de direção, ou clube automotivo) cadastrada em `sources`. Se não encontrar uma fonte real e específica, pare e peça ajuda em vez de inventar uma URL.
- RN-02: os ids devem ser exatamente `exhaust` e `steering` (fixados em `ADR-003`) — a `TASK-006` (geometria) vai usar os mesmos ids em `userData.part`.
- RN-03: `signs` (sinais) continuam sendo pistas, nunca diagnóstico (ex.: escape pode ter "ruído incomum" como sinal, não "está furado").

## Critérios de aceitação

- [x] CA-01: `parts` tem uma entrada `exhaust` e uma `steering`, com todos os campos da interface `Part` preenchidos.
- [x] CA-02: cada uma tem pelo menos um `sourceIds` apontando para uma fonte real, nova em `sources` ou uma já existente que se aplique.
- [x] CA-03: toda fonte nova em `sources` tem entrada correspondente na tabela de `CONTENT_SOURCES.md`.
- [x] CA-04: `npm run build` passa sem erros.
- [x] CA-05: nenhuma peça existente foi alterada.

## Impacto técnico

### Frontend
`src/data/parts.ts` (adicionar 2 entradas a `parts`, possivelmente novas entradas em `sources`), `CONTENT_SOURCES.md` (tabela de fontes).

### Banco de dados / Backend / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [x] Etapa 1: pesquisar fontes reais para sistema de escape/catalisador e para sistemas de direção (fabricantes como Bosal, Walker, ZF, TRW, ou clubes automotivos já usados no projeto como The AA).
- [x] Etapa 2: escrever as duas entradas em `parts`, seguindo o tom editorial já estabelecido (ver `engine` ou `cv-joint` como referência de estrutura e nível de detalhe).
- [x] Etapa 3: adicionar as fontes novas a `sources` e à tabela de `CONTENT_SOURCES.md`.
- [x] Etapa 4: `npm run build` para confirmar que o typecheck aceita as novas entradas.

## Estratégia de testes

- [ ] Unitários/Integração/E2E — não aplicável (sem suíte de testes).
- [x] Manual — `npm run build` limpo; releitura do texto novo contra a Constituição (sem diagnóstico, sem ranking, termos explicados na primeira ocorrência).

## Riscos e rollback

Risco: não encontrar fonte real específica o suficiente para "sistema de escape" genérico (a maioria das fontes de catalisadores é por marca de veículo). Se isso acontecer, usar uma fonte de clube automotivo (comportamento geral, sem ser peça específica) e sinalizar a limitação no registro de execução. Rollback: remover as 2 entradas de `parts` (peças novas e isoladas, sem outras peças dependendo delas).

## Registro de execução
### Alterações realizadas
Adicionadas duas entradas em `parts`: `exhaust` (sistema `engine`, cobre coletor, catalisador e silencioso como um conjunto) e `steering` (sistema `suspension`, cobre volante, coluna e caixa de direção conceitualmente). Adicionadas duas fontes novas em `sources`: `walker-exhaust` (Walker Exhaust Systems) e `zf-chassis-parts` (ZF Aftermarket). `zf-chassis-parts` também será reutilizada em TASK-004 para `sway-bar`, já que a mesma página cobre peças de chassi/estabilizador da ZF.

### Arquivos principais
- `src/data/parts.ts` (2 entradas em `parts`, 2 entradas em `sources`)
- `CONTENT_SOURCES.md` (2 linhas novas na tabela de fontes)

### Decisões
- Fonte de "sistema de escape genérico" (Walker) confirmada por fetch direto (200 OK) — página cobre função do sistema completo, do silencioso e do catalisador, o que evitou precisar de uma segunda fonte separada para o catalisador (conforme "Fora de escopo" da task).
- Fonte de "direção" usou ZF Aftermarket (página de peças de direção e chassi) em vez de um fabricante de caixa de direção isolado (ex.: TRW específico), porque a página cobre o sistema de direção e chassi de forma mais genérica, compatível com o recorte didático do projeto (sem implicar um sistema específico de marca).
- `attention: 'Atenção aos sinais'` escolhido para as duas peças (em vez de `'Desgaste natural'`) porque os sinais listados (ruído, cheiro, folga, peso incomum) pedem avaliação e não são um desgaste linear e previsível como pastilha/pneu/bateria.

### Divergências
Nenhuma peça exigiu desvio do plano original da task.

### Pendências
Nenhuma. As duas entradas estão completas e a geometria correspondente (`TASK-006`) já está marcada como completed pela trilha paralela (`three-scene`), conforme observado em `.agents/tasks/completed/` no início desta task.

## Validação
- `npx tsc -b --noEmit`: sem erros.
- `npm run build`: build de produção concluído sem erros (apenas o aviso pré-existente de chunk grande do Three.js, não relacionado a esta mudança).
- Não foi feita verificação visual no navegador (fora do escopo desta task de conteúdo, e o outro subagente pode estar usando a porta de dev server).

## Handoff
Não aplicável — task concluída nesta sessão.
