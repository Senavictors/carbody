# Instruções para Claude Code — Carbody

Arquivo versionado neste repositório. A fonte principal é `AGENTS.md`, na raiz.

Leia nesta ordem:
1. `AGENTS.md`
2. `.agents/context/CONTEXT.md`
3. task ativa em `.agents/tasks/active/` (se houver)
4. o subagente especializado relevante em `.claude/agents/`

Subagentes: `.claude/agents/` (`three-scene`, `content-catalog`, `react-ui`)
Skills: `.claude/skills/` (nenhuma skill de projeto criada ainda — pasta reservada para uso futuro via `bootstrap-quarantine`)
Regras globais: `.claude/rules/global.md`

Não trate este arquivo como documentação completa. Siga os links indicados e registre o estado necessário à continuidade em `.agents/tasks/` e `.agents/handoffs/`.
