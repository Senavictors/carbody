---
id: TASK-011
title: "Animar peças do modelo 3D condicionadas ao sistema selecionado"
status: completed
type: feature
owner:
created_at: 2026-09-13
updated_at: 2026-09-13
affected_modules: [three-scene]
related_use_cases: []
related_adrs: [ADR-005]
---

# TASK-011 — Animar peças do modelo 3D condicionadas ao sistema selecionado

## Contexto

`ADR-005`. `CarScene.tsx` hoje não anima nenhuma peça continuamente — o loop `render()` (linha ~494) só faz `orbit.update()` e projeta os pins a cada frame. Esta task adiciona movimento real a peças específicas, condicionado a `activeSystem`.

## Objetivo

Pelo menos 3 animações condicionadas: ventoinha do radiador girando quando `cooling` está ativo (já existe como `THREE.Group`, `const fan`, linha ~274 — só falta girar), rodas girando quando `suspension` está ativo, e algum movimento representando o motor em funcionamento quando `engine` está ativo.

## Fora de escopo

- Mudanças em `MechanismLab.tsx` — são `TASK-009`/`TASK-010`.
- Animar os 7 sistemas — só os que têm um movimento natural e não forçado (ver Comportamento esperado).

## Comportamento atual

- `fan` (linha 274-286) é um `THREE.Group` com 7 pás (`blade`), já posicionado e pronto para girar — só falta `fan.rotation.x += delta` em algum lugar do loop.
- As rodas são construídas peça por peça (tread, sidewalls, raios, cubo, disco, parafusos — ver o loop `for (const x of [-1.68, 1.68]) for (const side of [-1, 1])`, linha ~152) diretamente em `car`, **sem** um `THREE.Group` por roda — não há hoje um jeito único de "girar a roda inteira".
- Não existe uma peça "pistão" isolada — o cilindro do motor é um único mesh (`cyl(.081, .27, [x, .82, .335], ..., 'engine', 'engine', 'y')`, dentro do loop `for (let i = 0; i < 4; i++)`, linha ~224). As polias da correia dentada (`timing-belt`, linha ~223 em diante) já são cilindros/toros individuais, candidatos mais diretos a girar sem geometria nova.

## Comportamento esperado

- **Arrefecimento**: `fan.rotation.x` incrementado a cada frame quando `props.current.activeSystem === 'cooling'` (ou `'all'`, a decidir).
- **Suspensão**: as peças que compõem cada roda (pneu, banda de rodagem, raios, cubo — não a pastilha/pinça/amortecedor, que são fixos ao chassi) precisam ser agrupadas num `THREE.Group` por roda na construção, para poder girar como um conjunto só. É a mudança de maior escopo desta task — decidir, na implementação, exatamente quais meshes entram no grupo rotativo (candidato: tudo que hoje tem `part: 'tire'`) e quais ficam de fora (disco/pastilha de freio, amortecedor, junta homocinética — continuam fixos).
- **Motor**: como não existe peça "pistão" isolada, escolher entre (a) girar as polias/correia já existentes (`timing-belt`) — sem geometria nova, mecanicamente correto (a correia realmente gira com o motor funcionando) — ou (b) adicionar uma peça pistão nova, pequena, dentro do cilindro existente, que sobe/desce — mais fiel à ideia de "pistão", mas geometria nova. Decidir na implementação, calibrando visualmente qual comunica melhor.
- Toda animação só roda quando `!props.current.autoRotate` ou independente disso (a decidir) **e** `!reducedMotion` — replicar a checagem de `prefers-reduced-motion` já usada em `MechanismLab.tsx` (`window.matchMedia('(prefers-reduced-motion: reduce)')`), que `CarScene.tsx` ainda não tem.
- Animação para quando o sistema correspondente deixa de estar selecionado (volta ao estado parado, não só "não gira mais a partir de onde estava" — considerar se precisa resetar a posição/ângulo ou se pode simplesmente parar).

## Regras de negócio

- RN-01 (herdada de `.claude/agents/three-scene.md`): nenhuma mudança na árvore de `pickables`/`appearances` pode quebrar a seleção de peça existente — agrupar meshes de roda num `THREE.Group` não pode impedir que cada mesh individual continue sendo clicável/realçável (o raycaster intersecta objetos individuais, não grupos, então isso deve continuar funcionando desde que os meshes continuem tendo `userData.part`/`userData.system` e estarem em `pickables` como hoje).
- RN-02: primeira animação contínua da cena — precisa da checagem de `prefers-reduced-motion`, que não existe ainda neste arquivo.
- RN-03: não afrouxar os limites de câmera/zoom existentes (regra já estabelecida do papel `three-scene`).

