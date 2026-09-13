---
id: TASK-015
title: "UI: toggle/slider de comparação desgaste vs. novo"
status: backlog
type: feature
owner:
created_at: 2026-09-13
updated_at: 2026-09-13
affected_modules: [react-ui]
related_use_cases: []
related_adrs: [ADR-007]
---

# TASK-015 — UI: toggle/slider de comparação desgaste vs. novo

## Contexto

Parte 2/2 de `ADR-007`. Depende do campo `wear` de `TASK-014` já existir em `Part` para as 5 peças iniciais.

## Objetivo

Construir o controle de comparação (toggle ou slider — decidir na implementação qual fica mais claro) dentro do `PartDetail` (`src/App.tsx`), e as ilustrações SVG "desgastadas" correspondentes em `src/components/PartSketch.tsx`, para as mesmas 5 peças de `TASK-014`.

## Fora de escopo

- Definir o conteúdo/campo `wear` — é `TASK-014`.
- Ilustrar as demais 29 peças — só as 5 do subconjunto inicial.

## Comportamento atual

`PartSketch` (`src/components/PartSketch.tsx`) exporta `export default function PartSketch({ system, partId }: PartSketchProps)`, que resolve `id = partId ?? primaryPart[system]` e renderiza um `<PartShape id={...}>` — um `switch` sobre `id` com um caso por peça (ou `default` genérico). `PartDetail` (`App.tsx`) renderiza `<PartSketch system={part.system} partId={part.id}/>` dentro de `.part-illustration`, sem nenhum controle de variante hoje.

## Comportamento esperado

- `PartSketch` ganha um prop novo, ex. `variant?: 'normal' | 'worn'` (default `'normal'`), passado adiante para `PartShape`.
- Para as 5 peças com `part.wear` definido (`TASK-014`), `PartShape` ganha uma versão "desgastada" do desenho SVG já existente (reaproveitando as mesmas primitivas/estilo — `var(--part-fill)`, `strokeOpacity`, etc. — só alterando o que representa desgaste: ex. sulcos mais rasos no pneu, material mais fino na pastilha).
- `PartDetail` mostra um controle (toggle/slider) só quando `part.wear` existe, alternando entre `variant="normal"` e `variant="worn"`, com os rótulos de `part.wear.normalLabel`/`wornLabel`.
- Peças sem `part.wear` não mostram nenhum controle (nem um espaço vazio/quebrado) — `PartDetail` já teria essa checagem condicional.

## Regras de negócio

- RN-01: o controle só aparece quando a peça tem `wear` definido — nunca um controle "morto" ou desabilitado.
- RN-02: acessibilidade consistente com o resto do app (o toggle de "Carroceria" em `App.tsx` e as abas de `PartDetail` já estabelecem o padrão de `aria-pressed`/`role` a seguir).
- RN-03: a ilustração "desgastada" não pode parecer alarmista — mesmo cuidado de tom das descrições textuais de `TASK-014`.

## Critérios de aceitação

- [ ] CA-01: `PartSketch` aceita `variant` e renderiza a versão certa.
- [ ] CA-02: as 5 peças de `TASK-014` têm ilustração "desgastada" distinta da normal, no mesmo estilo visual do resto do app.
- [ ] CA-03: o controle aparece em `PartDetail` só para as 5 peças com `wear` definido; as demais 29 não mostram nada relacionado.
- [ ] CA-04: alternar o controle troca a ilustração e, se aplicável, o texto (`wear.description`) sem recarregar a página.
- [ ] CA-05: `npm run build` passa sem erros.
- [ ] CA-06: verificação de acessibilidade (teclado, `aria-pressed`/role) consistente com os outros controles do app.

## Impacto técnico

### Frontend
`src/components/PartSketch.tsx` (prop `variant`, 5 casos novos de `PartShape`), `src/App.tsx` (`PartDetail`, controle novo condicional).

### Banco de dados / Backend / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [ ] Etapa 1: adicionar o prop `variant` a `PartSketch`/`PartShape`.
- [ ] Etapa 2: desenhar as 5 versões "desgastadas", uma de cada vez, comparando visualmente com a versão normal.
- [ ] Etapa 3: construir o controle em `PartDetail`, condicionado a `part.wear`.
- [ ] Etapa 4: verificar as 5 peças com o controle e confirmar que as demais 29 não mostram nada.

## Estratégia de testes

- [ ] Unitários/Integração/E2E — não aplicável.
- [x] Manual — alternar o controle nas 5 peças; abrir peças sem `wear` para confirmar ausência do controle; navegação por teclado do controle novo.

## Riscos e rollback

Risco: ilustração "desgastada" pouco distinguível da normal (perde o propósito) ou exagerada demais (parece diagnóstico). Calibrar visualmente. Rollback: remover o prop `variant` novo e o controle de `PartDetail` — `PartSketch` volta a se comportar exatamente como hoje.

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
