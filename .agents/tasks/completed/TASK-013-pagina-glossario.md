---
id: TASK-013
title: "Página do glossário de termos técnicos"
status: completed
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

- [x] CA-01: `Page` inclui `'glossary'`; aparece na navegação (sidebar e abas mobile) com ícone e título.
- [x] CA-02: a página lista todos os termos de `TASK-012`, com busca/filtro local funcionando.
- [x] CA-03: termos com `relatedParts` linkam para a peça correspondente, abrindo a página "Explorar" na peça certa (mesmo padrão de `openPart` já usado em outras páginas).
- [x] CA-04: nenhuma página existente foi alterada além da navegação.
- [x] CA-05: `npm run build` passa sem erros.

## Impacto técnico

### Frontend
`src/App.tsx` — `Page`, `navigation`, novo bloco de página. Possível CSS novo em `src/styles.css`.

### Banco de dados / Backend / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [x] Etapa 1: adicionar `'glossary'` a `Page` e `navigation`.
- [x] Etapa 2: construir a listagem de termos com busca/filtro local.
- [x] Etapa 3: implementar os links de `relatedParts` para peças, reaproveitando `openPart`.
- [x] Etapa 4: revisão de acessibilidade (roles, aria-labels) contra o padrão já usado nas outras páginas.

## Estratégia de testes

- [x] Unitários/Integração/E2E — não aplicável.
- [x] Manual — navegação até a página, busca/filtro, links para peças relacionadas, comparação com as outras páginas para consistência visual.

## Riscos e rollback

Risco mínimo — página nova, aditiva, sem tocar lógica existente além da navegação. Rollback: remover `'glossary'` de `Page`/`navigation` e o bloco condicional novo.

## Registro de execução

### Alterações realizadas

- `Page` ganhou `'glossary'` e `navigation` ganhou a entrada correspondente (ícone `BookA`, título "Glossário"), posicionada entre "Peças e cuidados" e "Meu aprendizado". Como o array `navigation` gera sidebar e abas mobile, isso bastou para a navegação inteira.
- Estado `termQuery` e lista derivada `resultTerms`, escritos no mesmo formato de `query`/`resultParts` (filtro direto no corpo do componente, sem `useMemo`, como o resto do arquivo). O filtro reusa `normalize()` e procura em três campos: termo, definição e **nome das peças relacionadas** — é o que faz "freio" encontrar "Atrito" e "pneu" encontrar "Banda de rodagem".
- Bloco `{page==='glossary'&&…}` com cabeçalho, contador, campo de busca, a lista de termos e uma nota de rodapé.
- A lista é um `<dl>`, cada termo um `<dt>`/`<dd>` — é a marcação semântica de glossário, e um leitor de tela anuncia a relação termo/definição sem precisar de ARIA extra.
- Cada termo com `relatedParts` mostra chips "Onde aparece" que chamam `openPart`, com o `system-dot` colorido pelo sistema da peça, reaproveitando as classes de sistema que já existem.
- `src/styles.css` — classes novas (`.glossary-search`, `.glossary-list`, `.glossary-entry`, `.glossary-related`, `.glossary-part`), usando as variáveis já definidas em `:root` (`--line`, `--surface`, `--ink`, `--system-color`). Nenhum hex novo fora do que o arquivo já usava.

### Arquivos principais

- `src/App.tsx`, `src/styles.css`
- `docs/architecture/components.md`, `.claude/agents/react-ui.md` + `.codex/agents/react-ui.toml`, `.agents/context/CONTEXT.md`

### Decisões

- **Busca própria, não a `Ctrl K`.** É a decisão do `ADR-006`, respeitada literalmente: `termQuery` é um estado separado e a busca do topo continua indo para a página de peças. O campo do glossário reusa `normalize()` para o comportamento ser o mesmo (sem acento, sem caixa), sem compartilhar componente.
- **Buscar também pelo nome das peças relacionadas.** Não estava na task. Sem isso, alguém que digita "freio" não encontra "Atrito" nem "Pressão hidráulica" — que são exatamente os termos que essa pessoa está procurando. É o ganho que o campo `relatedParts` permitia de graça.
- **Grid de cartões em vez de lista com âncoras alfabéticas.** Com 19 termos e busca, um índice A-Z seria estrutura demais para pouco conteúdo. O grid usa `auto-fill` com mínimo de 320px, então vira coluna única no mobile sem breakpoint dedicado.
- **`BookA` como ícone.** `BookOpen` já é de "Meu aprendizado"; `BookA` (livro com letra) lê como vocabulário e não colide com nada.

### Divergências

- Nenhuma em relação ao que a task pedia.

### Pendências

- **Voltar do glossário.** `openPart()` faz `setReturnToResults(page==='parts')`, então quem chega a uma peça vindo do glossário vê o botão "Voltar às peças" (ou nenhum), não "Voltar ao glossário". Consertar direito exige trocar `returnToResults` de booleano para a página de origem — mudança pequena, mas que toca um estado usado por outro fluxo, e a task listava só navegação e a página nova no escopo. Vale uma task própria junto de outras melhorias de navegação.
- O `ADR-006` prevê, na seção "Revisão", reavaliar a integração com a busca `Ctrl K` (Alternativa C) se o glossário passar despercebido. Continua em aberto, por decisão, não por esquecimento.

## Validação

```bash
npm run build
```
Passou sem erros. O `index` foi de 310,58 kB para 319,38 kB (o glossário entra no bundle principal, como as outras páginas — só `CarScene` e `MechanismLab` são `lazy`).

Verificação no navegador (`npm run dev`, http://localhost:5173):

- CA-01: a navegação passou a listar `Explorar o carro, Como funciona, Peças e cuidados, Glossário, Meu aprendizado`; a página abre com `document.title` "Glossário — Carbody" e o contador mostra "19 termos".
- CA-02: filtro exercitado com cinco entradas — `"freio"` → Atrito, Dissipação de calor, Pressão hidráulica; `"calor"` → Amortecimento, Atrito, Combustão, Dissipação de calor; `"PNEU"` (maiúsculas) → Banda de rodagem, Tração; `"termostática"` (com acento) → Temperatura de trabalho; `"xyz"` → estado vazio "Nenhum termo por aqui."; limpar volta aos 19.
- CA-03: clicar no chip "Vela de ignição" dentro do termo "Alta tensão" leva à página "Explorar o carro", com a peça "Vela de ignição" aberta e o sistema "Motor" ativo.
- CA-04: `git diff src/App.tsx` mostra só duas linhas removidas — a do `import` de ícones e a de `type Page`. Todo o resto é adição; nenhuma página existente foi tocada.
- Layout conferido em 648px (coluna única) e 1180px (duas colunas, sidebar com o item ativo marcado). Console do navegador sem erros.

## Handoff
Não aplicável — a task foi executada e verificada em uma única sessão.
