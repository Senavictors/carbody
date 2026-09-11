---
estado: real
fonte: PRODUCT.md, src/App.tsx, package.json
ultima-revisao: bootstrap-init, 2026-09-11
---

# Contexto do Sistema

## Propósito

Carbody é uma aplicação web educativa, de página única, que ensina o essencial de mecânica automotiva a um iniciante. Relaciona a posição das principais peças de um carro genérico a combustão (câmbio manual) com sua função, funcionamento e sinais comuns de desgaste, através de um modelo 3D interativo e um laboratório de mecanismos animado (motor de 4 tempos e engrenagens).

## Atores

| Ator | Papel |
|---|---|
| Usuário aprendiz | Explora o modelo 3D, o catálogo de peças e o laboratório de mecanismos; marca peças como aprendidas; progresso salvo no próprio navegador. |
| Navegador do usuário | Executa toda a aplicação (React + Three.js); é também o único "armazenamento" do sistema, via `localStorage`. |

## Fronteiras do sistema (atores/sistemas externos)

- **Nenhum sistema externo é chamado em tempo de execução.** A aplicação não faz nenhuma requisição de rede além de carregar seus próprios arquivos estáticos (JS/CSS/fontes) e as fontes web do Google Fonts empacotadas localmente via `@fontsource`.
- **Fontes citadas em `CONTENT_SOURCES.md`** (DENSO, Gates, MANN-FILTER, The AA, Brembo, Monroe, Michelin, VARTA, HELLA, GKN, Nakata, AAA) são apenas referências editoriais usadas para escrever o conteúdo — não são integrações, não há chamada de API para elas.
- **Banco de dados**: não há. O único dado persistido é a lista de peças marcadas como "aprendidas" pelo usuário, em `localStorage` (chave `por-dentro:learned:v1`), tratado como "externo" ao processo React apenas no sentido de sobreviver a recarregamentos de página — vive inteiramente no navegador do próprio usuário.

## Fora do escopo deste contexto

- Contas de usuário, login, ou qualquer sincronização de progresso entre dispositivos/navegadores.
- Diagnóstico real de um veículo específico — o conteúdo é deliberadamente genérico e didático (ver Constituição em `.agents/test-onboarding.md`).
- Qualquer backend, API própria, ou banco de dados servidor.
