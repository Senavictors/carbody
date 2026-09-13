---
estado: real
fonte: src/components/MechanismLab.tsx
ultima-revisao: TASK-016, 2026-09-13
---

# Módulo MechanismLab

## Responsabilidade

Renderiza o laboratório de mecanismos da página "Como funciona": diagramas SVG esquemáticos e animados que mostram a relação entre movimento e função em seis mecanismos — motor de 4 tempos, par de engrenagens, circuito hidráulico de freio, circuito de arrefecimento, conjunto de suspensão e sistema de carga elétrica. Cada mecanismo tem um diagrama à esquerda e um painel de explicação didática à direita, com controles que deixam o usuário escolher o estado do mecanismo e o ritmo da animação.

## Localização

- Frontend: `src/components/MechanismLab.tsx` (+ `src/components/mechanism-lab.css`)

## Conceitos principais

- **Modo é dado, não ramificação.** `type Mode = 'engine' | 'gears' | 'brakes' | 'cooling' | 'suspension' | 'electrical'` e a lista `modes` (`id`, `tab`, `header`) são a fonte única do que existe: as abas, o cabeçalho do painel visual e a navegação por teclado derivam dessa lista, e não de condicionais fixos. Dois mapas acompanham: `speeds` (velocidade da animação por modo) e `startAngle(mode)` (ângulo inicial — 90 para o motor, 0 para o resto). **Este é o ponto de extensão do módulo**: acrescentar um mecanismo é acrescentar uma entrada em `modes`, uma em `speeds`, um componente de diagrama e um bloco no painel de explicação.
- **Um relógio só para todos os diagramas.** Existe um único estado `angle`, avançado por um `requestAnimationFrame` em `useEffect`, e todo movimento de todo diagrama é uma função dele (rotação do virabrequim, giro das engrenagens, deslocamento do tracejado de fluido, giro do disco de freio, rotor da bomba, ventoinha, oscilação da carroceria, rotor do alternador). Nenhum diagrama tem animação própria e nenhum usa `@keyframes` CSS — é o que torna o respeito a `prefers-reduced-motion` uma checagem só, no lugar de uma por mecanismo.
- **Padrão "array de estados + componente de diagrama".** Cada mecanismo tem um array de dados (`strokes`, `ratios`, `pressures`, `circuits`, `bumps`, `charges`) com o texto didático de cada estado, e um componente que recebe o progresso (`angle`) mais o estado atual como props primitivas (`EngineDiagram({ angle, stroke })`, `GearDiagram({ angle, input, output })`, `BrakeDiagram({ angle, force, color, label })`, `CoolingDiagram({ angle, open })`, `SuspensionDiagram({ angle, damped, label })`, `ElectricalDiagram({ angle, flows, label, spin })`). Os diagramas não leem estado do componente pai nem conhecem o catálogo.
- **Estado escolhido pelo usuário pausa e rebobina.** Trocar a relação de engrenagem, a pressão do pedal, a condição térmica do motor, a composição da suspensão ou o momento do sistema elétrico sempre faz `setRunning(false)` + `setAngle(0)`. Além da coerência didática, isso evita salto visual quando o parâmetro escolhido afeta a velocidade de algo animado (o giro do disco de freio cai conforme a pressão sobe).
- **Vista lateral + corte, no diagrama de freios.** A vista lateral mostra o disco girando, mas não consegue mostrar as pastilhas apertando as duas faces. Por isso o `BrakeDiagram` tem os dois: a vista lateral (pinça sobre o disco) e um corte destacado no canto inferior esquerdo, onde a folga entre pastilhas e disco fecha e as setas de aperto crescem conforme a força escolhida.
- **`FlowPath` desenha qualquer trajeto com fluxo.** Um único componente auxiliar cobre tubo de arrefecimento e fio elétrico: desenha o trecho como traço base + traçado animado por cima, com `width`/`flow`/`dash` parametrizáveis (o padrão é a espessura de tubo; os fios usam `width={8} flow={3.6}`). Recebe `active` — um trecho inativo fica apagado em vez de sumir, para que o usuário veja o caminho que existe mas não está sendo usado. O sinal do `offset` define o sentido do fluxo, que é o que permite ao diagrama elétrico inverter a direção na bateria conforme ela fornece ou recebe energia.
- **Estados que só existem no gráfico, na suspensão.** A diferença entre "só a mola" e "mola + amortecedor" é difícil de ler numa animação pausada, então o `SuspensionDiagram` traz, ao lado do conjunto, a curva do deslocamento da carroceria ao longo do tempo, com um marcador na posição atual. Com amortecedor a curva morre em poucos ciclos; sem, continua ondulando — a diferença fica visível mesmo sem apertar "Ver em movimento".
- **Direção de fluxo por estado, na elétrica.** O tipo `Flow` nomeia cada trecho do circuito (`alternator`, `busLeft`, `battery`, `busRight`, `load`, `starter`) e cada momento (`charges`) declara `0` (trecho inativo), `1` (fluxo no sentido do path) ou `-1` (sentido contrário). É isso que diferencia partida, motor funcionando e motor desligado sem precisar de três desenhos.
- **Abas acessíveis com roving tabindex.** `role="tablist"`/`role="tab"`/`role="tabpanel"`, `aria-selected` e `aria-controls`; só a aba ativa tem `tabIndex={0}`. O `onKeyDown` do container circula com `ArrowLeft`/`ArrowRight` (com wrap) e vai às pontas com `Home`/`End`, sempre movendo o foco junto — tudo calculado sobre `modes.length`, então não precisa de ajuste ao adicionar um mecanismo.

