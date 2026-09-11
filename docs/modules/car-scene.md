---
estado: real
fonte: src/components/CarScene.tsx
ultima-revisao: TASK-006/TASK-007/TASK-008 + correção de pins, 2026-09-11
---

# Módulo CarScene

## Responsabilidade

Renderiza a maquete 3D interativa do carro didático (React + Three.js) usada na página "Explorar o carro": constrói a geometria procedural do veículo, ilumina e sombreia a cena, permite girar/aproximar via `OrbitControls`, projeta pinos HTML sobre as peças e resolve a seleção de peça por clique via raycasting. Também expõe um fallback SVG estático quando WebGL não está disponível ou o contexto é perdido.

## Localização

- Frontend: `src/components/CarScene.tsx` (+ `src/components/car-scene.css`)

## Conceitos principais

- **Ponte props → imperativo**: o componente monta a cena Three.js uma única vez, num `useEffect` com array de dependências vazio. Props reativas (`activeSystem`, `selectedPart`, `bodyVisible`, `autoRotate`, `view`) são lidas via a ref `props.current`, nunca diretamente — é o que permite que a árvore de objetos 3D seja criada uma vez só, e efeitos subsequentes só chamem métodos da API imperativa exposta em `control.current` (`appearance()`, `camera()`, `zoom()`).
- **Helpers de construção geométrica**: `solid`, `box`, `cyl`, `torus`, `tube`, `line`, `panel` centralizam criação de mesh + material + registro em `pickables`/`appearances`/`bodyItems`. `box()` usa `RoundedBoxGeometry` (6 segmentos de canto, desde a `TASK-002`); `torus()` usa `TorusGeometry` (`radialSegments=18`, `tubularSegments=48`, desde a `TASK-002`).
- **Pipeline de render** (desde a `TASK-001`): a cena não é mais desenhada com `renderer.render(scene, camera)` direto — passa por um `EffectComposer` com três passes, nesta ordem: `RenderPass` (desenha a cena normalmente) → `GTAOPass` (ambient occlusion leve, `blendIntensity = .65`, calibrado para sombra de contato sutil, não escurecimento forte) → `OutputPass` (aplica o tone mapping/color space configurados no `renderer` — deve ser sempre o último pass).
- **Ambiente procedural**: `scene.environment` é um mapa gerado localmente via `THREE.PMREMGenerator` + `RoomEnvironment` (`three/addons/environments/RoomEnvironment.js`), sem nenhum HDR baixado por rede — dá reflexo real a metais/vidros/borrachas que usam `MeshStandardMaterial`. Gerado uma única vez no mount; o `RoomEnvironment`/`PMREMGenerator` de entrada são descartados logo após o bake, mas o `envRenderTarget` resultante precisa sobreviver (descartado só no cleanup do componente).
- **Elementos decorativos vs. peças do catálogo**: nem todo mesh é uma "peça" selecionável. Um mesh criado com `system` preenchido e `part` vazio (ex.: os parafusos de roda e a mangueira decorativa da `TASK-002`) participa da lógica de opacidade por sistema (`appearance()`), mas não entra em `pickables` e não pode ser realçado individualmente — é o padrão para detalhe visual que não corresponde a uma entrada do catálogo (`src/data/parts.ts`).
- **Pins HTML**: `PINS` é uma lista fixa de posições 3D com rótulo e sistema. A cada frame, `render()` projeta cada pino para coordenadas de tela (`Vector3.project`) e resolve sobreposição entre rótulos com uma busca gulosa limitada (não é layout do DOM/CSS). Cada sistema mostra no máximo 3 pins por vez (`shownPins`); um pin extra num sistema que já tem 3 não aparece por padrão, mas a peça continua clicável direto na malha.
- **Peças novas do catálogo expandido (`ADR-003`)**: 15 peças foram adicionadas (escape, direção, 9 que completam sistemas existentes, e as 4 do sistema `fuel` novo), todas seguindo os mesmos helpers e o mesmo padrão `system`/`part`. O sistema `fuel` (Combustível) e o sistema `electrical` ganharam pins dedicados (`fuel-tank`, `fuel-pump`, `fuel-injector`, `ignition-coil`) para não ficarem sem nenhum rótulo flutuante.

