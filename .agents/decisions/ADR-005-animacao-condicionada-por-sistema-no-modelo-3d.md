---
id: ADR-005
title: Animar peças do modelo 3D condicionadas ao sistema selecionado
status: accepted
date: 2026-09-13
deciders: [Senavictors]
related_tasks: [TASK-011]
---

# ADR-005 — Animar peças do modelo 3D condicionadas ao sistema selecionado

## Contexto

O modelo 3D (`CarScene.tsx`) é hoje inteiramente estático — reage a clique/zoom/rotação de câmera, mas nenhuma peça se move sozinha. O prop `autoRotate` existe na assinatura do componente desde a criação, mas `App.tsx` sempre o passa como `false` — é um prop morto. Isso deixa o princípio "mostrar a relação entre movimento e função" (`PRODUCT.md`) sem reforço visual na cena 3D (só no `MechanismLab`, que é 2D).

Restrição a respeitar: nenhuma animação contínua pode ignorar `prefers-reduced-motion` — o `MechanismLab.tsx` já faz essa checagem (`window.matchMedia('(prefers-reduced-motion: reduce)')`) e o `CarScene.tsx` precisa seguir o mesmo padrão, já que hoje não tem nenhuma verificação desse tipo (não tinha nenhuma animação contínua até agora).

## Decisão

Animar peças do carro condicionadas ao `activeSystem` selecionado: o pistão do motor sobe/desce quando `'engine'` está ativo, as rodas giram quando `'suspension'` está ativo, a ventoinha do radiador gira quando `'cooling'` está ativo, etc. — em vez de uma animação sempre ativa e genérica. A lógica entra no mesmo bridge já estabelecido (`props.current`, função `appearance()` chamada a cada mudança relevante de prop), lendo `props.current.activeSystem` dentro do loop de `render()` para decidir quais transformações aplicar a cada frame.

## Alternativas consideradas

### Alternativa A — Animação sempre ativa e sutil
Rodas e ventoinha girando continuamente, independente de qual sistema está selecionado. Não escolhida: o usuário preferiu a versão condicionada, mais coerente com o padrão já existente de opacidade por sistema (a cena já "reage" ao sistema selecionado; a nova animação segue a mesma filosofia) e mais rica pedagogicamente (o movimento aparece exatamente quando o usuário está prestando atenção naquele sistema).

### Alternativa C — Reaproveitar só o `autoRotate` (câmera)
Virar um toggle real de "girar sozinho" para a câmera, sem animar peças internas. Não escolhida: o usuário quis animação de peças de verdade, não só a câmera girando.

## Consequências

### Positivas
- Reforça visualmente a relação movimento↔função exatamente quando o usuário está olhando para aquele sistema.
- Não introduz um modo "sempre ligado" que poderia distrair da exploração deliberada do modelo.

### Negativas
- Mais lógica condicional dentro do loop de `render()` (hoje só orbit.update() + projeção de pins) — leve aumento de complexidade no arquivo mais denso do projeto.

### Riscos
- Animações mal calibradas (rápido demais, ângulo de rotação exagerado) podem parecer bugadas em vez de didáticas — calibrar visualmente.
- Esquecer o `prefers-reduced-motion` aqui seria uma regressão de acessibilidade real, já que é a primeira animação contínua da cena 3D.

## Plano de adoção

`TASK-011` implementa a animação condicionada para pelo menos: pistão do motor (`engine`), rodas (`suspension`), ventoinha do radiador (`cooling`). Sistemas sem peça naturalmente "móvel" (ex.: `electrical`, `brakes` sem pressão hidráulica visível) podem ficar sem animação nesta primeira rodada — não é obrigatório animar os 7 sistemas, só os que têm um movimento real e não forçado.

## Validação

`npm run build` sem erros; verificação visual: cada sistema com animação prevista mostra o movimento certo ao ser selecionado, e o movimento para quando outro sistema é selecionado; `prefers-reduced-motion` ativado remove a animação (igual ao `MechanismLab`).

## Revisão

Reavaliar quais outros sistemas ganham animação própria depois desta primeira rodada, com base no que ficar visualmente convincente.
