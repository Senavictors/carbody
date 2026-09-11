---
id: TASK-002
title: Mais detalhe geométrico no modelo 3D (segmentos + peças adicionais)
status: backlog
type: enhancement
owner:
created_at: 2026-09-11
updated_at: 2026-09-11
affected_modules: [three-scene]
related_use_cases: []
related_adrs: [ADR-002]
---

# TASK-002 — Mais detalhe geométrico no modelo 3D (segmentos + peças adicionais)

## Contexto

Parte 2/2 de `ADR-002`. O usuário pediu mais detalhes visuais no modelo 3D do carro. `CarScene.tsx` usa geometrias com poucos segmentos nos helpers `box`/`torus`, o que facetamento perceptível de perto.

## Problema

- `box()` usa `RoundedBoxGeometry(...size, 3, radius)` — 3 segmentos por canto arredondado, visivelmente poligonal ao aproximar a câmera (zoom).
- `torus()` usa `TorusGeometry(radius, tube, 10, 48)` — 10 segmentos radiais (seção transversal do tubo), o que dá um aspecto "de porca sextavada" em vez de cilíndrico liso em peças como pneus, discos e correias.
- Peças que já existem no domínio didático (catálogo `src/data/parts.ts`) mas não têm representação visual granular: parafusos/porcas das rodas, chanfros metálicos, mangueiras adicionais do compartimento do motor.

## Objetivo

Aumentar a resolução das geometrias curvas mais usadas e adicionar pequenos detalhes que reforcem a leitura de cada peça, sem mudar posição, escala ou cor das peças existentes (não pode quebrar a calibração de câmera/pins já ajustada).

## Fora de escopo

- Iluminação, ambiente, AO ou qualquer pós-processamento — isso é `TASK-001`.
- Otimização para mobile — `ADR-002` decidiu deliberadamente focar em desktop; não adicionar LOD (level of detail) condicional por dispositivo nesta task.
- Novas peças no catálogo de conteúdo (`src/data/parts.ts`) — esta task é só visual/geométrica no `CarScene.tsx`, não editorial.

## Comportamento atual

- Helper `box()`: `RoundedBoxGeometry(...size, 3, Math.min(radius, ...))` — segmento fixo em 3.
- Helper `torus()`: `TorusGeometry(radius, tube, 10, 48)` — `radialSegments=10`, `tubularSegments=48`.
- Rodas, discos de freio, correia dentada e molas usam `torus()`; praticamente toda peça sólida usa `box()`.

## Comportamento esperado

- `box()` passa a usar um número maior de segmentos de canto (ex.: 3 → 6, calibrar visualmente) — chanfros mais suaves em toda peça que já usa o helper, sem mudar a assinatura da função.
- `torus()` passa a usar `radialSegments` maior (ex.: 10 → 18-20, calibrar visualmente) — pneus, discos e correias com seção circular lisa em vez de facetada.
- Parafusos/porcas visíveis nos cubos de roda (pequenos `cyl()`/`box()` adicionais na posição já calculada dos aros).
- Mangueiras adicionais no compartimento do motor onde fizer sentido didático (reforça "mostrar a relação entre movimento e função"), usando o helper `tube()` já existente.
- Nenhuma posição/escala das peças existentes muda — só a resolução da geometria e pequenos elementos aditivos.

## Regras de negócio

- RN-01: aumentar segmentos não pode introduzir nenhum elemento que pareça logotipo, símbolo de marca, ou geometria que implique um modelo comercial específico (Constituição) — parafusos/chanfros são genéricos.
- RN-02: qualquer peça nova (parafuso, mangueira) que seja clicável deve seguir o mesmo registro de `userData.part`/`userData.system` em `pickables`/`appearances` (ver `.claude/agents/three-scene.md`, regra 3) — mas elementos puramente decorativos (ex.: parafuso não-selecionável) podem ficar fora de `pickables`, desde que documentado como decisão consciente na execução da task.

## Critérios de aceitação

- [ ] CA-01: cantos arredondados (`box()`) e seções de torus (`torus()`) perceptivelmente mais lisos/curvos ao aproximar a câmera (zoom máximo), comparado ao estado atual.
- [ ] CA-02: pelo menos os cubos das quatro rodas ganham parafusos/porcas visíveis.
- [ ] CA-03: nenhuma posição, escala ou cor de peça existente muda de forma perceptível (comparação visual antes/depois nas 3 visões).
- [ ] CA-04: `npm run build` passa sem erros.
- [ ] CA-05: FPS permanece fluido em desktop durante interação (arrastar para girar, zoom) — checagem manual, sem meta numérica formal (projeto sem ferramenta de profiling automatizada).

## Impacto técnico

### Backend
Não se aplica.

### Frontend
`src/components/CarScene.tsx` — ajustar parâmetros dos helpers `box`/`torus`; adicionar chamadas novas de `cyl()`/`box()`/`tube()` para parafusos/mangueiras, dentro dos blocos de construção já existentes (rodas, motor).

### Banco de dados
Não se aplica.

### Integrações
Não se aplica.

### Segurança
Não se aplica.

## Plano de implementação

- [ ] Etapa 1: subir os segmentos de `box()`/`torus()` e comparar visualmente o resultado (custo x benefício) antes de decidir o valor final.
- [ ] Etapa 2: adicionar parafusos/porcas nos cubos de roda.
- [ ] Etapa 3: adicionar mangueiras/chanfros adicionais no compartimento do motor, se o ganho visual justificar.
- [ ] Etapa 4: comparar a cena completa (as 3 visões, com/sem carroceria) contra o estado anterior para garantir que nada mudou de posição/escala.

## Estratégia de testes

- [ ] Unitários — não aplicável (sem suíte de testes).
- [ ] Integração — não aplicável.
- [ ] E2E — não aplicável.
- [x] Manual — comparação visual antes/depois; interação de zoom/rotação para checar fluidez.

## Riscos e rollback

Risco principal: mais segmentos/peças aumentam a contagem de triângulos e o número de recursos a descartar no cleanup — sem otimização mobile (decisão consciente do `ADR-002`), o app pode ficar pesado em dispositivos fracos; isso deve ser documentado como debt conhecido, não corrigido silenciosamente nesta task. Rollback: reverter os valores de segmento para os originais (3 e 10) e remover os meshes adicionados — mudança isolada, sem afetar `TASK-001`.

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
