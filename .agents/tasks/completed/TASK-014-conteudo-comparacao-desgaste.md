---
id: TASK-014
title: "Conteúdo: comparação desgaste vs. novo (5 peças iniciais)"
status: completed
type: feature
owner:
created_at: 2026-09-13
updated_at: 2026-09-13
affected_modules: [content-catalog]
related_use_cases: []
related_adrs: [ADR-007]
---

# TASK-014 — Conteúdo: comparação desgaste vs. novo (5 peças iniciais)

## Contexto

Parte 1/2 de `ADR-007`. Precede `TASK-015` (a UI e as ilustrações SVG que consomem este conteúdo).

## Objetivo

Adicionar um campo novo, opcional, à interface `Part` (`src/data/parts.ts`) descrevendo a comparação visual/textual entre o estado normal e desgastado, preenchido para 5 peças iniciais: `tire`, `brake-pad`, `brake-disc`, `timing-belt`, `spring` — escolhidas por já terem `signs` de desgaste bem concretos e visuais no catálogo atual.

## Fora de escopo

- As ilustrações SVG da versão "desgastada" e o toggle/slider de UI — é `TASK-015`.
- Aplicar às demais 29 peças do catálogo — decisão explícita do `ADR-007` de começar por um subconjunto, expandir depois como trabalho de conteúdo incremental.

## Comportamento atual

`Part` (linhas 13-27) não tem nenhum campo relacionado a comparação visual. As 5 peças escolhidas já têm `signs` descrevendo desgaste em texto (ex.: `tire.signs` inclui "Desgaste irregular ou indicador atingido").

## Comportamento esperado

- Novo campo opcional em `Part`, formato a definir nesta task (ex.: `wear?: { normalLabel: string; wornLabel: string; description: string }` — `normalLabel`/`wornLabel` são os rótulos dos dois estados no toggle, `description` explica textualmente o que muda visualmente).
- Preenchido para as 5 peças, com texto que **não** reintroduz diagnóstico nem estatística — descreve o que aparece visualmente diferente (ex.: "sulcos mais rasos e um desgaste mais uniforme na banda de rodagem" para o pneu), consistente com as fontes já citadas em `sourceIds` daquela peça (ex.: Michelin para `tire`, Brembo para `brake-pad`/`brake-disc`).
- Nenhuma fonte nova necessária a princípio — reaproveitar o que as 5 peças já citam; se precisar de uma afirmação não coberta pela fonte existente, seguir a regra normal (fonte real ou não escrever a afirmação).

## Regras de negócio

- RN-01 (herdada da Constituição): a comparação continua sendo exemplo ilustrativo — nunca "isto prova que a peça está no fim da vida útil", sempre "isto é como normalmente aparece desgastado".
- RN-02: o campo é opcional na interface `Part` — as outras 29 peças continuam válidas sem ele (não é obrigatório retroativamente).

## Critérios de aceitação

- [x] CA-01: `Part` tem o campo novo, opcional, com formato definido e documentado (comentário no tipo, se ajudar).
- [x] CA-02: as 5 peças (`tire`, `brake-pad`, `brake-disc`, `timing-belt`, `spring`) têm o campo preenchido.
- [x] CA-03: nenhuma afirmação nova sem lastro na fonte já citada pela peça.
- [x] CA-04: `npm run build` passa sem erros.
- [x] CA-05: as demais 29 peças continuam válidas (campo opcional, sem quebrar o tipo).

## Impacto técnico

### Frontend
`src/data/parts.ts` — novo campo na interface `Part` + preenchimento em 5 entradas.

### Banco de dados / Backend / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [x] Etapa 1: definir o formato exato do campo — `{ normal, worn, note }`.
- [x] Etapa 2: reler o que cada peça já afirma (e que suas fontes já sustentam) sobre aparência de desgaste.
- [x] Etapa 3: escrever o campo para as 5 peças.
- [x] Etapa 4: `npm run build`.

## Estratégia de testes

- [x] Unitários/Integração/E2E — não aplicável.
- [x] Manual — releitura contra as fontes já citadas, checagem de tom (sem diagnóstico).

## Riscos e rollback

Risco: descrever o desgaste de forma específica demais pode parecer diagnóstico — revisar tom com cuidado, mesmo padrão já usado em `signs`. Rollback: remover o campo das 5 peças e do tipo `Part` (é aditivo e opcional, não quebra nada existente).

## Registro de execução

### Alterações realizadas

- `Part` ganhou `wear?: { normal: string; worn: string; note: string }`, com comentário no tipo explicando que é exemplo editorial e nunca diagnóstico.
- Campo preenchido em `tire`, `brake-pad`, `brake-disc`, `timing-belt` e `spring`. As outras 29 peças não foram tocadas.
- `CONTENT_SOURCES.md` — seção nova com o critério de derivação das afirmações, o papel do `note` e a tensão registrada na correia dentada.
- `docs/domain/README.md` — `wear` na descrição de `Part` e duas invariantes novas.
- Papel `content-catalog` atualizado nos dois adaptadores.

