---
id: TASK-009
title: "Mecanismos animados: Freios (pressão hidráulica) e Arrefecimento (circulação)"
status: backlog
type: feature
owner:
created_at: 2026-09-13
updated_at: 2026-09-13
affected_modules: [react-ui]
related_use_cases: []
related_adrs: [ADR-004]
---

# TASK-009 — Mecanismos animados: Freios e Arrefecimento

## Contexto

Parte 1/2 de `ADR-004`. `src/components/MechanismLab.tsx` hoje só tem os modos `'engine'` e `'gears'` (tipo `Mode`, linha 5). Esta task adiciona os modos `'brakes'` e `'cooling'`, seguindo o padrão já estabelecido por `strokes`/`EngineDiagram` (linhas 8-33, 55-107) e `ratios`/`GearDiagram` (linhas 35-39, 109-135).

## Objetivo

Dois diagramas SVG animados novos: pressão hidráulica do pedal de freio até a pinça (por que pisar fraco/forte muda a força de frenagem), e circulação do líquido de arrefecimento (bomba → motor → radiador, com o termostato decidindo o caminho conforme a temperatura).

## Fora de escopo

- Suspensão e Elétrica — é `TASK-010`.
- Qualquer mudança em `CarScene.tsx` — os mecanismos aqui são diagramas 2D (SVG), não a cena 3D.

## Comportamento atual

`type Mode = 'engine' | 'gears';`. `MechanismLab` renderiza abas (`ml-tabs`) para os modos existentes, cada um com seu diagrama (`EngineDiagram`/`GearDiagram`) e painel de explicação (`ml-explanation`), animado via `requestAnimationFrame` respeitando `prefers-reduced-motion` (mesmo `useEffect` serve todos os modos, movido por `angle`).

## Comportamento esperado

- `Mode` ganha `'brakes'` e `'cooling'`.
- Um diagrama `BrakeDiagram` (pressão hidráulica: pedal → cilindro mestre → linha de freio → pinça apertando o disco; a intensidade do aperto varia com um parâmetro controlável, similar a como `ratios` deixa o usuário trocar a relação de engrenagem).
- Um diagrama `CoolingDiagram` (circulação: bomba empurra o líquido pelo motor, sobe a temperatura, a válvula termostática decide se o líquido vai direto de volta ou passa pelo radiador primeiro — dois "estados" de circulação, frio vs. quente, trocáveis pelo usuário).
- Cada modo novo segue a mesma estrutura de dados que já existe: um array de "estados" (como `strokes`/`ratios`) e um componente de diagrama que lê um parâmetro de progresso (como `angle`/`stroke` em `EngineDiagram`, `angle`/`input`/`output` em `GearDiagram`).
- Abas de modo (`ml-tabs`) ganham 2 botões novos, navegáveis por teclado (o `onKeyDown` do container de abas já lida com `ArrowLeft`/`ArrowRight`/`Home`/`End` — precisa ser ajustado para os 4 modos, não só 2).

## Regras de negócio

- RN-01 (Constituição): os diagramas continuam esquemáticos e genéricos — sem representar um sistema de freio/arrefecimento de marca ou modelo específico.
- RN-02: a animação respeita `prefers-reduced-motion`, seguindo o `useEffect` já existente que checa `window.matchMedia('(prefers-reduced-motion: reduce)')`.
- RN-03: o texto de explicação de cada estado segue o mesmo tom didático já usado em `strokes`/`ratios` (verbo curto, texto explicativo, analogia).

## Critérios de aceitação

- [ ] CA-01: `Mode` inclui `'brakes'` e `'cooling'`; as abas de modo mostram os 4 valores (2 existentes + 2 novos) e a navegação por teclado (`Home`/`End`/setas) funciona para os 4.
- [ ] CA-02: o diagrama de freios mostra visualmente a pressão aumentando a força de aperto da pinça conforme o usuário interage.
- [ ] CA-03: o diagrama de arrefecimento mostra os dois estados de circulação (direto vs. via radiador).
- [ ] CA-04: `prefers-reduced-motion` ativado desabilita a animação dos 2 modos novos, igual aos existentes.
- [ ] CA-05: os modos `'engine'`/`'gears'` continuam funcionando sem regressão.
- [ ] CA-06: `npm run build` passa sem erros.

## Impacto técnico

### Frontend
`src/components/MechanismLab.tsx` — novos arrays de dados, 2 componentes de diagrama, extensão do `Mode` e das abas. `src/components/mechanism-lab.css` — estilos para os novos diagramas, se precisarem de classes específicas.

### Banco de dados / Backend / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [ ] Etapa 1: modelar o diagrama de freios (`BrakeDiagram`), com o parâmetro de força de pressão.
- [ ] Etapa 2: modelar o diagrama de arrefecimento (`CoolingDiagram`), com os 2 estados de circulação.
- [ ] Etapa 3: estender `Mode`, as abas e a navegação por teclado para os 4 modos.
- [ ] Etapa 4: verificar visualmente os 4 modos (2 novos + 2 existentes) e o comportamento de `prefers-reduced-motion`.

## Estratégia de testes

- [ ] Unitários/Integração/E2E — não aplicável (sem suíte de testes).
- [x] Manual — navegação entre os 4 modos, interação com os diagramas, `prefers-reduced-motion`, comparação com o estado anterior dos 2 modos existentes.

## Riscos e rollback

Risco: diagramas de fluido são mais abstratos que peças girando (motor/engrenagens) — pode precisar de mais iteração visual para ficar claro. Rollback: reverter `Mode` para 2 valores e remover os componentes novos — mudança isolada em um único arquivo.

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
