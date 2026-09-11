---
estado: real
fonte: src/App.tsx, src/components/, src/data/parts.ts
ultima-revisao: ADR-003 (TASK-003 a TASK-008), 2026-09-11
---

# Dependências

Direção estrita de dependência entre camadas. Carbody é um projeto frontend-only — não há backend nem containers múltiplos, então as regras abaixo cobrem só o frontend.

## Frontend

```text
App.tsx  →  componentes de visualização (CarScene.tsx, MechanismLab.tsx, PartSketch.tsx)
App.tsx  →  dados estáticos (src/data/parts.ts)
```

- **Permitido**: `App.tsx` importar de `src/components/` e de `src/data/`.
- **Permitido**: `PartSketch.tsx` ser importado tanto por `App.tsx` quanto potencialmente por outros componentes de visualização (é uma ilustração pura, sem estado).
- **Proibido**: `src/data/parts.ts` importar de `src/components/` ou de `App.tsx` — o catálogo é dado puro; não pode depender da UI.
- **Proibido**: `CarScene.tsx` e `MechanismLab.tsx` importarem um do outro — são visualizações independentes, cada uma orquestrada só por `App.tsx`.
- **Proibido**: introduzir chamada de rede/API em qualquer camada — o projeto é deliberadamente local, sem backend (Constituição, `.agents/test-onboarding.md`).

A expansão do catálogo (`ADR-003`, 34 peças/7 sistemas, incluindo o sistema `fuel` novo) seguiu essas mesmas regras sem exceção: nenhuma peça nova em `parts.ts` importa de `components/`, e a geometria nova em `CarScene.tsx` não importa de `parts.ts` (a associação entre os dois lados é só por id de string, combinado por convenção — ver `docs/modules/car-scene.md`).

## Entre containers

Não se aplica — não há múltiplos containers (ver `containers.md`); é um único SPA estático sem backend.

## Contratos públicos

Não há API pública. Os "contratos" reais deste projeto são:

- A interface `Part` (`src/data/parts.ts`) — consumida por `App.tsx` inteiro (biblioteca, detalhe de peça, progresso). Mudar seu formato exige atualizar todos os pontos de consumo e, se afetar dado já publicado, registrar ADR.
- A chave e o formato salvos em `localStorage` (`por-dentro:learned:v1`, array de strings) — mudar isso silenciosamente quebra o progresso já salvo de usuários existentes; requer ADR em `.agents/decisions/`.
