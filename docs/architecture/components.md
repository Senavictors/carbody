---
estado: real
fonte: src/App.tsx, src/components/, src/data/parts.ts
ultima-revisao: TASK-001/TASK-002, 2026-09-11
---

# Componentes

Componentes internos relevantes por camada. Carbody não tem camadas de backend/dados de servidor — a divisão real é entre casca de UI, visualizações e dados estáticos.

## Camada de entrada/UI

- **`App.tsx`** — casca da aplicação inteira: navegação entre páginas via estado local (`page`), busca (`normalize()` + filtro), progresso do usuário, toasts, menu mobile. Compõe `CarScene`, `MechanismLab` e `PartSketch`.

## Camada de visualização — cena 3D

- **`CarScene.tsx`** (`src/components/`) — cena Three.js imperativa: geometria procedural do carro, câmera ortográfica + `OrbitControls`, raycasting para seleção de peças, pins HTML projetados por frame, fallback SVG quando WebGL está indisponível. Renderiza via `EffectComposer` (`RenderPass` → `GTAOPass` → `OutputPass`), com um ambiente procedural (`PMREMGenerator` + `RoomEnvironment`, gerado localmente) atribuído a `scene.environment` para reflexo em metais/vidros. Detalhes em [`../modules/car-scene.md`](../modules/car-scene.md). Ver `.claude/agents/three-scene.md` para as regras completas.

## Camada de visualização — laboratório de mecanismos

- **`MechanismLab.tsx`** (`src/components/`) — diagramas SVG animados (motor de 4 tempos, par de engrenagens), animação via `requestAnimationFrame` respeitando `prefers-reduced-motion`.
- **`PartSketch.tsx`** (`src/components/`) — ilustrações SVG por sistema, usadas na biblioteca de peças e nos detalhes de cada peça.

## Camada de dados/conteúdo

- **`src/data/parts.ts`** — catálogo estático: `systems` (6 sistemas), `parts` (19 peças), `sources` (fontes citadas). Dado puro, sem lógica de UI. Ver `.claude/agents/content-catalog.md`.

## Persistência

- Progresso do usuário: `localStorage`, chave `por-dentro:learned:v1`, gerenciado diretamente em `App.tsx` (`loadLearned`/`toggleLearned`) — não há camada de abstração dedicada (não é necessária para o volume de dado envolvido).

## Observabilidade/infraestrutura transversal

- Nenhuma. Não há logging estruturado, analytics, correlação de requisições ou monitoramento — aplicação 100% client-side, sem telemetria, consistente com a Constituição de app local.
