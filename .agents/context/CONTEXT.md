# Contexto Atual do Projeto — Carbody

Última atualização: 2026-09-11

## Estado atual

Carbody (marca visível no app: "carbody.") é uma SPA em React 19 + TypeScript + Vite 7, com uma cena 3D interativa em Three.js (`CarScene.tsx`) e um laboratório de mecanismos animado (`MechanismLab.tsx`). O catálogo de conteúdo (`src/data/parts.ts`) cobre 19 peças em 6 sistemas, cada peça com fontes reais citadas. Aplicação 100% local: sem conta, sem backend, progresso salvo em `localStorage`. Branch `main`, publicado em `github.com/Senavictors/carbody`. Build (`npm run build`) e typecheck (`tsc -b`) passam limpos.

## Iniciativas ativas

- **Realismo do modelo 3D** (`ADR-002`): `TASK-001` (iluminação física — PMREM + AO) e `TASK-002` (mais detalhe geométrico — segmentos, parafusos, mangueira) implementadas e validadas, ambas em `.agents/tasks/active/`. Pendências antes de mover para `completed/` via `bootstrap-complete`: checagem manual de memória (TASK-001, CA-06) e confirmação visual dos parafusos em tela real, sem as limitações da ferramenta de captura desta sessão (TASK-002, CA-02).

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
