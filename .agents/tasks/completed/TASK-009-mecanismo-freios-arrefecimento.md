---
id: TASK-009
title: "Mecanismos animados: Freios (pressão hidráulica) e Arrefecimento (circulação)"
status: completed
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

- [x] CA-01: `Mode` inclui `'brakes'` e `'cooling'`; as abas de modo mostram os 4 valores (2 existentes + 2 novos) e a navegação por teclado (`Home`/`End`/setas) funciona para os 4.
- [x] CA-02: o diagrama de freios mostra visualmente a pressão aumentando a força de aperto da pinça conforme o usuário interage.
- [x] CA-03: o diagrama de arrefecimento mostra os dois estados de circulação (direto vs. via radiador).
- [x] CA-04: `prefers-reduced-motion` ativado desabilita a animação dos 2 modos novos, igual aos existentes.
- [x] CA-05: os modos `'engine'`/`'gears'` continuam funcionando sem regressão.
- [x] CA-06: `npm run build` passa sem erros.

## Impacto técnico

### Frontend
`src/components/MechanismLab.tsx` — novos arrays de dados, 2 componentes de diagrama, extensão do `Mode` e das abas. `src/components/mechanism-lab.css` — estilos para os novos diagramas, se precisarem de classes específicas.

### Banco de dados / Backend / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [x] Etapa 1: modelar o diagrama de freios (`BrakeDiagram`), com o parâmetro de força de pressão.
- [x] Etapa 2: modelar o diagrama de arrefecimento (`CoolingDiagram`), com os 2 estados de circulação.
- [x] Etapa 3: estender `Mode`, as abas e a navegação por teclado para os 4 modos.
- [x] Etapa 4: verificar visualmente os 4 modos (2 novos + 2 existentes) e o comportamento de `prefers-reduced-motion`.

## Estratégia de testes

- [x] Unitários/Integração/E2E — não aplicável (sem suíte de testes).
- [x] Manual — navegação entre os 4 modos, interação com os diagramas, `prefers-reduced-motion`, comparação com o estado anterior dos 2 modos existentes.

## Riscos e rollback

Risco: diagramas de fluido são mais abstratos que peças girando (motor/engrenagens) — pode precisar de mais iteração visual para ficar claro. Rollback: reverter `Mode` para 2 valores e remover os componentes novos — mudança isolada em um único arquivo.

## Registro de execução

### Alterações realizadas

- `Mode` passou de `'engine' | 'gears'` para incluir `'brakes'` e `'cooling'`.
- Introduzida a tabela `modes` (id, rótulo da aba, cabeçalho do painel visual), o mapa `speeds` (velocidade de animação por modo) e o helper `startAngle(mode)` — as abas, o cabeçalho, a velocidade do loop e o ângulo inicial passaram a derivar dessas estruturas em vez de ternários com 2 valores fixos.
- Dois arrays de dados novos, no mesmo padrão de `strokes`/`ratios`: `pressures` (3 níveis de força no pedal) e `circuits` (2 condições térmicas do motor).
- `BrakeDiagram` — pedal articulado que gira conforme a força, pistão do cilindro mestre deslocado pela mesma força, linha de freio com fluxo tracejado (animado por `angle`), barra de pressão da linha, pinça sobre o disco e um corte lateral mostrando a folga entre pastilhas e disco diminuindo e as setas de aperto crescendo. O giro do disco cai conforme a pressão sobe (`angle * (1 - force * .72)`).
- `CoolingDiagram` — bomba com rotor girando, galerias internas do motor, válvula termostática com dois estados visuais (barra fechando a passagem × passagem liberada), radiador com colmeia, ventoinha e o caminho do líquido em dois circuitos: retorno curto (válvula fechada) ou via radiador (válvula aberta), com gradiente quente→frio dentro do radiador e barra de temperatura do motor.
- `Pipe` — componente auxiliar (tubo base + traçado animado) usado pelo diagrama de arrefecimento.
- Abas e navegação por teclado generalizadas para N modos: `ArrowLeft`/`ArrowRight` circulam pelos 4 (com wrap), `Home`/`End` vão ao primeiro/último.
- Painel de explicação: a estrutura `{mode === 'engine' ? ... : ...}` virou quatro blocos `{mode === 'x' && ...}`, com os painéis novos reaproveitando as classes já existentes (`ml-ratio-options`, `ml-lesson-copy`, `ml-mechanics-state`, `ml-analogy`, `ml-footnote`).
- CSS: com 4 abas, `.ml-intro` passa a empilhar em ≤1080px (antes ≤900px) e as abas quebram em grade 2×2 em ≤700px. Nenhuma cor nova foi introduzida.

### Arquivos principais

