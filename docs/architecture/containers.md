---
estado: real
fonte: package.json, vite.config.ts, index.html
ultima-revisao: bootstrap-init, 2026-09-11
---

# Containers

Processos/serviços implantáveis de forma independente (sentido C4), mais serviços externos consumidos. Topologia de implantação real (portas, proxy) fica em [deployment.md](deployment.md); aqui o foco é responsabilidade e forma de comunicação. Carbody tem um único container real.

## 1. SPA (React + Three.js)

- React 19 + TypeScript, empacotada por Vite 7; renderiza toda a UI e a cena 3D (Three.js 0.183) inteiramente no navegador do usuário.
- Não autentica — não há usuário/sessão de servidor. O "estado do usuário" é só o progresso local em `localStorage`.
- Servida como arquivos estáticos: `npm run build` gera `dist/`, servido por qualquer host de arquivos estáticos (nenhum host configurado ainda neste repositório).

## 2. Backend

- Não existe. Este projeto é deliberadamente sem backend (ver Constituição, `.agents/test-onboarding.md`).

## 3. Banco de dados

- Não existe processo de banco de dados. O único "armazenamento" é `localStorage` do navegador do usuário — não é gerenciado por nenhum schema/migration, é uma lista de strings (IDs de peças) serializada em JSON sob uma chave fixa.

## Serviços externos consumidos

Nenhum, em tempo de execução. (Fontes de conteúdo citadas em `CONTENT_SOURCES.md` são referências editoriais, não integrações — ver `context.md`.)

## Comunicação entre containers

```text
Usuário → Navegador (SPA React + Three.js) → localStorage (leitura/escrita direta, sem rede)
```
