# Contexto Atual do Projeto — Carbody

Última atualização: 2026-09-13

## Estado atual

Carbody (marca visível no app: "carbody.") é uma SPA em React 19 + TypeScript + Vite 7, com uma cena 3D interativa em Three.js (`CarScene.tsx` — geometria procedural, ambiente PMREM + AO via `EffectComposer`) e um laboratório de mecanismos animado (`MechanismLab.tsx`). O catálogo de conteúdo (`src/data/parts.ts`) cobre 34 peças em 7 sistemas, cada peça com fontes reais citadas. Aplicação 100% local: sem conta, sem backend, progresso salvo em `localStorage`. Branch `main`, publicado em `github.com/Senavictors/carbody`. Build (`npm run build`) e typecheck (`tsc -b`) passam limpos.

## Iniciativas ativas

- **Realismo do modelo 3D** (`ADR-002`): `TASK-001` e `TASK-002` concluídas — ver `.agents/tasks/completed/`.
- **Expansão do catálogo de peças** (`ADR-003`, 2026-09-11): 15 peças novas + um 7º sistema ("Combustível"), implementadas em duas trilhas paralelas por papel (subagentes), depois convergidas e verificadas pela sessão principal. **Concluída** — ver `.agents/tasks/completed/TASK-003` a `TASK-008`.
  - Trilha conteúdo (`content-catalog`): `TASK-003`, `TASK-004`, `TASK-005`. Catálogo agora com 34 peças em 7 sistemas (`src/data/parts.ts`), todas as novas com `sourceIds` reais; `CONTENT_SOURCES.md` atualizado. `SystemId` ganhou `'fuel'`; `App.tsx`/`systemIcons` ganhou a chave `fuel: Fuel`.
  - Trilha geometria (`three-scene`): `TASK-006`, `TASK-007`, `TASK-008`. As 15 peças novas têm geometria em `CarScene.tsx` com `system`/`part` corretos, usando só os helpers já estabelecidos.
  - **Bloqueador de build encontrado pela trilha conteúdo e corrigido pela sessão principal**: `src/components/PartSketch.tsx` tinha seu próprio `Record<SystemId, string>` (`primaryPart`), não previsto em `ADR-003`, que também exigia a chave `fuel`. Corrigido adicionando `fuel: 'fuel-tank'` (mesmo padrão de `engine: 'engine'`, cai no ícone genérico do `default`). `npm run build` confirmado limpo.
  - Verificação visual final feita pela sessão principal no navegador: sistema "Combustível" navegável com ícone; conteúdo das 15 peças novas correto na biblioteca; clique direto confirmado para `exhaust` (raycasting funcionando com a geometria nova); opacidade por sistema confirmada em 5 abas; 3 visões (perspectiva/lateral/superior) sem colisão aparente entre tanque de combustível, escape e eixo traseiro. Clique direto em `steering` especificamente não foi confirmado (limitação da ferramenta de captura desta sessão em acertar um alvo fino em coordenadas exatas), mas o código segue o mesmo padrão já confirmado para `exhaust`.
  - Ids de todas as peças novas fixados na tabela do `ADR-003` — usados exatamente como especificado; nenhuma peça órfã entre as duas trilhas.
