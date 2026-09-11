# Contexto Atual do Projeto — Carbody

Última atualização: 2026-09-11

## Estado atual

Carbody (marca visível no app: "carbody.") é uma SPA em React 19 + TypeScript + Vite 7, com uma cena 3D interativa em Three.js (`CarScene.tsx`) e um laboratório de mecanismos animado (`MechanismLab.tsx`). O catálogo de conteúdo (`src/data/parts.ts`) cobre 19 peças em 6 sistemas, cada peça com fontes reais citadas. Aplicação 100% local: sem conta, sem backend, progresso salvo em `localStorage`. Branch `main`, publicado em `github.com/Senavictors/carbody`. Build (`npm run build`) e typecheck (`tsc -b`) passam limpos.

## Iniciativas ativas

- **Realismo do modelo 3D** (`ADR-002`): `TASK-001` e `TASK-002` concluídas — ver `.agents/tasks/completed/`.
- **Expansão do catálogo de peças** (`ADR-003`, 2026-09-11): 15 peças novas + um 7º sistema ("Combustível"), organizadas em duas trilhas paralelas por papel, todas em `.agents/tasks/backlog/`, nenhuma iniciada ainda:
  - Trilha conteúdo (`content-catalog`): `TASK-003` (escape/direção — peças já modeladas em 3D), `TASK-004` (9 peças que completam sistemas existentes), `TASK-005` (sistema de combustível novo — `SystemId`, `systems`, `systemIcons`).
  - Trilha geometria (`three-scene`): `TASK-006`, `TASK-007` e `TASK-008` concluídas — ver `.agents/tasks/completed/`. As 15 peças novas (escape/direção, as 9 que completam sistemas existentes, e as 4 do sistema de combustível) têm geometria em `CarScene.tsx` com `system`/`part` corretos, usando só os helpers já estabelecidos (`box`/`cyl`/`torus`/`tube`). Validado por `npx tsc -b --noEmit` + `npm run build` (sem erros) em cada task; verificação visual no navegador (clique em cada peça, opacidade por sistema, comparação das 3 visões, colisão de geometria) não foi feita — pendente para quando as duas trilhas convergirem.
  - Ids de todas as peças novas fixados na tabela do `ADR-003` — qualquer implementação deve usá-los exatamente, para as duas trilhas convergirem sem peça órfã.

## Arquitetura vigente

Ver `docs/architecture/` para a visão completa (contexto, containers, componentes, dependências, deployment) e `.claude/agents/` para os papéis especializados (`three-scene`, `content-catalog`, `react-ui`).

## Restrições importantes

- Ver a Constituição completa em `.agents/test-onboarding.md` — resumo: sem conta/backend, modelo genérico (não representa veículo comercial específico), conteúdo em pt-BR, sinais de desgaste são exemplos editoriais (nunca diagnóstico/ranking estatístico), toda afirmação técnica precisa de fonte real em `sources`.

## Dívida técnica conhecida

- Não há testes automatizados. `@playwright/test` está instalado como devDependency mas sem nenhuma configuração ou arquivo de teste — decidir se remove a dependência ou escreve os testes.
- Bundle de produção único de ~851 kB (Three.js não é code-splitted) — `vite build` avisa sobre isso. Candidato a `dynamic import()` de `CarScene` quando a página "Explorar" for aberta.
- Não há `README.md` na raiz com instruções de setup (`npm install && npm run dev`).
- A fonte `hella-alternator` em `src/data/parts.ts` aponta para um PDF (`BI_Alternators_2026.pdf`) — vale confirmar periodicamente que o link continua válido.
- Não há pipeline de deploy/CI configurado ainda.

## Decisões recentes

- Ver `.agents/decisions/` — `ADR-001` registra a decisão de versionar todo o hub de agentes (`.agents/`, roteadores, `docs/`) neste repositório público, em vez de mantê-los locais.

## Riscos atuais

- Baixo risco geral: projeto sem backend, sem dados sensíveis, sem usuários reais ainda. O maior risco é editorial (conteúdo técnico incorreto ou sem fonte sendo publicado como se fosse verificado) — mitigado pela regra de `sourceIds` obrigatório.

## Não fazer agora

- Não introduzir conta de usuário, autenticação ou backend sem uma decisão explícita do usuário (violaria a Constituição).
- Não adicionar peças ao catálogo sem fonte real correspondente em `sources`.
