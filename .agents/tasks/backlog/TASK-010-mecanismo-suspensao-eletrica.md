---
id: TASK-010
title: "Mecanismos animados: Suspensão (compressão/retorno) e Elétrica (carga do alternador)"
status: backlog
type: feature
owner:
created_at: 2026-09-13
updated_at: 2026-09-13
affected_modules: [react-ui]
related_use_cases: []
related_adrs: [ADR-004]
---

# TASK-010 — Mecanismos animados: Suspensão e Elétrica

## Contexto

Parte 2/2 de `ADR-004`. Mesmo padrão de `TASK-009`, agora para os modos `'suspension'` e `'electrical'`.

## Objetivo

Dois diagramas SVG animados novos: a mola comprimindo e o amortecedor controlando o retorno depois de um solavanco; o alternador gerando corrente e carregando a bateria enquanto o motor gira.

## Fora de escopo

- Freios e Arrefecimento — é `TASK-009`.
- Qualquer mudança em `CarScene.tsx`.

## Comportamento atual

Ver `TASK-009` — mesmo `Mode`/estrutura de `MechanismLab.tsx`. Depois de `TASK-009`, `Mode` já inclui `'brakes'`/`'cooling'`; esta task adiciona os 2 últimos, completando os 6 modos (mais `'engine'`/`'gears'` originais).

## Comportamento esperado

- `Mode` ganha `'suspension'` e `'electrical'`.
- Um diagrama `SuspensionDiagram` (mola comprimindo com o impacto, amortecedor dissipando a oscilação — visualmente parecido com o princípio já descrito no texto da peça `spring`: "lembra um pula-pula que o amortecedor ajuda a parar").
- Um diagrama `ElectricalDiagram` (rotor do alternador girando, gerando corrente que carrega a bateria — um indicador visual de "fluxo de energia" do alternador para a bateria).
- Mesma estrutura de dados (array de estados + componente de diagrama lendo um parâmetro de progresso) das tasks anteriores.
- Abas de modo (`ml-tabs`) ganham os últimos 2 botões, completando os 6; navegação por teclado ajustada de novo.

## Regras de negócio

- RN-01 (Constituição): diagramas esquemáticos e genéricos.
- RN-02: `prefers-reduced-motion` respeitado.
- RN-03: tom didático consistente com os demais modos.

## Critérios de aceitação

- [ ] CA-01: `Mode` inclui `'suspension'` e `'electrical'`; as 6 abas navegam corretamente por teclado.
- [ ] CA-02: o diagrama de suspensão mostra a mola comprimindo e o amortecedor controlando o retorno (não oscilando livremente).
- [ ] CA-03: o diagrama elétrico mostra o alternador gerando energia e a bateria recebendo carga.
- [ ] CA-04: `prefers-reduced-motion` desabilita a animação dos 2 modos novos.
- [ ] CA-05: os 4 modos anteriores (`engine`/`gears`/`brakes`/`cooling`) continuam funcionando sem regressão.
- [ ] CA-06: `npm run build` passa sem erros.

## Impacto técnico

### Frontend
`src/components/MechanismLab.tsx`, `src/components/mechanism-lab.css`.

### Banco de dados / Backend / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [ ] Etapa 1: modelar o diagrama de suspensão (`SuspensionDiagram`).
- [ ] Etapa 2: modelar o diagrama elétrico (`ElectricalDiagram`).
- [ ] Etapa 3: completar `Mode`/abas/navegação para os 6 modos.
- [ ] Etapa 4: verificar visualmente os 6 modos e `prefers-reduced-motion`.

## Estratégia de testes

- [ ] Unitários/Integração/E2E — não aplicável.
- [x] Manual — navegação entre os 6 modos, interação, `prefers-reduced-motion`, comparação com os 4 modos anteriores.

## Riscos e rollback

Risco: mesmo de `TASK-009` — diagramas abstratos exigem calibração visual. Rollback: reverter `Mode` para os 4 valores anteriores e remover os 2 componentes novos.

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
