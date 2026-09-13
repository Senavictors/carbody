// Termos técnicos que aparecem no catálogo (`parts.ts`) e no laboratório de mecanismos
// sem explicação autocontida. Curadoria manual, não gerada a partir do texto das peças (ADR-006).
// Cada definição se apoia nas mesmas fontes que sustentam a peça onde o termo é usado, e não
// pode contradizer o que aquela peça diz — ver CONTENT_SOURCES.md.

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  /** Ids de `parts` onde o termo aparece, para navegação cruzada. */
  relatedParts: string[];
  /** Ids de `sources`, mesma regra do catálogo. */
  sourceIds: string[];
}

export const glossary: GlossaryTerm[] = [
  {
    id: 'alta-tensao', term: 'Alta tensão',
    definition: 'Tensão elétrica muito maior que a dos 12 volts da bateria. Ela é gerada porque a faísca precisa vencer a distância entre os eletrodos da vela, dentro de um cilindro já comprimido.',
    relatedParts: ['ignition-coil', 'spark-plug'], sourceIds: ['bosch-ignition-coil', 'denso-spark'],
  },
  {
    id: 'amortecimento', term: 'Amortecimento',
    definition: 'Consumir a energia de um movimento para que ele termine, em vez de continuar oscilando. A mola guarda e devolve a energia de um solavanco; o amortecimento é o que tira essa energia do sistema, transformando o balanço em calor.',
    relatedParts: ['shock-absorber', 'spring'], sourceIds: ['monroe-shocks', 'monroe-springs'],
  },
  {
    id: 'atrito', term: 'Atrito',
    definition: 'A resistência que surge quando duas superfícies em contato deslizam uma sobre a outra, transformando parte da energia do movimento em calor. O freio provoca atrito de propósito; o rolamento existe para reduzi-lo.',
    relatedParts: ['brake-pad', 'brake-disc', 'wheel-bearing'], sourceIds: ['brembo-pads', 'timken-wheel-bearing'],
  },
  {
    id: 'banda-de-rodagem', term: 'Banda de rodagem',
    definition: 'A faixa do pneu que toca o chão. Seus sulcos ajudam a escoar a água entre a borracha e o piso, e é essa superfície que se consome com o uso.',
    relatedParts: ['tire'], sourceIds: ['michelin-tread', 'michelin-wear'],
  },
  {
    id: 'cilindro', term: 'Cilindro',
    definition: 'O espaço fechado onde o pistão se move e a combustão acontece. Um motor de passeio tem mais de um, e eles trabalham em sequência para que a entrega de força seja contínua.',
    relatedParts: ['engine', 'spark-plug'], sourceIds: ['denso-spark'],
  },
  {
    id: 'combustao', term: 'Combustão',
    definition: 'A queima da mistura de ar e combustível dentro do cilindro. É dela que vem a força que empurra o pistão — e também o calor e os gases que o arrefecimento e o escape precisam administrar.',
    relatedParts: ['engine', 'spark-plug', 'exhaust', 'radiator'], sourceIds: ['denso-spark', 'walker-exhaust'],
  },
  {
    id: 'corrente-eletrica', term: 'Corrente elétrica',
    definition: 'A passagem de eletricidade por um circuito. Quanto maior a corrente, mais o condutor esquenta — por isso existe o fusível, que se rompe antes que a fiação sofra.',
    relatedParts: ['fuses', 'battery', 'starter'], sourceIds: ['rac-fuses', 'varta-battery'],
  },
  {
    id: 'dissipacao-de-calor', term: 'Dissipação de calor',
    definition: 'Transferir para o ar o calor gerado pelo funcionamento, para que ele não se acumule. O radiador faz isso com o líquido de arrefecimento; o disco de freio, com o calor produzido a cada frenagem.',
    relatedParts: ['radiator', 'brake-disc'], sourceIds: ['hella-cooling', 'brembo-disc-heat'],
  },
  {
    id: 'elemento-filtrante', term: 'Elemento filtrante',
    definition: 'O material que retém as impurezas dentro de um filtro, deixando o fluido passar. É ele que se satura com o uso, e é por isso que filtros são trocados em vez de limpos.',
    relatedParts: ['oil-filter', 'air-filter', 'fuel-filter'], sourceIds: ['mann-filter', 'mann-air-filter', 'mann-fuel-filter'],
  },
  {
    id: 'folga', term: 'Folga',
    definition: 'Um movimento livre que passa a existir entre duas peças que deveriam trabalhar unidas. Costuma ser percebida como uma mudança de comportamento — um volante mais solto, um ruído novo — e, sozinha, não identifica qual componente está envolvido.',
    relatedParts: ['steering', 'wheel-bearing', 'sway-bar'], sourceIds: ['zf-chassis-parts', 'timken-wheel-bearing'],
  },
  {
    id: 'ignicao', term: 'Ignição',
    definition: 'O momento em que a faísca inicia a queima da mistura dentro do cilindro, e o conjunto de peças que produz essa faísca na hora certa.',
    relatedParts: ['spark-plug', 'ignition-coil', 'engine'], sourceIds: ['denso-spark', 'bosch-ignition-coil'],
  },
  {
    id: 'pressao-hidraulica', term: 'Pressão hidráulica',
    definition: 'Força transmitida por um líquido dentro de um circuito fechado. Como o líquido praticamente não se comprime, a força aplicada de um lado chega quase inteira do outro — é assim que a força no pedal vira aperto das pastilhas na roda.',
    relatedParts: ['brake-fluid', 'brake-caliper', 'brake-pad'], sourceIds: ['brembo-fluid', 'brembo-caliper'],
  },
  {
    id: 'relacao-de-transmissao', term: 'Relação de transmissão',
    definition: 'A proporção entre quantas voltas entram e quantas saem de um par de engrenagens. Marchas baixas favorecem a força nas rodas; marchas altas permitem manter velocidade com menos rotação do motor.',
    relatedParts: ['gearbox', 'clutch'], sourceIds: ['aa-transmission'],
  },
  {
    id: 'rolamento', term: 'Rolamento',
    definition: 'Um conjunto de esferas ou roletes que corre dentro de uma pista, permitindo que uma peça gire com atrito mínimo enquanto sustenta carga.',
    relatedParts: ['wheel-bearing'], sourceIds: ['timken-wheel-bearing'],
  },
  {
    id: 'sincronismo', term: 'Sincronismo',
    definition: 'A relação de tempo entre o giro do virabrequim e a abertura das válvulas, para que elas abram e fechem na posição certa dos pistões. É o que a correia dentada — ou a corrente, em alguns projetos — preserva.',
    relatedParts: ['timing-belt', 'engine'], sourceIds: ['gates-timing'],
  },
  {
    id: 'sistema-de-carga', term: 'Sistema de carga',
    definition: 'O conjunto que gera eletricidade com o motor funcionando e repõe a energia que a bateria entregou: alternador, seu acionamento e o controle de tensão.',
    relatedParts: ['alternator', 'battery', 'accessory-belt'], sourceIds: ['hella-starting', 'varta-battery'],
  },
  {
    id: 'temperatura-de-trabalho', term: 'Temperatura de trabalho',
    definition: 'A faixa em que o motor funciona melhor: nem frio como logo depois da partida, nem acima do que o arrefecimento consegue segurar. A válvula termostática existe para alcançá-la e mantê-la.',
    relatedParts: ['thermostat', 'radiator', 'water-pump'], sourceIds: ['hella-thermostat', 'hella-cooling'],
  },
  {
    id: 'torque', term: 'Torque',
    definition: 'A capacidade de fazer força girando. É o que um par de engrenagens multiplica quando a saída gira mais devagar do que a entrada — a ideia por trás das marchas baixas.',
    relatedParts: ['gearbox', 'engine'], sourceIds: ['aa-transmission'],
  },
  {
    id: 'tracao', term: 'Tração',
    definition: 'O agarro entre o pneu e o piso. É por esse contato que passam, de fato, as forças de acelerar, frear e mudar de direção — nenhuma delas chega ao chão por outro caminho.',
    relatedParts: ['tire', 'shock-absorber'], sourceIds: ['michelin-wear', 'aa-breakdowns'],
  },
];
