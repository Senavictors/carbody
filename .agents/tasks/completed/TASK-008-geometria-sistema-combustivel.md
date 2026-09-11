---
id: TASK-008
title: "Geometria: sistema de combustível (tanque, bomba, filtro, injetores)"
status: active
type: feature
owner: three-scene (subagent)
created_at: 2026-09-11
updated_at: 2026-09-11
affected_modules: [three-scene]
related_use_cases: []
related_adrs: [ADR-003]
---

# TASK-008 — Geometria: sistema de combustível (tanque, bomba, filtro, injetores)

## Contexto

Parte da trilha "geometria" de `ADR-003`, par de `TASK-005` (conteúdo, que introduz `system: 'fuel'`). Esta task modela as 4 peças correspondentes em `CarScene.tsx`.

## Objetivo

Modelar `fuel-tank`, `fuel-pump`, `fuel-filter`, `fuel-injector`, todas com `system: 'fuel'`.

## Fora de escopo

- A adição do `SystemId`/`systems`/`systemIcons` — é `TASK-005` (o tipo `'fuel'` precisa existir antes ou ao mesmo tempo; como `userData.system` em `CarScene.tsx` é só uma string solta, não há erro de compilação se esta task rodar antes — mas o sistema "Combustível" só aparecerá na navegação depois de `TASK-005`).
- Geometria de motor a injeção eletrônica detalhada (chicote, sensores) — fora do recorte didático desta iniciativa.

## Comportamento esperado

- **`fuel-tank`**: um volume na traseira do carro (área ainda livre no chassi, próxima ao eixo traseiro — ver as posições de roda traseira `x=1.68` e o chassi longitudinal, linha ~140-141), formato de caixa achatada.
- **`fuel-pump`**: pequeno componente cilíndrico dentro ou junto ao tanque.
- **`fuel-filter`**: um cilindro pequeno na linha de combustível entre o tanque e o motor — usar `tube()` para a linha e `cyl()` para o corpo do filtro, mesmo padrão já usado nas mangueiras de arrefecimento (`CarScene.tsx:257-259`).
- **`fuel-injector`**: pequenos componentes junto ao coletor de admissão do motor (perto de onde `air-filter`, de `TASK-007`, for modelado) — um por cilindro (4, seguindo o padrão de 4 cilindros já usado para velas, loop em `CarScene.tsx:209-217`) ou um bloco representando o conjunto, a decidir na implementação conforme o resultado visual.

Todas usam os helpers já existentes, com `system: 'fuel'` e `part` igual ao id de `TASK-005`.

## Regras de negócio

- RN-01 (herdada de `.claude/agents/three-scene.md`): formas genéricas, sem implicar fabricante/modelo específico.
- RN-02: ids exatos: `fuel-tank`, `fuel-pump`, `fuel-filter`, `fuel-injector` (fixados em `ADR-003`).
- RN-03: `system: 'fuel'` deve bater exatamente com o valor introduzido em `TASK-005` — combinar com quem/quando essa task for implementada se a ordem entre as duas não for a mesma sessão.

## Critérios de aceitação

- [x] CA-01: confirmado pela sessão principal — depois que `TASK-005` (e a correção de `PartSketch.tsx`) foram concluídas, o sistema "Combustível" aparece na navegação, e as 4 peças aparecem corretamente na biblioteca com conteúdo; o tanque foi visualmente localizado na traseira do chassi, sem colisão aparente com o escape (que ocupa o lado oposto em z).
- [x] CA-02: nenhuma peça existente mudou de posição/escala/cor (só inserções de blocos novos; nenhuma chamada pré-existente foi tocada).
- [x] CA-03: `npm run build` passa sem erros (rodado nesta sessão, e novamente pela sessão principal após o fix de `PartSketch.tsx`).
- [~] CA-04: comparação visual feita pela sessão principal nas visões "Visão geral" e "Lateral", com carroceria ligada/desligada — sem colisão aparente entre tanque/linha de combustível e escape/eixo traseiro/console. A visão "Superior" especificamente não foi conferida.

## Impacto técnico

### Frontend
`src/components/CarScene.tsx` — 4 blocos de geometria novos.

