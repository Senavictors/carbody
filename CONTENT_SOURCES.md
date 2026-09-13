# Conteúdo educativo do Carbody

Pesquisa e redação: 11 de setembro de 2026 (expandido em 11 de setembro de 2026, `ADR-003`). O catálogo está em `src/data/parts.ts`, com 34 peças, sete sistemas e referências vinculadas a cada peça por `sourceIds`.

## Recorte e decisões editoriais

- Referência didática: carro de passeio a combustão, gasolina/flex, com câmbio manual. O texto reconhece variações de projeto, como correntes de distribuição, bombas elétricas, automáticos e CVTs. Não representa a configuração de um modelo específico.
- As peças são uma seleção introdutória de funcionamento, desgaste e manutenção. Não há classificação estatística de “peças que mais quebram” nem extrapolação de atendimentos britânicos para a frota brasileira.
- “Desgaste natural”, “Manutenção preventiva” e “Atenção aos sinais” são categorias editoriais de aprendizagem, não uma previsão de vida útil ou de urgência.
- Os sinais são pistas inespecíficas. Textos evitam concluir que um sintoma comprova defeito em uma peça e orientam avaliação quando necessário.
- Não há intervalo universal de troca, torque, pressão, fluido ou espessura mínima. O manual do veículo e as especificações da aplicação determinam os valores.
- Pneus estão agrupados em Suspensão por conveniência de navegação; a descrição identifica explicitamente suspensão e rodagem.
- As analogias são criações didáticas. Explicam um princípio, sem sugerir equivalência completa entre os mecanismos.
- Não há instruções de desmontagem ou reparo. Cuidados específicos destacam a parada segura em alertas relevantes e a proibição de abrir o arrefecimento quente.

## Base das explicações

Todas as referências do catálogo são de fabricantes ou clubes automotivos. Os títulos em português são rótulos editoriais; parte das páginas originais está em inglês. A verificação foi feita por busca indexada e/ou abertura da página. A página da AA sobre partida respondeu 403 na abertura direta, mas seu conteúdo estava disponível na busca; sua informação foi corroborada pela HELLA.

