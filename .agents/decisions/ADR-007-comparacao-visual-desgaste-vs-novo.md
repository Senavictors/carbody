---
id: ADR-007
title: Comparação visual "desgaste vs. novo" via campo novo em Part
status: accepted
date: 2026-09-13
deciders: [Senavictors]
related_tasks: [TASK-014, TASK-015]
---

# ADR-007 — Comparação visual "desgaste vs. novo" via campo novo em Part

## Contexto

O catálogo já descreve sinais de desgaste em texto (`Part.signs`), mas não tem nenhuma comparação visual. Um toggle/slider mostrando o aspecto normal vs. desgastado de uma peça reforça o mesmo conteúdo de forma mais concreta, sem virar diagnóstico (a Constituição exige que sinais continuem sendo exemplos ilustrativos, nunca prova de defeito).

## Decisão

Adicionar um campo novo à interface `Part` (ex.: `wear?: { normal: <descrição/id de ilustração>; worn: <descrição/id de ilustração> }`, formato exato a definir na implementação) e renderizar como toggle/slider dentro do `PartDetail` (`App.tsx`), reaproveitando o estilo SVG já usado por `PartSketch.tsx`.

**Decisão de escopo, sinalizada explicitamente aqui por não ter sido resolvida na pergunta ao usuário**: a opção de aplicar só a um subconjunto curado (3 peças) não foi escolhida nem recusada — o usuário selecionou apenas a abordagem A. Interpretando a ausência de restrição de escopo como "aplicar ao catálogo todo" e considerando que ilustrar as 34 peças de uma vez é um volume de trabalho de design muito maior que o resto desta iniciativa, a decisão desta ADR é: **o campo e o mecanismo de UI são genéricos e valem para qualquer peça**, mas a primeira entrega (`TASK-014`) cobre um subconjunto inicial representativo (peças com desgaste visualmente didático: pneu, pastilha de freio, disco de freio, correia dentada, mola), com o entendimento de que estender às demais peças é trabalho de conteúdo incremental subsequente, no mesmo espírito em que o catálogo original de 19 peças foi expandido para 34 ao longo de várias tasks (`ADR-003`) — não uma limitação técnica.

## Alternativas consideradas

### Alternativa C — Fotos/ilustrações reais em vez de SVG
Mais realista, mas foge do estilo 100% vetorial minimalista já estabelecido (`PartSketch.tsx`, todo o resto do app) e introduz uma categoria de cuidado nova (licenciamento de imagem de terceiro) que a Constituição não previa. Não escolhida.

## Consequências

### Positivas
- Reforça `signs` com uma comparação visual concreta, sem introduzir nenhuma alegação nova sem fonte (a comparação ilustra o que o texto já diz, não adiciona afirmação técnica nova).
- Mecanismo genérico (campo opcional em `Part`) permite expandir peça por peça sem mudança de arquitetura depois.

### Negativas
- Peças sem o campo `wear` preenchido não mostram a comparação — UI precisa lidar bem com a ausência (não pode parecer erro).
- Cada ilustração "desgastada" é trabalho de design manual, não gerado automaticamente.

### Riscos
- Uma ilustração de desgaste mal calibrada pode parecer alarmista ou sugerir um nível de dano específico (contradiz "sinais não são diagnóstico") — revisar tom junto do papel `content-catalog`.

## Plano de adoção

- `TASK-014` (`content-catalog`) — define o formato do campo `wear` e cria as ilustrações/descrições para o subconjunto inicial (pneu, pastilha de freio, disco de freio, correia dentada, mola).
- `TASK-015` (`react-ui`) — constrói o toggle/slider no `PartDetail`, com fallback claro quando a peça não tem `wear` definido.

## Validação

`npm run build` sem erros; verificação visual do toggle nas peças do subconjunto inicial; confirmar que uma peça sem `wear` não quebra nem mostra um controle vazio/quebrado.

## Emenda (2026-09-13) — vela de ignição no lugar da correia dentada

Durante a `TASK-014` ficou evidente que a correia dentada não cabe numa comparação visual: o catálogo diz que ela "pode se deteriorar sem dar um aviso claro" e que não se deve esperar sintoma para trocá-la, enquanto uma comparação "em bom estado × com uso" sugere justamente que dá para julgar pela aparência. O texto do campo `wear` foi escrito para desfazer isso, mas a ilustração prevista para a `TASK-015` continuaria podendo ensinar o contrário.

**Decisão do usuário, tomada explicitamente após a `TASK-014`**: a correia dentada sai do subconjunto inicial e entra a vela de ignição. O subconjunto passa a ser pneu, pastilha de freio, disco de freio, **vela de ignição** e mola.

A vela é o caso mais seguro do catálogo para esta feature: seu campo `how` já descreve a distância que a eletricidade atravessa entre os eletrodos, e o desgaste é exatamente o aumento gradual dessa distância — visual, didático e diretamente derivável do texto existente. É também a única peça do catálogo com uma fonte dedicada a aparência de desgaste (`denso-spark-wear`).

A correia dentada continua no catálogo normalmente, apenas sem o campo `wear` — ausência que é o caso normal para 29 das 34 peças.

## Revisão

Reavaliar a extensão para as demais peças do catálogo como trabalho de conteúdo incremental, task por task, não nesta ADR.
