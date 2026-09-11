---
estado: real
fonte: src/ (ausência de qualquer servidor/rota de API)
ultima-revisao: bootstrap-init, 2026-09-11
---

# API

Carbody não expõe nenhuma API. É uma aplicação client-only: não há servidor de aplicação, não há rotas HTTP próprias, e nenhuma chamada de rede é feita em runtime (ver `docs/architecture/context.md`). Esta pasta fica vazia de propósito — ficará relevante só se uma decisão futura (registrada em ADR) introduzir um backend, o que hoje contraria a Constituição do projeto (`.agents/test-onboarding.md`).

## Template por endpoint (para uso futuro, se um backend for introduzido)

```markdown
---
estado: <planejado | real | divergente>
fonte: <controller/handler real que implementa este endpoint>
ultima-revisao: <task ou data>
---

# METODO /rota

## Propósito
## Autenticação e autorização
## Idempotência
## Request
## Response
## Erros
## Efeitos colaterais
## Limites
## Exemplos
```
