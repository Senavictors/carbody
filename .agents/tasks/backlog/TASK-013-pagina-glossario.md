---
id: TASK-013
title: "Página do glossário de termos técnicos"
status: backlog
type: feature
owner:
created_at: 2026-09-13
updated_at: 2026-09-13
affected_modules: [react-ui]
related_use_cases: []
related_adrs: [ADR-006]
---

# TASK-013 — Página do glossário de termos técnicos

## Contexto

Parte 2/2 de `ADR-006`. Depende do conteúdo de `TASK-012` (o array de termos). `App.tsx` hoje tem `type Page = 'explore' | 'mechanisms' | 'parts' | 'progress'` (linha 11) e um array `navigation` (linha 15) que gera a barra lateral/abas — sem `Record<Page, ...>` forçando atualização em outro arquivo (diferente do que aconteceu com `SystemId` em `ADR-003` — confirmado antes de planejar esta task).

## Objetivo

Adicionar `'glossary'` a `Page`, uma entrada em `navigation`, e uma página nova que lista os termos de `TASK-012` (busca/filtro simples por texto, sem precisar integrar com o `Ctrl K` existente — decisão do `ADR-006`).

## Fora de escopo

- Curadoria do conteúdo do glossário — é `TASK-012`.
- Integração com a busca `Ctrl K` já existente (`searchRef`, `normalize()`) — decisão explícita do `ADR-006` de não fazer isso nesta rodada.

## Comportamento atual

`Page` tem 4 valores; `navigation` mapeia cada um a um ícone (`lucide-react`) e título, renderizado tanto na sidebar quanto no topo mobile. Cada página é um bloco condicional dentro do `<main>` de `App.tsx` (`{page==='explore'&&<>...`).

## Comportamento esperado

- `Page` ganha `'glossary'`; `navigation` ganha uma entrada com ícone e título ("Glossário" ou similar).
- Um novo bloco condicional `{page==='glossary'&&<>...` renderiza a lista de termos (de `TASK-012`), com um campo de busca/filtro local (reaproveitar o padrão de `normalize()` já usado na busca de peças, para consistência de UX, sem precisar ser o mesmo componente).
- Cada termo mostra: nome, definição, e (se `relatedParts` estiver preenchido) links para as peças relacionadas, reaproveitando o padrão de navegação já usado em outras partes do app (`openPart`).

## Regras de negócio

- RN-01: nenhuma mudança na busca `Ctrl K` existente — o glossário é uma página separada.
- RN-02: seguir os padrões de acessibilidade já estabelecidos no resto do app (roles, aria-labels, navegação por teclado consistente com as outras páginas).

## Critérios de aceitação

- [ ] CA-01: `Page` inclui `'glossary'`; aparece na navegação (sidebar e abas mobile) com ícone e título.
- [ ] CA-02: a página lista todos os termos de `TASK-012`, com busca/filtro local funcionando.
- [ ] CA-03: termos com `relatedParts` linkam para a peça correspondente, abrindo a página "Explorar" na peça certa (mesmo padrão de `openPart` já usado em outras páginas).
- [ ] CA-04: nenhuma página existente foi alterada além da navegação.
- [ ] CA-05: `npm run build` passa sem erros.

## Impacto técnico

### Frontend
`src/App.tsx` — `Page`, `navigation`, novo bloco de página. Possível CSS novo em `src/styles.css`.

### Banco de dados / Backend / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [ ] Etapa 1: adicionar `'glossary'` a `Page` e `navigation`.
- [ ] Etapa 2: construir a listagem de termos com busca/filtro local.
- [ ] Etapa 3: implementar os links de `relatedParts` para peças, reaproveitando `openPart`.
- [ ] Etapa 4: revisão de acessibilidade (roles, aria-labels) contra o padrão já usado nas outras páginas.

## Estratégia de testes

- [ ] Unitários/Integração/E2E — não aplicável.
- [x] Manual — navegação até a página, busca/filtro, links para peças relacionadas, comparação com as outras páginas para consistência visual.

## Riscos e rollback

Risco mínimo — página nova, aditiva, sem tocar lógica existente além da navegação. Rollback: remover `'glossary'` de `Page`/`navigation` e o bloco condicional novo.

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
