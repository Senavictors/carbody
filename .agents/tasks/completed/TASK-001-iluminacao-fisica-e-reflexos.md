---
id: TASK-001
title: Iluminação física, ambiente procedural e AO no modelo 3D
status: completed
type: enhancement
owner: three-scene (Claude Code)
created_at: 2026-09-11
updated_at: 2026-09-11
affected_modules: [three-scene]
related_use_cases: []
related_adrs: [ADR-002]
---

# TASK-001 — Iluminação física, ambiente procedural e AO no modelo 3D

## Contexto

Parte 1/2 de `ADR-002`. O usuário pediu mais realismo no modelo 3D do carro. `CarScene.tsx` hoje usa `MeshStandardMaterial` sem `envMap` (nenhum reflexo de ambiente) e iluminação simples sem oclusão de ambiente (AO).

## Problema

Metais, vidros e plásticos do modelo (rodas, para-brisa, carroceria fantasma) não refletem nada — parecem "planos" mesmo sendo materiais PBR (`MeshStandardMaterial` já suporta `envMap`, só não está configurado). Reentrâncias do motor (entre pistão/bloco, entre peças próximas) não têm sombra de contato, perdendo profundidade visual.

## Objetivo

Adicionar um ambiente procedural (gerado localmente, sem depender de arquivo HDR externo) que dê reflexo real aos materiais existentes, e um passe leve de ambient occlusion (AO) que reforce a profundidade nas reentrâncias — sem mudar nenhuma geometria, cor ou peça existente.

## Fora de escopo

- Qualquer mudança de geometria (segmentos, peças novas) — isso é `TASK-002`.
- Otimização para mobile/dispositivos fracos — `ADR-002` decidiu deliberadamente focar em desktop.
- Bloom, FXAA, depth-of-field ou qualquer outro efeito de pós-processamento além do AO.

## Comportamento atual

`renderer.render(scene, camera)` é chamado diretamente (sem `EffectComposer`). `scene.environment` nunca é definido. Luzes: `HemisphereLight('#f2f5f3', '#858c87', 2.25)` + `DirectionalLight` `key` (com sombra, `shadow.mapSize` 1024×1024) + `DirectionalLight` `rim` (sem sombra).

## Comportamento esperado

- Um `THREE.PMREMGenerator` gera um `envMap` a partir de `RoomEnvironment` (`three/addons/environments/RoomEnvironment.js`) uma única vez, fora do loop de render, e é atribuído a `scene.environment`.
- O `PMREMGenerator` e o `RoomEnvironment` intermediário são descartados (`dispose()`) depois de gerar o mapa e no cleanup do componente — nenhum recurso extra deve vazar.
- `renderer.render(scene, camera)` passa a ser substituído por um `EffectComposer` com `RenderPass` → `GTAOPass` → `OutputPass` (todos de `three/addons/postprocessing/`), redimensionado junto com o `resize()` já existente.
- O resultado visual final mantém o tom/paleta atual do carro (não deve parecer "outro carro") — o objetivo é reflexo e profundidade, não mudança de identidade visual.

## Regras de negócio

- RN-01: nenhuma textura/HDR externo pode ser carregado por URL/fetch — o ambiente deve ser gerado localmente (`RoomEnvironment`), preservando a restrição de "sem chamada de rede em runtime" (Constituição).
- RN-02: todo recurso Three.js criado (render targets do composer, o `PMREMGenerator`, texturas intermediárias) precisa ter descarte correspondente no cleanup do `useEffect` principal, seguindo o padrão já usado para geometrias/materiais (ver `.claude/agents/three-scene.md`, regra 1).

## Critérios de aceitação

- [x] CA-01: `scene.environment` está definido a partir de `RoomEnvironment`/`PMREMGenerator`, sem nenhum `fetch`/`load` de arquivo externo.
- [x] CA-02: metais e vidros do carro (rodas, disco de freio, para-brisa/carroceria fantasma) visivelmente refletem o ambiente ao girar a câmera.
- [x] CA-03: `EffectComposer` com `GTAOPass` está ativo e produz sombreamento visível em pelo menos uma reentrância do motor (ex.: entre bloco e cabeçote).
- [x] CA-04: `resize()` continua funcionando corretamente com o composer (a cena não distorce ao redimensionar a janela).
- [x] CA-05: `npm run build` passa sem erros.
- [~] CA-06: verificado por revisão de código (todo recurso novo tem `dispose()` correspondente no cleanup — ver "Alterações realizadas"), não por profiling empírico de memória em DevTools ao longo de várias montagens/desmontagens. Ver "Pendências".

## Impacto técnico

### Backend
Não se aplica (projeto sem backend).

### Frontend
`src/components/CarScene.tsx` — adicionar imports de `PMREMGenerator` (já em `three` core), `RoomEnvironment`, `EffectComposer`, `RenderPass`, `GTAOPass`, `OutputPass` (de `three/addons/...`); substituir a chamada de render direta pelo composer; atualizar `resize()` para redimensionar o composer também.

### Banco de dados
Não se aplica.

### Integrações
Não se aplica (nenhuma nova integração externa — geração é 100% local).

### Segurança
Não se aplica.

## Plano de implementação

- [x] Etapa 1: gerar o `envMap` via `PMREMGenerator`/`RoomEnvironment` e atribuir a `scene.environment`; validar visualmente o reflexo antes de mexer em pós-processamento.
- [x] Etapa 2: montar o `EffectComposer` com `RenderPass` → `GTAOPass` → `OutputPass`, substituindo `renderer.render(scene, camera)`.
- [x] Etapa 3: ajustar `resize()` para redimensionar o composer junto da câmera/renderer.
- [x] Etapa 4: calibrar intensidade do AO (evitar escurecer demais) e conferir que o tom geral do carro não mudou.
- [x] Etapa 5: adicionar descarte (`dispose()`) de todos os recursos novos no cleanup do `useEffect`.

