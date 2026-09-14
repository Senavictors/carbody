---
id: TASK-015
title: "UI: toggle/slider de comparação desgaste vs. novo"
status: completed
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

- [x] CA-01: `PartSketch` aceita `variant` e renderiza a versão certa.
- [x] CA-02: as 5 peças de `TASK-014` têm ilustração "desgastada" distinta da normal, no mesmo estilo visual do resto do app.
- [x] CA-03: o controle aparece em `PartDetail` só para as 5 peças com `wear` definido; as demais 29 não mostram nada relacionado.
- [x] CA-04: alternar o controle troca a ilustração e o texto sem recarregar a página.
- [x] CA-05: `npm run build` passa sem erros.
- [x] CA-06: verificação de acessibilidade (teclado, `aria-pressed`/role) consistente com os outros controles do app.

## Impacto técnico

### Frontend
`src/components/PartSketch.tsx` (prop `variant`, 5 casos novos de `PartShape`), `src/App.tsx` (`PartDetail`, controle novo condicional).

### Banco de dados / Backend / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [x] Etapa 1: adicionar o prop `variant` a `PartSketch`/`PartShape`.
- [x] Etapa 2: desenhar as 5 versões "desgastadas", uma de cada vez, comparando visualmente com a versão normal.
- [x] Etapa 3: construir o controle em `PartDetail`, condicionado a `part.wear`.
- [x] Etapa 4: verificar as 5 peças com o controle e confirmar que as demais 29 não mostram nada.

## Estratégia de testes

- [x] Unitários/Integração/E2E — não aplicável.
- [x] Manual — alternar o controle nas 5 peças; abrir peças sem `wear` para confirmar ausência do controle; navegação por teclado do controle novo.

## Riscos e rollback

Risco: ilustração "desgastada" pouco distinguível da normal (perde o propósito) ou exagerada demais (parece diagnóstico). Calibrar visualmente. Rollback: remover o prop `variant` novo e o controle de `PartDetail` — `PartSketch` volta a se comportar exatamente como hoje.

## Registro de execução

### Alterações realizadas

- `PartSketch` ganhou `variant?: SketchVariant` (`'normal' | 'worn'`, default `'normal'`), repassado a `PartShape`, que expõe um booleano `worn` para os `case` usarem.
- Cinco desenhos ganharam variante, cada um alterando só o traço que representa o desgaste, sem mexer na silhueta:
  - **pneu** — sulcos radiais mais curtos e com menos opacidade, e um a cada quatro ainda mais raso, para ler como desgaste desigual;
  - **pastilha** — o contorno interno se aproxima do externo, deixando a camada de atrito visivelmente mais fina sobre a mesma base;
  - **disco** — três círculos finos na área de contato (os sulcos) e um anel na borda, marcando o degrau onde a pastilha não alcança;
  - **vela** — eletrodo central mais curto e o lateral mais recuado, aumentando a folga entre eles, com alguns pontos de depósito na ponta;
  - **mola** — mesma quantidade de espiras, comprimidas numa altura menor, com uma linha tracejada leve onde ficava o topo.
- `PartDetail` ganhou `wearView`, resetado para `'normal'` no mesmo `useEffect` que já zerava a aba ao trocar de peça, e um bloco `.wear-compare` renderizado só quando `part.wear` existe.
- `src/styles.css` — `.wear-compare`, `.wear-toggle`, `.wear-copy`, `.wear-note`, usando as variáveis já definidas em `:root`.

### Arquivos principais

- `src/components/PartSketch.tsx`, `src/App.tsx`, `src/styles.css`
- `docs/architecture/components.md`, `.claude/agents/react-ui.md` + `.codex/agents/react-ui.toml`, `.agents/context/CONTEXT.md`

### Decisões

