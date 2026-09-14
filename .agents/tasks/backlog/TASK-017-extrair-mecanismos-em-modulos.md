---
id: TASK-017
title: "Extrair cada mecanismo do MechanismLab para um módulo próprio"
status: backlog
type: refactor
owner:
created_at: 2026-09-13
updated_at: 2026-09-13
affected_modules: [react-ui]
related_use_cases: []
related_adrs: [ADR-008]
---

# TASK-017 — Extrair cada mecanismo do MechanismLab para um módulo próprio

## Contexto

`ADR-008`, que é a reavaliação que o `ADR-004` pediu na sua seção "Revisão". `src/components/MechanismLab.tsx` está com 660 linhas depois de `TASK-009`, `TASK-010` e `TASK-016`.

## Problema

O padrão está saudável — `docs/modules/mechanism-lab.md` descreve o ponto de extensão com clareza —, mas ele está espalhado: acrescentar um mecanismo exige tocar quatro pontos do mesmo arquivo, separados por centenas de linhas (a entrada em `modes`, a entrada em `speeds`, o componente de diagrama, o bloco no painel de explicação).

## Objetivo

Cada mecanismo vira uma unidade de leitura e edição: um arquivo em `src/components/mechanisms/` com seus dados, seu diagrama e seu painel. `MechanismLab.tsx` fica só com o que é comum aos seis.

## Fora de escopo

- Qualquer mudança de comportamento, texto didático ou desenho. Esta task é reorganização pura.
- Acrescentar um sétimo mecanismo.
- `CarScene.tsx` e o catálogo.

## Comportamento atual

Um arquivo com: `Mode`, `modes`, `speeds`, `startAngle`, seis arrays de dados (`strokes`, `ratios`, `pressures`, `circuits`, `bumps`, `charges`), auxiliares (`toothPath`, `coilPath`, `suspensionTravel`, `FlowPath`), seis componentes de diagrama e o componente `MechanismLab` com seis blocos de painel.

## Comportamento esperado

- `src/components/mechanisms/<id>.tsx`, um por mecanismo, exportando o que aquele mecanismo é: dados dos estados, componente de diagrama e o bloco do painel de explicação.
- Um módulo comum no mesmo diretório para o que é compartilhado — `FlowPath` (usado por arrefecimento e elétrica) e os helpers de geometria.
- `MechanismLab.tsx` importa a lista de módulos e cuida apenas do comum: `angle` + `requestAnimationFrame`, `prefers-reduced-motion`, abas com navegação por teclado, controles de reprodução.
- O tipo `Mode` continua exportado de onde `App.tsx` o importa hoje, ou de um lugar novo com o import ajustado — sem deixar de ser `import type`.

## Regras de negócio

- RN-01: nenhum comportamento muda. Os seis mecanismos precisam funcionar exatamente como antes, incluindo teclado, estados e animação.
- RN-02 (invariante de `docs/modules/mechanism-lab.md`): todo movimento continua derivando de `angle`; nenhuma animação CSS pode ser introduzida na mudança.
- RN-03: o chunk do `MechanismLab` (`React.lazy`) continua único e separado do `index` — a extração não pode fragmentá-lo nem puxá-lo para o bundle principal.
- RN-04: `App.tsx` continua importando `Mode` com `import type`.

## Critérios de aceitação

- [ ] CA-01: cada um dos seis mecanismos tem seu módulo em `src/components/mechanisms/`, com dados, diagrama e painel juntos.
- [ ] CA-02: `MechanismLab.tsx` não contém mais dados nem JSX específico de nenhum mecanismo.
- [ ] CA-03: os seis modos funcionam como antes — abas, navegação por teclado (setas com wrap, `Home`/`End`), controles de estado de cada mecanismo, animação e reset.
- [ ] CA-04: `prefers-reduced-motion` continua desabilitando a animação dos seis.
- [ ] CA-05: a saída do `vite build` continua mostrando um único chunk `MechanismLab-*.js`, e o `index-*.js` não cresce de forma relevante.
- [ ] CA-06: `npm run build` passa sem erros.
- [ ] CA-07: `docs/modules/mechanism-lab.md` atualizado — o ponto de extensão descrito lá muda de forma.

## Impacto técnico

### Frontend
`src/components/MechanismLab.tsx` (vira orquestrador), `src/components/mechanisms/*` (novos), possivelmente o import de `Mode` em `src/App.tsx`.

### Banco de dados / Backend / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [ ] Etapa 1: criar o módulo comum (`FlowPath`, `toothPath`, `coilPath`, `suspensionTravel`) e fazer o `MechanismLab` atual consumi-lo, verificando que nada quebrou.
- [ ] Etapa 2: extrair um mecanismo de cada vez, verificando visualmente antes de passar ao próximo. Sugestão de ordem: começar por `gears` (o menor) para firmar o formato do módulo, e deixar `engine` (o mais antigo e detalhado) por último.
- [ ] Etapa 3: reduzir `MechanismLab.tsx` ao orquestrador sobre a lista de módulos.
- [ ] Etapa 4: conferir os seis modos, o teclado, `prefers-reduced-motion` e o chunk no build.
- [ ] Etapa 5: atualizar `docs/modules/mechanism-lab.md`.

## Estratégia de testes

- [ ] Unitários/Integração/E2E — não aplicável (sem suíte de testes).
- [x] Manual — os seis mecanismos, um a um, comparando com o comportamento anterior; teclado; `prefers-reduced-motion`; tamanho dos chunks na saída do build.

## Riscos e rollback

Risco: regressão silenciosa em um mecanismo durante a movimentação, já que nenhum tem teste automatizado. Mitigação: extrair um por vez e verificar antes de seguir — o histórico de `TASK-009`/`TASK-010` mostra que captura de tela sozinha engana (a ventoinha do 3D girava sem aparecer), então vale comparar estado por estado. Rollback: a task é reorganização sem mudança de comportamento, então reverter o commit restaura o arquivo único.

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
