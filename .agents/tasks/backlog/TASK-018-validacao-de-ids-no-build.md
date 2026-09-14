---
id: TASK-018
title: "Script de validação das referências cruzadas de conteúdo no build"
status: backlog
type: chore
owner:
created_at: 2026-09-13
updated_at: 2026-09-13
affected_modules: [content-catalog, react-ui, three-scene]
related_use_cases: []
related_adrs: [ADR-009]
---

# TASK-018 — Script de validação das referências cruzadas de conteúdo no build

## Contexto

`ADR-009`. Durante `TASK-012` e `TASK-014` escrevi scripts de checagem, rodei uma vez e descartei — a verificação existiu, mas não ficou no repositório.

## Problema

Nada verifica que os ids referenciados entre estruturas existem de fato. Um `sourceId` com erro de digitação não quebra o build nem aparece na tela: a peça só deixa de listar aquela fonte. Como a Constituição exige fonte real para toda afirmação técnica do catálogo, é uma falha que apaga silenciosamente a garantia editorial mais forte do projeto.

## Objetivo

Uma verificação que pertence ao repositório e roda sozinha no build, cobrindo as referências que hoje vivem em quatro arquivos de três papéis diferentes.

## Fora de escopo

- Escolher estratégia de teste automatizado — decisão maior, registrada como dívida em aberto no `CONTEXT.md`, que merece seu próprio `bootstrap-plan`.
- Configurar CI.
- Mudar os tipos ou os exports de `parts.ts` (é a Alternativa B, recusada no `ADR-009`).

## Comportamento atual

`npm run build` roda `tsc -b && vite build`. O TypeScript valida a forma dos objetos, mas `sourceIds`, `relatedParts` e `mechanismParts` são `string[]` — qualquer texto passa.

## Comportamento esperado

- `scripts/check-content.mjs` valida, no mínimo:
  - `Part.sourceIds` → ids existentes em `sources` (`src/data/parts.ts`);
  - `GlossaryTerm.sourceIds` → `sources`, e `GlossaryTerm.relatedParts` → `parts` (`src/data/glossary.ts`);
  - `mechanismParts` → ids de `parts` (`src/App.tsx`);
  - `PINS[].part` e os `userData.part` dos meshes → ids de `parts` (`src/components/CarScene.tsx`).
- Falha com saída diferente de zero, apontando arquivo, entrada e id inválido.
- Encadeado no `npm run build`, antes do `tsc -b`.
- Documentado em `AGENTS.md`, seção "Comandos reais" — que hoje avisa para não inventar comandos inexistentes, e passa a ter um a mais de verdade.

## Regras de negócio

- RN-01: o script precisa falhar de verdade. Provar as duas direções é parte da entrega, não só o caso feliz.
- RN-02: não muda tipo, export ou conteúdo de nenhum arquivo de dado — é só verificação.
- RN-03: sem dependência npm nova; Node puro, como os scripts ad hoc que já foram usados.

## Critérios de aceitação

- [ ] CA-01: `scripts/check-content.mjs` existe e cobre as quatro famílias de referência listadas acima.
- [ ] CA-02: `npm run build` executa o script e continua passando com o conteúdo atual.
- [ ] CA-03: introduzir um `sourceId` inválido faz o build falhar com mensagem que identifica arquivo, entrada e id — demonstrado e revertido.
- [ ] CA-04: nenhum arquivo de dado teve tipo, export ou conteúdo alterado.
- [ ] CA-05: `AGENTS.md` documenta o comando.
- [ ] CA-06: nenhuma dependência nova em `package.json`.

## Impacto técnico

### Frontend
`package.json` (script `build`), `scripts/check-content.mjs` (novo). Nenhum arquivo de `src/` alterado.

### Banco de dados / Backend / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [ ] Etapa 1: decidir como o script lê os dados — leitura textual com regex (como os scripts ad hoc já fizeram) ou import dinâmico dos módulos. Registrar o motivo da escolha, porque isso define o custo de manutenção quando o formato do catálogo mudar.
- [ ] Etapa 2: implementar as quatro famílias de verificação, com mensagem de erro útil.
- [ ] Etapa 3: encadear no `build` e confirmar que passa com o conteúdo atual.
- [ ] Etapa 4: quebrar um id de propósito, confirmar a falha, reverter.
- [ ] Etapa 5: documentar em `AGENTS.md`.

## Estratégia de testes

- [ ] Unitários/Integração/E2E — não aplicável.
- [x] Manual — build limpo com o conteúdo atual e build falhando com um id inválido introduzido de propósito, em cada uma das quatro famílias de referência.

## Riscos e rollback

Risco: um script frouxo passa a dar falsa segurança — se ele não falhar de verdade, ninguém percebe, e passa a impressão de que a integridade está coberta. Mitigação: o CA-03 exige demonstrar a falha, em cada família. Rollback: remover o script e o encadeamento no `build`; nada em `src/` depende dele.

## Registro de execução
### Alterações realizadas
### Arquivos principais
### Decisões
### Divergências
### Pendências

## Validação
Comandos e resultados.

## Handoff
Link para o handoff ativo, quando aplicável.
