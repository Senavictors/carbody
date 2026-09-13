---
id: TASK-010
title: "Mecanismos animados: Suspensão (compressão/retorno) e Elétrica (carga do alternador)"
status: completed
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

- [x] CA-01: `Mode` inclui `'suspension'` e `'electrical'`; as 6 abas navegam corretamente por teclado.
- [x] CA-02: o diagrama de suspensão mostra a mola comprimindo e o amortecedor controlando o retorno (não oscilando livremente).
- [x] CA-03: o diagrama elétrico mostra o alternador gerando energia e a bateria recebendo carga.
- [x] CA-04: `prefers-reduced-motion` desabilita a animação dos 2 modos novos.
- [x] CA-05: os 4 modos anteriores (`engine`/`gears`/`brakes`/`cooling`) continuam funcionando sem regressão.
- [x] CA-06: `npm run build` passa sem erros.

## Impacto técnico

### Frontend
`src/components/MechanismLab.tsx`, `src/components/mechanism-lab.css`.

### Banco de dados / Backend / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [x] Etapa 1: modelar o diagrama de suspensão (`SuspensionDiagram`).
- [x] Etapa 2: modelar o diagrama elétrico (`ElectricalDiagram`).
- [x] Etapa 3: completar `Mode`/abas/navegação para os 6 modos.
- [x] Etapa 4: verificar visualmente os 6 modos e `prefers-reduced-motion`.

## Estratégia de testes

- [x] Unitários/Integração/E2E — não aplicável.
- [x] Manual — navegação entre os 6 modos, interação, `prefers-reduced-motion`, comparação com os 4 modos anteriores.

## Riscos e rollback

Risco: mesmo de `TASK-009` — diagramas abstratos exigem calibração visual. Rollback: reverter `Mode` para os 4 valores anteriores e remover os 2 componentes novos.

## Registro de execução

### Alterações realizadas

- `Mode` completou os 6 valores previstos pelo `ADR-004`. Como a `TASK-009` já tinha generalizado abas, cabeçalho, velocidade e ângulo inicial sobre a lista `modes`, esta task só precisou acrescentar duas entradas em `modes` e duas em `speeds` — nenhuma mudança na navegação por teclado nem no loop de animação.
- Dois arrays de dados novos, no padrão já estabelecido: `bumps` (2 composições do conjunto de suspensão) e `charges` (3 momentos do sistema elétrico).
- `SuspensionDiagram` — carroceria, mola helicoidal (`coilPath`, com as espiras comprimindo conforme o curso), amortecedor com haste, roda e chão com a irregularidade. O movimento vem de `suspensionTravel(time, damped)`, uma oscilação amortecida (`-34·e^(-k·t)·cos(3.5·t)`, com `k` alto quando há amortecedor e quase nulo quando não há). Ao lado, um gráfico do deslocamento da carroceria ao longo do tempo, com marcador na posição atual.
- `ElectricalDiagram` — polia e correia do motor, alternador com rotor girando, bateria com terminais e células, bloco de equipamentos e motor de partida, ligados por uma linha de alimentação. O tipo `Flow` nomeia os seis trechos do circuito e cada momento declara, por trecho, `0`/`1`/`-1` (inativo / fluxo no sentido do path / sentido contrário).
- `Pipe` (introduzido na `TASK-009` para o arrefecimento) virou `FlowPath`, com `width`/`flow`/`dash` opcionais mantendo os valores antigos como padrão. As 7 chamadas do arrefecimento foram renomeadas sem mudança de comportamento; os fios do diagrama elétrico usam o mesmo componente com espessura menor.
- Painel de explicação: dois blocos novos, reaproveitando as classes existentes (`ml-ratio-options`, `ml-lesson-copy`, `ml-mechanics-state`, `ml-analogy`, `ml-footnote`).
- CSS: com 6 abas, o cabeçalho e as abas deixaram de disputar a mesma linha — `.ml-intro` empilha sempre e `.ml-tabs` ocupa a largura toda com `flex-wrap`, virando seis colunas em tela larga e grade 2×3 em ≤700px. Nenhuma cor nova.

### Arquivos principais

- `src/components/MechanismLab.tsx` (455 → 660 linhas)
- `src/components/mechanism-lab.css` (regras de aba ajustadas para 6 modos)
- `docs/modules/mechanism-lab.md` — doc de módulo revisado (6 modos, `FlowPath`, os dois conceitos novos e a invariante editorial sobre desgaste)
- `docs/architecture/components.md`, `docs/modules/README.md`, `README.md`, `AGENTS.md`, `.claude/agents/react-ui.md` + `.codex/agents/react-ui.toml`, `.agents/context/CONTEXT.md`

### Decisões

