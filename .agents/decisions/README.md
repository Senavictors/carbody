# Índice de Decisões (ADRs) — Carbody

Mantido automaticamente por `bootstrap-audit` a cada execução — não edite esta tabela manualmente, edite os ADRs individuais. Se `bootstrap-audit` ainda não rodou desde a última decisão adicionada, esta tabela pode estar desatualizada.

| ID | Título | Status | Data | Arquivo |
|---|---|---|---|---|
| ADR-001 | Versionar o hub de agentes (.agents/, roteadores, docs/) no repositório público | accepted | 2026-09-11 | `ADR-001-versionamento-do-hub-de-agentes.md` |
| ADR-002 | Aumentar o realismo do modelo 3D via iluminação física + mais detalhe geométrico (foco desktop) | accepted | 2026-09-11 | `ADR-002-realismo-modelo-3d-iluminacao-e-geometria.md` |
| ADR-003 | Expandir o catálogo de peças em duas trilhas paralelas por papel (conteúdo x geometria 3D) | accepted | 2026-09-11 | `ADR-003-expansao-do-catalogo-de-pecas.md` |
| ADR-004 | Estender o MechanismLab com 4 mecanismos novos (Freios, Arrefecimento, Suspensão, Elétrica) | accepted | 2026-09-13 | `ADR-004-mais-mecanismos-no-mechanism-lab.md` |
| ADR-005 | Animar peças do modelo 3D condicionadas ao sistema selecionado | accepted | 2026-09-13 | `ADR-005-animacao-condicionada-por-sistema-no-modelo-3d.md` |
| ADR-006 | Adicionar um glossário de termos técnicos como página própria | accepted | 2026-09-13 | `ADR-006-glossario-de-termos-tecnicos.md` |
| ADR-007 | Comparação visual "desgaste vs. novo" via campo novo em Part | accepted | 2026-09-13 | `ADR-007-comparacao-visual-desgaste-vs-novo.md` |
| ADR-008 | Extrair cada mecanismo do MechanismLab para um módulo próprio, co-locando dados, diagrama e painel | accepted | 2026-09-13 | `ADR-008-extrair-mecanismos-em-modulos-proprios.md` |
| ADR-009 | Validar a integridade dos ids de conteúdo por script no build | accepted | 2026-09-13 | `ADR-009-validacao-de-ids-do-conteudo-no-build.md` |
<!-- bootstrap-audit preenche uma linha por arquivo em .agents/decisions/*.md, lendo o frontmatter (id, title, status, date). Não remova este comentário — é o marcador de onde a regeneração insere as linhas. -->

## Status possíveis

- `proposed` — decisão registrada, ainda não confirmada em execução.
- `accepted` — decisão vigente, deve ser respeitada por qualquer papel/ferramenta.
- `superseded` — substituída por uma decisão mais recente (referenciar o ID novo).
- `deprecated` — não vale mais, mantida só para histórico.
