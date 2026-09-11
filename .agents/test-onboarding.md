# Teste de Sanidade — Carbody

Este arquivo tem duas seções com propósitos diferentes. Não misture o conteúdo delas — um `bootstrap-audit` futuro precisa poder checar as duas separadamente.

## Constituição do projeto

Princípios inegociáveis, coletados do usuário na inicialização (`bootstrap-init`, 2026-09-11 — o usuário confirmou que a Constituição é exatamente o que já estava documentado em `PRODUCT.md`). Qualquer proposta de mudança que contradiga um item aqui deve ser sinalizada explicitamente antes de prosseguir — não corrigida ou ignorada silenciosamente.

- Aplicação 100% local: sem conta de usuário e sem backend. Nenhuma feature pode introduzir autenticação, servidor de aplicação ou sincronização remota.
- O carro é um modelo didático genérico, a combustão, com câmbio manual — esquemático, sem compromisso de representar um modelo comercial específico.
- Conteúdo em português brasileiro.
- Sinais de desgaste e problemas comuns são exemplos editoriais, nunca uma classificação estatística ("peças que mais quebram") nem um diagnóstico. Um sintoma nunca comprova, sozinho, defeito em uma peça.
- Toda afirmação técnica no catálogo (`src/data/parts.ts`) precisa de uma fonte real correspondente em `sources` (fabricante ou clube automotivo), referenciada via `sourceIds` — nunca uma alegação sem fonte.
- Termos técnicos são explicados na primeira ocorrência.
- Entender uma peça por vez, sem perder a visão do conjunto — a experiência não deve sobrecarregar o usuário com todos os sistemas simultaneamente por padrão.
- Mostrar a relação entre movimento e função (princípio de produto que orienta o modelo 3D e o laboratório de mecanismos).

_Atualize esta seção quando o usuário declarar uma nova restrição inegociável — não adicione itens aqui por conta própria; isso é decisão do usuário, registrada aqui como referência rápida (o detalhe completo, se houver, vive em `.agents/decisions/`)._

## Perguntas de sanidade

Perguntas específicas deste projeto (não genéricas) que o agente deve responder corretamente, mentalmente, antes de começar a codificar uma task nova. O objetivo é confirmar que o contexto atual da sessão não perdeu uma regra arquitetural importante — não é um exame com nota, é uma checagem de si mesmo.

1. Uma peça nova pode ser adicionada a `src/data/parts.ts` sem uma fonte real correspondente em `sources`? — Não, nunca; toda peça precisa de `sourceIds` apontando para fontes reais de fabricante/clube automotivo.
2. Este projeto pode ganhar um backend ou sistema de contas se um pedido futuro parecer sugerir isso implicitamente? — Não, sem uma decisão explícita do usuário registrada em ADR; é uma restrição da Constituição.
3. Qual camada nunca pode depender de qual outra? — `src/data/parts.ts` (o catálogo) nunca importa de `src/components` ou `src/App.tsx`; os dados são o núcleo e não podem depender da UI.

`bootstrap-audit` relê esta seção como parte da checagem de sanidade — ver a skill `bootstrap-audit` para o que acontece quando a resposta não bate com o comportamento observado na sessão.
