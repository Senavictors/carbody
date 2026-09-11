---
id: TASK-001
title: Iluminação física, ambiente procedural e AO no modelo 3D
status: backlog
type: enhancement
owner:
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

- [ ] CA-01: `scene.environment` está definido a partir de `RoomEnvironment`/`PMREMGenerator`, sem nenhum `fetch`/`load` de arquivo externo.
- [ ] CA-02: metais e vidros do carro (rodas, disco de freio, para-brisa/carroceria fantasma) visivelmente refletem o ambiente ao girar a câmera.
- [ ] CA-03: `EffectComposer` com `GTAOPass` está ativo e produz sombreamento visível em pelo menos uma reentrância do motor (ex.: entre bloco e cabeçote).
- [ ] CA-04: `resize()` continua funcionando corretamente com o composer (a cena não distorce ao redimensionar a janela).
- [ ] CA-05: `npm run build` passa sem erros.
- [ ] CA-06: abrir/fechar a página "Explorar" repetidas vezes não mostra crescimento indefinido de memória de GPU (checagem manual via DevTools > Performance/Memory).

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

- [ ] Etapa 1: gerar o `envMap` via `PMREMGenerator`/`RoomEnvironment` e atribuir a `scene.environment`; validar visualmente o reflexo antes de mexer em pós-processamento.
- [ ] Etapa 2: montar o `EffectComposer` com `RenderPass` → `GTAOPass` → `OutputPass`, substituindo `renderer.render(scene, camera)`.
- [ ] Etapa 3: ajustar `resize()` para redimensionar o composer junto da câmera/renderer.
- [ ] Etapa 4: calibrar intensidade do AO (evitar escurecer demais) e conferir que o tom geral do carro não mudou.
- [ ] Etapa 5: adicionar descarte (`dispose()`) de todos os recursos novos no cleanup do `useEffect`.

## Estratégia de testes

- [ ] Unitários — não aplicável (projeto sem suíte de testes automatizada, ver `AGENTS.md`).
- [ ] Integração — não aplicável.
- [ ] E2E — não aplicável.
- [x] Manual — comparação visual antes/depois nas três visões (`perspective`/`side`/`top`), com e sem carroceria (`bodyVisible`); checagem de memória via DevTools após múltiplas montagens/desmontagens do componente.

## Riscos e rollback

Risco principal: AO mal calibrado deixa o motor escuro demais, ou o `envMap` deixa metais "espelhados" demais para o tom didático do produto. Rollback simples: reverter para `renderer.render(scene, camera)` direto e remover `scene.environment` (um único commit de reversão, sem afetar geometria/dados).

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
