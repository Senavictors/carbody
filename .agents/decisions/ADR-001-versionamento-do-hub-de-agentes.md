---
id: ADR-001
title: Versionar o hub de agentes (.agents/, roteadores, docs/) no repositório público
status: accepted
date: 2026-09-11
deciders: [Senavictors]
related_tasks: []
---

# ADR-001 — Versionar o hub de agentes (.agents/, roteadores, docs/) no repositório público

## Contexto

Ao rodar `bootstrap-init` neste projeto, a arquitetura padrão (usada em outros projetos do usuário, como GeoCloudAI e E-LIMS) mantém `AGENTS.md`, `CLAUDE.md`, `PLANS.md`, `.agents/` e `docs/` locais e fora do Git (`.gitignore`). O repositório `Senavictors/carbody`, porém, é público e o usuário quis avaliar explicitamente se esse estado de trabalho deveria ser versionado junto do código.

## Decisão

Versionar `AGENTS.md`, `CLAUDE.md`, `PLANS.md`, `.agents/` (contexto, tasks, handoffs, decisões, quarentena) e `docs/` no repositório `Senavictors/carbody`, em vez de mantê-los locais. A seção de segredos do `.gitignore` (`.env*`, `secrets/**`, `credentials/**`, `*.pem`, `*.key`, `backups/**`, `dumps/**`) continua sempre excluída, independente desta decisão.

## Alternativas consideradas

### Alternativa A — Tudo local (padrão da arquitetura)
Mantém o hub de agentes fora do repositório público. Vantagem: nenhuma informação de processo interno fica visível a quem clonar o repositório. Desvantagem: como o repositório é público e não há colaboradores adicionais previstos no momento, isso teria pouco benefício real e dificultaria continuar o trabalho de outra máquina sem recriar o hub manualmente.

### Alternativa B — Misto (ex.: `docs/` versionado, `.agents/` local)
Consideraria versionar só a documentação de arquitetura, mantendo tasks/decisões privadas. Não escolhida porque o usuário preferiu simplicidade (uma única regra para todo o hub) a esta granularidade.

## Consequências

### Positivas
- O estado de trabalho (contexto, tasks, decisões) fica disponível em qualquer clone do repositório, sem depender de uma máquina específica.
- `docs/` fica público, servindo também como documentação de arquitetura para quem for ler o código no GitHub.

### Negativas
- Decisões de processo interno (ex.: dívida técnica conhecida, riscos) ficam visíveis publicamente junto do código.

### Riscos
- Nenhum segredo deve nunca ser registrado em `.agents/context/CONTEXT.md` ou em qualquer ADR, já que este conteúdo é público — mitigado pela seção de segredos do `.gitignore`, que continua valendo independente desta decisão.

## Plano de adoção

Aplicado imediatamente no bootstrap inicial (`bootstrap-init`, 2026-09-11): todos os arquivos do hub foram criados sem entradas de `.gitignore` que os excluam, e serão commitados normalmente.

## Validação

`git status` não deve mostrar `AGENTS.md`, `CLAUDE.md`, `PLANS.md`, `.agents/` ou `docs/` como ignorados; `git log` deve mostrar esses arquivos commitados.

## Revisão

Reavaliar se o projeto ganhar colaboradores externos ou se decisões sensíveis precisarem ser registradas — nesse caso, considerar mover `.agents/decisions/` (ou parte dele) para local.