| Conteúdo | Referências principais |
| --- | --- |
| Motor, ignição e desgaste da vela | [DENSO: funcionamento](https://www.denso-am.eu/news/what-does-a-spark-plug-do-and-how-does-it-work), [DENSO: desgaste](https://www.denso-am.eu/news/dont-overlook-spark-plug-replacement-reminds-denso) |
| Sincronismo e filtro | [Gates: correia dentada](https://www.gates.com/gb/en/innovations-and-solutions/automotive-and-on-highway-solutions/timing-belt-drive-systems.html), [MANN-FILTER: óleo](https://www.mann-filter.com/us-en/parts/oil-filter.html) |
| Embreagem e transmissões | [The AA: embreagem](https://www.theaa.com/breakdown-cover/advice/car-clutch-problems), [The AA: transmissões](https://www.theaa.com/breakdown-cover/advice/manual-vs-automatic) |
| Homocinética | [GKN: funcionamento](https://www.gknautomotive.com/en/aftermarket/portfolio/constant-velocity-joints/), [Nakata: sinais](https://www.nakata.com.br/sala-de-imprensa/indicios-de-que-a-junta-homocinetica-pode-estar-comprometida) |
| Freios | [Brembo: pastilhas](https://www.bremboparts.com/america/en/support/car/maintenance/how-can-i-tell-if-my-brake-pads-are-worn-335458), [Brembo: discos](https://www.bremboparts.com/america/en/support/car/maintenance/minimum-brake-rotor-thickness-212337), [Brembo: fluido](https://www.bremboparts.com/america/en/support/car/maintenance/brake-fading-and-vapour-lock-two-problems-compared-324324) |
| Suspensão e rodagem | [Monroe: amortecedores](https://www.monroe.com/technical-resources/shocks-101/symptoms-worn-shock-struts.html), [Monroe: molas](https://www.monroe.com/technical-resources/tech-tips/What-Every-Technician-Needs-to-Know-About-Coil-Springs.html), [Michelin: desgaste](https://thetiredigest.michelin.com/every-day-check-for-wear) |
| Elétrica | [VARTA: bateria](https://www.varta-automotive.com/apac/varta-battery-support/battery-basics/how-does-a-battery-work), [HELLA: partida e carga](https://www.hella.com/techworld/au/passenger-car-parts/vehicle-electrics/starters-and-alternators/) |
| Arrefecimento | [HELLA: circuito](https://www.hella.com/techworld/us/technical/car-cooling-system/engine-cooling/), [HELLA: bomba](https://www.hella.com/techworld/us/technical/car-cooling-system/defective-water-pump/), [HELLA: válvula termostática](https://www.hella.com/techworld/us/passenger-car-parts/vehicle-electrics/coolant-thermostats/) |
| Alertas e contexto de manutenção | [AAA: luzes do painel](https://cluballiance.aaa.com/the-extra-mile/series/the-extra-mile-magazine/a-warning-light-road-map), [The AA: falhas comuns](https://www.theaa.com/breakdown-cover/advice/top-ten-breakdown-causes) |
| Sistema de escape | [Walker: componentes do sistema de escape](https://www.walkerexhaust.com/support/exhaust-101/what-parts-make-up-the-exhaust-system.html) |
| Direção e barra estabilizadora | [ZF Aftermarket: peças de direção e chassi](https://aftermarket.zf.com/en/aftermarket-portal/our-portfolio/passenger-cars/products/steering-chassis-parts/) |
| Filtro de ar | [MANN-FILTER: função do filtro de ar](https://www.mann-filter.com/us-en/parts/air-filter.html) |
| Correia auxiliar | [Gates: sistema de correia auxiliar (Micro-V)](https://www.gates.com/gb/en/innovations-and-solutions/automotive-and-on-highway-solutions/micro-v-belt-drive-systems.html) |
| Freio de mão | [The AA: funcionamento e desgaste do freio de mão](https://www.theaa.com/driving-advice/service-repair/brakes-discs-drums-pads) |
| Pinça de freio | [Brembo: pinças fixas e flutuantes](https://www.bremboparts.com/america/en/support/insights/brake-caliper-technology-and-operation-324333) |
| Bobina de ignição | [Bosch: como a bobina gera alta tensão](https://www.bosch-mobility.com/en/solutions/ignition/ignition-coil/) |
| Fusíveis e relés | [RAC: como identificar um fusível queimado](https://www.rac.co.uk/drive/advice/car-maintenance/blown-car-fuse/) |
| Rolamento de roda | [Timken: sinais de desgaste do rolamento de roda](https://www.timken.com/resources/md17-symptoms-of-a-worn-wheel-hub-bearing/) |
| Reservatório de expansão | [HELLA: função do reservatório de expansão](https://www.hella.com/techworld/us/passenger-car-parts/thermal-management/ec-expansion-tanks/) |
| Tanque de combustível | [Kautex: sistemas de combustível convencionais](https://www.kautex.com/en/mobility/fuel-systems/conventional-fuel-systems) |
| Bomba de combustível | [Bosch: módulo de alimentação de combustível](https://www.bosch-mobility.com/en/solutions/pumps/fuel-supply-module/) |
| Filtro de combustível | [MANN-FILTER: função do filtro de combustível](https://www.mann-filter.com/us-en/parts/fuel-filter.html) |
| Bico injetor | [Bosch: função do bico injetor](https://www.bosch-mobility.com/en/solutions/valves/fuel-injector-manifold/) |

Três fontes desta lista responderam 403 na abertura direta (`aa-parking-brake`, `rac-fuses`, `gates-accessory-belt`), mas seu conteúdo estava disponível na busca indexada — mesmo critério já usado para `aa-starting`. A fonte `timken-wheel-bearing` aponta para um documento técnico (PDF) da Timken.

**Correção (2026-09-11)**: a fonte `hella-alternator`, citada pela peça "Alternador", apontava para um arquivo de logotipo da HELLA em vez de conteúdo técnico — removida. A peça passou a citar `hella-starting` (já cadastrada, cobre partida e alternador na mesma página).

O cadastro exportado mantém os links complementares. Propaganda de produto, prazos médios, rankings e percentuais das fontes não foram reproduzidos como regras universais.

## Glossário de termos técnicos

Adicionado em 13 de setembro de 2026 (`ADR-006`, `TASK-012`), em `src/data/glossary.ts` — arquivo próprio, separado de `parts.ts`. São 19 termos, cada um com `relatedParts` (onde o termo aparece) e `sourceIds`.

Critério de seleção: só entraram termos que o usuário **encontra de fato** no conteúdo — no texto das 34 peças ou no laboratório de mecanismos. Por isso `viscosidade` e `oxidação`, citados como candidatos no planejamento, ficaram de fora: não aparecem em lugar nenhum do conteúdo, e defini-los seria explicar uma palavra que ninguém vai encontrar. `torque` entrou mesmo não aparecendo em `parts.ts`, porque é usado no laboratório de mecanismos (modo "Engrenagens").

Nenhuma fonte nova foi cadastrada. Cada definição se apoia nas mesmas referências que já sustentam a peça onde o termo é usado — por exemplo, "pressão hidráulica" cita as mesmas fontes Brembo de `brake-fluid` e `brake-caliper`. A regra por trás disso: o glossário não pode introduzir afirmação técnica que o catálogo já não sustente, e não pode contradizer o campo `function`/`how` da peça relacionada.