### Banco de dados / Backend / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [x] Etapa 1: modelar o tanque (posição/volume), calibrando (por cálculo de coordenadas, não visualmente) para não colidir com o eixo traseiro/escape.
- [x] Etapa 2: modelar a bomba (junto ao tanque).
- [x] Etapa 3: modelar o filtro e a linha de combustível até o motor.
- [x] Etapa 4: modelar os injetores junto ao coletor de admissão.
- [~] Etapa 5: comparação visual completa — não executada nesta sessão (sem servidor de dev); fica para a sessão principal.

## Estratégia de testes

- [ ] Unitários/Integração/E2E — não aplicável.
- [~] Manual — clique nas 4 peças e comparação visual: não executados nesta sessão (sem navegador/servidor de dev). `npm run build`: executado, passou.

## Riscos e rollback

Risco: o tanque de combustível precisa de espaço na traseira do chassi que hoje pode estar visualmente "vazio" de propósito (simplicidade do modelo) — calibrar tamanho para não parecer desproporcional. Se `TASK-005` ainda não tiver rodado, o sistema `fuel` não aparecerá na navegação lateral/abas até que rode — isso é esperado (trade-off aceito em `ADR-002`/`ADR-003` de trilhas paralelas), não um bug desta task. Rollback: as 4 peças são aditivas e isoladas.

## Registro de execução
### Alterações realizadas
Em `src/components/CarScene.tsx`, 4 blocos novos com `system: 'fuel'`:
- `fuel-tank`: caixa achatada `box([.46, .16, .48], [1.3, .35, .34], ...)` + tampa (`cyl`), recuada sob o piso traseiro, entre o corte transversal do chassi (`x=1.67`) e o final da cabine, no lado oposto (z positivo) ao escapamento/silencioso (que ocupa z negativo nessa mesma faixa de x).
- `fuel-pump`: `cyl(.055, .1, [1.15, .47, .25], ...)` — pequeno cilindro logo acima/junto ao canto do tanque.
- `fuel-filter`: linha de combustível (`tube`) da região do tanque até perto do motor + corpo do filtro (`cyl` horizontal, eixo x) no meio do trajeto.
- `fuel-injector`: um `cyl` por cilindro (eixo z), dentro do loop dos 4 cilindros do motor, na ponta externa de cada duto de admissão (`x, .82, .46`), logo além da ponta do duto existente (`x, .82, .335`, raio `.081`).

### Arquivos principais
- `src/components/CarScene.tsx`

### Decisões
- A linha de combustível (`tube` entre tanque e filtro) foi marcada com `part: 'fuel-filter'` — segue a convenção já usada no sistema de arrefecimento (as mangueiras de termostato/bomba d'água são marcadas com o `part` do componente ao qual estão associadas, não um id próprio de "mangueira").
- Injetor modelado como um cilindro pequeno na ponta externa do duto de admissão existente (em vez de embutido dentro do bloco do motor), para garantir que fique visível e clicável em vez de oculto dentro da geometria do bloco.

### Divergências
Nenhuma — segue o "Comportamento esperado" da task (tanque na traseira, bomba junto ao tanque, filtro+linha entre tanque e motor, um injetor por cilindro).

### Pendências
- Verificação visual (posição real do tanque em relação ao escapamento/eixo traseiro, trajeto da linha de combustível sob o assoalho, proximidade dos injetores com o duto de admissão/correia dentada) não foi feita no navegador nesta sessão — só por cálculo das coordenadas/dimensões contra as peças vizinhas já existentes no código. Maior risco a conferir visualmente: a linha de combustível passando perto do túnel/console central da cabine, e o tanque próximo ao travessão traseiro do chassi (`x=1.67`). Fica para a sessão principal.
- Como combinado em `ADR-003`, o sistema `fuel` só aparecerá na navegação lateral depois que `TASK-005` (trilha conteúdo) cadastrar `SystemId`/`systems`/`systemIcons` — não é pendência desta task, é a trilha paralela.

## Validação
- `npx tsc -b --noEmit` — sem erros.
- `npm run build` — passou (typecheck + `vite build`), mesmo aviso pré-existente de chunk size.
- Verificação visual (clique, opacidade por sistema, comparação de 3 visões): não realizada nesta sessão — só revisão de código e cálculo de coordenadas. Fica para a sessão principal.

## Handoff
Não há handoff separado — pendências de verificação visual registradas acima e no relatório final ao usuário.