- **Próximas features** (`ADR-004` a `ADR-007`, 2026-09-13): 4 features planejadas a partir de uma sessão de brainstorm; `TASK-009` em andamento, as demais ainda em `.agents/tasks/backlog/`:
  - `ADR-004` — mais 4 mecanismos animados no `MechanismLab`. **Concluído**: `TASK-009` (Freios+Arrefecimento) e `TASK-010` (Suspensão+Elétrica), ambas em `.agents/tasks/completed/`. O `MechanismLab` tem hoje os 6 modos previstos, governados pela lista `modes` no topo de `MechanismLab.tsx` (abas, cabeçalho do painel, velocidade de animação em `speeds`, ângulo inicial em `startAngle`); o componente `FlowPath` desenha qualquer trajeto com fluxo animado (tubo de arrefecimento ou fio elétrico). Ver `docs/modules/mechanism-lab.md`. `TASK-016` fechou a ponta solta: `App.tsx` conhece os 6 modos (`systemMechanism`, `mechanismParts`, tipo `Mode` importado por `import type`), então qualquer peça de sistema com mecanismo oferece o link e a seção "Agora, encontre no carro" acompanha o mecanismo aberto. **Pendência remanescente do `ADR-004`**: `MechanismLab.tsx` está com 660 linhas e o próprio ADR previa reavaliar a Alternativa B (extrair cada mecanismo para `mechanisms/<Nome>Mechanism.tsx`) depois desta expansão — decisão ainda não tomada.
  - `ADR-005` — animar peças do modelo 3D condicionadas ao sistema selecionado. **Concluído** (`TASK-011`, em `.agents/tasks/completed/`): ventoinha (`cooling`), rodas (`suspension`) e polias da correia dentada (`engine`) se movem quando seu sistema está selecionado. O risco previsto — agrupar as peças da roda num `THREE.Group` — foi resolvido reparentando depois da construção com `attach()`, sem tocar nos helpers nem no raycasting. A cena ganhou sua primeira checagem de `prefers-reduced-motion`. Ver `docs/modules/car-scene.md`.
  - `ADR-006` — glossário de termos técnicos, página própria (sem integrar com a busca `Ctrl K` existente). Tasks: `TASK-012` (conteúdo, `content-catalog`), `TASK-013` (página, `react-ui`).
  - `ADR-007` — comparação visual "desgaste vs. novo", campo novo em `Part` + SVG em `PartSketch.tsx`, começando por 5 peças (pneu, pastilha de freio, disco de freio, correia dentada, mola) — escopo reduzido decidido durante o planejamento (não escolhido explicitamente pelo usuário, sinalizado no próprio `ADR-007`). Tasks: `TASK-014` (conteúdo), `TASK-015` (UI).

## Arquitetura vigente

Ver `docs/architecture/` para a visão completa (contexto, containers, componentes, dependências, deployment) e `.claude/agents/` para os papéis especializados (`three-scene`, `content-catalog`, `react-ui`).

## Restrições importantes

- Ver a Constituição completa em `.agents/test-onboarding.md` — resumo: sem conta/backend, modelo genérico (não representa veículo comercial específico), conteúdo em pt-BR, sinais de desgaste são exemplos editoriais (nunca diagnóstico/ranking estatístico), toda afirmação técnica precisa de fonte real em `sources`.

## Dívida técnica conhecida

- Não há testes automatizados. `@playwright/test` está instalado como devDependency mas sem nenhuma configuração ou arquivo de teste — decidir se remove a dependência ou escreve os testes. Maior item de dívida ainda em aberto; por ser uma decisão arquitetural (escolher estratégia de teste), merece seu próprio `bootstrap-plan` em vez de ser resolvido ad hoc.
- `CarScene.tsx` já é `lazy`-importado (`React.lazy`, carregado só quando a página "Explorar" abre) — o chunk isolado ainda pesa ~608 kB (aviso do `vite build`), por causa do Three.js. Considerar `manualChunks` se isso incomodar no futuro.
- Não há pipeline de deploy/CI configurado ainda.

**Resolvidos em 2026-09-11**:
- ~~Sem `README.md` na raiz~~ — criado, com instruções de setup e mapa do projeto.
- ~~Fonte `hella-alternator` apontava para um PDF~~ — na verdade apontava para um arquivo de logotipo da HELLA, não documentação técnica. Corrigido: a peça `alternator` agora cita `hella-starting` (fonte já existente, cobre partida e alternador). Ver `CONTENT_SOURCES.md`.

## Decisões recentes

Ver `.agents/decisions/` (índice em `README.md`): `ADR-001` (versionar o hub de agentes), `ADR-002` (realismo do modelo 3D — concluída), `ADR-003` (expansão do catálogo — concluída), `ADR-004` a `ADR-007` (próximas features — planejadas, ainda não implementadas).

## Riscos atuais

- Baixo risco geral: projeto sem backend, sem dados sensíveis, sem usuários reais ainda. O maior risco é editorial (conteúdo técnico incorreto ou sem fonte sendo publicado como se fosse verificado) — mitigado pela regra de `sourceIds` obrigatório.

## Não fazer agora

- Não introduzir conta de usuário, autenticação ou backend sem uma decisão explícita do usuário (violaria a Constituição).
- Não adicionar peças ao catálogo sem fonte real correspondente em `sources`.
