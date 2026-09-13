---
id: TASK-016
title: "Casca da aplicação conhece os 6 mecanismos do MechanismLab"
status: completed
type: fix
owner:
created_at: 2026-09-13
updated_at: 2026-09-13
affected_modules: [react-ui]
related_use_cases: []
related_adrs: [ADR-004]
---

# TASK-016 — Casca da aplicação conhece os 6 mecanismos

## Contexto

`ADR-004` levou o `MechanismLab` de 2 para 6 mecanismos animados (`TASK-009` e `TASK-010`), mas o "Impacto técnico" das duas tasks listava apenas `MechanismLab.tsx` e o CSS. `App.tsx` ficou para trás e continua enxergando só dois modos. A pendência foi registrada nas duas tasks e em `docs/modules/mechanism-lab.md` ("Interfaces públicas"), com a recomendação de virar task própria — é esta.

Task criada diretamente, sem o ritual de 3 opções do `bootstrap-plan`: a decisão arquitetural já está tomada no `ADR-004`, e aqui só resta alinhar a casca ao que o componente já expõe.

## Problema

Os 4 mecanismos novos são alcançáveis apenas pelas abas dentro da própria página "Como funciona". Nada na aplicação leva a eles, e em um ponto a casca leva ativamente ao lugar errado.

## Objetivo

Qualquer peça cujo sistema tenha um mecanismo animado correspondente oferece o caminho até ele, e a página "Como funciona" para de descrever a si mesma como se tivesse só dois diagramas.

## Fora de escopo

- Qualquer mudança em `MechanismLab.tsx` além de exportar o tipo `Mode` (o componente já está correto).
- Extrair os mecanismos para arquivos próprios — é a outra pendência aberta, ligada à Alternativa B do `ADR-004`.
- `CarScene.tsx` e o catálogo (`src/data/parts.ts`).

## Comportamento atual

- `const [mechanismMode,setMechanismMode]=useState<'engine'|'gears'>('engine')` — o estado não comporta os 4 valores novos.
- `openMechanism=(mode:'engine'|'gears')` e a chamada `openMechanism(selectedPart.system==='transmission'?'gears':'engine')`: qualquer peça que não seja de transmissão leva ao motor.
- Em `PartDetail`, o botão "Veja o movimento acontecer" só é renderizado quando `['engine','transmission'].includes(part.system)` — para peças de freio, suspensão, arrefecimento e elétrica o link nem existe.
- A nota de rodapé da página diz "Os diagramas simplificam um motor de quatro tempos e pares de engrenagens".
- A seção "Agora, encontre no carro" lista sempre as mesmas 4 peças (`engine`, `spark-plug`, `clutch`, `gearbox`), independentemente do mecanismo aberto.

## Comportamento esperado

- Um mapa único `SystemId → Mode` é a fonte da relação entre sistema do catálogo e mecanismo animado, usado tanto para decidir se o link aparece quanto para onde ele leva.
- `PartDetail` mostra "Veja o movimento acontecer" exatamente quando existe mecanismo para o sistema da peça, e o link abre o mecanismo correto.
- A seção "Agora, encontre no carro" lista peças relacionadas ao mecanismo aberto no momento.
- A nota de rodapé descreve os 6 diagramas sem enumerar cada um.

## Regras de negócio

- RN-01: o mapa `SystemId → Mode` não pode duplicar conhecimento que já vive em `MechanismLab.tsx` — o tipo `Mode` é importado de lá, não redeclarado.
- RN-02 (`.claude/agents/react-ui.md`, regra 1): nenhuma biblioteca de rotas; a navegação continua por estado local.
- RN-03: importar `Mode` não pode quebrar o code-splitting do `MechanismLab` (`React.lazy`) — precisa ser `import type`.
- RN-04: as peças citadas por mecanismo precisam existir no catálogo; nenhum id inventado.

## Critérios de aceitação

