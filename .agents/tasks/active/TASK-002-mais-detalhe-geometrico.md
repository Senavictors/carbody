---
id: TASK-002
title: Mais detalhe geométrico no modelo 3D (segmentos + peças adicionais)
status: active
type: enhancement
owner: three-scene (Claude Code)
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

- [x] CA-01: cantos arredondados (`box()`) e seções de torus (`torus()`) perceptivelmente mais lisos/curvos ao aproximar a câmera (zoom máximo), comparado ao estado atual.
- [~] CA-02: parafusos adicionados aos cubos das quatro rodas via código (5 por roda, mesmo padrão angular já usado nos raios). Presença confirmada por revisão do código e por seleção via raycasting no disco de freio adjacente; a ferramenta de captura de tela disponível nesta sessão não permite zoom/crop de região, então a visibilidade individual de cada parafuso não foi confirmada pixel a pixel — ver Pendências.
- [x] CA-03: nenhuma posição, escala ou cor de peça existente muda de forma perceptível (comparação visual antes/depois nas 3 visões e nas duas sessões desta iniciativa).
- [x] CA-04: `npm run build` passa sem erros.
- [x] CA-05: FPS permanece fluido em desktop durante interação (arrastar para girar, zoom, trocar de visão) — sem engasgos percebidos nas verificações manuais.

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

- [x] Etapa 1: subir os segmentos de `box()`/`torus()` e comparar visualmente o resultado (custo x benefício) antes de decidir o valor final.
- [x] Etapa 2: adicionar parafusos/porcas nos cubos de roda.
- [x] Etapa 3: adicionar mangueiras/chanfros adicionais no compartimento do motor, se o ganho visual justificar.
- [x] Etapa 4: comparar a cena completa (as 3 visões, com/sem carroceria) contra o estado anterior para garantir que nada mudou de posição/escala.

## Estratégia de testes

- [ ] Unitários — não aplicável (sem suíte de testes).
- [ ] Integração — não aplicável.
- [ ] E2E — não aplicável.
- [x] Manual — comparação visual antes/depois nas visões perspectiva/lateral, com/sem carroceria; interação de zoom/rotação/redimensionamento; seleção de peça por clique direto na malha 3D (raycasting) e por pino HTML, ambos confirmados funcionando após as mudanças de geometria.

## Riscos e rollback

Risco principal: mais segmentos/peças aumentam a contagem de triângulos e o número de recursos a descartar no cleanup — sem otimização mobile (decisão consciente do `ADR-002`), o app pode ficar pesado em dispositivos fracos; isso deve ser documentado como debt conhecido, não corrigido silenciosamente nesta task. Rollback: reverter os valores de segmento para os originais (3 e 10) e remover os meshes adicionados — mudança isolada, sem afetar `TASK-001`.

## Registro de execução

### Alterações realizadas
- `box()`: segmentos de `RoundedBoxGeometry` subidos de 3 para 6 — chanfros mais suaves em toda peça sólida que já usa o helper (motor, carroceria fantasma, chassi, etc.), sem mudar a assinatura da função.
- `torus()`: `radialSegments` de `TorusGeometry` subido de 10 para 18 (`tubularSegments` mantido em 48) — pneus, discos de freio, molas e correia dentada com seção circular lisa em vez de facetada.
- Parafusos/porcas: 5 por roda (20 no total), pequenos cilindros (`cyl(.013, .022, ...)`) posicionados num raio de `.1` a partir do centro do cubo, com o mesmo padrão angular de 5 posições já usado no loop dos raios (`Math.PI*2/5`), deslocados por `Math.PI/5` para cair entre os raios em vez de sobrepor. Registrados com `system: 'suspension'` e `part: ''` (decorativos, não clicáveis) — decisão consciente prevista pela RN-02 da task.
- Uma mangueira decorativa adicional no compartimento do motor (`tube(...)`, cor escura genérica, `system: 'engine'`, sem `part`), representando uma linha de respiro/vácuo saindo da tampa de válvulas — não corresponde a nenhuma peça específica do catálogo, só reforço visual.

### Arquivos principais
- `src/components/CarScene.tsx` — única alteração de código desta task (a mesma da TASK-001).

### Decisões
- Parafusos e a mangueira nova foram registrados com `system` preenchido mas `part` vazio, seguindo exatamente a alternativa prevista na RN-02: eles participam da lógica de opacidade por sistema (`appearance()`) mas não entram em `pickables` nem podem ser selecionados/realçados individualmente — são elementos decorativos, não peças do catálogo.
- Optei por 5 parafusos por roda (não 4 ou 6) para casar com a simetria já usada nos raios (`for (let i = 0; i < 5; i++)`), mantendo o mesmo "ritmo" geométrico da peça.
- `tubularSegments` do `torus()` foi mantido em 48 — a task e o levantamento inicial (ADR-002) identificaram o `radialSegments` (seção transversal, "aspecto de porca sextavada") como o problema real; o `tubularSegments` (resolução ao redor do círculo maior) já era suficiente.
- Não adicionei chanfros extras separados nos blocos do motor além do aumento geral de segmentos do `box()` — o pedido da task ("chanfros metálicos") é coberto pelo aumento de segmentos em todas as peças que usam o helper, sem precisar de geometria adicional dedicada.

### Divergências
Nenhuma em relação ao pedido da task.

### Pendências
- CA-02 (parafusos visíveis) foi confirmado por revisão do código (a matemática de posicionamento espelha o padrão dos raios, que renderizam corretamente), mas **não por inspeção pixel a pixel** — a ferramenta de captura de tela usada nesta sessão não suporta zoom/crop de região, e o zoom máximo da câmera (`orbit.maxZoom = 1.75`, limite já existente e deliberado do produto) deixa os parafusos pequenos na captura de tela disponível. Recomendo conferir visualmente em uma tela real (não só via automação) antes de considerar a task pronta para `bootstrap-complete`.
- Assim como na `TASK-001`, não foi feito profiling de memória/FPS com ferramenta dedicada (o projeto não tem uma) — a fluidez foi avaliada apenas por interação manual qualitativa.

## Validação

- `npx tsc -b --noEmit` — sem erros.
- `npm run build` — sem erros; chunk do `CarScene` foi de ~606,14 kB para ~606,14 kB (variação desprezível — os parafusos/mangueira são poucos triângulos adicionais).
- Verificação visual no navegador (dev server): tires/discos/molas visivelmente mais arredondados nas visões perspectiva e lateral; nenhuma peça mudou de posição/escala/cor perceptível; clique direto na malha 3D (disco de freio) e clique no pino HTML ("Freios") ambos continuam selecionando a peça corretamente; redimensionamento de viewport (1600×1000) sem distorção; nenhum erro novo no console.

## Handoff
Nenhum — task implementada e validada na mesma sessão que a iniciou, sem necessidade de handoff para outra sessão/ferramenta.
