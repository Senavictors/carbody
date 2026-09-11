---
name: global
description: Regras globais de Carbody, válidas para qualquer subagente ou alteração no repositório.
---

## Propósito

Manter consistência entre as três áreas do projeto (cena 3D, catálogo de conteúdo, casca React/UI), independente de qual papel ou ferramenta executa a mudança, e proteger as restrições não-negociáveis do produto (ver `.agents/test-onboarding.md`).

## Escopo

Todo o repositório: `src/`, `public/`, `index.html`, `PRODUCT.md`, `CONTENT_SOURCES.md`, `docs/`.

## Práticas exigidas

- O catálogo (`src/data/parts.ts`) é a única fonte de peças, sistemas e fontes citadas — nenhum outro arquivo deve duplicar esse conteúdo.
- Toda afirmação técnica nova sobre uma peça precisa de uma fonte real em `sources`, referenciada via `sourceIds`.
- Conteúdo voltado ao usuário final é sempre em português brasileiro.
- `npm run build` (typecheck + build) deve passar sem erros antes de considerar uma mudança de TypeScript concluída.
- Contratos de dado estáveis (interface `Part`, a chave/formato salvos em `localStorage`) não mudam silenciosamente — mudança que quebre o progresso já salvo de um usuário exige ADR em `.agents/decisions/`.

## Práticas proibidas

- Introduzir conta de usuário, autenticação, backend ou qualquer chamada de rede em runtime — o app é deliberadamente local (Constituição, `.agents/test-onboarding.md`).
- Representar ou implicar um modelo de carro comercial específico — o modelo 3D e o conteúdo são deliberadamente genéricos.
- Apresentar um sinal de desgaste como diagnóstico ou como ranking estatístico de frequência.
- Adicionar uma peça ao catálogo sem fonte real correspondente em `sources`.

## Documentos necessários antes de alterar código

- `.agents/context/CONTEXT.md`
- Subagente relevante: `.claude/agents/three-scene.md`, `.claude/agents/content-catalog.md` ou `.claude/agents/react-ui.md`
- Task ativa em `.agents/tasks/active/`, se houver

## Comandos de validação

```bash
npm run build
```

Não há lint nem teste configurado neste projeto (ver `AGENTS.md`, seção "Comandos reais") — não invente um comando que não existe.

## Condições de atualização

Revisar quando um novo padrão arquitetural for adotado ou quando um ADR novo em `.agents/decisions/` mudar uma regra aqui listada.