- **A suspensão compara "só a mola" com "mola + amortecedor", não estados de desgaste.** É o par que explica por que as duas peças existem, e está ancorado na analogia que o catálogo já usa em `shock-absorber` ("A mola lembra um pula-pula; sem controle, continuaria oscilando"). Um estado "amortecedor gasto" teria sido tentador e mais concreto, mas apresentar desgaste como estado do diagrama sugere diagnóstico — o que a Constituição proíbe. A invariante ficou registrada no doc de módulo.
- **Gráfico de deslocamento ao lado do conjunto.** Sem ele, a diferença entre os dois estados só aparece para quem aperta "Ver em movimento" — e some de novo ao pausar. Com a curva, a diferença entre "morre em dois ciclos" e "continua ondulando" é legível de imediato, inclusive sob `prefers-reduced-motion`.
- **Elétrica com 3 momentos em vez de 2.** Partida / motor funcionando / motor desligado cobre também o `starter` e deixa claro que a direção do fluxo na bateria é o que muda entre eles. Foi o que motivou generalizar o `FlowPath` com sentido de fluxo pelo sinal do `offset`.
- **`Pipe` → `FlowPath` em vez de um `Wire` separado.** Tubo de arrefecimento e fio elétrico são o mesmo desenho com espessuras diferentes; duplicar o componente teria criado duas cópias da mesma lógica de traçado animado.

### Divergências

- Nenhuma em relação ao que a task pedia.

### Pendências

- A mesma da `TASK-009`, agora maior: `App.tsx` tipa `mechanismMode` como `'engine'|'gears'` e `openMechanism()` só roteia `transmission → gears`, resto → `engine`. Os 4 modos novos só são alcançáveis pelas abas — o botão "Ver o mecanismo" de uma peça de freio, suspensão, arrefecimento ou elétrica leva ao motor. Continua fora do escopo (o "Impacto técnico" desta task também lista só `MechanismLab.tsx` e o CSS) e agora está registrada em "Interfaces públicas" de `docs/modules/mechanism-lab.md`. **Merece uma task própria**: exige mexer em `App.tsx` (tipo do estado e um mapa `SystemId → Mode`) e também na nota de rodapé da página, que ainda fala só em "motor de quatro tempos e pares de engrenagens".
- `MechanismLab.tsx` está com 660 linhas. O `ADR-004` já previa reavaliar a Alternativa B (extrair cada mecanismo para `mechanisms/<Nome>Mechanism.tsx`) depois desta expansão — com os 6 modos no lugar e o padrão estável, agora é o momento natural de decidir isso.

## Validação

```bash
npm run build
```
Passou sem erros (`tsc -b` + `vite build`). O aviso de chunk >500 kB é o do `CarScene`/Three.js, dívida conhecida e anterior.

Verificação visual no navegador (`npm run dev`, http://localhost:5173, página "Como funciona"):

- CA-01: as 6 abas aparecem e montam o diagrama certo — conferido via DOM que cada aba resulta na classe de SVG e no cabeçalho esperados (`ml-engine-svg` … `ml-electrical-svg`). Teclado exercitado na sequência `Home`, `ArrowLeft`, 6× `ArrowRight`, `End`: circula pelos 6 com wrap nos dois sentidos, `Home`/`End` vão às pontas, e o foco acompanha a aba selecionada em todos os passos.
- CA-02: "Só a mola" mostra o amortecedor apagado com a legenda "fora do conjunto" e a curva laranja oscilando até o fim do eixo; "Mola + amortecedor" mostra o conjunto completo e a curva azul morrendo em poucos ciclos. A diferença é visível com a animação parada.
- CA-03: em "Motor funcionando", o rotor do alternador fica destacado, o fluxo sai do alternador para a linha de alimentação, os equipamentos acendem e o trecho da bateria inverte para azul com as células cheias e o rótulo "Bateria · recebendo carga". Em "Partida", o alternador e a correia ficam apagados, o motor de partida ativa e a bateria passa a "fornecendo energia".
- CA-04: com `window.matchMedia('(prefers-reduced-motion: reduce)')` forçado a `matches: true` e o componente remontado, o botão de reprodução fica desabilitado com o texto "Movimento reduzido" nos dois modos novos. Nenhuma animação CSS foi adicionada — todo movimento deriva do `angle`.
- CA-05: os 4 modos anteriores montam e renderizam normalmente, incluindo o arrefecimento, que é o mais exposto à renomeação `Pipe` → `FlowPath` (verificado em 648px e em 1180px). Console do navegador sem erros.
- Animação: com "Ver em movimento" ativo no modo suspensão, o marcador do gráfico avança ao longo da curva entre leituras consecutivas.
- Responsividade: em 1180px as 6 abas formam uma linha só, full-width, abaixo do título; em 648px viram grade 2×3 sem cortar rótulo.

## Handoff
Não aplicável — a task foi executada e verificada em uma única sessão.
