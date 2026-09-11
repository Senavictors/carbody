---
id: TASK-007
title: "Geometria: 9 peças novas que completam sistemas existentes"
status: active
type: feature
owner: three-scene (subagent)
created_at: 2026-09-11
updated_at: 2026-09-11
affected_modules: [three-scene]
related_use_cases: []
related_adrs: [ADR-003]
---

# TASK-007 — Geometria: 9 peças novas que completam sistemas existentes

## Contexto

Parte da trilha "geometria" de `ADR-003`, par de `TASK-004` (conteúdo). As 9 peças da tabela abaixo precisam de representação 3D nova em `CarScene.tsx`, usando os helpers já existentes (`box`, `cyl`, `torus`, `tube`).

## Objetivo

Modelar as 9 peças, cada uma com `userData.part` igual ao id fixado em `ADR-003`/`TASK-004`, ancoradas perto do bloco de código onde a área correspondente já é construída.

| id (igual a `TASK-004`) | Sistema | Âncora de posição sugerida (coordenadas já existentes próximas) |
|---|---|---|
| `air-filter` | `engine` | Perto do bloco do motor (`CarScene.tsx:206-208`, x ≈ -1.8 a -1.5, y ≈ .9-1.1) — uma caixa achatada representando a caixa do filtro de ar, no lado de admissão. |
| `accessory-belt` | `engine` | Entre a polia do virabrequim (região do bloco do motor) e o alternador (`[-1.99, .64, .4]`, linha 266) — um laço de correia adicional, seguindo o padrão de `tube` fechado já usado na correia dentada (linha 228). |
| `parking-brake` | `brakes` | Console central da cabine (perto de `[.1, .6, 0]`, linha 286) — uma pequena alavanca genérica entre os bancos. |
| `brake-caliper` | `brakes` | Mesma posição de `brake-disc`/`brake-pad` (`discZ`, linha 180, com as duas peças logo depois em 181-187) — uma carcaça envolvendo parte do disco, hoje só sugerida implicitamente pela pastilha. |
| `ignition-coil` | `electrical` | Sobre o cabeçote, perto das velas (`x = -1.84 + i*.232`, loop começando em 209, vela em 212, y ≈ 1.2) — um pequeno bloco por cilindro ou um bloco único cobrindo os 4. |
| `fuses` | `electrical` | Perto da bateria (`[-1.26, .9, -.68]`, linha 262) — uma caixa pequena com tampa, no vão do motor. |
| `wheel-bearing` | `suspension` | Dentro do cubo da roda (mesma região dos hub caps, linha ~173-174) — um anel/disco fino, parcialmente oculto atrás da tampa do cubo já existente. |
| `sway-bar` | `suspension` | Uma barra fina conectando as duas mangas de eixo dianteiras (região da bandeja/`tube` de suspensão, linha 189) — usar `tube`/`cyl` reto atravessando o eixo X entre `x=-1.68` e `x=1.68` (ou só no eixo dianteiro, a decidir na implementação). |
| `coolant-reservoir` | `cooling` | Perto do topo do radiador (`[-2.17, 1.055, 0]`, linha 241) — uma caixa pequena semitransparente (`opacity` reduzida, como já usado em `brake-fluid`). |

## Fora de escopo

- Conteúdo/catálogo — é `TASK-004`.
- Geometria do sistema de combustível — é `TASK-008`.
- Otimização para mobile — decisão já registrada em `ADR-002`, continua valendo.

## Comportamento esperado

Cada peça nova segue o padrão já estabelecido: construída via `box`/`cyl`/`torus`/`tube` com `system`/`part` preenchidos (entra em `pickables` e `appearances` automaticamente, via `solid()`). Nenhuma peça existente muda de posição, escala ou cor.

## Regras de negócio

- RN-01 (herdada de `.claude/agents/three-scene.md`): nenhuma peça pode parecer logotipo/marca — todas as 9 são formas genéricas.
- RN-02: toda peça pickável precisa de `userData.part`/`userData.system` corretos, com os ids exatos da tabela acima.
- RN-03: nenhum recurso Three.js criado pode ficar sem descarte — como todas usam os helpers já existentes (`solid()` via `box`/`cyl`/`torus`/`tube`), o cleanup já cobre isso automaticamente (o `scene.traverse()` no cleanup descarta qualquer geometria/material da cena, registrada ou não em `pickables`).

## Critérios de aceitação

- [~] CA-01: as 9 peças são visíveis e clicáveis. A sessão principal confirmou visualmente, nas abas de sistema, que as 9 aparecem no modelo (Motor, Freios, Elétrica, Suspensão, Arrefecimento) sem elemento faltando ou visualmente quebrado, e confirmou o conteúdo das 9 na biblioteca de peças; clique direto em cada uma das 9 malhas especificamente não foi testado uma a uma (ver `TASK-006`, mesma limitação de mira em alvos pequenos na ferramenta de captura desta sessão) — o mecanismo de raycasting em si foi confirmado funcionando (peça `exhaust`, `TASK-006`, e uma peça pré-existente em sessão anterior).
- [x] CA-02: confirmado pela sessão principal — comparação visual das visões "Visão geral"/"Lateral" não mostrou nenhuma peça pré-existente fora do lugar, e o diff já mostrava só inserções.
- [x] CA-03: confirmado visualmente pela sessão principal (mesma checagem de `TASK-006`, opacidade por sistema testada em 5 abas).
- [x] CA-04: `npm run build` passa sem erros (rodado nesta sessão, e novamente pela sessão principal após o fix de `PartSketch.tsx`).
- [x] CA-05: confirmado qualitativamente pela sessão principal — várias interações de arrastar/zoom/trocar de visão sem engasgo perceptível.

