---
estado: real
fonte: src/App.tsx, src/components/, src/data/parts.ts
ultima-revisao: TASK-015, 2026-09-13
---

# Componentes

Componentes internos relevantes por camada. Carbody não tem camadas de backend/dados de servidor — a divisão real é entre casca de UI, visualizações e dados estáticos.

## Camada de entrada/UI

- **`App.tsx`** — casca da aplicação inteira: navegação entre 5 páginas via estado local (`page`), busca (`normalize()` + filtro), glossário com filtro próprio, progresso do usuário, toasts, menu mobile. Compõe `CarScene` e `MechanismLab` via `React.lazy`/`Suspense` (code-splitting — cada um só carrega quando a página correspondente abre) e `PartSketch` diretamente. Consome `glossary` (`src/data/glossary.ts`) na página `glossary`, com busca local separada da busca `Ctrl K` (decisão do `ADR-006`) e chips que levam de um termo às peças onde ele aparece, via `openPart`. Dois mapas ligam a casca ao laboratório de mecanismos: `systemMechanism` (`SystemId → Mode`) decide se a página de uma peça oferece o link "Veja o movimento acontecer" e para qual mecanismo ele leva, e `mechanismParts` (`Mode → ids de peça`) alimenta a seção "Agora, encontre no carro". O tipo `Mode` vem de `MechanismLab.tsx` por `import type`, que é apagado na compilação e por isso não desfaz o code-splitting.

## Camada de visualização — cena 3D

- **`CarScene.tsx`** (`src/components/`) — cena Three.js imperativa: geometria procedural do carro, câmera ortográfica + `OrbitControls`, raycasting para seleção de peças, pins HTML projetados por frame, fallback SVG quando WebGL está indisponível. Renderiza via `EffectComposer` (`RenderPass` → `GTAOPass` → `OutputPass`), com um ambiente procedural (`PMREMGenerator` + `RoomEnvironment`, gerado localmente) atribuído a `scene.environment` para reflexo em metais/vidros. Detalhes em [`../modules/car-scene.md`](../modules/car-scene.md). Ver `.claude/agents/three-scene.md` para as regras completas.

## Camada de visualização — laboratório de mecanismos

- **`MechanismLab.tsx`** (`src/components/`) — diagramas SVG animados (motor de 4 tempos, par de engrenagens, circuito hidráulico de freio, circuito de arrefecimento, conjunto de suspensão, sistema de carga elétrica), animação via `requestAnimationFrame` respeitando `prefers-reduced-motion`.
- **`PartSketch.tsx`** (`src/components/`) — ilustrações SVG por sistema, usadas na biblioteca de peças e nos detalhes de cada peça Desde o `ADR-007`/`TASK-015` aceita `variant?: 'normal' | 'worn'`: as 5 peças com `wear` no catálogo têm uma segunda versão do mesmo desenho, alterando só o traço que representa o desgaste (sulcos mais rasos no pneu, camada de atrito mais fina na pastilha, sulcos circulares no disco, folga maior entre os eletrodos da vela, mola mais baixa). As outras 29 ignoram o prop e caem no desenho único.

## Camada de dados/conteúdo

- **`src/data/parts.ts`** — catálogo estático: `systems` (7 sistemas, incluindo `fuel` desde `ADR-003`), `parts` (34 peças), `sources` (fontes citadas). Dado puro, sem lógica de UI. Ver `.claude/agents/content-catalog.md`.

## Persistência

- Progresso do usuário: `localStorage`, chave `por-dentro:learned:v1`, gerenciado diretamente em `App.tsx` (`loadLearned`/`toggleLearned`) — não há camada de abstração dedicada (não é necessária para o volume de dado envolvido).

## Observabilidade/infraestrutura transversal

- Nenhuma. Não há logging estruturado, analytics, correlação de requisições ou monitoramento — aplicação 100% client-side, sem telemetria, consistente com a Constituição de app local.
