---
estado: real
fonte: src/
ultima-revisao: TASK-001/TASK-002, 2026-09-11
---

# Módulos

Carbody tem quatro módulos funcionais reais, todos em `src/`: a casca de UI (`App.tsx`), a cena 3D (`CarScene.tsx`), o laboratório de mecanismos (`MechanismLab.tsx` + `PartSketch.tsx`) e o catálogo de dados (`data/parts.ts`). Ver `docs/architecture/components.md` para a visão geral de responsabilidades — arquivos individuais por módulo nascem sob demanda, quando uma task tocar aquela área a fundo (ver `bootstrap-plan`/`bootstrap-complete`).

## Template por módulo

```markdown
---
estado: <planejado | real | divergente>
fonte: <caminho do código do módulo>
ultima-revisao: <task ou data>
---

# Módulo <Nome>

## Responsabilidade
## Localização
- Frontend: <caminho>

## Conceitos principais
## Dependências
### Depende de
### É usado por

## Interfaces públicas
## Invariantes
## Modos de falha
## Testes
## Decisões relacionadas
```

Módulos documentados até agora:

- [`car-scene.md`](car-scene.md) — cena 3D interativa (Three.js), criado ao concluir `TASK-001`/`TASK-002`.

_(criar os demais conforme necessário — candidatos naturais restantes: `mechanism-lab.md`, `parts-catalog.md`, `app-shell.md`)_
