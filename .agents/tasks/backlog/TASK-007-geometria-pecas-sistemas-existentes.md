---
id: TASK-007
title: "Geometria: 9 peças novas que completam sistemas existentes"
status: backlog
type: feature
owner:
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

- [ ] CA-01: as 9 peças são visíveis e clicáveis no modelo 3D, cada uma abrindo o painel de detalhe correto (depois que `TASK-004` cadastrar o conteúdo correspondente).
- [ ] CA-02: nenhuma peça existente mudou de posição/escala/cor perceptível (comparar as 3 visões antes/depois).
- [ ] CA-03: as 9 peças respondem corretamente à opacidade por sistema.
- [ ] CA-04: `npm run build` passa sem erros.
- [ ] CA-05: fluidez de interação (arrastar/zoom) permanece sem engasgos perceptíveis em desktop.

## Impacto técnico

### Frontend
`src/components/CarScene.tsx` — 9 blocos de geometria novos, cada um perto da área correspondente do carro.

### Banco de dados / Backend / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [ ] Etapa 1: modelar as peças do motor (`air-filter`, `accessory-belt`).
- [ ] Etapa 2: modelar as peças de freios (`parking-brake`, `brake-caliper`).
- [ ] Etapa 3: modelar as peças elétricas (`ignition-coil`, `fuses`).
- [ ] Etapa 4: modelar as peças de suspensão (`wheel-bearing`, `sway-bar`).
- [ ] Etapa 5: modelar o reservatório de arrefecimento (`coolant-reservoir`).
- [ ] Etapa 6: comparação visual completa (3 visões, com/sem carroceria) contra o estado anterior.

## Estratégia de testes

- [ ] Unitários/Integração/E2E — não aplicável.
- [x] Manual — clique em cada uma das 9 peças (idealmente já com `TASK-004` mesclada, para confirmar o painel de detalhe); comparação visual; interação de zoom/rotação.

## Riscos e rollback

Risco: 9 blocos de geometria novos aumentam a contagem de triângulos e a chance de colisão visual com peças existentes (ex.: `sway-bar` cruzando outras peças da suspensão) — calibrar visualmente cada uma antes de considerar pronta, não confiar só nas coordenadas sugeridas acima (são âncoras de referência, não valores finais). Rollback: cada peça é aditiva e independente — remover uma não afeta as outras 8.

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
