# Carbody

Entenda seu carro, peça por peça. Um guia web interativo de mecânica automotiva: um modelo 3D explorável do carro, um laboratório de mecanismos animado (motor de 4 tempos e engrenagens) e um catálogo de peças com função, funcionamento e sinais de desgaste — cada um com fonte real citada.

Aplicação 100% local: sem conta, sem backend. O progresso de aprendizado fica salvo no `localStorage` do próprio navegador.

## Rodando localmente

Pré-requisitos: [Node.js](https://nodejs.org) `>= 22.18.0`.

```bash
npm install
npm run dev
```

Abre em `http://127.0.0.1:5173`.

## Scripts disponíveis

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (Vite), com hot reload. |
| `npm run build` | Typecheck (`tsc -b`) + build de produção em `dist/`. |
| `npm run preview` | Serve o build de produção localmente, para conferência. |

Não há script de lint nem de teste configurado neste projeto — não existe ESLint configurado, e `@playwright/test` está instalado como devDependency mas sem nenhum arquivo de teste ainda (ver dívida técnica em `.agents/context/CONTEXT.md`).

## Stack

React 19 + TypeScript + Vite 7, com Three.js para o modelo 3D interativo (câmera ortográfica, ambiente PMREM + ambient occlusion, raycasting de peças). Sem dependências de UI além de `lucide-react` (ícones) e `@fontsource` (fontes locais).

## Estrutura do projeto

```text
src/
  App.tsx                    # casca da aplicação: navegação, busca, progresso
  components/
    CarScene.tsx              # cena 3D interativa (Three.js)
    MechanismLab.tsx           # motor de 4 tempos e engrenagens (SVG animado)
    PartSketch.tsx              # ilustrações SVG por sistema/peça
  data/
    parts.ts                   # catálogo: sistemas, peças, fontes citadas
docs/                         # documentação de arquitetura
.agents/                      # contexto de projeto, tasks, decisões (ADRs)
```

Para o mapa completo do projeto e as convenções de trabalho com IA (Claude Code, Codex), veja [`AGENTS.md`](AGENTS.md). Para a visão de produto original, [`PRODUCT.md`](PRODUCT.md). Para a curadoria editorial do conteúdo e a tabela de fontes por assunto, [`CONTENT_SOURCES.md`](CONTENT_SOURCES.md).

## Publicado em

[github.com/Senavictors/carbody](https://github.com/Senavictors/carbody)
