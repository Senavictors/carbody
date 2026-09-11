---
id: TASK-008
title: "Geometria: sistema de combustível (tanque, bomba, filtro, injetores)"
status: backlog
type: feature
owner:
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
- **`fuel-filter`**: um cilindro pequeno na linha de combustível entre o tanque e o motor — usar `tube()` para a linha e `cyl()` para o corpo do filtro, mesmo padrão já usado nas mangueiras de arrefecimento (linha ~244-246).
- **`fuel-injector`**: pequenos componentes junto ao coletor de admissão do motor (perto de onde `air-filter`, de `TASK-007`, for modelado) — um por cilindro (4, seguindo o padrão de 4 cilindros já usado para velas, linha ~204) ou um bloco representando o conjunto, a decidir na implementação conforme o resultado visual.

Todas usam os helpers já existentes, com `system: 'fuel'` e `part` igual ao id de `TASK-005`.

## Regras de negócio

- RN-01 (herdada de `.claude/agents/three-scene.md`): formas genéricas, sem implicar fabricante/modelo específico.
- RN-02: ids exatos: `fuel-tank`, `fuel-pump`, `fuel-filter`, `fuel-injector` (fixados em `ADR-003`).
- RN-03: `system: 'fuel'` deve bater exatamente com o valor introduzido em `TASK-005` — combinar com quem/quando essa task for implementada se a ordem entre as duas não for a mesma sessão.

## Critérios de aceitação

- [ ] CA-01: as 4 peças são visíveis e clicáveis, cada uma respondendo ao filtro do sistema `fuel` (quando `TASK-005` já estiver implementada — se não, o clique ainda deve funcionar, só o painel do sistema "Combustível" na navegação depende de `TASK-005`).
- [ ] CA-02: nenhuma peça existente mudou de posição/escala/cor.
- [ ] CA-03: `npm run build` passa sem erros.
- [ ] CA-04: comparação visual nas 3 visões, com/sem carroceria.

## Impacto técnico

### Frontend
`src/components/CarScene.tsx` — 4 blocos de geometria novos.

### Banco de dados / Backend / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [ ] Etapa 1: modelar o tanque (posição/volume), calibrando visualmente para não colidir com o eixo traseiro/escape.
- [ ] Etapa 2: modelar a bomba (junto ao tanque).
- [ ] Etapa 3: modelar o filtro e a linha de combustível até o motor.
- [ ] Etapa 4: modelar os injetores junto ao coletor de admissão.
- [ ] Etapa 5: comparação visual completa.

## Estratégia de testes

- [ ] Unitários/Integração/E2E — não aplicável.
- [x] Manual — clique nas 4 peças; comparação visual; `npm run build`.

## Riscos e rollback

Risco: o tanque de combustível precisa de espaço na traseira do chassi que hoje pode estar visualmente "vazio" de propósito (simplicidade do modelo) — calibrar tamanho para não parecer desproporcional. Se `TASK-005` ainda não tiver rodado, o sistema `fuel` não aparecerá na navegação lateral/abas até que rode — isso é esperado (trade-off aceito em `ADR-002`/`ADR-003` de trilhas paralelas), não um bug desta task. Rollback: as 4 peças são aditivas e isoladas.

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
