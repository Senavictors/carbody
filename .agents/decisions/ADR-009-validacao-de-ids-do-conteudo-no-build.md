---
id: ADR-009
title: Validar a integridade dos ids de conteúdo por script no build
status: accepted
date: 2026-09-13
deciders: [Senavictors]
related_tasks: [TASK-018]
---

# ADR-009 — Validar a integridade dos ids de conteúdo por script no build

## Contexto

Várias estruturas do projeto referenciam outras por id, e nenhuma dessas referências é verificada:

- `Part.sourceIds: string[]` → ids de `sources` (`src/data/parts.ts`)
- `GlossaryTerm.sourceIds` e `GlossaryTerm.relatedParts` → `sources` e `parts` (`src/data/glossary.ts`)
- `mechanismParts: Record<Mode, string[]>` → ids de `parts` (`src/App.tsx`)
- `PINS` em `src/components/CarScene.tsx` e `userData.part` dos meshes → ids de `parts`

A regra editorial mais forte do projeto depende disso: a Constituição exige que toda afirmação técnica do catálogo tenha fonte real citada via `sourceIds`. Um `sourceId` com erro de digitação não quebra o build nem aparece na tela — a peça simplesmente deixa de listar aquela fonte, e a garantia editorial some sem aviso.

Durante `TASK-012` e `TASK-014` escrevi scripts de checagem ad hoc, rodei uma vez e os descartei. A verificação existiu, mas não ficou: é conhecimento de sessão, não do repositório.

O projeto não tem suíte de testes (`AGENTS.md`, seção "Comandos reais") nem CI. Qualquer garantia precisa caber no que existe hoje: `npm run build`.

## Decisão

Um script `scripts/check-content.mjs` que valida as referências cruzadas e falha com código de saída diferente de zero quando um id não existe, encadeado no `npm run build` antes do `tsc -b`.

Formaliza no repositório exatamente a checagem que foi feita à mão, e serve de gancho pronto para um CI futuro sem depender de escolher uma estratégia de teste — decisão maior que o `CONTEXT.md` registra como dívida em aberto e que merece seu próprio planejamento.

## Alternativas consideradas

### Alternativa B — `as const` e tipos derivados
Declarar `sources` e `parts` com `as const` e derivar `type SourceId = typeof sources[number]['id']`, fazendo o TypeScript recusar um id inválido no editor, sem script nenhum. É a garantia mais forte e a de melhor ergonomia. Não escolhida: exige mudar a declaração de exports já consumidos por `App.tsx`, `PartSketch.tsx` e `glossary.ts`, torna os arrays `readonly` e produz mensagens de erro longas num arquivo de 34 objetos. O ganho não compensa mexer num contrato estável só para obter uma verificação que um script cobre.

### Alternativa C — Checagem em runtime de desenvolvimento
Validar dentro de `parts.ts` sob `import.meta.env.DEV`, avisando no console. É a implementação mais curta. Não escolhida: só dispara quando alguém abre a página em dev, o que a torna a garantia mais fraca das três e a mais fácil de passar despercebida em um commit — exatamente a falha que esta ADR existe para fechar.

## Consequências

### Positivas
- A verificação passa a ser do repositório, não da sessão: vale para qualquer pessoa ou ferramenta que rode o build.
- Cobre num lugar só referências que hoje vivem em quatro arquivos de três papéis diferentes (`content-catalog`, `react-ui`, `three-scene`).
- Primeiro passo concreto para um CI, sem precisar decidir estratégia de teste antes.

### Negativas
- O erro aparece no build, não enquanto se digita — mais tarde no ciclo que a Alternativa B ofereceria.
- `npm run build` fica um pouco mais lento e ganha um passo a mais para manter.
- O script lê os arquivos `.ts` como texto ou via import dinâmico; em qualquer dos casos, uma mudança grande de formato no catálogo pode exigir ajuste nele.

### Riscos
- Um script frouxo demais dá falsa sensação de segurança: se ele não falhar de verdade, ninguém percebe. A task precisa provar que ele quebra o build ao encontrar um id inválido, não apenas que passa quando está tudo certo.

## Plano de adoção

`TASK-018` escreve o script, encadeia no `build` e demonstra as duas direções: build limpo com o conteúdo atual, e build falhando ao introduzir um id inválido de propósito (revertido em seguida).

## Validação

`npm run build` continua passando com o conteúdo atual; ao trocar um `sourceId` por um valor inexistente, o build falha apontando arquivo, entrada e id. `AGENTS.md` passa a documentar o script na seção "Comandos reais".

## Revisão

Reavaliar quando o projeto adotar uma estratégia de teste automatizado — o script pode virar um teste, ou ser substituído pela Alternativa B se em algum momento valer mexer nos contratos de `parts.ts`.
