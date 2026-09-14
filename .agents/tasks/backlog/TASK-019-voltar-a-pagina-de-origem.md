---
id: TASK-019
title: "Voltar para a página de origem ao abrir uma peça"
status: backlog
type: fix
owner:
created_at: 2026-09-13
updated_at: 2026-09-13
affected_modules: [react-ui]
related_use_cases: []
related_adrs: []
---

# TASK-019 — Voltar para a página de origem ao abrir uma peça

## Contexto

Pendência registrada na `TASK-013`. Task criada sem ADR: a abordagem é única e óbvia (guardar a página de origem em vez de um booleano), não há decisão arquitetural a tomar.

## Problema

`openPart()` faz `setReturnToResults(page==='parts')`. Como `returnToResults` é um booleano, ele só sabe distinguir um caso: veio da biblioteca de peças ou não. Quem chega a uma peça pelo glossário — clicando num chip "Onde aparece" — não recebe caminho de volta, e quem vier de qualquer página futura terá o mesmo problema.

## Objetivo

O botão de retorno leva de volta à página de onde o usuário veio, com o rótulo correspondente.

## Fora de escopo

- Histórico de navegação com pilha ou URLs — a navegação por estado local é deliberada (`.claude/agents/react-ui.md`, regra 1).
- Mudar o comportamento de quem chega a uma peça pelo modelo 3D (sem origem, sem botão), que é o correto hoje.

## Comportamento atual

`const [returnToResults,setReturnToResults]=useState(false)` (`src/App.tsx:86`) e o botão condicional em `:155`, que sempre volta para `'parts'` com o texto "Voltar aos resultados de “…”" ou "Voltar às peças".

## Comportamento esperado

- O estado passa a guardar a página de origem (`Page | null`) em vez de um booleano.
- `openPart()` registra a origem quando ela é uma página de listagem (`parts` ou `glossary`) e `null` quando a peça foi aberta dentro da própria página "Explorar" (clique no modelo 3D ou num pin).
- O botão de retorno aparece só quando há origem, leva à página certa e usa um rótulo adequado a ela — mantendo o texto atual quando a origem é `parts` com busca ativa.

## Regras de negócio

- RN-01: sem biblioteca de rotas; a navegação continua por estado local.
- RN-02: o botão continua ausente quando não há origem — nada de botão desabilitado.

## Critérios de aceitação

- [ ] CA-01: abrir uma peça pela biblioteca e voltar leva a "Peças e cuidados", preservando o texto atual quando há busca ativa.
- [ ] CA-02: abrir uma peça por um chip do glossário e voltar leva ao "Glossário".
- [ ] CA-03: abrir uma peça pelo modelo 3D não mostra botão de retorno.
- [ ] CA-04: o filtro do glossário (`termQuery`) continua como estava ao voltar — voltar não pode limpar a busca do usuário.
- [ ] CA-05: `npm run build` passa sem erros.

## Impacto técnico

### Frontend
`src/App.tsx` — estado, `openPart()`, o botão de retorno e as chamadas a partir do glossário.

### Banco de dados / Backend / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [ ] Etapa 1: trocar `returnToResults` por um estado que guarda a página de origem.
- [ ] Etapa 2: ajustar `openPart()` para registrar a origem certa em cada chamada.
- [ ] Etapa 3: ajustar o botão (condição, destino e rótulo).
- [ ] Etapa 4: verificar os três caminhos de entrada no navegador.

## Estratégia de testes

- [ ] Unitários/Integração/E2E — não aplicável.
- [x] Manual — entrar numa peça pela biblioteca (com e sem busca ativa), pelo glossário e pelo modelo 3D, conferindo o botão em cada caso.

## Riscos e rollback

Risco baixo; o estado é local e não é persistido. Rollback: reverter o commit.

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