- [x] CA-01: `mechanismMode` e `openMechanism()` aceitam os 6 valores de `Mode`, importado de `MechanismLab.tsx`.
- [x] CA-02: abrir uma peça de freio, suspensão, arrefecimento ou elétrica mostra o link para o mecanismo, e o link abre o mecanismo daquele sistema.
- [x] CA-03: peças de sistema sem mecanismo correspondente continuam sem o link — **satisfeito estruturalmente, não exercitável hoje** (ver Divergências).
- [x] CA-04: a seção "Agora, encontre no carro" muda conforme o mecanismo aberto.
- [x] CA-05: a nota de rodapé da página não descreve mais apenas motor e engrenagens.
- [x] CA-06: o chunk do `MechanismLab` continua separado no build (o `import type` não o puxa para o bundle principal).
- [x] CA-07: `npm run build` passa sem erros.

## Impacto técnico

### Frontend
`src/App.tsx` (estado, `openMechanism`, `PartDetail`, seção de conexões, nota de rodapé) e `src/components/MechanismLab.tsx` (apenas `export` do tipo `Mode`).

### Backend / Banco de dados / Integrações / Segurança
Não se aplica.

## Plano de implementação

- [x] Etapa 1: exportar `Mode` de `MechanismLab.tsx` e importar como tipo em `App.tsx`.
- [x] Etapa 2: criar o mapa `SystemId → Mode` e usá-lo em `openMechanism()` e na condição do link em `PartDetail`.
- [x] Etapa 3: tornar a seção "Agora, encontre no carro" dependente do mecanismo aberto.
- [x] Etapa 4: atualizar a nota de rodapé.
- [x] Etapa 5: verificar no navegador, conferir o build e a separação de chunks.

## Estratégia de testes

- [x] Unitários/Integração/E2E — não aplicável (sem suíte de testes).
- [x] Manual — abrir uma peça de cada sistema, seguir o link, conferir o mecanismo aberto e as peças sugeridas.

## Riscos e rollback

Risco baixo: mudança localizada em uma casca sem estado persistido. O único ponto de atenção é o `import type` — um import de valor puxaria o `MechanismLab` (e não o Three.js) para o bundle principal, o que o build revela na listagem de chunks. Rollback: reverter `App.tsx`.

## Registro de execução

### Alterações realizadas

- `MechanismLab.tsx`: `type Mode` passou a ser exportado. Nenhuma outra mudança no componente.
- `App.tsx`: `import type { Mode } from './components/MechanismLab'` — import de tipo, apagado na compilação, que não desfaz o `React.lazy`.
- Dois mapas novos no topo de `App.tsx`, ao lado de `systemIcons`:
  - `systemMechanism: Partial<Record<Exclude<SystemId,'all'>, Mode>>` — a relação entre sistema do catálogo e mecanismo animado, usada tanto para decidir se o link aparece quanto para onde ele leva.
  - `mechanismParts: Record<Mode, string[]>` — as peças sugeridas por mecanismo na seção "Agora, encontre no carro".
- `PartDetail` passou a receber `onMechanism: (() => void) | null` e renderiza o link quando ele não é nulo, no lugar da lista fixa `['engine','transmission'].includes(part.system)`. Quem decide passou a ser o mapa, não o componente.
- `mechanismMode` e `openMechanism()` tipados com `Mode`; a chamada deixou de ser o ternário `transmission ? gears : engine` e passa o mecanismo do sistema da peça aberta (`partMechanism`).
- A seção "Agora, encontre no carro" resolve os ids de `mechanismParts[mechanismMode]` contra o catálogo, filtrando o que não existir — antes listava sempre as mesmas 4 peças de motor e transmissão.
- Nota de rodapé da página reescrita sem enumerar os mecanismos, para não voltar a envelhecer a cada mecanismo novo.

### Arquivos principais

- `src/App.tsx`
- `src/components/MechanismLab.tsx` (uma palavra: `export`)
- `docs/architecture/components.md`, `docs/modules/mechanism-lab.md`, `.agents/context/CONTEXT.md`

### Decisões

