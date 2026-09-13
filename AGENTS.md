# Guia de Agentes — Carbody

Este arquivo é versionado neste repositório (decisão do projeto — ver ADR-001 em `.agents/decisions/`). Compartilhado entre máquinas/devs via Git.

## Projeto

Carbody ("Por dentro" é o nome de marca visível no app) é uma aplicação web educativa que ensina o essencial de mecânica automotiva: relaciona a posição das peças de um carro genérico a combustão com sua função, funcionamento e sinais comuns de desgaste, através de um modelo 3D interativo e um laboratório de mecanismos animado. React 19 + TypeScript + Vite 7 no frontend, Three.js para a cena 3D; aplicação 100% local, sem conta e sem backend — todo o progresso do usuário fica em `localStorage`.

## Fontes de verdade

- Contexto vivo: `.agents/context/CONTEXT.md`
- Estado de trabalho: `.agents/tasks/` e `.agents/handoffs/`
- Decisões arquiteturais: `.agents/decisions/` (índice em `.agents/decisions/README.md`)
- Constituição e teste de sanidade: `.agents/test-onboarding.md`
- Memória persistente entre sessões: `.agents/memory/`
- Documentação real do produto (versionada): `docs/`
- Visão de produto e escopo original: `PRODUCT.md` (raiz — fonte primária, não duplicar em `docs/`)
- Pesquisa e curadoria do conteúdo educativo: `CONTENT_SOURCES.md` (raiz — fonte primária)

## Leitura obrigatória antes de alterar código

1. Leia `.agents/context/CONTEXT.md`.
2. Identifique se há task ativa em `.agents/tasks/active/`.
3. Leia o agente especializado relevante em `.claude/agents/` (ver lista abaixo).
4. Releia a seção "Constituição" de `.agents/test-onboarding.md` — nenhuma mudança deve contradizê-la silenciosamente.
5. Se a mudança tocar o catálogo de peças (`src/data/parts.ts`), leia também `CONTENT_SOURCES.md` antes de escrever qualquer afirmação técnica nova.

## Auditoria local

Antes de um commit ou handoff, rode a skill `bootstrap-audit` (teste de sanidade, compliance de formato entre adaptadores, guardrail anti-vazamento, índice de ADRs). Se quiser que o guardrail anti-vazamento valha também para commits feitos manualmente (fora de uma sessão de IA), rode `bootstrap-install-hook` uma vez por máquina — é opcional e não é ativado por padrão.

## Ciclo de vida de uma task

`bootstrap-plan` (ingestão → 3 opções → ADR → task em `backlog/`) → você move para `active/` ao começar → `bootstrap-handoff` se precisar pausar → `bootstrap-complete` verifica o DoD e move para `completed/`. Nenhuma dessas skills pula etapa silenciosamente — se faltar evidência, elas reportam em vez de assumir.

## Mapa do repositório

- `src/App.tsx` — casca da aplicação: navegação entre páginas (estado local, sem router), busca, progresso, toasts
- `src/components/CarScene.tsx` — cena 3D interativa (Three.js): geometria procedural do carro, câmera, OrbitControls, raycasting de peças
- `src/components/MechanismLab.tsx` — laboratório de mecanismos: 6 diagramas animados (motor de 4 tempos, engrenagens, freios, arrefecimento, suspensão, elétrica), SVG + `requestAnimationFrame`
- `src/components/PartSketch.tsx` — ilustrações SVG por sistema, usadas na biblioteca de peças
- `src/data/parts.ts` — catálogo de conteúdo: 19 peças, 6 sistemas, fontes citadas (`sources`) — dado puro, sem lógica de UI
- `src/main.tsx` — ponto de entrada React
- `src/styles.css`, `src/components/car-scene.css`, `src/components/mechanism-lab.css` — estilos
- `public/favicon.svg` — favicon
- `index.html` — shell HTML
- `PRODUCT.md` — especificação de produto (schema `impeccable`) — fonte primária de visão de produto
- `CONTENT_SOURCES.md` — pesquisa e curadoria editorial do conteúdo, com tabela de fontes por assunto
- `docs/` — documentação de arquitetura de apoio (este bootstrap)
- `.agents/` — hub de estado: contexto, tasks, handoffs, decisões
- `.claude/`, `.codex/` — adaptadores de ferramentas de IA (papéis especializados, regras)

## Papéis especializados (agentes)

- `.claude/agents/three-scene.md` — cena 3D em Three.js (`CarScene.tsx`): geometria procedural, ciclo de vida do WebGL, performance
- `.claude/agents/content-catalog.md` — catálogo de conteúdo educativo (`src/data/parts.ts`, `CONTENT_SOURCES.md`): integridade editorial e sourcing
- `.claude/agents/react-ui.md` — casca React/UI (`App.tsx`, `MechanismLab.tsx`, CSS): navegação, acessibilidade, responsividade, persistência local

## Regras globais

- Não duplique regra de negócio/conteúdo entre camadas — o catálogo (`src/data/parts.ts`) é a única fonte de peças, sistemas e fontes.
- Nunca introduza conta de usuário, autenticação ou backend — o app é deliberadamente local (ver Constituição em `.agents/test-onboarding.md`).
- Toda afirmação técnica nova sobre uma peça precisa de uma fonte real em `sources` (`src/data/parts.ts`), referenciada via `sourceIds` — nunca uma alegação sem fonte.
- Sinais de desgaste são exemplos editoriais, nunca uma classificação estatística ou um diagnóstico — mantenha essa distinção em qualquer texto novo.
- Não amplie o escopo de uma task sem registrar em `.agents/tasks/`.
- Registre decisões arquiteturais relevantes em `.agents/decisions/`.
- Contratos de dado estáveis (a interface `Part` em `src/data/parts.ts`, a chave e o formato salvos em `localStorage`) não mudam silenciosamente — mudança que quebre o progresso já salvo de um usuário exige ADR.

## Comandos reais

```bash
npm install       # instala dependências
npm run dev       # servidor de desenvolvimento (Vite, http://127.0.0.1:5173)
npm run build     # typecheck (tsc -b) + build de produção (vite build)
npm run preview   # serve o build de produção localmente
```

Não há script de lint nem de teste configurado neste projeto — não existe ESLint configurado, e `@playwright/test` está como devDependency mas sem nenhuma configuração ou arquivo de teste. Não invente `npm test`/`npm run lint`; se uma task exigir testes, isso precisa ser configurado primeiro (registre como task própria).

## Critérios de conclusão

- Critérios de aceitação da task verificados.
- `npm run build` executado sem erros quando o escopo alterado incluir TypeScript.
- Verificação visual no navegador quando o escopo alterado for visível (UI, cena 3D, laboratório de mecanismos).
- Riscos e pendências declarados.
- Handoff preenchido em `.agents/handoffs/` quando houver continuação em outra sessão/ferramenta.