## Estratégia de testes

- [ ] Unitários — não aplicável (projeto sem suíte de testes automatizada, ver `AGENTS.md`).
- [ ] Integração — não aplicável.
- [ ] E2E — não aplicável.
- [x] Manual — comparação visual antes/depois nas três visões, com e sem carroceria (`bodyVisible`), clique de seleção de peça, e redimensionamento de viewport (900×700). Checagem de memória via DevTools ao longo de várias montagens/desmontagens **não foi executada** nesta sessão (ver Pendências) — a garantia de não vazamento vem da revisão do código de cleanup, não de medição.

## Riscos e rollback

Risco principal: AO mal calibrado deixa o motor escuro demais, ou o `envMap` deixa metais "espelhados" demais para o tom didático do produto. Rollback simples: reverter para `renderer.render(scene, camera)` direto e remover `scene.environment` (um único commit de reversão, sem afetar geometria/dados).

## Registro de execução

### Alterações realizadas
- Imports novos de `three/addons/environments/RoomEnvironment.js` e `three/addons/postprocessing/{EffectComposer,RenderPass,GTAOPass,OutputPass}.js` — todos já presentes em `node_modules/three` (sem dependência npm nova, confirmado antes de codar).
- Ambiente procedural: `new THREE.PMREMGenerator(renderer)` + `new RoomEnvironment()` → `pmremGenerator.fromScene(roomEnvironment, .04)` → `scene.environment = envRenderTarget.texture`. `roomEnvironment`/`pmremGenerator` descartados logo após o bake (só o `envRenderTarget` resultante precisa sobreviver, atribuído a `scene.environment` para o resto da vida da cena).
- Pipeline de render: `EffectComposer` com `RenderPass(scene, camera)` → `GTAOPass(scene, camera, 1, 1)` (com `updateGtaoMaterial({ radius: .3, distanceExponent: 1, thickness: 1, scale: 1 })` e `blendIntensity = .65`, chamado separadamente do construtor por causa de uma divergência de tipos — ver "Divergências") → `OutputPass` (aplica o tone mapping/color space do renderer no fim da cadeia, como documentado pela própria classe).
- `renderer.render(scene, camera)` substituído por `composer.render()` no loop de `render()`.
- `resize()` ganhou `composer.setSize(width, height)` logo após `renderer.setSize(width, height)`.
- Cleanup do `useEffect` principal ganhou `envRenderTarget.dispose()`, `gtaoPass.dispose()`, `outputPass.dispose()`, `composer.dispose()` (nessa ordem, antes de `renderer.dispose()`). `RenderPass` não tem `dispose()` próprio (não aloca recursos GPU extras) — confirmado lendo o código-fonte do módulo antes de decidir não descartá-lo.

### Arquivos principais
- `src/components/CarScene.tsx` — única alteração de código desta task.

### Decisões
- `GTAOPass` construído sem os parâmetros de AO no construtor (a assinatura de 6 argumentos existe no runtime, mas o `@types/three` instalado — 0.183.1, uma versão atrás do `three` 0.183.2 — só tipa até o 5º argumento). Em vez de usar `as any`/type assertion para forçar a assinatura mais nova, optei por chamar `gtaoPass.updateGtaoMaterial({...})` logo depois — é o mesmo método que o construtor chamaria internamente com esses parâmetros (confirmado lendo o JS-fonte do pass), então o comportamento é idêntico e o código fica corretamente tipado.
- `blendIntensity = .65` (em vez do padrão `1`) para manter a oclusão "leve", conforme pedido no ADR-002 ("sombra de contato", não um escurecimento forte) — calibrado por inspeção visual no navegador.
- Não defini `gtaoPass.output` — o padrão (`GTAOPass.OUTPUT.Default = 0`) já combina cena + AO, que é o que se quer (não um buffer de debug isolado).

### Divergências
- Nenhuma divergência de comportamento em relação ao que o ADR/task pediam. A única divergência foi a de tipos do `@types/three` descrita acima, resolvida sem mudar o resultado.

### Pendências
- CA-06 (ausência de vazamento de memória de GPU) foi coberto por revisão de código, não por medição em DevTools ao longo de várias montagens/desmontagens do componente — recomendo que isso seja checado manualmente (abrir "Explorar" → navegar para outra página → voltar, repetidas vezes, observando `chrome://gpu`/aba Memory do DevTools) antes de considerar a task pronta para `bootstrap-complete`.
- Nenhuma calibração fina adicional de AO/exposição foi pedida pelo usuário além da revisão visual feita nesta sessão — se o resultado não agradar em uso prolongado, ajustar `gtaoPass.blendIntensity` e os parâmetros de `updateGtaoMaterial` é a primeira coisa a tentar (ambos isolados no bloco de código descrito acima).

## Validação

- `npx tsc -b --noEmit` — sem erros.
- `npm run build` — sem erros (`tsc -b && vite build`); `CarScene` segue como chunk separado (`~606 kB`, já era code-splitted antes desta task).
- Verificação visual no navegador (dev server, `http://127.0.0.1:5173`): reflexo visível em rodas/discos de freio ao girar a câmera; sombreamento mais presente entre motor/radiador/rodas com `bodyVisible` desligado; fundo da cena permanece transparente (sem regressão de alpha através do composer); clique numa peça (`Câmbio`) continua abrindo o painel de detalhe correto (raycasting não afetado); redimensionamento da janela (900×700) não distorce a cena.

## Handoff
Nenhum — task implementada e validada na mesma sessão que a iniciou, sem necessidade de handoff para outra sessão/ferramenta.