## Critérios de aceitação

- [x] CA-01: ventoinha do radiador gira quando `cooling` está selecionado, para quando outro sistema é selecionado.
- [x] CA-02: rodas giram como conjunto (não peça por peça de forma dessincronizada) quando `suspension` está selecionado.
- [x] CA-03: alguma animação representa o motor funcionando quando `engine` está selecionado — polias da correia dentada, com raios novos para a rotação ficar visível.
- [x] CA-04: `prefers-reduced-motion` ativado desabilita todas as animações novas.
- [x] CA-05: seleção de peça por clique (raycasting) continua funcionando normalmente em todas as peças, incluindo as agora agrupadas (rodas).
- [x] CA-06: `npm run build` passa sem erros.

## Impacto técnico

### Frontend
`src/components/CarScene.tsx` — possível refactor do loop de construção de rodas (agrupar em `THREE.Group`), adição de estado de animação no loop `render()`, nova checagem de `prefers-reduced-motion`.

### Banco de dados / Backend / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [x] Etapa 1: adicionar a checagem de `prefers-reduced-motion` ao `CarScene.tsx` (padrão já usado em `MechanismLab.tsx`).
- [x] Etapa 2: girar a ventoinha (`fan`) condicionado a `cooling` — validar o padrão antes de ir para os itens mais complexos.
- [x] Etapa 3: agrupar as peças rotativas de cada roda num `THREE.Group`; girar condicionado a `suspension`.
- [x] Etapa 4: decidir e implementar a animação do motor (polias da correia dentada).
- [x] Etapa 5: verificar que a seleção de peça por clique não regrediu, especialmente nas rodas.

## Estratégia de testes

- [x] Unitários/Integração/E2E — não aplicável.
- [x] Manual — selecionar cada sistema animado e observar o movimento; `prefers-reduced-motion`; clicar em peças de roda para confirmar que a seleção não quebrou.

## Riscos e rollback

Risco principal: agrupar meshes de roda num `THREE.Group` é o único ponto desta task que mexe em geometria já existente (não é só aditivo) — testar com cuidado que a seleção por clique não regride. Rollback: reverter o agrupamento e as chamadas de rotação — mudança concentrada, sem afetar o catálogo de conteúdo.

## Registro de execução

### Alterações realizadas

- `CarScene.tsx` ganhou sua primeira checagem de `prefers-reduced-motion`: `window.matchMedia` lido no `useEffect` principal, guardado numa variável local e atualizado por um listener `change` que o cleanup remove.
- O loop `render()` passou a calcular um delta em segundos a partir de `performance.now()`, limitado a 80 ms. O relógio avança mesmo quando nada se move, então trocar de sistema nunca produz um salto acumulado.
- Três animações condicionadas a `props.current.activeSystem`: ventoinha (`cooling`, 2,4 rad/s), rodas (`suspension`, 1,25 rad/s) e polias da correia dentada (`engine`, 1,5 rad/s na polia maior, proporcionalmente mais rápido na menor — é a mesma correia).
- **Agrupamento sem tocar nos helpers**: cada roda marca `spinStart`/`spinEnd` em `car.children` durante a construção e, no fim do bloco, move essa fatia para um `THREE.Group` posicionado no centro do cubo com `hub.attach(mesh)`. `attach()` preserva a transformação no mundo, então nada se desloca. As polias da correia usam o mesmo padrão.
- Três raios por polia da correia dentada (geometria nova, `part: 'timing-belt'`): um cilindro liso girando não mostra que está girando.
- O corpo do radiador passou a ter `opacity: .55`.

### Arquivos principais

- `src/components/CarScene.tsx`
- `docs/modules/car-scene.md`, `.claude/agents/three-scene.md` + `.codex/agents/three-scene.toml`, `docs/architecture/components.md`, `.agents/context/CONTEXT.md`

### Decisões

