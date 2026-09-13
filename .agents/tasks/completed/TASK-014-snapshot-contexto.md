# Snapshot — TASK-014

Gerado em: 2026-09-13
Task: `.agents/tasks/backlog/TASK-014-conteudo-comparacao-desgaste.md`

## ADR de referência

`.agents/decisions/ADR-007-comparacao-visual-desgaste-vs-novo.md` — parte 1/2 (com `TASK-015`, que consome este campo). **Atenção**: o `ADR-007` documenta que o escopo (5 peças, não as 34) foi uma decisão de planejamento, não uma escolha explícita do usuário — releia a seção "Decisão" do ADR antes de expandir esse escopo por conta própria.

## Assinaturas de código necessárias

- `export interface Part { id, system, name, shortName, summary, function, how, analogy, signs, care, attention, difficulty, sourceIds }` — `src/data/parts.ts:13-27` — o campo `wear` novo é um acréscimo opcional a esta interface.
- `sourceIds` atuais das 5 peças do subconjunto inicial (conferidos em 2026-09-13, antes de escrever qualquer texto novo):
  - `tire`: `['michelin-wear', 'michelin-tread', 'aa-breakdowns']`
  - `brake-pad`: `['brembo-pads']`
  - `brake-disc`: `['brembo-discs', 'brembo-disc-heat']`
  - `timing-belt`: `['gates-timing', 'aa-breakdowns']`
  - `spring`: `['monroe-springs']`
- `export const sources: {...}[]` — mesmo arquivo — cada id acima tem uma entrada correspondente com `url`/`organization`; reler o conteúdo de cada fonte (ou o que já foi extraído em `CONTENT_SOURCES.md`) antes de escrever a comparação visual.

## Restrições ativas

- Comparação continua sendo exemplo ilustrativo, nunca diagnóstico ("isto prova que a peça acabou") — mesma regra de `signs`.
- Campo novo é opcional em `Part` — não preencher/tocar as outras 29 peças.
- Não usar fonte nova além das já citadas por cada peça, a menos que uma afirmação específica exija (nesse caso, seguir a regra normal: fonte real ou não escrever).

## Próximo passo imediato

Decidir o formato exato do campo `wear` (a task original sugere `{ normalLabel, wornLabel, description }`, mas o formato final é desta task, coordenado com quem for implementar `TASK-015`) e depois reler as fontes das 5 peças, extraindo o que cada uma diz sobre aparência de desgaste, antes de escrever qualquer texto.

---
Para retomar: abra uma sessão nova e peça para ler este arquivo antes de continuar a task `TASK-014`.
