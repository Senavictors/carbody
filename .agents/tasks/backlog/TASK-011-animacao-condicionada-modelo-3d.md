---
id: TASK-011
title: "Animar peças do modelo 3D condicionadas ao sistema selecionado"
status: backlog
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

- [ ] CA-01: ventoinha do radiador gira quando `cooling` está selecionado, para quando outro sistema é selecionado.
- [ ] CA-02: rodas giram como conjunto (não peça por peça de forma dessincronizada) quando `suspension` está selecionado.
- [ ] CA-03: alguma animação representa o motor funcionando quando `engine` está selecionado (polias/correia ou pistão novo, conforme decidido na implementação).
- [ ] CA-04: `prefers-reduced-motion` ativado desabilita todas as animações novas.
- [ ] CA-05: seleção de peça por clique (raycasting) continua funcionando normalmente em todas as peças, incluindo as agora agrupadas (rodas).
- [ ] CA-06: `npm run build` passa sem erros.

## Impacto técnico

### Frontend
`src/components/CarScene.tsx` — possível refactor do loop de construção de rodas (agrupar em `THREE.Group`), adição de estado de animação no loop `render()`, nova checagem de `prefers-reduced-motion`.

### Banco de dados / Backend / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [ ] Etapa 1: adicionar a checagem de `prefers-reduced-motion` ao `CarScene.tsx` (padrão já usado em `MechanismLab.tsx`).
- [ ] Etapa 2: girar a ventoinha (`fan`) condicionado a `cooling` — validar o padrão antes de ir para os itens mais complexos.
- [ ] Etapa 3: agrupar as peças rotativas de cada roda num `THREE.Group`; girar condicionado a `suspension`.
- [ ] Etapa 4: decidir e implementar a animação do motor (polias/correia ou pistão novo).
- [ ] Etapa 5: verificar que a seleção de peça por clique não regrediu, especialmente nas rodas.

## Estratégia de testes

- [ ] Unitários/Integração/E2E — não aplicável.
- [x] Manual — selecionar cada sistema animado e observar o movimento; `prefers-reduced-motion`; clicar em peças de roda para confirmar que a seleção não quebrou.

## Riscos e rollback

Risco principal: agrupar meshes de roda num `THREE.Group` é o único ponto desta task que mexe em geometria já existente (não é só aditivo) — testar com cuidado que a seleção por clique não regride. Rollback: reverter o agrupamento e as chamadas de rotação — mudança concentrada, sem afetar o catálogo de conteúdo.

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
