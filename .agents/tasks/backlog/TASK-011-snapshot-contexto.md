# Snapshot — TASK-011

Gerado em: 2026-09-13
Task: `.agents/tasks/backlog/TASK-011-animacao-condicionada-modelo-3d.md`

## ADR de referência

`.agents/decisions/ADR-005-animacao-condicionada-por-sistema-no-modelo-3d.md` — a task de maior risco técnico das 7, porque mexe em geometria já existente (agrupamento de rodas), não só adiciona.

## Assinaturas de código necessárias

- `const fan = new THREE.Group(); fan.position.set(-2.07, .76, 0);` — `src/components/CarScene.tsx:274-275`, com 7 `blade` adicionadas em `:276-286` (`fan.add(blade)`) — já é um `THREE.Group`, pronto para girar (`fan.rotation.x += delta`), sem mudança estrutural.
- Loop de construção das rodas: `for (const x of [-1.68, 1.68]) for (const side of [-1, 1]) { ... }`, começando em `:152` — constrói tread, sidewalls, raios, cubo, parafusos, disco de freio, pastilha, amortecedor, mola, junta homocinética, tudo direto em `car` (sem agrupar por roda). Ler o bloco inteiro (`:152` até o fechamento do loop) antes de decidir quais chamadas entram no novo `THREE.Group` rotativo (candidato: tudo com `part: 'tire'`) e quais ficam de fora (`brake-disc`, `brake-pad`, `shock-absorber`, `spring`, `cv-joint` — fixos ao chassi).
- Polias da correia dentada (`timing-belt`): bloco começando em `:223` (`for (const [x, y, r] of [[-1.75, .96, .13], [-1.4, .65, .105]])`) — candidato a girar sem geometria nova, se essa opção for escolhida para a animação do motor.
- `function render() { ... }` — `~:494` em diante — loop principal de renderização (hoje só `orbit.update()` + projeção de pins); é onde a lógica de animação condicionada entra.
- Bridge de props: `const props = useRef({ activeSystem, ... }); props.current = { activeSystem, ... };` — topo do componente — ler `activeSystem` sempre via `props.current` dentro do loop, nunca a prop direta (regra 2 do papel `three-scene`).
- `.claude/agents/three-scene.md` — ler as regras obrigatórias antes de mexer (especialmente a 1, sobre descarte de recursos, e a nova nota sobre pins/sistema com no máximo 3 exibidos).

## Restrições ativas

- Primeira animação contínua da cena — precisa adicionar a checagem de `prefers-reduced-motion` (`window.matchMedia('(prefers-reduced-motion: reduce)')`), que `CarScene.tsx` ainda não tem (só `MechanismLab.tsx` tem hoje).
- Agrupar meshes de roda num `THREE.Group` não pode quebrar a seleção por clique (raycasting intersecta objetos individuais, não grupos) — cada mesh precisa continuar com `userData.part`/`userData.system` e estar em `pickables`, exatamente como hoje.
- Não afrouxar limites de câmera/zoom (regra já estabelecida).

## Próximo passo imediato

Implementar primeiro a animação da ventoinha (`fan.rotation.x`, condicionada a `activeSystem === 'cooling'`) — é a mudança mais simples e segura (grupo já existe, nada para refatorar) — antes de partir para o agrupamento de rodas, que é o item de maior risco.

---
Para retomar: abra uma sessão nova e peça para ler este arquivo antes de continuar a task `TASK-011`.
