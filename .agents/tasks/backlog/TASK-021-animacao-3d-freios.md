---
id: TASK-021
title: "Animação do sistema de freios no modelo 3D"
status: backlog
type: feature
owner:
created_at: 2026-09-13
updated_at: 2026-09-13
affected_modules: [three-scene]
related_use_cases: []
related_adrs: [ADR-005]
---

# TASK-021 — Animação do sistema de freios no modelo 3D

## Contexto

O `ADR-005` previa, na seção "Revisão": _"Reavaliar quais outros sistemas ganham animação própria depois desta primeira rodada, com base no que ficar visualmente convincente."_ A `TASK-011` entregou três sistemas (`cooling`, `suspension`, `engine`) e registrou `brakes` como o candidato natural seguinte, porque o agrupamento das rodas em `THREE.Group` criou a peça que faltava.

Task criada sem ADR: a decisão arquitetural — animar por sistema selecionado, respeitando `prefers-reduced-motion` — já está tomada no `ADR-005`. Esta task aplica o padrão a mais um sistema.

## Problema

Ao selecionar "Freios", a cena fica parada. É o sistema com o movimento mais didático que ainda não foi animado: a pinça apertando o disco é exatamente o mecanismo que o `MechanismLab` já explica em 2D no modo `brakes`.

## Objetivo

Selecionar "Freios" no modelo 3D mostra a frenagem acontecendo: o disco girando e a pinça apertando.

## Fora de escopo

- Os demais sistemas sem animação (`electrical`, `transmission`, `fuel`) — se algum ficar convincente, é task própria.
- `MechanismLab.tsx`.
- Mudar limites de câmera ou o pipeline de render.

## Comportamento atual

O loop `render()` anima três sistemas (`cooling`, `suspension`, `engine`), lendo `props.current.activeSystem`. As peças que giram solidárias ao cubo — incluindo o `brake-disc` — já estão agrupadas num `THREE.Group` por roda (`wheels`), criado pela `TASK-011`. A pinça (`brake-caliper`) e a pastilha (`brake-pad`) ficaram deliberadamente fora do grupo, por serem ancoradas ao chassi.

## Comportamento esperado

- Com `brakes` selecionado, as rodas giram (o disco gira junto, já que faz parte do grupo) e a pastilha/pinça mostram o aperto — um deslocamento pequeno e cíclico contra a face do disco.
- A decisão de como representar o aperto é da implementação: pode ser o giro desacelerando em ciclos enquanto a pastilha encosta, ou um movimento curto da pinça. O critério é ser legível sem parecer defeito.
- O movimento para quando outro sistema é selecionado, como nos demais.

## Regras de negócio

- RN-01 (`ADR-005`): só o sistema selecionado se move; nada de movimento ambiente.
- RN-02: `prefers-reduced-motion` desabilita, usando a checagem que a cena já tem.
- RN-03 (invariante de `docs/modules/car-scene.md`, da `TASK-011`): antes de animar, confirmar que a peça não está ocluída nas vistas padrão — foi o que obrigou a colmeia do radiador a virar semitransparente para a ventoinha aparecer. A pinça fica na face interna da roda e pode ter o mesmo problema.
- RN-04: a animação não pode sugerir defeito — o aperto é o funcionamento normal do freio, não desgaste (Constituição: sinais não são diagnóstico).
- RN-05: seleção de peça por clique continua funcionando em disco, pastilha e pinça.

## Critérios de aceitação

- [ ] CA-01: com `brakes` selecionado, há movimento visível representando a frenagem.
- [ ] CA-02: o movimento para ao selecionar outro sistema.
- [ ] CA-03: `prefers-reduced-motion` desabilita a animação.
- [ ] CA-04: a peça animada é de fato visível nas vistas padrão — verificado, não presumido.
- [ ] CA-05: clicar em disco, pastilha e pinça continua selecionando a peça certa.
- [ ] CA-06: os três sistemas já animados não regridem.
- [ ] CA-07: `npm run build` passa sem erros.

## Impacto técnico

### Frontend
`src/components/CarScene.tsx` — mais um ramo na animação condicionada e, se o aperto exigir, agrupar pinça/pastilha num `THREE.Group` pelo mesmo padrão de `attach()` usado nas rodas.

### Banco de dados / Backend / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [ ] Etapa 1: verificar a visibilidade da pinça e da pastilha nas três vistas antes de desenhar qualquer movimento (RN-03).
- [ ] Etapa 2: decidir a representação do aperto e implementá-la.
- [ ] Etapa 3: medir que o movimento chega à tela, comparando o framebuffer entre frames (`gl.readPixels`) — captura de tela sozinha não provou nada na `TASK-011`.
- [ ] Etapa 4: conferir clique nas três peças de freio e ausência de regressão nos sistemas já animados.

## Estratégia de testes

- [ ] Unitários/Integração/E2E — não aplicável.
- [x] Manual — selecionar freios e observar; comparar com um sistema sem animação como controle; `prefers-reduced-motion`; clique nas peças.

## Riscos e rollback

Risco principal: repetir o erro da ventoinha — animar algo que o usuário não vê. A pinça fica na face interna da roda, atrás dos raios, e a verificação precisa ser medida, não presumida. Rollback: remover o ramo da animação e, se houver, o agrupamento novo.

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
