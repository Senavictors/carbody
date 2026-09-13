# Snapshot — TASK-013

Gerado em: 2026-09-13
Task: `.agents/tasks/backlog/TASK-013-pagina-glossario.md`

## ADR de referência

`.agents/decisions/ADR-006-glossario-de-termos-tecnicos.md` — parte 2/2 (depende do conteúdo de `TASK-012`).

## Assinaturas de código necessárias

- `type Page = 'explore' | 'mechanisms' | 'parts' | 'progress';` — `src/App.tsx:11` — precisa ganhar `'glossary'`. Confirmado: não há nenhum `Record<Page, ...>` em `App.tsx` forçando atualização em outro arquivo (diferente do que aconteceu com `SystemId` — ver `docs/domain/README.md`).
- `const navigation: { id: Page; title: string; icon: LucideIcon }[] = [...]` — `:15` — array que gera a navegação (sidebar + abas mobile); adicionar uma entrada aqui é o suficiente, a UI é toda gerada a partir deste array.
- `const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();` — `:28` — função de normalização de busca já usada na biblioteca de peças; reutilizável para o filtro do glossário.
- `function PartDetail(...)` — `:34` — não é editado diretamente, mas é o padrão de estrutura de página/detalhe a seguir.
- `const searchRef=useRef<HTMLInputElement>(null);` — `:74` — busca `Ctrl K` existente; **não integrar** o glossário a ela (decisão do `ADR-006`), mas serve de referência do padrão de busca local.
- `const openPart=(part:Part)=>{...}` — `:114` — função que navega para a página "Explorar" já numa peça específica; reaproveitar para os links de `relatedParts` do glossário.

## Restrições ativas

- Não integrar com a busca `Ctrl K` existente — página separada, decisão explícita do `ADR-006`.
- Seguir os padrões de acessibilidade já estabelecidos (roles, aria-labels, navegação por teclado) do resto do app.
- Depende do formato de dado que `TASK-012` definir para o glossário — se `TASK-012` ainda não rodou, ler a task dela para saber a forma esperada antes de escrever a UI.

## Próximo passo imediato

Confirmar se `TASK-012` já criou o array/arquivo de glossário (ler `src/data/parts.ts` ou procurar `src/data/glossary.ts`) antes de começar — sem o conteúdo, não há o que listar. Se ainda não existir, coordenar ou implementar `TASK-012` primeiro.

---
Para retomar: abra uma sessão nova e peça para ler este arquivo antes de continuar a task `TASK-013`.
