# Mapa da Documentação — Carbody

Pasta versionada neste repositório (decisão do projeto — ver `ADR-001` em `.agents/decisions/`). Documentação de arquitetura de apoio, separada da documentação de produto que já existe em outro lugar do repositório (ver "Fontes primárias" abaixo).

## Convenção de estado (documentação viva)

Todo documento desta pasta (exceto os `README.md` de índice) começa com um frontmatter mínimo:

```yaml
---
estado: planejado | real | divergente
fonte: <arquivo/pasta de código que sustenta este doc, ou a spec de origem>
ultima-revisao: <task ou data que atualizou este doc por último>
---
```

- **planejado** — descreve algo especificado mas ainda não implementado (projeto novo ou funcionalidade futura).
- **real** — descreve o comportamento confirmado no código atual.
- **divergente** — o documento e o código real discordam e a divergência ainda não foi resolvida; registre a divergência no corpo do doc, nunca corrija silenciosamente.

Quem mantém isso vivo: `bootstrap-complete` (ao concluir uma task que toca a área, atualiza o doc, carimba `ultima-revisao` e vira `planejado → real` quando aplicável) e `bootstrap-audit` (aponta docs `real` suspeitos de estarem defasados).

## Fontes primárias

Já existe documentação de produto forte na raiz do repositório — esta pasta complementa, nunca duplica:

| Assunto | Fonte primária |
|---|---|
| Visão de produto, plataforma, stack, usuários, princípios de produto | `PRODUCT.md` (raiz) |
| Pesquisa e curadoria editorial do conteúdo (recorte, decisões, tabela de fontes por assunto) | `CONTENT_SOURCES.md` (raiz) |
| Restrições inegociáveis (Constituição) e perguntas de sanidade | `.agents/test-onboarding.md` |
| Assuntos sem dono externo (arquitetura técnica de código, domínio de dados, deployment) | esta pasta (`docs/`) |

## Regra de organização

Nenhum arquivo solto na raiz de `docs/` além deste `README.md` — todo doc vive numa subpasta do mapa abaixo.

## Comece por aqui

Núcleo (existe em todo projeto):

1. [Arquitetura](architecture/README.md)
2. [Domínio](domain/README.md)
3. [Módulos](modules/README.md)
4. [API](api/README.md)
5. [Dados](data/README.md)
6. [Integrações](integrations/README.md)
7. [Diagramas](diagrams/README.md)

Extensões deste projeto: nenhuma criada no bootstrap inicial (2026-09-11). O projeto não tem funcionalidade de IA em runtime, não é pré-desenvolvimento (já tem código funcionando e publicado), não tem um design system formal separado do CSS de `src/`, e não tem requisitos de segurança/qualidade formais que justifiquem `quality/`/`security/` dedicados agora (sem dados sensíveis, sem contas de usuário). Se um desses cenários mudar, proponha a extensão correspondente antes de criar a pasta.

## Implementar uma funcionalidade

Task (`.agents/tasks/`) → módulo (`modules/`) → API/dados (`api/`, `data/`) → decisões (`.agents/decisions/`) → testes

## Corrigir um bug

Task → módulo → known issues → testes → causa raiz → handoff (`.agents/handoffs/`)
