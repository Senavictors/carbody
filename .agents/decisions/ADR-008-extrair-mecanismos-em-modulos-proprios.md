---
id: ADR-008
title: Extrair cada mecanismo do MechanismLab para um módulo próprio, co-locando dados, diagrama e painel
status: accepted
date: 2026-09-13
deciders: [Senavictors]
related_tasks: [TASK-017]
---

# ADR-008 — Extrair cada mecanismo do MechanismLab para um módulo próprio

## Contexto

O `ADR-004` decidiu estender `MechanismLab.tsx` de 2 para 6 mecanismos **sem** refatorar antes, e registrou explicitamente na seção "Revisão": _"Reavaliar a Alternativa B (extrair em arquivos próprios) se `MechanismLab.tsx` ficar difícil de manter depois desta expansão."_ Esta ADR é essa reavaliação.

Estado hoje, depois de `TASK-009`, `TASK-010` e `TASK-016`: o arquivo tem 660 linhas. O padrão em si está saudável e documentado em `docs/modules/mechanism-lab.md` — a lista `modes` governa abas, cabeçalho e navegação por teclado; um único `angle` move todos os diagramas; cada mecanismo é "um array de dados + um componente de diagrama". O problema não é o padrão, é a distribuição: acrescentar um mecanismo exige tocar **quatro lugares distintos do mesmo arquivo** (a entrada em `modes`, a entrada em `speeds`, o componente de diagrama, o bloco no painel de explicação), separados por centenas de linhas.

Nenhuma restrição da Constituição é tocada — é reorganização de código, sem mudança de comportamento, conteúdo ou contrato de dado.

## Decisão

Um arquivo por mecanismo em `src/components/mechanisms/`, cada um exportando tudo o que aquele mecanismo é: os dados dos estados, o componente de diagrama e o bloco do painel de explicação. `MechanismLab.tsx` passa a ser um orquestrador que importa uma lista desses módulos e cuida apenas do que é comum a todos — o relógio (`angle` + `requestAnimationFrame`), a checagem de `prefers-reduced-motion`, as abas com navegação por teclado e os controles de reprodução.

Acrescentar um sétimo mecanismo passa a ser: criar um arquivo e registrá-lo na lista.

Os componentes auxiliares compartilhados (`FlowPath`, `toothPath`, `coilPath`, `suspensionTravel`) vão para um módulo comum do mesmo diretório, já que `FlowPath` hoje serve arrefecimento e elétrica.

## Alternativas consideradas

### Alternativa B — Separar por tipo (dados / diagramas / painéis)
`mechanisms/data.ts` com todos os arrays, `mechanisms/diagrams.tsx` com todos os SVGs, painéis permanecendo em `MechanismLab.tsx`. Gera menos arquivos novos (2) e um diff menor. Não escolhida: mantém exatamente o acoplamento que originou o problema — mexer em um mecanismo continuaria tocando três arquivos, e cada um deles voltaria a crescer a cada mecanismo novo. Troca um arquivo grande por três médios sem resolver a dispersão.

### Alternativa C — Extrair só os diagramas SVG
Mover apenas os seis componentes de diagrama (cerca de 400 das 660 linhas) para `mechanisms/diagrams/*.tsx`. É a opção de menor risco de regressão e resolveria o volume imediato. Não escolhida: deixaria `MechanismLab.tsx` com ~260 linhas ainda contendo seis blocos de painel JSX e os seis arrays de dados, e a mesma decisão voltaria à mesa no sétimo mecanismo.

## Consequências

### Positivas
- O ponto de extensão descrito em `docs/modules/mechanism-lab.md` deixa de estar espalhado: um mecanismo passa a ser uma unidade de leitura e de edição.
- Cada módulo pode ser lido isoladamente por quem for entender ou revisar aquele mecanismo, sem rolar por outros cinco.
- Reduz a chance de conflito quando dois trabalhos tocam mecanismos diferentes.

### Negativas
- Seis arquivos novos mais um de utilidades compartilhadas, num projeto que hoje tem poucos arquivos e os mantém grandes deliberadamente.
- O refactor toca os seis mecanismos de uma vez, incluindo motor e engrenagens, que estão estáveis desde antes do `ADR-004`.

### Riscos
- Regressão silenciosa em um mecanismo durante a movimentação — nenhum deles tem teste automatizado, então a verificação é visual e manual, mecanismo por mecanismo.
- Quebrar acidentalmente a invariante de que todo movimento deriva de `angle` (nada de `@keyframes`), ao mover código entre arquivos.
- O chunk do `MechanismLab` é carregado por `React.lazy`; a extração não pode transformá-lo em vários chunks nem puxá-lo para o bundle principal.

## Plano de adoção

`TASK-017` executa a extração em uma única task, mecanismo por mecanismo, com verificação visual de cada um antes de passar ao próximo. Não é uma mudança de comportamento: o critério de pronto é que os seis mecanismos funcionem exatamente como antes, incluindo teclado, `prefers-reduced-motion` e o tamanho do chunk.

## Validação

`npm run build` sem erros; `MechanismLab.tsx` reduzido a orquestrador; os seis modos verificados no navegador (abas, navegação por teclado, controles de estado de cada mecanismo, animação, `prefers-reduced-motion`); a saída do `vite build` continuando a mostrar um único chunk `MechanismLab-*.js` separado do `index`.

## Revisão

Reavaliar se o diretório `mechanisms/` passar de dez arquivos, ou se o orquestrador voltar a acumular lógica específica de um mecanismo.
