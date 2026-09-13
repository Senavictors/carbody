---
id: TASK-012
title: "Conteúdo: glossário de termos técnicos"
status: completed
type: feature
owner:
created_at: 2026-09-13
updated_at: 2026-09-13
affected_modules: [content-catalog]
related_use_cases: []
related_adrs: [ADR-006]
---

# TASK-012 — Conteúdo: glossário de termos técnicos

## Contexto

Parte 1/2 de `ADR-006`. Precede `TASK-013` (a página que renderiza este conteúdo).

## Objetivo

Criar um array novo em `src/data/parts.ts` (ou um arquivo próprio, ex. `src/data/glossary.ts` — decidir na implementação qual organização é mais limpa, já que hoje `parts.ts` já é um arquivo grande) com termos técnicos usados no catálogo e suas definições em português, no mesmo tom didático já estabelecido.

## Fora de escopo

- A página/UI que consome esse conteúdo — é `TASK-013`.
- Gerar os termos automaticamente a partir do texto das peças (decisão do `ADR-006`: conteúdo curado à parte).

## Comportamento esperado

- Uma lista de termos, cada um com: `id` (slug), `term` (o termo em si), `definition` (explicação curta, didática), e opcionalmente `relatedParts` (ids de `Part` onde o termo aparece, para eventual navegação cruzada).
- Cobrir pelo menos os termos usados nas 34 peças que um iniciante provavelmente não conhece: torque, combustão, rotação/RPM, hidráulico, viscosidade, oxidação, amortecimento, tração, embreagem (como conceito, não a peça), ignição, entre outros que aparecerem na releitura do catálogo.
- Mesma regra de fonte: se um termo precisar de uma afirmação técnica nova (além de uma definição de dicionário/didática simples), precisa de `sourceIds` real, igual às peças.

## Regras de negócio

- RN-01 (herdada da Constituição): conteúdo em português brasileiro, sem diagnóstico, termos explicados de forma didática.
- RN-02: nenhuma definição pode contradizer o que já está escrito no texto das peças que usam aquele termo — reler o campo `how`/`function` das peças relacionadas antes de escrever a definição do glossário.

## Critérios de aceitação

- [x] CA-01: array de termos criado — 19 termos, acima da faixa de 10-15 pedida.
- [x] CA-02: cada termo tem definição em pt-BR, tom didático, consistente com o texto das peças relacionadas.
- [x] CA-03: `npm run build` passa sem erros (o tipo do array precisa estar bem formado para `TASK-013` consumir).
- [x] CA-04: nenhuma peça existente foi alterada.

## Impacto técnico

### Frontend
`src/data/parts.ts` ou `src/data/glossary.ts` (novo arquivo — decidir na implementação).

### Banco de dados / Backend / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [x] Etapa 1: reler as 34 peças e listar termos técnicos não explicados de forma autocontida.
- [x] Etapa 2: decidir a organização do arquivo — `src/data/glossary.ts` próprio.
- [x] Etapa 3: escrever as definições.
- [x] Etapa 4: `npm run build`.

## Estratégia de testes

- [x] Unitários/Integração/E2E — não aplicável.
- [x] Manual — releitura cruzada com o texto das peças.

## Riscos e rollback

Risco: um termo definido de forma vaga o suficiente para ficar tecnicamente incorreto — revisar contra o texto das peças relacionadas antes de fechar. Rollback: remover o array/arquivo novo, sem afetar `parts.ts` existente (se organizado em arquivo próprio) ou reverter a adição isolada (se dentro de `parts.ts`).

## Registro de execução

### Alterações realizadas

- `src/data/glossary.ts` — arquivo novo com a interface `GlossaryTerm` (`id`, `term`, `definition`, `relatedParts`, `sourceIds`) e 19 termos, em ordem alfabética por `term`.
- `CONTENT_SOURCES.md` — seção nova registrando o critério de seleção dos termos e a decisão de não cadastrar fonte nova.
- `docs/domain/README.md` — `GlossaryTerm` documentado como entidade do domínio, com as invariantes correspondentes.
- `AGENTS.md` — mapa do repositório: entrada para `glossary.ts` (e correção de "19 peças, 6 sistemas" para os 34/7 atuais, que estava defasado desde o `ADR-003`).
- Papel `content-catalog` atualizado nos dois adaptadores.

### Arquivos principais