### Arquivos principais

- `src/data/parts.ts` (32 linhas, todas adição)
- `CONTENT_SOURCES.md`, `docs/domain/README.md`, `.claude/agents/content-catalog.md` + `.codex/agents/content-catalog.toml`, `.agents/context/CONTEXT.md`

### Decisões

- **Formato `{ normal, worn, note }`, sem rótulos de UI.** A task sugeria `{ normalLabel, wornLabel, description }`. Os rótulos do toggle são os mesmos para qualquer peça e são decisão de interface, não de conteúdo — deixá-los no dado seria repetir "Nova"/"Com uso" cinco vezes e dar ao `content-catalog` uma responsabilidade de UI. Em troca, `description` virou dois campos: descrever o estado bom e o estado com uso separadamente é o que a `TASK-015` precisa para rotular os dois lados da comparação.
- **`note` é obrigatório dentro de `wear`, não opcional.** É o campo que impede a comparação de virar diagnóstico, repetindo no contexto visual a ressalva que o `care` daquela peça já faz. Deixá-lo opcional convidaria a preencher só os dois primeiros e perder a proteção editorial exatamente onde ela é mais necessária.
- **Nenhuma fonte nova.** Cada afirmação visual foi derivada do que a própria peça já diz em `how`, `signs` ou `care` — texto que os `sourceIds` dela já cobrem. Mesmo princípio adotado no glossário (`TASK-012`).
- **Uma frase foi cortada por falta de lastro.** A primeira versão do `worn` da mola mencionava pontos de corrosão no revestimento. É verdade em geral e a Monroe trata disso, mas não está em nenhum campo da peça, então seria afirmação nova apoiada numa leitura minha da fonte. Reescrevi em torno do que `signs` já afirma: o sinal aparece na altura do carro antes de aparecer na mola.

### Divergências

- **A correia dentada é um caso problemático dentro do subconjunto escolhido, e isso não estava previsto.** O catálogo diz que ela "pode se deteriorar sem dar um aviso claro" e que não se deve esperar sintoma para trocá-la. Uma comparação visual sugere o oposto — que dá para julgar pela aparência. Escrevi o texto para desfazer isso (`worn` diz que a correia pode chegar ao fim do prazo com boa aparência; `note` diz que é a peça em que a aparência menos ajuda), mas o texto só resolve metade: a ilustração da `TASK-015` ainda pode ensinar o contrário. Registrado em `CONTENT_SOURCES.md` e no `CONTEXT.md` para quem for desenhar.
- O escopo de 5 peças continua sendo o do `ADR-007` — decisão de planejamento, não escolha explícita do usuário, como o próprio ADR sinaliza. Não expandi nem reduzi por conta própria.

### Pendências

- **Trocar ou remover a correia dentada do subconjunto** é uma decisão do usuário. Se a comparação visual dela for considerada mais arriscada que útil, as candidatas naturais para ocupar o lugar são a vela de ignição — que tem fonte dedicada a desgaste (`denso-spark-wear`), hoje o único `sourceId` do catálogo especificamente sobre aparência de peça gasta — e o filtro de ar.
- Estender `wear` às demais peças é trabalho de conteúdo incremental, como o `ADR-007` previu.

## Validação

```bash
npm run build
```
Passou sem erros (`tsc -b` + `vite build`).

Checagem por script:

```text
peças no catálogo: 34
peças com wear: 5 -> timing-belt, brake-pad, brake-disc, spring, tire
subconjunto exatamente como a task especifica
blocos wear bem formados: 5
nenhuma formulação de diagnóstico encontrada
peças sem wear: 29 (esperado 29)
```

- CA-02/CA-05: o script confere que as 5 peças certas têm o campo e que as outras 29 seguem sem ele; `git diff --stat` mostra **32 inserções e 0 remoções** em `parts.ts`, ou seja, a mudança é puramente aditiva e nenhum texto existente foi alterado.
- CA-03: cada uma das 15 frases foi escrita a partir de um campo já existente da peça. Rastreamento: pneu — `how` ("sulcos ajudam a escoar água") e `signs` ("desgaste irregular ou indicador atingido"); pastilha — `how` ("o material de atrito se consome com o uso") e `signs` ("aviso de desgaste, se equipado"); disco — `signs` ("sulcos ou espessura insuficiente na inspeção"); correia — `summary` ("pode se deteriorar sem dar um aviso claro"); mola — `signs` ("carro mais baixo de um lado", "dano identificado na inspeção"). Os três `note` reproduzem a ressalva do `care` da própria peça.
- Tom: o script também varre o texto novo atrás de formulações de diagnóstico ("significa que", "comprova", "prova que", "precisa trocar", "sempre indica") — nenhuma encontrada.

## Handoff
Não aplicável — a task foi executada e verificada em uma única sessão.
