---
id: TASK-020
title: "Controle de rotação automática do modelo 3D"
status: backlog
type: feature
owner:
created_at: 2026-09-13
updated_at: 2026-09-13
affected_modules: [react-ui]
related_use_cases: []
related_adrs: [ADR-005]
---

# TASK-020 — Controle de rotação automática do modelo 3D

## Contexto

Pendência registrada na `TASK-011`. Task criada sem ADR: a decisão de fundo já está tomada — o `ADR-005` recusou a Alternativa C (usar o `autoRotate` no lugar de animar peças) mas não decidiu removê-lo, e a implementação no `CarScene` foi mantida e continua funcional.

## Problema

`autoRotate` está implementado e ligado ao `OrbitControls` (`src/components/CarScene.tsx:467`, `orbit.autoRotate = props.current.autoRotate`, com `autoRotateSpeed = .6` em `:93`), mas `App.tsx` passa `false` fixo (`:158`). É capacidade pronta sem porta de entrada: ninguém consegue ligar, e o prop fica parecendo código morto para quem lê depois — foi exatamente essa a leitura errada que tive ao listá-lo como pendência.

## Objetivo

Resolver a ambiguidade: ou o usuário ganha o controle, ou o prop sai. A recomendação é dar o controle, já que a implementação existe, funciona e custa pouco expor.

## Fora de escopo

- Animação de peças — é o `ADR-005`, já implementado.
- Mudar limites de câmera, zoom ou o alvo do `OrbitControls` (`.claude/agents/three-scene.md`, regra 4).

## Comportamento atual

Os controles da cena são os botões de zoom (`+`/`−`), o de restaurar visualização, o toggle "Carroceria" e as três visões (perspectiva/lateral/superior). Nenhum deles liga a rotação automática.

## Comportamento esperado

- Um controle na área da cena liga e desliga a rotação automática, seguindo o padrão visual e de acessibilidade do toggle "Carroceria" que já existe ao lado.
- A rotação automática respeita `prefers-reduced-motion`: com a preferência ativa, o controle não liga o movimento (desabilitado com rótulo explicativo, no mesmo espírito do botão "Movimento reduzido" do `MechanismLab`).
- Interagir com a cena (arrastar para girar) não precisa desligar o controle — o `OrbitControls` já retoma a rotação sozinho.

## Regras de negócio

- RN-01: `prefers-reduced-motion` precisa ser respeitado — a cena já tem a checagem desde a `TASK-011`, e ela vale para esta animação também.
- RN-02: o controle precisa de rótulo acessível e `aria-pressed`, como os demais.
- RN-03: não afrouxar limites de câmera/zoom.

## Critérios de aceitação

- [ ] CA-01: existe um controle visível que liga e desliga a rotação automática, e ele funciona.
- [ ] CA-02: com `prefers-reduced-motion` ativo, o controle não coloca a cena em movimento e comunica o motivo.
- [ ] CA-03: o controle tem `aria-pressed` e rótulo acessível, consistente com o toggle "Carroceria".
- [ ] CA-04: nenhum limite de câmera, zoom ou alvo do `OrbitControls` foi alterado.
- [ ] CA-05: `npm run build` passa sem erros.

## Impacto técnico

### Frontend
`src/App.tsx` (estado e controle novo, prop passado a `CarScene`), possivelmente `src/styles.css`. `src/components/CarScene.tsx` só se a checagem de `prefers-reduced-motion` precisar alcançar o `orbit.autoRotate` — a lógica de animação de peças já tem a dela.

### Banco de dados / Backend / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [ ] Etapa 1: conferir como `orbit.autoRotate` se comporta hoje sob `prefers-reduced-motion` — a checagem da `TASK-011` cobre as animações de peça, e é preciso verificar se alcança também a rotação de câmera.
- [ ] Etapa 2: adicionar estado e controle em `App.tsx`, no padrão do toggle "Carroceria".
- [ ] Etapa 3: verificar no navegador, com e sem `prefers-reduced-motion`.

## Estratégia de testes

- [ ] Unitários/Integração/E2E — não aplicável.
- [x] Manual — ligar/desligar, conferir que a cena gira e para; forçar `prefers-reduced-motion` e confirmar que não gira; teclado no controle novo.

## Riscos e rollback

Risco baixo, aditivo. Atenção a um detalhe do ambiente: a cena só desenha sob demanda quando a janela está em segundo plano, então verificar rotação por captura de tela engana — a `TASK-011` mediu comparando o framebuffer entre frames (`gl.readPixels`), e a mesma técnica serve aqui. Rollback: reverter o commit; se a decisão for remover o prop em vez de expor, a alternativa é apagar `autoRotate` de `Props`, do bridge `props.current` e da linha `orbit.autoRotate`.

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