- `src/data/glossary.ts` (novo)
- `CONTENT_SOURCES.md`, `docs/domain/README.md`, `AGENTS.md`, `.claude/agents/content-catalog.md` + `.codex/agents/content-catalog.toml`

### Decisões

- **Arquivo próprio (`glossary.ts`) em vez de mais um array em `parts.ts`.** A task deixava a escolha aberta. `parts.ts` já passa de 400 linhas e mistura três exports; o glossário é um segundo tipo de conteúdo, com regras próprias de curadoria, e separá-lo deixa o rollback trivial (apagar um arquivo) e evita conflito com quem estiver editando peças.
- **Nenhuma fonte nova cadastrada.** Cada definição se apoia nas mesmas fontes que já sustentam a peça onde o termo é usado — "pressão hidráulica" cita as Brembo de `brake-fluid`/`brake-caliper`, "sincronismo" cita a Gates de `timing-belt`. Isso satisfaz a regra 1 do papel `content-catalog` sem pesquisa nova, e força o glossário a ser uma segunda forma de dizer o que o catálogo já diz, em vez de uma porta lateral para afirmações sem lastro.
- **Só entraram termos que o usuário encontra de fato.** Varri o texto das 34 peças e o do laboratório de mecanismos procurando cada candidato. Definir uma palavra que não aparece em lugar nenhum seria ruído.
- **Ordem alfabética no próprio array**, para que a `TASK-013` possa renderizar direto sem ordenar — e conferida por script, não no olho.
- **`folga` escrito com cuidado extra.** É o termo mais próximo de virar diagnóstico; a definição termina dizendo explicitamente que, sozinha, não identifica qual componente está envolvido — mesmo padrão do campo `care` de `steering`.

### Divergências

- **`viscosidade` e `oxidação` ficaram de fora**, apesar de a task os listar como candidatos. Nenhum dos dois aparece em `parts.ts` nem no `MechanismLab` — a varredura confirmou zero ocorrências. Entraram no lugar termos que aparecem e são igualmente opacos para um iniciante: `alta tensão`, `banda de rodagem`, `dissipação de calor`, `elemento filtrante`, `folga`, `sistema de carga`, `sincronismo`.
- **`torque` entrou mesmo não aparecendo em `parts.ts`** — é usado no laboratório de mecanismos (modo "Engrenagens"), que também é conteúdo voltado ao usuário. O mesmo vale para `relação de transmissão`.

### Pendências

- `relatedParts` e `sourceIds` são `string[]`, como em `Part` — a existência dos ids é convenção, não garantia de tipo. Validei por script nesta task, mas nada impede uma referência quebrada no futuro. Transformar `sources` em `as const` daria ids literais e checagem em tempo de compilação, mas mudaria a declaração de um export já consumido por `App.tsx` — decisão que merece ser avaliada à parte, não embutida numa task de conteúdo.
- A `TASK-013` precisa decidir o que fazer com `relatedParts`: o campo existe e está preenchido, mas navegar do termo para a peça é escolha de UI.

## Validação

```bash
npm run build
```
Passou sem erros (`tsc -b` + `vite build`). O `glossary.ts` ainda não é importado por ninguém — é esperado, quem consome é a `TASK-013`.

Checagem por script (referências cruzadas), resultado:

```text
termos: 19 | peças no catálogo: 34 | fontes: 40
OK — todos os relatedParts e sourceIds existem, sem duplicados, em ordem alfabética
```

- CA-01: 19 termos — `alta tensão`, `amortecimento`, `atrito`, `banda de rodagem`, `cilindro`, `combustão`, `corrente elétrica`, `dissipação de calor`, `elemento filtrante`, `folga`, `ignição`, `pressão hidráulica`, `relação de transmissão`, `rolamento`, `sincronismo`, `sistema de carga`, `temperatura de trabalho`, `torque`, `tração`.
- CA-02: cada definição foi escrita depois de reler o `function`/`how` das peças em `relatedParts`. Casos em que isso mudou o texto: "pressão hidráulica" reusa o "praticamente não se comprime" de `brake-fluid`; "temperatura de trabalho" evita citar faixa numérica, como `thermostat`; "sincronismo" menciona que alguns projetos usam corrente, como `timing-belt`.
- CA-04: `git diff src/data/parts.ts` vazio — o único arquivo novo em `src/data/` é o `glossary.ts`.

## Handoff
Não aplicável — a task foi executada e verificada em uma única sessão.
