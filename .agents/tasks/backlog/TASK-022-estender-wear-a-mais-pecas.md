---
id: TASK-022
title: "Estender a comparação de desgaste a mais peças"
status: backlog
type: feature
owner:
created_at: 2026-09-13
updated_at: 2026-09-13
affected_modules: [content-catalog, react-ui]
related_use_cases: []
related_adrs: [ADR-007]
---

# TASK-022 — Estender a comparação de desgaste a mais peças

## Contexto

O `ADR-007` decidiu que "o campo e o mecanismo de UI são genéricos e valem para qualquer peça", entregando um subconjunto inicial de 5 com o entendimento explícito de que estender às demais é trabalho de conteúdo incremental — "no mesmo espírito em que o catálogo original de 19 peças foi expandido para 34 ao longo de várias tasks (`ADR-003`)".

Task criada sem ADR: a decisão está tomada e o mecanismo existe. É conteúdo mais desenho, no padrão já validado.

## Problema

Cinco das 34 peças têm `wear` (`tire`, `brake-pad`, `brake-disc`, `spark-plug`, `spring`). Peças com desgaste igualmente visual e didático seguem sem a comparação.

## Objetivo

Mais uma leva de peças com `wear` preenchido e ilustração "com uso", mantendo o padrão editorial e visual estabelecido nas `TASK-014` e `TASK-015`.

## Fora de escopo

- Mudar o formato do campo `wear` ou o mecanismo de UI — ambos estão prontos e verificados.
- Cobrir todas as 29 restantes de uma vez. Nem toda peça tem desgaste de leitura visual: a ausência do campo é o caso normal, não dado faltando (`docs/domain/README.md`).
- Reintroduzir a correia dentada, retirada do subconjunto por decisão registrada na emenda do `ADR-007`.

## Comportamento atual

`Part.wear?: { normal, worn, note }`; `PartSketch` aceita `variant`; `PartDetail` mostra o controle só quando a peça tem o campo. Acrescentar uma peça é preencher o campo no catálogo e acrescentar o ramo `worn` no `case` correspondente de `PartShape`.

## Comportamento esperado

- Uma leva nova de peças com `wear` e ilustração "com uso".
- Candidata mais forte, já apontada em `CONTENT_SOURCES.md`: **filtro de ar** (`air-filter`) — desgaste visual direto, elemento filtrante saturado, com fonte própria (`mann-air-filter`).
- Outras a avaliar, cada uma contra a mesma pergunta: *o desgaste desta peça tem leitura visual honesta, ou estaríamos ensinando a julgar pela aparência algo que se avalia de outro jeito?* — foi essa pergunta que tirou a correia dentada do subconjunto.
- Seleção final das peças é parte do trabalho desta task, não uma lista fechada aqui.

## Regras de negócio

- RN-01: cada afirmação visual precisa de lastro no que a peça já diz (`how`/`signs`/`care`) ou em fonte real já citada por ela — sem fonte nova sem necessidade, e sem afirmação apoiada só numa leitura da fonte (foi o que cortou a menção a corrosão na mola).
- RN-02: o `note` é obrigatório e é ele que impede a comparação de virar diagnóstico.
- RN-03: a ilustração "com uso" mostra menos material, nunca dano — sem vermelho, ícone de alerta ou contorno deformado.
- RN-04: nenhuma peça existente tem texto alterado; a mudança é aditiva.

## Critérios de aceitação

- [ ] CA-01: as peças escolhidas têm `wear` com os três campos preenchidos.
- [ ] CA-02: cada uma tem ilustração "com uso" distinta, no estilo do resto do app.
- [ ] CA-03: nenhuma afirmação sem lastro no texto da peça ou em fonte já citada por ela.
- [ ] CA-04: o critério de seleção de cada peça está registrado — por que entrou, e por que alguma candidata avaliada ficou de fora.
- [ ] CA-05: peças sem `wear` continuam sem qualquer resquício do controle.
- [ ] CA-06: `npm run build` passa sem erros e `git diff` em `parts.ts` é puramente aditivo.

## Impacto técnico

### Frontend
`src/data/parts.ts` (campo em mais peças), `src/components/PartSketch.tsx` (ramo `worn` nos `case` correspondentes), `CONTENT_SOURCES.md`.

### Banco de dados / Backend / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [ ] Etapa 1: listar candidatas e aplicar a pergunta da RN-03 a cada uma, registrando as recusadas junto com o motivo.
- [ ] Etapa 2: escrever o `wear` das escolhidas, relendo `how`/`signs`/`care` de cada uma antes.
- [ ] Etapa 3: desenhar as variantes `worn`.
- [ ] Etapa 4: verificar no navegador e atualizar `CONTENT_SOURCES.md`.

## Estratégia de testes

- [ ] Unitários/Integração/E2E — não aplicável.
- [x] Manual — alternar o controle em cada peça nova; conferir que peças sem o campo seguem sem controle; releitura cruzada do texto contra os campos da peça.

## Riscos e rollback

Risco: escolher uma peça cujo desgaste não se julga pela aparência e ensinar o contrário do catálogo — exatamente o que aconteceu com a correia dentada na `TASK-014`, pego a tempo. Mitigação: a pergunta da Etapa 1, aplicada antes de escrever qualquer texto. Rollback: remover o campo das peças novas e os ramos `worn` correspondentes; é aditivo.

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