- **Reparentar depois de construir, em vez de mexer no helper `solid()`.** Fazer `solid()` aceitar um pai alternativo mudaria a assinatura usada por toda a cena. Construir normalmente e reparentar no fim isola a mudança no bloco da roda e mantém `pickables`/`appearances` intactos. Detalhe que custou atenção: o slice de `car.children` precisa ser tirado **antes** do primeiro `attach()`, porque `attach` remove o mesh de `car.children` e mutaria o array durante a iteração.
- **Polias com raios, em vez de pistão novo.** A task deixava a escolha em aberto. Girar as polias já existentes não comunicava nada — cilindros e toros lisos girando em torno do próprio eixo são visualmente idênticos parados ou girando. A alternativa do pistão esbarrava na geometria: não há cilindro de motor exposto (o que parece cilindro são os dutos de admissão), então um pistão ficaria dentro do bloco opaco. Adicionar três raios a cada polia resolve com pouca geometria, é mecanicamente correto e usa uma peça que já está no catálogo.
- **A correia não se move.** Com as polias girando, a correia fica parada — um tubo liso fechado não tem como mostrar movimento. É a convenção de esquema; as polias com raios carregam a leitura.
- **Só o sistema selecionado se move.** `'all'` (Visão geral) não anima nada: animar tudo ali seria a Alternativa A que o `ADR-005` rejeitou.
- **Sem reset de ângulo ao trocar de sistema.** A task deixava em aberto. Uma roda que para na posição em que estava é o estado natural; resetar produziria um salto visível.

### Divergências

- **O disco de freio entrou no grupo rotativo, contra o que a task e o snapshot previam.** Os dois listavam `brake-disc` entre as peças "fixas ao chassi". Isso está mecanicamente errado: o disco é parafusado no cubo e gira solidário à roda. Mantê-lo parado produziria uma roda girando com o disco imóvel dentro dela, visível por entre os raios. Ficaram de fora, corretamente, a pastilha, a pinça, o amortecedor, a mola e a junta homocinética.
- **A colmeia do radiador virou semitransparente — mudança de aparência não prevista na task.** Com o corpo opaco, a ventoinha fica completamente escondida atrás dele em todas as vistas padrão: a animação rodava (medida em `fan.rotation.x`) mas nenhum pixel mudava na tela. Como um radiador real é vazado, `opacity: .55` resolve a oclusão sendo mais fiel, não menos. É a única alteração desta task em geometria/material pré-existente além do agrupamento.

### Pendências

- Sistemas sem animação nesta rodada: `brakes`, `electrical`, `transmission` e `fuel`. O `ADR-005` já previa isso ("não é obrigatório animar os 7 sistemas") e sua seção "Revisão" pede reavaliar depois desta primeira rodada. Candidato natural agora que as rodas são um `THREE.Group`: a pinça apertando o disco em `brakes`.
- O `autoRotate` continua um prop morto (`App.tsx` sempre passa `false`). O `ADR-005` menciona isso no contexto, mas a decisão foi animar peças, não a câmera — então o prop segue sem uso e sem dono. Vale decidir se remove ou se vira um controle real.

## Validação

```bash
npm run build
```
Passou sem erros. O chunk do `CarScene` foi de 608,33 kB para 609,36 kB.

Verificação no navegador (`npm run dev`, http://localhost:5173, página "Explorar o carro"). A cena só desenha sob demanda neste ambiente, então a medição foi feita comparando o framebuffer entre frames consecutivos (`gl.readPixels`, contando pixels alterados) em vez de confiar só em captura de tela:

| sistema selecionado | pixels alterados entre frames |
|---|---|
| Suspensão | 1049, 980, 1008, 1034, 1039, 1018 |
| Motor | 20, 13, 10, 7, 11, 4 |
| Arrefecimento (antes da colmeia vazada) | 0, 0, 0, 0, 0, 0 |
| Arrefecimento (depois) | 80, 36, 34, 43, 34, 37 |
| **Transmissão (controle, sem animação)** | **0, 0, 0, 0, 0, 0** |

- CA-01/CA-02/CA-03: cada sistema animado altera pixels a cada frame; o controle sem animação fica em zero absoluto, o que descarta ruído de câmera ou de damping do `OrbitControls`. As rodas também foram conferidas por captura de tela: os raios mudam de posição entre capturas com `suspension` e ficam imóveis com `electrical`.
- Estrutura do agrupamento conferida por instrumentação temporária (removida antes do commit): 4 grupos de roda, 81 meshes cada, 76 deles pickáveis, com `userData.part` em `['tire','wheel-bearing','(decorativo)','brake-disc']`; grupo de polia com `['timing-belt']`. Confirma que pastilha, pinça, amortecedor, mola e junta ficaram fora.
- CA-04: com `window.matchMedia('(prefers-reduced-motion: reduce)')` forçado a `matches: true` e a cena remontada, `fan.rotation.x` permaneceu exatamente `0` com `cooling` selecionado ao longo de vários frames.
- CA-05: cinco pontos diferentes em duas rodas distintas (`(490,280)`, `(458,312)`, `(490,345)`, `(520,300)`, `(288,372)`) selecionaram "Pneu", partindo de "Amortecedor" — o raycasting acerta os meshes reparentados. Console do navegador sem erros.

## Handoff
Não aplicável — a task foi executada e verificada em uma única sessão.