## Dependências

### Depende de
- `react` (`useEffect`, `useId`, `useRef`, `useState`) e `lucide-react` (ícones dos controles e das linhas de estado).
- `./mechanism-lab.css`.
- Nada de `src/data/parts.ts`: o texto didático dos mecanismos vive nos arrays deste arquivo, não no catálogo. São conteúdos diferentes — o catálogo descreve peças (com `sourceIds` obrigatório), o laboratório explica princípios de funcionamento.
- Nenhuma chamada de rede, nenhum acesso a `localStorage`.

### É usado por
- `src/App.tsx` — renderiza `<MechanismLab>` na página "Como funciona" via `React.lazy`/`Suspense` (chunk próprio), com `key={mechanismMode}` e a prop `initialMode`.

## Interfaces públicas

`MechanismLabProps = { initialMode?: Mode }` — o modo em que o laboratório abre (padrão `'engine'`). Um `useEffect` reage a mudanças de `initialMode` resetando modo, reprodução e ângulo.

O tipo `Mode` é exportado e consumido por `App.tsx` via `import type` (nunca import de valor: puxaria este módulo para o bundle principal e desfaria o `React.lazy`). A casca mantém dois mapas sobre ele — `systemMechanism` e `mechanismParts` — descritos em `docs/architecture/components.md`. Acrescentar um mecanismo aqui exige acrescentar a entrada correspondente em `mechanismParts`, que é um `Record<Mode, string[]>` e portanto acusa a falta no typecheck.

_(A divergência registrada aqui pela `TASK-009` e pela `TASK-010` — a casca conhecendo apenas dois modos — foi resolvida pela `TASK-016`.)_

## Invariantes

- Todo elemento animado novo deriva de `angle` e nunca de `@keyframes`/`transition` CSS — é o que mantém `prefers-reduced-motion` garantido por uma checagem só (`.claude/agents/react-ui.md`, regra 2).
- Os diagramas são esquemáticos e genéricos: nenhum pode representar ou implicar o sistema de uma marca ou modelo comercial específico (Constituição do projeto).
- Afirmação técnica nova no texto didático deve seguir o vocabulário já usado pelo catálogo para a mesma peça. Em particular, o arrefecimento fala em "temperatura de trabalho" sem citar faixa numérica, acompanhando o que `src/data/parts.ts` diz sobre o termostato — introduzir um número aqui seria uma afirmação técnica nova sem fonte. Pelo mesmo motivo, nenhum estado de mecanismo pode representar uma peça desgastada ou com defeito: "Só a mola" é um experimento mental sobre o princípio (ancorado na analogia do pula-pula que o catálogo usa em `shock-absorber`), não um amortecedor gasto — apresentar desgaste como estado do diagrama sugeriria diagnóstico, que a Constituição proíbe.
- Todo controle interativo precisa de rótulo acessível (`aria-label`/`aria-pressed`/`aria-selected`) e a lista `modes` precisa continuar sendo a única fonte das abas — abas escritas à mão quebram a navegação por teclado, que indexa sobre ela.
- Cada `<svg>` precisa de `role="img"` + `aria-label` descrevendo o estado atual do mecanismo, não só o nome dele.
- Ids de `<marker>`/`<linearGradient>` dentro dos SVGs precisam ser únicos entre diagramas (`ml-flow-arrow`, `ml-clamp-arrow`, `ml-radiator-flow`) — só um diagrama é montado por vez, mas ids repetidos quebrariam a referência se isso mudar.

## Modos de falha

- **`prefers-reduced-motion: reduce` ativo**: o loop de animação não inicia, o botão de reprodução fica desabilitado com o texto "Movimento reduzido" e a dica muda para "Explore pelos controles ao lado.". Os diagramas continuam totalmente utilizáveis pelos controles de estado — nenhum conteúdo depende de ver o movimento.
- **Aba estreita**: as abas ficam sempre abaixo do título, ocupando a largura toda (`flex: 1 1 auto`, seis colunas em telas largas); em ≤700px quebram em grade 2×3 e o painel de explicação passa a ficar abaixo do diagrama (`grid-template-columns: 1fr`).
- O módulo não tem caminho de erro em runtime: não faz I/O, não depende de WebGL e não lê estado persistido.

## Testes

Nenhum automatizado (o projeto não tem suíte de testes — ver `AGENTS.md`). Validação é manual: `npm run build` sem erros (typecheck + build) e verificação visual no navegador — troca entre os 4 modos, navegação por teclado nas abas, interação com os controles de estado de cada mecanismo, comportamento sob `prefers-reduced-motion` e checagem de regressão nos modos que já existiam. Ver a seção "Validação" das tasks relacionadas para o que foi checado em cada mudança.

## Decisões relacionadas

- `ADR-004` (estender o MechanismLab com 4 mecanismos novos) — decisão de reaproveitar a infraestrutura existente em vez de extrair cada mecanismo para um arquivo próprio antes de expandir. O próprio ADR prevê reavaliar essa extração se o arquivo ficar difícil de manter depois da expansão.
- `TASK-009` — implementou os mecanismos de freios e arrefecimento, e generalizou modo/abas/navegação por teclado para N modos.
- `TASK-010` — implementou os mecanismos de suspensão e elétrica, fechando os 6 modos previstos pelo `ADR-004`, e generalizou o `Pipe` do arrefecimento no `FlowPath` usado também pelos fios do diagrama elétrico.
- `TASK-016` — ligou a casca (`App.tsx`) aos 6 mecanismos, exportando o tipo `Mode` deste módulo.