- **Toggle de dois botões, não slider.** A task deixava a escolha aberta. Um slider sugere estados intermediários — "meio gasto" —, que é exatamente a leitura que a `TASK-014` evitou no texto: a comparação mostra dois exemplos, não uma escala de quanto a peça já andou. Dois botões deixam isso explícito, e reusam o padrão de `aria-pressed` que o app já tem.
- **Rótulos "Em bom estado" / "Com uso", fixos na UI.** Consequência do formato escolhido na `TASK-014`: os rótulos são iguais para qualquer peça e não pertencem ao conteúdo. "Com uso" em vez de "Desgastada" é deliberado — descreve o que aconteceu, não emite um veredito sobre a peça.
- **O `note` fica visível nos dois estados.** Ele poderia aparecer só no estado "com uso", mas a ressalva vale para a comparação inteira, não só para metade dela.
- **Variação por traço, nunca por cor ou silhueta.** Nenhuma versão "com uso" usa vermelho, ícone de alerta ou contorno deformado — o desgaste aparece como menos material, não como dano. É o que mantém a ilustração longe do tom alarmista que a RN-03 proíbe.
- **O texto que muda é uma live region (`aria-live="polite"`).** Sem isso, quem usa leitor de tela ouviria o botão mudar de estado sem receber o texto novo, que é o conteúdo real da comparação.

### Divergências

- **A task cita `wear.normalLabel`/`wear.wornLabel`/`wear.description`, campos que não existem.** A `TASK-014` definiu o formato como `{ normal, worn, note }`, tirando os rótulos do dado (são decisão de UI) e dividindo a descrição em dois textos, um por estado. A UI foi construída sobre o formato real: rótulos fixos no componente, `normal`/`worn` alternando com o botão e `note` sempre visível.
- **O subconjunto tem vela de ignição no lugar da correia dentada**, por decisão do usuário registrada como emenda no `ADR-007` — a task e seu snapshot ainda listam a correia.

### Pendências

- Estender `wear` (conteúdo e desenho) às demais peças segue como trabalho incremental, previsto pelo `ADR-007`. O mecanismo agora é genérico: basta preencher o campo no catálogo e acrescentar o `worn` no `case` correspondente de `PartShape`.
- As ilustrações "com uso" não aparecem na biblioteca (`library-drawing`) nem em nenhum outro lugar além do `PartDetail` — o prop tem default `'normal'`, então todos os outros usos seguem inalterados. Foi a escolha conservadora; se fizer sentido mostrar a comparação em outro lugar, é só passar o prop.

## Validação

```bash
npm run build
```
Passou sem erros (`tsc -b` + `vite build`).

Verificação no navegador (`npm run dev`, http://localhost:5173), abrindo cada peça pela biblioteca:

| peça | controle | desenho muda ao alternar |
|---|---|---|
| Pneu | sim | sim |
| Pastilha de freio | sim | sim |
| Disco de freio | sim | sim |
| Vela de ignição | sim | sim |
| Mola da suspensão | sim | sim |
| Correia dentada (sem `wear`) | **não** | — |
| Bateria de 12 volts (sem `wear`) | **não** | — |

- CA-03: nas duas peças sem `wear`, além de o bloco não existir, `document.querySelectorAll('.wear-toggle, .wear-copy, .wear-note').length` é `0` — nenhum elemento órfão ou espaço reservado. A correia dentada é o caso mais informativo aqui: ela **tinha** o campo antes da emenda do `ADR-007`, e a UI passou a ignorá-la sem nenhum resíduo.
- CA-04: alternar troca a ilustração (comparação do `outerHTML` do SVG antes e depois) e o texto, sem recarregar.
- CA-06: o grupo é `role="group"` com `aria-label` contextual ("Comparar a pastilha em bom estado e com uso"); os dois botões têm `tabIndex` 0 e recebem foco; `aria-pressed` alterna corretamente; o parágrafo que muda tem `aria-live="polite"`.
- Console do navegador sem erros.

## Handoff
Não aplicável — a task foi executada e verificada em uma única sessão.
