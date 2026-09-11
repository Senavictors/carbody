# Diagramas — Carbody

Nenhum diagrama criado ainda no bootstrap inicial (2026-09-11) — a arquitetura atual é simples o bastante (um único container SPA, sem backend) para ser descrita em prosa em `../architecture/`. Diagramas em formato de texto versionável (Mermaid, PlantUML ou Structurizr DSL) — nunca só a imagem renderizada — devem ser adicionados aqui quando a complexidade justificar, organizados por tipo:

```text
diagrams/
├── context/
├── containers/
├── components/
├── sequences/
├── domain/
├── database/
└── deployment/
```

## Governança por diagrama

Cada diagrama deve indicar, num cabeçalho no topo do próprio arquivo:

- **Propósito e escopo** — o que mostra e o que fica de fora.
- **`status:`** — `canônico` (fonte confiável e revisada), `rascunho` (em construção) ou `desatualizado` (o código mudou e o diagrama ainda não acompanhou).
- **`fonte:`** — o código/documento primário que o diagrama representa (é contra isso que ele será conferido).
- **Data da última revisão** e links para os documentos relacionados em `../architecture/`.

Quando o catálogo passar de ~10 diagramas, mantenha um **índice** neste README (tabela: arquivo, tipo, status, fonte).
