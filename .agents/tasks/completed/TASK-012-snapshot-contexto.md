# Snapshot — TASK-012

Gerado em: 2026-09-13
Task: `.agents/tasks/backlog/TASK-012-conteudo-glossario.md`

## ADR de referência

`.agents/decisions/ADR-006-glossario-de-termos-tecnicos.md` — parte 1/2 (com `TASK-013`, que consome este conteúdo).

## Assinaturas de código necessárias

- `export interface Part { id, system, name, shortName, summary, function, how, analogy, signs, care, attention, difficulty, sourceIds }` — `src/data/parts.ts:13-27` — não é o que esta task edita, mas é o padrão de estilo/estrutura de dado a seguir para o array de glossário novo.
- `export const sources: { id: string; title: string; url: string; organization: string }[]` — mesmo arquivo, logo após `parts` — mesmo padrão de "array de objetos com id" a replicar para o glossário.
- `CONTENT_SOURCES.md` — decisões editoriais já registradas (recorte, tom, o que não é feito) — reler antes de escrever definições, para manter o mesmo padrão de voz.

## Restrições ativas

- Conteúdo em português brasileiro, sem diagnóstico, tom didático (Constituição).
- Se um termo precisar de uma afirmação técnica nova além de uma definição simples, precisa de `sourceIds` real — mesma regra do catálogo.
- Definições não podem contradizer o texto (`how`/`function`) das peças que já usam aquele termo — reler as peças relacionadas antes de escrever.
- Decidir a organização do arquivo (dentro de `parts.ts` vs. `src/data/glossary.ts` próprio) é parte do trabalho desta task, não uma decisão já tomada pelo `ADR-006`.

## Próximo passo imediato

Reler as 34 peças em `src/data/parts.ts` e listar os termos técnicos que aparecem sem explicação autocontida (candidatos: torque, combustão, RPM/rotação, hidráulico, viscosidade, oxidação, tração) antes de decidir a organização do arquivo ou escrever qualquer definição.

---
Para retomar: abra uma sessão nova e peça para ler este arquivo antes de continuar a task `TASK-012`.
