# Snapshot — TASK-015

Gerado em: 2026-09-13
Task: `.agents/tasks/backlog/TASK-015-ui-comparacao-desgaste.md`

## ADR de referência

`.agents/decisions/ADR-007-comparacao-visual-desgaste-vs-novo.md` — parte 2/2, depende do campo `wear` de `TASK-014` já existir para as 5 peças (`tire`, `brake-pad`, `brake-disc`, `timing-belt`, `spring`).

## Assinaturas de código necessárias

- `type PartSketchProps = { system: SystemId; partId?: string };` e `export default function PartSketch({ system, partId }: PartSketchProps)` — `src/components/PartSketch.tsx:4, 178` — precisa ganhar um prop `variant?: 'normal' | 'worn'`.
- `function PartShape({ id }: { id: string }): ReactNode { switch (id) { ... } }` — mesmo arquivo, `:22` em diante — um `case` por peça; as 5 do subconjunto (`tire` em `:119`, `brake-pad` em `:80`, `brake-disc` em `:87`, `timing-belt` em `:35`, `spring` em `:113` — linhas de 2026-09-13, reconferir antes de editar) precisam de uma variante "desgastada" cada.
- `const primaryPart: Record<SystemId, string> = {...}` — `:6-9` — não editado por esta task, só contexto (é o mapa usado quando `partId` não é passado).
- `<PartSketch system={part.system} partId={part.id}/>` dentro de `PartDetail` — `src/App.tsx:40` — onde o controle de variante (toggle/slider) entra, condicionado a `part.wear` existir.

## Restrições ativas

- O controle só aparece quando `part.wear` está definido — nunca um controle "morto" para as outras 29 peças.
- Ilustração "desgastada" não pode parecer alarmista — mesmo cuidado de tom do texto de `TASK-014`.
- Acessibilidade consistente com os outros controles do app (ex.: o toggle "Carroceria" já em `App.tsx`).

## Próximo passo imediato

Confirmar que `TASK-014` já preencheu o campo `wear` nas 5 peças (ler `src/data/parts.ts`) antes de começar — sem o campo, não há o que alternar. Depois, adicionar o prop `variant` a `PartSketch`/`PartShape` primeiro (mudança pequena e isolada) antes de desenhar qualquer SVG novo.

---
Para retomar: abra uma sessão nova e peça para ler este arquivo antes de continuar a task `TASK-015`.
