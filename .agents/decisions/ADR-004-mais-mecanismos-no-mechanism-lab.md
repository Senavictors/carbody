---
id: ADR-004
title: Estender o MechanismLab com 4 mecanismos novos (Freios, Arrefecimento, Suspensão, Elétrica)
status: accepted
date: 2026-09-13
deciders: [Senavictors]
related_tasks: [TASK-009, TASK-010]
---

# ADR-004 — Estender o MechanismLab com 4 mecanismos novos (Freios, Arrefecimento, Suspensão, Elétrica)

## Contexto

O catálogo de peças cresceu para 34 peças em 7 sistemas (`ADR-003`), mas `src/components/MechanismLab.tsx` — a página "Como funciona" — só tem 2 modos animados: motor de 4 tempos e engrenagens. A maioria dos sistemas (Freios, Arrefecimento, Suspensão, Elétrica) não tem nenhum diagrama animado explicando o mecanismo, só texto estático nas páginas de peça. Isso deixa o princípio de produto "mostrar a relação entre movimento e função" (`PRODUCT.md`) parcialmente coberto.

Nenhuma restrição da Constituição é tocada — os novos diagramas seguem o mesmo padrão esquemático/genérico já usado em motor/engrenagens (Constituição, `.agents/test-onboarding.md`).

## Decisão

Estender o `Mode` existente em `MechanismLab.tsx` (hoje `'engine' | 'gears'`) com 4 valores novos — `'brakes'`, `'cooling'`, `'suspension'`, `'electrical'` —, cada um com seu próprio diagrama SVG animado e painel de explicação, reaproveitando 100% da infraestrutura já validada: abas de modo, loop de `requestAnimationFrame`, checagem de `prefers-reduced-motion`, e o padrão de "array de dados do mecanismo" + "componente de diagrama" já usado por `strokes`/`EngineDiagram` e `ratios`/`GearDiagram`.

Todos os 4 mecanismos são implementados agora (sem faseamento) — quebrados em 2 tasks por afinidade de sistema, não 4, já que todas tocam o mesmo arquivo (`MechanismLab.tsx`) e não há benefício real em separar mais.

## Alternativas consideradas

### Alternativa B — Extrair cada mecanismo para um arquivo próprio primeiro
Refatorar `MechanismLab.tsx` para virar só um orquestrador de abas, cada mecanismo isolado em `mechanisms/<Nome>Mechanism.tsx`, antes de adicionar os 4 novos. Não escolhida: o usuário preferiu reaproveitar a estrutura existente sem refatorar o que já funciona (motor/engrenagens) só para acomodar a expansão — o risco de regressão nos 2 mecanismos atuais durante um refactor não fazia sentido pagar agora.

### Alternativa C — Só 2 dos 4 mecanismos agora (fase 1)
Implementar Freios + Arrefecimento agora, Suspensão + Elétrica depois. Não escolhida: o usuário quis os 4 de uma vez.

## Consequências

### Positivas
- `MechanismLab.tsx` passa a cobrir todos os 7 sistemas do catálogo (exceto Transmissão e Motor, que já tinham `gears`/`engine`) com o mesmo padrão didático.
- Nenhuma dependência nova, nenhuma mudança de arquitetura — extensão pura do que já existe.

### Negativas
- `MechanismLab.tsx` cresce de ~230 linhas para um arquivo bem maior (6 modos, 6 diagramas SVG) — candidato a refactor (Alternativa B) numa iteração futura, se ficar difícil de navegar.

### Riscos
- Diagramas SVG de mecanismos hidráulicos/elétricos são conceitualmente mais abstratos que motor/engrenagens (não há uma peça girando visível) — calibrar a analogia visual com cuidado para não ficar confuso.

## Plano de adoção

- `TASK-009` — mecanismos de Freios e Arrefecimento (fluidos: pressão hidráulica e circulação de líquido, tema visual semelhante — "algo escoando").
- `TASK-010` — mecanismos de Suspensão e Elétrica (movimento mecânico e carga elétrica).

## Validação

`npm run build` sem erros; verificação visual dos 6 modos (incluindo os 2 já existentes, para garantir que não regrediram); `prefers-reduced-motion` respeitado nos 4 novos, igual aos 2 existentes.

## Revisão

Reavaliar a Alternativa B (extrair em arquivos próprios) se `MechanismLab.tsx` ficar difícil de manter depois desta expansão.
