# Snapshot — TASK-005

Gerado em: 2026-09-11
Task: `.agents/tasks/backlog/TASK-005-conteudo-sistema-combustivel.md`

## ADR de referência

`.agents/decisions/ADR-003-expansao-do-catalogo-de-pecas.md` — esta é a task de maior escopo das 6 (introduz um 7º `SystemId`).

## Assinaturas de código necessárias

- `export type SystemId = 'all' | 'engine' | 'transmission' | 'brakes' | 'suspension' | 'electrical' | 'cooling';` — `src/data/parts.ts:1`. Precisa ganhar `| 'fuel'`.
- `export const systems: { id: SystemId; name: string; description: string }[] = [...]` — `src/data/parts.ts:3-11`. Precisa ganhar uma entrada `{ id: 'fuel', name: 'Combustível', description: '...' }`.
- `const systemIcons: Record<SystemId, LucideIcon> = { all: Layers3, engine: Cog, transmission: Settings2, brakes: CircleDot, suspension: Move, electrical: Zap, cooling: Droplets };` — `src/App.tsx:14`. Como o tipo é `Record<SystemId, LucideIcon>`, o TypeScript **recusa compilar** até essa chave `fuel` ser adicionada — é esperado, não um bug.
- A navegação por sistema (`src/App.tsx:130`, `sidebar-systems`, e o bloco `system-tabs` na página "explore") já itera `systems` dinamicamente — nenhuma outra mudança de JSX é necessária além de `systemIcons`.
- `export interface Part {...}` — `src/data/parts.ts:13-27`, para as 4 peças novas.

## Restrições ativas

- Ids fixos: `SystemId` novo é `'fuel'`; peças são `fuel-tank`, `fuel-pump`, `fuel-filter`, `fuel-injector` — a `TASK-008` (par desta, trilha geometria) usa os mesmos.
- Manter genérico — sem implicar um sistema de injeção eletrônica de marca específica (Constituição do projeto).
- Confirmar que o ícone escolhido existe em `lucide-react` na versão instalada (`^0.577.0`) antes de importar — sugestão da task original: `Fuel`.

## Próximo passo imediato

Adicionar `| 'fuel'` a `SystemId` e a entrada em `systems`, depois rodar `npm run build` só para **confirmar que o erro esperado aparece** em `systemIcons` (prova de que a rede de segurança do tipo está funcionando) — só depois disso adicionar a chave `fuel` a `systemIcons` e seguir para o conteúdo das 4 peças.

---
Para retomar: abra uma sessão nova e peça para ler este arquivo antes de continuar a task `TASK-005`.
