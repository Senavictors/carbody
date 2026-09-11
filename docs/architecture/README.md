# Arquitetura

Visão estrutural de Carbody: uma SPA React 19 + TypeScript + Vite 7 sem backend, com uma cena 3D interativa (Three.js) e um catálogo de conteúdo educativo estático. Não há múltiplos serviços/containers — é um único processo client-side.

## Documentos

- [`context.md`](context.md) — propósito do sistema, atores, fronteiras e integrações externas
- [`containers.md`](containers.md) — processos/serviços implantáveis de forma independente, responsabilidades e comunicação
- [`components.md`](components.md) — componentes internos relevantes por camada/módulo
- [`dependencies.md`](dependencies.md) — direção de dependência permitida/proibida entre camadas
- [`deployment.md`](deployment.md) — topologia real de implantação (ambiente, portas, variáveis de ambiente, boot)

Diagramas visuais complementares (Mermaid/PlantUML): [`../diagrams/`](../diagrams/README.md) — nenhum criado ainda.

**Importante**: estes documentos foram escritos a partir do código real (`package.json`, `vite.config.ts`, `src/`), nunca do que "deveria ser" — marcados `estado: real`. Se um diagrama ou documento futuro divergir do comportamento real do código, marque `estado: divergente` e registre a divergência explicitamente em vez de escolher um dos dois silenciosamente.