## Impacto técnico

### Frontend
`src/components/CarScene.tsx` — 9 blocos de geometria novos, cada um perto da área correspondente do carro.

### Banco de dados / Backend / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [x] Etapa 1: modelar as peças do motor (`air-filter`, `accessory-belt`).
- [x] Etapa 2: modelar as peças de freios (`parking-brake`, `brake-caliper`).
- [x] Etapa 3: modelar as peças elétricas (`ignition-coil`, `fuses`).
- [x] Etapa 4: modelar as peças de suspensão (`wheel-bearing`, `sway-bar`).
- [x] Etapa 5: modelar o reservatório de arrefecimento (`coolant-reservoir`).
- [~] Etapa 6: comparação visual completa (3 visões, com/sem carroceria) contra o estado anterior — não executada nesta sessão (sem servidor de dev, para não colidir com o outro subagente); calibração foi feita só por leitura das coordenadas de peças vizinhas no código. Fica pendente para a sessão principal.

## Estratégia de testes

- [ ] Unitários/Integração/E2E — não aplicável.
- [~] Manual — clique em cada uma das 9 peças, comparação visual e interação de zoom/rotação: não executados nesta sessão (sem navegador/servidor de dev). `npm run build`: executado, passou.

## Riscos e rollback

Risco: 9 blocos de geometria novos aumentam a contagem de triângulos e a chance de colisão visual com peças existentes (ex.: `sway-bar` cruzando outras peças da suspensão) — calibrar visualmente cada uma antes de considerar pronta, não confiar só nas coordenadas sugeridas acima (são âncoras de referência, não valores finais). Rollback: cada peça é aditiva e independente — remover uma não afeta as outras 8.

## Registro de execução
### Alterações realizadas
Em `src/components/CarScene.tsx`, 9 blocos de geometria novos, todos via `box`/`cyl`/`torus`/`tube` com `system`/`part` preenchidos:
- `air-filter` (`engine`): caixa achatada + tampa + duto de admissão (`tube`) até perto do coletor, posição `[-1.6, .95, .55]`, fora do range de z do cabeçote/correia dentada.
- `accessory-belt` (`engine`): duas polias (`cyl`+`torus`) — uma perto do virabrequim (`[-1.7, .56, .1]`) e outra na frente do alternador (`[-1.99, .64, .13]`) — ligadas por um laço de correia (`tube`), no plano `z=.53-.55`, deslocado à frente da face do alternador para não colidir com o corpo dele.
- `parking-brake` (`brakes`): base + alavanca (`box`+`cyl` com leve inclinação), no console central, atrás do câmbio (`[.14, .72-.78, .11-.13]`).
- `brake-caliper` (`brakes`): carcaça (`box`) envolvendo a posição de `brake-pad`, dentro do loop das 4 rodas — aparece nas 4.
- `ignition-coil` (`electrical`): um bloco por cilindro, dentro do loop de velas, logo acima do topo da vela (`y=1.335`).
- `fuses` (`electrical`): caixa + tampa, montada acima da bateria (`[-1.26, 1.15-1.2, -.68]`).
- `wheel-bearing` (`suspension`): anel fino (`torus`) atrás da tampa do cubo, dentro do loop das 4 rodas.
- `sway-bar` (`suspension`): uma barra (`tube`) ligando as duas bandejas dianteiras (eixo `x=-1.68`), no eixo Z entre os dois lados — decisão de implementação (ver Divergências).
- `coolant-reservoir` (`cooling`): caixa semitransparente + tampa, ao lado do tanque superior do radiador (`[-1.98, 1.05-1.135, .28]`).

### Arquivos principais
- `src/components/CarScene.tsx`

### Decisões
- `sway-bar`: a task permitia "atravessando o eixo X entre x=-1.68 e x=1.68 (ou só no eixo dianteiro, a decidir na implementação)". Optei pelo eixo dianteiro só, ligando os dois lados (Z) no mesmo x=-1.68, por ser mecanicamente coerente com o que uma barra estabilizadora real faz (liga esquerda/direita do mesmo eixo, não dianteira/traseira) — mantém o modelo didático sem introduzir uma peça que pareça fisicamente errada.
- `brake-caliper`: modelada como uma carcaça um pouco maior do que `brake-pad`, na mesma posição — o encobrimento parcial é intencional (a pinça real envolve a pastilha).
- `wheel-bearing`: torus fino deliberadamente próximo/sobreposto à tampa do cubo existente, conforme a própria task pede ("parcialmente oculto atrás da tampa do cubo").

### Divergências
Nenhuma divergência das âncoras sugeridas na task além da decisão de `sway-bar` documentada acima (opção já prevista/autorizada pela própria task).

### Pendências
- Calibração visual fina das 9 peças (posição/tamanho exatos, ausência de colisão perceptível com peças vizinhas) não foi feita no navegador nesta sessão — só por leitura e cálculo das coordenadas de peças vizinhas já existentes no código. Maior risco de colisão a conferir visualmente: `accessory-belt` (proximidade com o alternador e o filtro de óleo) e `air-filter` (duto de admissão perto do cabeçote/correia dentada). Fica para a sessão principal.
- Comparação visual completa nas 3 visões (Etapa 6) não executada, pelo mesmo motivo.

## Validação
- `npx tsc -b --noEmit` — sem erros.
- `npm run build` — passou (typecheck + `vite build`), mesmo aviso pré-existente de chunk size.
- Verificação visual (clique, opacidade por sistema, comparação de 3 visões, fluidez de zoom/rotação): não realizada nesta sessão — só revisão de código e cálculo de coordenadas. Fica para a sessão principal.

## Handoff
Não há handoff separado — pendências de verificação visual registradas acima e no relatório final ao usuário.
