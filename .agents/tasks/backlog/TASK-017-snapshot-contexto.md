# Snapshot — TASK-017

Gerado em: 2026-09-13
Task: `.agents/tasks/backlog/TASK-017-extrair-mecanismos-em-modulos.md`

## ADR de referência

`.agents/decisions/ADR-008-extrair-mecanismos-em-modulos-proprios.md` — decidido: **um arquivo por mecanismo**, co-locando dados, diagrama e painel; `MechanismLab.tsx` vira orquestrador. As duas alternativas recusadas (separar por tipo; extrair só os SVGs) estão registradas lá — não reabra sem motivo novo.

Leia também `docs/modules/mechanism-lab.md`: descreve o padrão atual e as invariantes que o refactor precisa preservar.

## Assinaturas de código necessárias

Todas conferidas em `src/components/MechanismLab.tsx` (660 linhas) em 2026-09-13 — reconfira as linhas antes de editar.

**Governança dos modos (vai para o orquestrador ou para um índice de módulos):**
- `export type Mode = 'engine' | 'gears' | 'brakes' | 'cooling' | 'suspension' | 'electrical';` — `:5`. **Exportado e consumido por `src/App.tsx` via `import type`** — se mudar de arquivo, ajuste o import lá sem transformá-lo em import de valor (puxaria o chunk para o bundle principal).
- `type MechanismLabProps = { initialMode?: Mode };` — `:6`
- `const modes: { id: Mode; tab: string; header: string }[]` — `:8`
- `const speeds: Record<Mode, number>` — `:16`
- `const startAngle = (mode: Mode) => mode === 'engine' ? 90 : 0;` — `:17`

**Dados por mecanismo (cada um vai para o módulo do seu mecanismo):**
- `const strokes` — `:18` (engine) · `const ratios` — `:45` (gears) · `const pressures` — `:65` (brakes) · `const circuits` — `:89` (cooling) · `const bumps` — `:106` (suspension) · `const charges` — `:123` (electrical)
- `type Flow = { alternator: number; busLeft: number; battery: number; busRight: number; load: number; starter: number };` — `:433` — usado só pelo mecanismo elétrico, mas **declarado depois de `charges` (`:123`), que o referencia** — funciona por hoisting de tipo; ao separar, mantenha os dois no mesmo módulo.

**Componentes de diagrama (um por módulo):**
- `function EngineDiagram({ angle, stroke }: { angle: number; stroke: number })` — `:150`
- `function GearDiagram({ angle, input, output }: { angle: number; input: number; output: number })` — `:204`
- `function BrakeDiagram({ angle, force, color, label }: { angle: number; force: number; color: string; label: string })` — `:232`
- `function CoolingDiagram({ angle, open }: { angle: number; open: boolean })` — `:312`
- `function SuspensionDiagram({ angle, damped, label }: { angle: number; damped: boolean; label: string })` — `:386`
- `function ElectricalDiagram({ angle, flows, label, spin }: { angle: number; flows: Flow; label: string; spin: boolean })` — `:435`

**Auxiliares (vão para o módulo comum):**
- `function FlowPath({ d, color, active, offset, width = 13, flow = 6.5, dash = '10 14' }: {...})` — `:305` — **compartilhado**: usado por arrefecimento (6 chamadas) e elétrica (6 chamadas).
- `function toothPath(teeth: number, module: number)` — `:51` — só `gears`.
- `function suspensionTravel(time: number, damped: boolean)` — `:372` e `function coilPath(x, top, bottom, turns, width)` — `:376` — só `suspension`. Podem ir para o módulo do mecanismo em vez do comum.