- **Dois mapas em `App.tsx`, não um campo novo no catálogo.** Tentador seria acrescentar `mechanism` à interface `Part` ou ao `systems`, mas isso colocaria conhecimento de UI dentro do dado puro e mexeria num contrato estável (`AGENTS.md`: mudança na interface `Part` exige ADR). A relação sistema↔mecanismo é de apresentação e fica na casca.
- **`mechanismParts` é `Record<Mode, string[]>`, não `Partial`.** Assim, acrescentar um sétimo mecanismo no `MechanismLab` quebra o typecheck até que as peças sugeridas sejam declaradas — o esquecimento vira erro de build em vez de uma seção vazia.
- **`fuel → 'engine'`.** O sistema Combustível não tem mecanismo próprio, mas o diagrama do motor de 4 tempos mostra exatamente a admissão da mistura ar-combustível e o bico injetor está entre as peças sugeridas do modo `engine`. É o destino mais honesto disponível; se um mecanismo de alimentação surgir, basta trocar essa entrada.
- **Nota de rodapé sem enumerar.** Ela já estava defasada por dois ciclos justamente por listar os mecanismos um a um.

### Divergências

- **CA-03 não é exercitável com o catálogo atual.** O mapa cobre os 7 sistemas existentes (`fuel` incluído, pela decisão acima), então hoje nenhuma peça fica sem link. O caminho negativo está implementado e tipado (`onMechanism: (() => void) | null`, e `partMechanism` é `Mode | undefined`), mas não há dado que o exercite — o critério foi marcado como atendido pela estrutura, não por observação. Um sistema novo sem mecanismo cairia nele automaticamente.

### Pendências

- Nenhuma nova. A pendência remanescente do `ADR-004` continua sendo a Alternativa B (extrair cada mecanismo de `MechanismLab.tsx`, hoje com 660 linhas, para arquivos próprios) — decisão ainda não tomada, registrada no `CONTEXT.md`.
- Não foi criado `docs/modules/app-shell.md`: esta task alterou ~10 linhas de `App.tsx` e não mexeu na navegação, na busca nem na persistência, então não tocou o módulo "a fundo" no sentido que o `README` de `docs/modules/` usa para justificar um arquivo próprio. O que mudou está documentado em `docs/architecture/components.md`, que já cobre `App.tsx`.

## Validação

```bash
npm run build
```
Passou sem erros. Separação de chunks conferida na saída do `vite build`: `MechanismLab-*.js` continua como chunk próprio (41,20 kB) e o `index-*.js` ficou em 310,58 kB — praticamente o mesmo valor de antes do `ADR-004` (310,15 kB), confirmando que o `import type` não trouxe o componente para o bundle principal (CA-06).

Verificação no navegador (`npm run dev`, http://localhost:5173), abrindo uma peça de cada sistema pela biblioteca e seguindo o link:

| peça aberta | mecanismo que abriu | peças sugeridas |
|---|---|---|
| Pastilha de freio | Freio a disco · circuito hidráulico | Pastilha, Disco, Pinça, Fluido de freio |
| Amortecedor | Conjunto de mola e amortecedor · uma roda | Mola, Amortecedor, Pneu, Barra estabilizadora |
| Alternador | Sistema de carga · 12 volts | Bateria, Alternador, Motor de partida, Fusíveis e relés |
| Radiador | Circuito de arrefecimento | Radiador, Bomba d'água, Válvula termostática, Reservatório |
| Tanque de combustível | Motor a gasolina · um cilindro | Motor, Vela, Filtro de ar, Bico injetor |
| Caixa de câmbio | Um par de engrenagens | Embreagem, Caixa de câmbio, Junta homocinética |

- CA-02: confirmado que o link "Veja o movimento acontecer" agora aparece na página da Pastilha de freio (antes não existia para o sistema `brakes`) e leva ao mecanismo certo.
- CA-04: a seção "Agora, encontre no carro" trocou de conteúdo junto com o mecanismo em todos os 6 casos da tabela.
- CA-05: nota de rodapé lida no DOM — "Os diagramas são esquemas simplificados, feitos para explicar o princípio de cada mecanismo. O projeto real varia conforme o veículo."
- Console do navegador sem erros.

## Handoff
Não aplicável — a task foi criada, executada e verificada em uma única sessão.
