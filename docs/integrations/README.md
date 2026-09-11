---
estado: real
fonte: src/ (ausência de qualquer chamada de rede em runtime)
ultima-revisao: bootstrap-init, 2026-09-11
---

# Integrações

Carbody não tem nenhuma integração de terceiros em tempo de execução — nenhuma chamada de API, webhook, ou SDK externo é usada pelo código.

As referências a fabricantes e clubes automotivos (DENSO, Gates, MANN-FILTER, The AA, Brembo, Monroe, Michelin, VARTA, HELLA, GKN, Nakata, AAA) que aparecem em `CONTENT_SOURCES.md` e em `src/data/parts.ts` (`sources`) são **citações editoriais** usadas para escrever o conteúdo educativo — não são integrações técnicas, não há chamada de rede para essas organizações.

## Template por integração (para uso futuro, se uma integração real for introduzida)

```markdown
---
estado: <planejado | real | divergente>
fonte: <código real que implementa esta integração>
ultima-revisao: <task ou data>
---

# Integração <Nome>

## Propósito
## Credenciais e configuração
## Limites e rate limits
## Retry / timeout / idempotência
## Modos de falha e circuit breaker
## Procedimento de indisponibilidade
```