**Orquestrador — `export default function MechanismLab({ initialMode = 'engine' }: MechanismLabProps)` — `:499`.** O corpo tem, nesta ordem (`:500-519`):
- comum: `mode`, `running`, `angle`, `reducedMotion`, `tabs` (ref), `id` (`useId`), `activeMode`;
- **por mecanismo**: `ratioIndex`, `pressureIndex`, `circuitIndex`, `bumpIndex`, `chargeIndex` (com defaults diferentes: `pressureIndex` e `bumpIndex` e `chargeIndex` iniciam em `1`, os outros em `0`) e os derivados `stroke`, `ratio`, `activeStroke`, `pressure`, `circuit`, `bump`, `charge`.
- Três `useEffect` (`:521` em diante): reação a `initialMode`, media query de `prefers-reduced-motion`, e o loop de `requestAnimationFrame` que usa `speeds[mode]`.

**Renderização:**
- Diagramas: `:567-572`, um `{mode === 'x' && <XDiagram .../>}` por linha.
- Painéis: blocos `{mode === 'x' && <>` em `:584` (engine), `:598` (gears), `:610` (brakes), `:622` (cooling), `:634` (suspension), `:646` (electrical).

## A decisão de design que esta task precisa tomar

O estado de cada mecanismo (`pressureIndex` e companhia) vive hoje no componente pai. Co-locar o mecanismo num módulo levanta a pergunta: esse estado vai junto, ou fica no orquestrador?

- **Fica no orquestrador**: menos mudança, mas o módulo não é autocontido — acrescentar um mecanismo continuaria exigindo tocar o pai.
- **Vai para o módulo**: cada mecanismo passa a gerir seu próprio estado, e o orquestrador só entrega `angle`/`running`. Mais alinhado ao objetivo do `ADR-008`, porém exige definir um contrato — algo como cada módulo exportar `{ id, tab, header, speed, startAngle, useMechanism() }` ou um componente que recebe `angle` e renderiza diagrama + painel.

Decidir isso **antes** de mover código, e registrar o motivo no "Registro de execução" da task.

## Restrições ativas

- **Nenhuma mudança de comportamento.** Critério de pronto é os seis funcionarem exatamente como antes.
- Todo movimento continua derivando de `angle`; nada de `@keyframes`/`transition` CSS (invariante de `docs/modules/mechanism-lab.md` — é o que mantém `prefers-reduced-motion` garantido por uma checagem só).
- O chunk do `MechanismLab` (`React.lazy` em `App.tsx`) precisa continuar **único e separado** do `index` — confira na saída do `vite build`, que hoje mostra `MechanismLab-*.js` em ~41 kB e `index-*.js` em ~319 kB.
- `App.tsx` continua importando `Mode` com `import type`.
- As abas indexam sobre `modes.length` — a navegação por teclado (setas com wrap, `Home`/`End`) não pode passar a depender de lista escrita à mão.
- Sem suíte de testes neste projeto (`AGENTS.md`): validação é `npm run build` + verificação visual, mecanismo por mecanismo.

## Próximo passo imediato

Ler `MechanismLab.tsx` inteiro e `docs/modules/mechanism-lab.md`, decidir o contrato do módulo (ver "A decisão de design" acima) e só então começar — extraindo **`gears` primeiro**, que é o menor (dados em `:45-49`, diagrama em `:204-230`, painel em `:598-608`), para firmar o formato antes de mexer nos maiores. Deixe `engine` por último: é o mais antigo, o mais detalhado, e o único cujo estado não é um índice guardado — o tempo atual é **derivado do ângulo** (`const stroke = Math.floor((angle % 720) / 180)`, `:511`) e a navegação entre etapas escreve no próprio relógio (`const selectStroke = (index: number) => { setRunning(false); setAngle(index * 180 + 90); };`, `:545`, usada pelas abas de etapa em `:586` e pelo botão "Próximo tempo" em `:594`). Ou seja: enquanto os outros cinco mecanismos guardam um índice independente de `angle`, o motor acopla estado e relógio — é o caso que mais tensiona o contrato de módulo escolhido.

---
Para retomar: abra uma sessão nova e peça para ler este arquivo antes de continuar a task `TASK-017`.