- `src/components/MechanismLab.tsx` (232 → 455 linhas)
- `src/components/mechanism-lab.css` (2 regras responsivas ao final)
- `docs/modules/mechanism-lab.md` — doc de módulo criado no `bootstrap-complete` (o módulo não tinha arquivo próprio; nasceu sob demanda, como o `README` de `docs/modules/` prevê), indexado no README da pasta
- `docs/architecture/components.md`, `README.md`, `AGENTS.md`, `.claude/agents/react-ui.md` + `.codex/agents/react-ui.toml` — referências ao `MechanismLab` atualizadas para os 4 modos
- `.agents/context/CONTEXT.md` — estado do `ADR-004` e ponto de extensão para a `TASK-010`

### Decisões

- **Freios com corte lateral em vez de só a vista lateral.** A vista lateral do disco mostra a rotação, mas não consegue mostrar as pastilhas apertando as duas faces. Em vez de escolher uma das duas, o diagrama tem a vista lateral (pinça sobre o disco girando) e um corte destacado no canto inferior esquerdo, onde a folga e as setas de aperto respondem à força escolhida — é ali que o CA-02 fica visível.
- **A pressão é um estado escolhido pelo usuário, não um valor animado.** Segue exatamente o padrão de `ratios`: trocar a opção pausa a animação e zera o `angle`, o que também evita um salto visual no giro do disco (que depende da força).
- **Sem número de temperatura em °C.** O catálogo (`src/data/parts.ts`, peça `thermostat`) descreve o comportamento em linguagem qualitativa ("temperatura de trabalho") e não cita uma faixa numérica; o diagrama seguiu o mesmo vocabulário para não introduzir uma afirmação técnica nova sem fonte.
- **Velocidade de animação por modo** (`speeds`): freios .05 e arrefecimento .045, entre o motor (.07) e as engrenagens (.025) — fluido escoando lê melhor num ritmo intermediário.

### Divergências

- Nenhuma em relação ao que a task pedia.

### Pendências

- `App.tsx` ainda tipa `mechanismMode` como `'engine'|'gears'` e `openMechanism()` só roteia `transmission → gears`, resto → `engine`. Levar o usuário direto ao mecanismo de freios/arrefecimento a partir de uma peça desses sistemas é uma melhoria óbvia, mas está fora do "Impacto técnico" desta task (que lista só `MechanismLab.tsx` e o CSS) — registrado aqui em vez de feito, para não ampliar escopo sem task. Vale considerar junto com `TASK-010`, quando os 6 modos existirem.
- A nota de rodapé da página em `App.tsx` ("Os diagramas simplificam um motor de quatro tempos e pares de engrenagens") não menciona os mecanismos novos — mesmo motivo acima.

## Validação

```bash
npm run build
```
Passou sem erros (`tsc -b` + `vite build`, "✓ built in 9.35s"). O aviso de chunk >500 kB é o do `CarScene`/Three.js, dívida já conhecida e anterior a esta task.

Verificação visual no navegador (`npm run dev`, http://localhost:5173, página "Como funciona"):

- CA-01: as 4 abas aparecem; `aria-selected`/`tabIndex` conferidos via DOM (só a ativa com `true`/`0`). Navegação por teclado exercitada nos 4 modos: `ArrowRight` circula Motor → Engrenagens → Freios → Arrefecimento → Motor (wrap), `ArrowLeft` volta, `Home` vai ao primeiro, `End` ao último — e o foco acompanha a aba selecionada em todos os casos.
- CA-02: trocando "Toque leve" → "Frenagem forte", o pedal afunda, o pistão do cilindro mestre avança, a barra de pressão enche e, no corte, a folga entre as pastilhas e o disco fecha com as setas de aperto crescendo.
- CA-03: "Motor frio" mostra o ramo do radiador apagado e o líquido voltando pelo caminho curto; "Temperatura de trabalho" mostra o ramo do radiador ativo (quente na entrada, frio na saída, gradiente dentro do radiador) e o retorno curto apagado.
- CA-04: com `window.matchMedia('(prefers-reduced-motion: reduce)')` forçado a `matches: true` e o componente remontado, o botão de reprodução fica desabilitado com o texto "Movimento reduzido" e a dica "Explore pelos controles ao lado." nos dois modos novos — mesmo comportamento dos modos existentes. Nenhuma animação CSS (`@keyframes`/`transition`) foi adicionada: todo movimento dos diagramas novos deriva do `angle`, que só avança dentro do `useEffect` já protegido por `reducedMotion`.
- CA-05: "Motor de 4 tempos" e "Engrenagens" renderizam e animam como antes (verificado em 648px e em 1180px de largura).
- Responsividade: em ~1180px as 4 abas cabem na mesma linha do título; em 648px quebram em grade 2×2 sem cortar rótulo. Console do navegador sem erros.

## Handoff
Não aplicável — a task foi executada e verificada em uma única sessão.
