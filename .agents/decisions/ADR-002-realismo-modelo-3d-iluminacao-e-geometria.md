---
id: ADR-002
title: Aumentar o realismo do modelo 3D via iluminação física + mais detalhe geométrico (foco desktop)
status: accepted
date: 2026-09-11
deciders: [Senavictors]
related_tasks: [TASK-001, TASK-002]
---

# ADR-002 — Aumentar o realismo do modelo 3D via iluminação física + mais detalhe geométrico (foco desktop)

## Contexto

O usuário pediu para otimizar a visualização do modelo 3D do carro (`src/components/CarScene.tsx`), trazendo mais detalhes e mais realismo. Levantamento do código real mostrou:

- Todos os materiais usam `THREE.MeshStandardMaterial` (helper `mat()`) sem nenhum `envMap` — metais e vidros não refletem nada do ambiente.
- Iluminação é só `HemisphereLight` + duas `DirectionalLight` (`key` com sombra, `rim` sem), sem oclusão de ambiente — vãos e reentrâncias do motor ficam visualmente "achatados".
- Geometrias curvas usam poucos segmentos: `RoundedBoxGeometry(...size, 3, radius)` (3 segmentos de canto) e `TorusGeometry(radius, tube, 10, 48)` (10 segmentos radiais) — facetamento perceptível de perto.
- `three/addons/postprocessing/` e `three/addons/environments/RoomEnvironment.js` já estão disponíveis em `node_modules/three` (mesma versão já usada para `OrbitControls`/`RoundedBoxGeometry`), então nenhuma dependência npm nova é necessária.
- Restrição da Constituição (`.agents/test-onboarding.md`): o modelo deve continuar esquemático/genérico, sem representar um veículo comercial específico — nenhuma das abordagens avaliadas viola isso, já que atuam em luz/material/geometria, não em marca/identidade.

Três opções foram apresentadas ao usuário (ver processo `bootstrap-plan`): (A) iluminação física + reflexos via ambiente procedural gerado localmente e AO leve; (B) mais detalhe geométrico (segmentos, parafusos, chanfros); (C) pipeline de pós-processamento isolado (AO/FXAA/bloom). O usuário escolheu combinar A e B, e declarou explicitamente que performance mobile não é uma preocupação — o foco do projeto é web desktop.

## Decisão

Implementar as opções A e B juntas:

1. **Iluminação/reflexos (A)**: gerar um ambiente procedural local via `PMREMGenerator` + `RoomEnvironment` (sem baixar HDR externo — preserva "sem chamada de rede em runtime") e aplicá-lo como `scene.environment`; adicionar um `GTAOPass` leve ao pipeline de render (via `EffectComposer`/`RenderPass`/`OutputPass`, todos de `three/addons/postprocessing/`) para sombra de contato nas reentrâncias.
2. **Detalhe geométrico (B)**: subir os segmentos de curvatura das geometrias mais usadas (`RoundedBoxGeometry` de 3 para um valor maior; `TorusGeometry` radialSegments de 10 para um valor maior) e adicionar detalhes que já fazem parte do domínio didático mas ainda não estão modelados (parafusos/porcas visíveis nas rodas, chanfros de metal, mangueiras adicionais).
3. **Não otimizar para mobile** nesta iniciativa — os parâmetros de qualidade (segmentos, resolução de AO) são fixos, sem detecção de dispositivo. Isso é uma decisão deliberada do usuário, não um esquecimento.

## Alternativas consideradas

### Alternativa C — Pós-processamento isolado (sem mudar iluminação/geometria)
Um `EffectComposer` completo com `GTAOPass` + `FXAAPass` + `OutputPass`, sem tocar em `envMap` nem em segmentos de geometria. Não escolhida como iniciativa própria porque o AO já está incluído dentro da opção A (mesmo mecanismo), e FXAA/bloom adicionais ficam como possível iteração futura caso o resultado de A+B não seja suficiente.

### Alternativa — Somente A ou somente B isoladamente
Cobriria só um eixo (luz/reflexo OU detalhe geométrico). Não escolhida porque o usuário quis maximizar o ganho visual combinando os dois eixos na mesma iniciativa.

## Consequências

### Positivas
- Ganho de realismo perceptível sem violar a Constituição (nenhuma marca/logo/placa real é introduzida).
- Nenhuma dependência npm nova — tudo via `three/addons/` já presente no `node_modules`.
- Escopo mobile explicitamente fora, reduzindo o custo de teste/calibração desta iniciativa.

### Negativas
- Sem otimização mobile, o desempenho em celular pode piorar (mais triângulos + passe de AO por frame) — deve ser registrado como debt conhecido em `.agents/context/CONTEXT.md` quando a implementação for concluída, não tratado como regressão acidental.

### Riscos
- `PMREMGenerator`/`RoomEnvironment` e o `GTAOPass` têm custo de setup e por frame — precisa checar visualmente que o FPS em desktop continua fluido (o projeto não tem suíte de testes automatizada para medir isso; a validação é manual).
- AO mal calibrado pode escurecer demais frestas do motor — ajuste iterativo esperado.
- Mais segmentos de geometria aumentam a contagem de recursos que o `cleanup()` do `useEffect` precisa descartar corretamente (ver regra do papel `three-scene` sobre nunca deixar geometria/material sem `dispose()`).

## Plano de adoção

Quebrado em duas tasks por fronteira técnica real dentro do mesmo componente (`CarScene.tsx`), ambas de responsabilidade do papel `three-scene`:

- `TASK-001` — iluminação física, ambiente procedural e AO.
- `TASK-002` — aumento de detalhe geométrico (segmentos + peças adicionais).

`TASK-001` não depende de `TASK-002` (são eixos independentes) — podem ser implementadas em qualquer ordem, mas a verificação visual final deve considerar as duas juntas (o AO de `TASK-001` muda a leitura visual dos detalhes adicionados em `TASK-002`).

## Validação

- `npm run build` (typecheck + build) sem erros.
- Verificação visual manual no navegador (captura de antes/depois da cena em `page=explore`), comparando as três visões (`perspective`, `side`, `top`) e com/sem carroceria (`bodyVisible`).
- Confirmar ausência de vazamento de recursos: abrir/fechar a página "Explorar" várias vezes e observar que a memória de GPU não cresce indefinidamente (checagem manual via DevTools, já que não há suíte automatizada).

## Revisão

Reavaliar caso o projeto decida suportar mobile como público-alvo no futuro — nesse caso, os parâmetros fixados aqui (segmentos, resolução/qualidade do AO) precisam ganhar um "nível de qualidade" condicional por dispositivo, o que hoje foi deliberadamente descartado.