## Dependências

### Depende de
- `three` (core: `Scene`, `OrthographicCamera`, `WebGLRenderer`, `PMREMGenerator`, geometrias, materiais).
- `three/addons/controls/OrbitControls.js`, `three/addons/geometries/RoundedBoxGeometry.js`, `three/addons/environments/RoomEnvironment.js`, `three/addons/postprocessing/{EffectComposer,RenderPass,GTAOPass,OutputPass}.js` — todos parte do pacote `three` já instalado (`node_modules/three/examples/jsm/`), nenhuma dependência npm own.
- Nada de `src/data/parts.ts` diretamente — a associação peça↔posição 3D vive só neste arquivo (`PINS`, `userData.part`/`userData.system` nos meshes), não no catálogo.

### É usado por
- `src/App.tsx` — renderiza `<CarScene>` na página "Explorar o carro", passando `activeSystem`/`selectedPart`/`bodyVisible`/`view`/`zoomDelta`/`resetKey` e recebendo `onSelectPart`.

## Interfaces públicas

Props do componente (`Props` em `CarScene.tsx`): `activeSystem`, `selectedPart`, `onSelectPart`, `bodyVisible`, `autoRotate?`, `view?` (`'perspective' | 'side' | 'top'`), `zoomDelta?`, `resetKey?`. Nenhuma delas força a recriação da cena — todas fluem para dentro via `props.current` ou via `useEffect`s dedicados que chamam a API de `control.current`.

## Invariantes

- Todo recurso Three.js (geometria, material, render target, pass, composer) criado dentro do `useEffect` principal precisa ter descarte correspondente no cleanup — ver `.claude/agents/three-scene.md`, regra 1.
- `OutputPass` deve ser sempre o último pass do `composer` (aplica tone mapping/color space; um pass depois dele veria cor já convertida).
- Os limites de câmera (`orbit.minZoom/maxZoom`, `minPolarAngle/maxPolarAngle`) e o alvo fixo (`orbit.target.set(0, .7, 0)`) não devem ser afrouxados/removidos sem decisão explícita — mantêm o carro sempre visível e centralizado como material didático.
- Nenhuma peça pode parecer logotipo, símbolo de marca ou geometria que implique um modelo comercial específico (Constituição do projeto).

## Modos de falha

- **WebGL indisponível ou contexto perdido**: `unavailable` vira `true` (`try/catch` na criação do `WebGLRenderer`, ou evento `webglcontextlost`) e o componente renderiza o fallback SVG estático (`.car-fallback`) em vez da cena 3D.
- **Elemento host sem dimensões** (`clientWidth`/`clientHeight` zero): `resize()` retorna cedo sem chamar `renderer.setSize`/`composer.setSize`, evitando um render target de tamanho inválido.

## Testes

Nenhum automatizado (o projeto não tem suíte de testes — ver `AGENTS.md`). Validação é manual: build (`npm run build`) sem erros, e verificação visual no navegador (reflexo/AO, seleção de peça por clique, redimensionamento de janela, comparação entre visões) — ver as tasks relacionadas abaixo para o que foi checado em cada mudança.

## Decisões relacionadas

- `ADR-002` (aumento de realismo do modelo 3D) — decisão de combinar iluminação física + mais detalhe geométrico, com foco desktop.
- `TASK-001` — implementou o ambiente procedural e o pipeline `EffectComposer`/AO.
- `TASK-002` — implementou o aumento de segmentos de geometria e os elementos decorativos (parafusos, mangueira).
- `ADR-003` (expansão do catálogo de peças) — decisão de implementar conteúdo e geometria em trilhas paralelas por papel.
- `TASK-006` — marcou escape e direção (já modelados) como peças clicáveis.
- `TASK-007` — modelou as 9 peças que completam sistemas existentes.
- `TASK-008` — modelou o sistema de combustível (tanque, bomba, filtro, injetores).
