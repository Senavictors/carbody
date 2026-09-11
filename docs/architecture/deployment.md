---
estado: real
fonte: package.json, vite.config.ts
ultima-revisao: bootstrap-init, 2026-09-11
---

# Implantação

Ambiente: nenhum host de produção configurado ainda neste repositório — não há CI/CD, Dockerfile, ou configuração de hosting. O que existe hoje é o fluxo local de desenvolvimento/build via Vite.

## Processos/serviços

| Serviço | Processo | Porta | Path público | Env relevantes |
|---|---|---|---|---|
| Dev server | `npm run dev` → `vite --host 127.0.0.1 --port 5173 --strictPort` | 5173 | `/` | nenhuma |
| Preview do build | `npm run preview` → `vite preview --host 127.0.0.1 --port 5173 --strictPort` | 5173 | `/` | nenhuma |
| Build de produção | `npm run build` → `tsc -b && vite build` | — (gera `dist/`, não sobe servidor) | — | nenhuma |

## Roteamento/proxy (se houver)

Não se aplica — sem backend, sem proxy reverso configurado.

## Variáveis de ambiente relevantes

Nenhuma. A aplicação não lê nenhuma variável de ambiente em runtime — é 100% estática após o build (sem `.env`, sem chave de API).

## Boot da aplicação

1. `index.html` carrega `src/main.tsx` como módulo ES.
2. `main.tsx` importa as fontes (`@fontsource/dm-sans`, `@fontsource/manrope`) e `styles.css`, depois monta `<App />` em `#root` via `ReactDOM.createRoot`.
3. `App.tsx` lê o progresso salvo de `localStorage` (`loadLearned()`) de forma síncrona, na inicialização do estado.

## Armazenamento de arquivos (se aplicável)

Não há upload de usuário. Único armazenamento é `localStorage` (progresso de aprendizado) — ver `components.md`.

## Observabilidade

Nenhuma configurada (ver `components.md`).

## Divergência conhecida

Nenhuma — não há documento ou diagrama anterior a esta revisão para divergir. Quando um host de produção real for configurado, este documento deve ser atualizado a partir da configuração real do deploy (não deixe este README como "deveria ser").
