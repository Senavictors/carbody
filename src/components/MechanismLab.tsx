import { useEffect, useId, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUp, ArrowUpDown, Gauge, MoveRight, Pause, Play, RotateCcw, Thermometer, Zap } from 'lucide-react';
import './mechanism-lab.css';

export type Mode = 'engine' | 'gears' | 'brakes' | 'cooling' | 'suspension' | 'electrical';
type MechanismLabProps = { initialMode?: Mode };

const modes: { id: Mode; tab: string; header: string }[] = [
  { id: 'engine', tab: 'Motor de 4 tempos', header: 'Motor a gasolina · um cilindro' },
  { id: 'gears', tab: 'Engrenagens', header: 'Um par de engrenagens' },
  { id: 'brakes', tab: 'Freios', header: 'Freio a disco · circuito hidráulico' },
  { id: 'cooling', tab: 'Arrefecimento', header: 'Circuito de arrefecimento' },
  { id: 'suspension', tab: 'Suspensão', header: 'Conjunto de mola e amortecedor · uma roda' },
  { id: 'electrical', tab: 'Elétrica', header: 'Sistema de carga · 12 volts' },
];
const speeds: Record<Mode, number> = { engine: .07, gears: .025, brakes: .05, cooling: .045, suspension: .06, electrical: .05 };
const startAngle = (mode: Mode) => mode === 'engine' ? 90 : 0;
const strokes = [
  {
    name: 'Admissão', verb: 'A mistura entra.',
    text: 'O pistão desce e a válvula de admissão abre. Ar e combustível entram no cilindro.',
    valve: 'Admissão aberta · escape fechado', direction: 'O pistão desce', color: '#d6e7ec',
    detail: 'Pense em uma seringa: ao puxar o êmbolo, você cria espaço para o ar entrar.',
  },
  {
    name: 'Compressão', verb: 'A mistura é comprimida.',
    text: 'As duas válvulas fecham. O pistão sobe e comprime a mistura de ar e combustível.',
    valve: 'As duas válvulas fechadas', direction: 'O pistão sobe', color: '#c9dce4',
    detail: 'A mistura fica em um espaço menor, pronta para receber a faísca da vela.',
  },
  {
    name: 'Combustão', verb: 'A expansão gera força.',
    text: 'Perto do fim da compressão, a vela produz uma faísca. A queima da mistura expande os gases e empurra o pistão para baixo.',
    valve: 'As duas válvulas fechadas', direction: 'O pistão desce', color: '#f4c6ae',
    detail: 'É o tempo que entrega energia. A biela transmite o movimento ao virabrequim, que gira.',
  },
  {
    name: 'Escape', verb: 'Os gases saem.',
    text: 'A válvula de escape abre. O pistão sobe e empurra os gases da queima para fora do cilindro.',
    valve: 'Admissão fechada · escape aberto', direction: 'O pistão sobe', color: '#e1e4e8',
    detail: 'Com o cilindro preparado para uma nova mistura, a sequência começa de novo.',
  },
];

const ratios = [
  { input: 12, output: 24, label: 'Mais força', title: 'Menos velocidade, mais torque.', text: 'A engrenagem menor move uma maior. A saída gira mais devagar e ganha torque: a capacidade de fazer força ao girar.', example: 'A ideia por trás das marchas baixas: ajudar o carro a sair do lugar e subir uma ladeira.' },
  { input: 24, output: 24, label: 'Mesma relação', title: 'O tamanho é igual. O giro também.', text: 'Com o mesmo número de dentes, as duas engrenagens completam uma volta no mesmo tempo. O sentido de rotação é invertido.', example: 'Aqui a relação é de 1 para 1. O par muda o sentido do giro, sem multiplicar o torque.' },
  { input: 24, output: 12, label: 'Mais velocidade', title: 'Mais velocidade, menos torque.', text: 'A engrenagem maior move uma menor. A saída gira mais rápido, mas entrega menos torque.', example: 'A ideia por trás das marchas altas: manter velocidade com menos giros do motor. A relação final depende de todo o conjunto.' },
];

function toothPath(teeth: number, module: number) {
  const pitch = teeth * module / 2;
  const root = pitch - 1.25 * module;
  const tip = pitch + module;
  const points: string[] = [];
  for (let tooth = 0; tooth < teeth; tooth++) {
    for (const [fraction, radius] of [[-.5, root], [-.32, root], [-.2, tip], [.2, tip], [.32, root], [.5, root]]) {
      const angle = (tooth + fraction) * Math.PI * 2 / teeth;
      points.push(`${(Math.cos(angle) * radius).toFixed(3)},${(Math.sin(angle) * radius).toFixed(3)}`);
    }
  }
  return `M${points.join(' L')} Z`;
}

const pressures = [
  {
    label: 'Toque leve', force: .28, color: '#e0a077', hint: 'início do curso',
    title: 'Pouca pressão, pouco aperto.',
    text: 'Um toque no pedal desloca pouco o pistão do cilindro mestre. A pressão que chega à pinça é baixa e as pastilhas apenas encostam no disco.',
    state: 'Pressão na linha: baixa', effect: 'As pastilhas roçam o disco e a roda perde pouca velocidade',
    detail: 'É a frenagem de ajuste: reduzir um pouco a velocidade sem incomodar quem está no carro.',
  },
  {
    label: 'Pressão firme', force: .62, color: '#d9743f', hint: 'meio do curso',
    title: 'Mais força no pedal, mais força na pinça.',
    text: 'O fluido de freio praticamente não se comprime. Por isso quase toda a força aplicada no pedal percorre a linha e vira aperto das pastilhas contra o disco.',
    state: 'Pressão na linha: média', effect: 'As pastilhas apertam o disco e o giro da roda cai de forma clara',
    detail: 'Pense em uma seringa cheia de água: empurrar o êmbolo move o líquido do outro lado na mesma hora.',
  },
  {
    label: 'Frenagem forte', force: 1, color: '#c9532a', hint: 'curso completo',
    title: 'O aperto máximo do circuito.',
    text: 'Com o pedal no fundo, a pressão na linha é máxima e as pastilhas apertam o disco com toda a força que o circuito consegue transmitir. A energia do movimento vira calor no disco e nas pastilhas.',
    state: 'Pressão na linha: máxima', effect: 'O disco perde giro rapidamente e esquenta',
    detail: 'Daqui em diante quem limita a frenagem deixa de ser o circuito e passa a ser o contato do pneu com o chão.',
  },
];

const circuits = [
  {
    label: 'Motor frio', open: false,
    title: 'O caminho curto, sem passar pelo radiador.',
    text: 'Logo depois da partida, a válvula termostática fica fechada. A bomba circula o líquido pelo motor e por um caminho de retorno curto, então o calor da combustão aquece o conjunto mais rápido.',
    state: 'Válvula fechada · radiador fora do circuito', temperature: 'O motor ainda está aquecendo',
    detail: 'Pense em uma porta controlada pela temperatura: enquanto o motor está frio, ela mantém o radiador de fora.',
  },
  {
    label: 'Temperatura de trabalho', open: true,
    title: 'A válvula abre e o radiador entra no circuito.',
    text: 'Ao atingir a temperatura de trabalho, a válvula termostática abre e o líquido passa a percorrer o radiador. O ar que atravessa o radiador, ajudado pela ventoinha, retira parte do calor antes do retorno ao motor.',
    state: 'Válvula aberta · líquido passa pelo radiador', temperature: 'O motor está na temperatura de trabalho',
    detail: 'A válvula não liga e desliga o resfriamento: ela dosa a passagem para manter a temperatura em uma faixa estável.',
  },
];

const bumps = [
  {
    label: 'Só a mola', damped: false,
    title: 'Sem controle, o balanço não acaba.',
    text: 'A mola é quem absorve: ela se deforma com o impacto, guarda essa energia e devolve logo em seguida. Sozinha, devolve a energia inteira — e a carroceria sobe e desce várias vezes depois que a irregularidade já ficou para trás.',
    state: 'A mola devolve a energia que recebeu', effect: 'A carroceria segue oscilando por muito tempo',
    detail: 'É o princípio do pula-pula: cada descida vira uma subida, e o movimento só perde força bem devagar.',
  },
  {
    label: 'Mola + amortecedor', damped: true,
    title: 'O amortecedor encerra o vai e vem.',
    text: 'O amortecedor não sustenta o peso do carro — quem faz isso é a mola. Ele força um fluido a atravessar passagens estreitas, e essa resistência freia tanto a compressão quanto o retorno. A energia do impacto vira calor em vez de virar balanço.',
    state: 'O amortecedor consome a energia da mola', effect: 'A carroceria volta à altura de trabalho em pouco tempo',
    detail: 'É por isso que as duas peças aparecem sempre juntas: uma guarda a energia, a outra tira ela do sistema.',
  },
];

const charges: { label: string; hint: string; spin: boolean; flows: Flow; title: string; text: string; state: string; effect: string; detail: string }[] = [
  {
    label: 'Partida', hint: 'motor ainda parado', spin: false,
    flows: { alternator: 0, busLeft: 0, battery: 1, busRight: 1, load: 0, starter: 1 },
    title: 'A bateria entrega o impulso inicial.',
    text: 'O motor a combustão precisa começar a girar antes de funcionar sozinho. Nesse instante só a bateria tem energia disponível, e ela alimenta o motor de partida — uma demanda grande e curta.',
    state: 'Bateria fornecendo · alternador parado', effect: 'O motor de partida faz o motor a combustão girar',
    detail: 'É como o primeiro impulso em um balanço: assim que o motor sustenta o próprio ciclo, o motor de partida sai de cena.',
  },
  {
    label: 'Motor funcionando', hint: 'alternador girando', spin: true,
    flows: { alternator: 1, busLeft: 1, battery: -1, busRight: 1, load: 1, starter: 0 },
    title: 'O alternador passa a sustentar o sistema.',
    text: 'Com o motor girando, a correia movimenta o rotor do alternador. A interação entre campos magnéticos e bobinas gera corrente, que é convertida e regulada: alimenta os equipamentos ligados e repõe a energia que a bateria gastou.',
    state: 'Alternador gerando · bateria recebendo carga', effect: 'Os equipamentos são alimentados e a reserva é reposta',
    detail: 'Lembra o dínamo de uma bicicleta: aproveita um movimento que já existe para gerar eletricidade.',
  },
  {
    label: 'Motor desligado', hint: 'nada repondo', spin: false,
    flows: { alternator: 0, busLeft: 0, battery: 1, busRight: 1, load: 1, starter: 0 },
    title: 'Sem giro, nada repõe a reserva.',
    text: 'Com o motor parado, o alternador não gera nada. Qualquer equipamento que continue ligado consome a energia guardada na bateria, e nada entra no lugar.',
    state: 'Bateria fornecendo · alternador parado', effect: 'A reserva da bateria vai sendo consumida',
    detail: 'Por isso a bateria é comparada a uma caixa-d’água: enquanto nada repõe, o que existe é só o que já está guardado.',
  },
];

function EngineDiagram({ angle, stroke }: { angle: number; stroke: number }) {
  const theta = angle * Math.PI / 180;
  const crankX = 295 + Math.sin(theta) * 40;
  const crankY = 308 - Math.cos(theta) * 40;
  const pinY = crankY - Math.sqrt(118 ** 2 - (crankX - 295) ** 2);
  const pistonY = pinY - 22;
  const intakeOpen = stroke === 0;
  const exhaustOpen = stroke === 3;
  const intakeY = intakeOpen ? 109 : 96;
  const exhaustY = exhaustOpen ? 109 : 96;

  return <svg className="ml-engine-svg" viewBox="0 0 600 430" role="img" aria-label={`Motor de quatro tempos, etapa de ${strokes[stroke].name.toLowerCase()}. ${strokes[stroke].direction}. ${strokes[stroke].valve}.`}>
    <defs>
      <marker id="ml-flow-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 1 L 8 5 L 0 9" fill="none" stroke="currentColor" strokeWidth="1.7" /></marker>
    </defs>
    <text className="ml-svg-label" x="148" y="35" textAnchor="middle">Admissão</text>
    <text className="ml-svg-label" x="295" y="35" textAnchor="middle">Vela</text>
    <path d="M295 45 V67" className="ml-leader" />
    <text className="ml-svg-label" x="439" y="35" textAnchor="middle">Escape</text>
    <path d="M149 54 V72 H250 V92" fill="none" stroke={intakeOpen ? '#568392' : '#d6dce2'} strokeWidth="19" strokeLinejoin="round" />
    <path d="M340 92 V72 H440 V54" fill="none" stroke={exhaustOpen ? '#858e9b' : '#d6dce2'} strokeWidth="19" strokeLinejoin="round" />
    {intakeOpen && <path d="M158 72 H231" className="ml-flow ml-flow-intake" markerEnd="url(#ml-flow-arrow)" />}
    {exhaustOpen && <path d="M359 72 H430" className="ml-flow ml-flow-exhaust" markerEnd="url(#ml-flow-arrow)" />}
    <rect x="237" y="97" width="116" height={Math.max(0, pistonY - 97)} fill={strokes[stroke].color} />
    <path d="M229 248 V92 H361 V248" fill="none" stroke="#8d9aa8" strokeWidth="7" strokeLinejoin="round" />
    <path d="M241 243 V101 M349 101 V243" fill="none" stroke="#dbe1e6" strokeWidth="2" />
    <path d={`M251 55 V${intakeY} M239 ${intakeY} H263`} fill="none" stroke={intakeOpen ? '#477786' : '#788795'} strokeWidth="5" strokeLinecap="round" />
    <path d={`M339 55 V${exhaustY} M327 ${exhaustY} H351`} fill="none" stroke={exhaustOpen ? '#667383' : '#788795'} strokeWidth="5" strokeLinecap="round" />
    <rect x="289" y="73" width="12" height="25" rx="3" fill="#e8ecf0" stroke="#7b8998" strokeWidth="2" />
    <path d="M295 97 V104" stroke="#7b8998" strokeWidth="3" />
    {stroke === 2 && <path d="M297 106 L289 116 H299 L294 126" fill="none" stroke="#cb582e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
    <path d="M363 94 H388 L401 105" className="ml-leader" />
    <text className="ml-svg-label" x="411" y="111">Cilindro</text>
    <circle cx="295" cy="308" r="58" fill="#edf0f3" stroke="#d4dce3" strokeWidth="2" />
    <circle cx="295" cy="308" r="40" fill="none" stroke="#d4dce3" strokeWidth="1" strokeDasharray="3 5" />
    <path d={`M295 308 L${crankX} ${crankY}`} stroke="#778b9f" strokeWidth="17" strokeLinecap="round" />
    <path d={`M295 ${pinY} L${crankX} ${crankY}`} stroke="#1d2d43" strokeWidth="15" strokeLinecap="round" />
    <path d={`M295 ${pinY} L${crankX} ${crankY}`} stroke="#43576e" strokeWidth="7" strokeLinecap="round" />
    <rect x="241" y={pistonY} width="108" height="38" rx="5" fill="#bec9d2" stroke="#768a9c" strokeWidth="2" />
    <path d={`M242 ${pistonY + 8} H348 M242 ${pistonY + 15} H348`} stroke="#8294a4" strokeWidth="2" />
    <circle cx="295" cy={pinY} r="6" fill="#f8f9fb" stroke="#768a9c" strokeWidth="2" />
    <circle cx={crankX} cy={crankY} r="6" fill="#f8f9fb" stroke="#1d2d43" strokeWidth="3" />
    <circle cx="295" cy="308" r="9" fill="#f8f9fb" stroke="#778b9f" strokeWidth="3" />
    <path d={`M350 ${pistonY + 23} H391`} className="ml-leader" />
    <text className="ml-svg-label" x="405" y={pistonY + 28}>Pistão</text>
    <path d={`M${(295 + crankX) / 2 - 8} ${(pinY + crankY) / 2} H194`} className="ml-leader" />
    <text className="ml-svg-label" x="181" y={(pinY + crankY) / 2 + 5} textAnchor="end">Biela</text>
    <path d="M343 335 H386 L400 346" className="ml-leader" />
    <text className="ml-svg-label" x="411" y="352">Virabrequim</text>
    <path d="M270 389 H320" fill="none" stroke="#c4cdd6" strokeWidth="2" />
    <text className="ml-svg-caption" x="295" y="414" textAnchor="middle">O movimento de subir e descer se transforma em rotação.</text>
  </svg>;
}

function GearDiagram({ angle, input, output }: { angle: number; input: number; output: number }) {
  const module = 8;
  const inputRadius = input * module / 2;
  const outputRadius = output * module / 2;
  const centers = [310 - outputRadius, 310 + inputRadius];
  const gears = [
    { teeth: input, center: centers[0], rotation: angle, color: '#1d2d43', line: '#31475f', radius: inputRadius, label: 'Entrada' },
    { teeth: output, center: centers[1], rotation: 180 + 180 / output - angle * input / output, color: '#e76b3d', line: '#c55932', radius: outputRadius, label: 'Saída' },
  ];
  return <svg className="ml-gears-svg" viewBox="0 0 620 390" role="img" aria-label={`Duas engrenagens acopladas. Entrada com ${input} dentes e saída com ${output} dentes, girando em sentidos opostos.`}>
    {gears.map((gear, index) => <g key={gear.label}>
      <text className="ml-svg-label ml-svg-gear-title" x={gear.center} y="46" textAnchor="middle">{gear.label}</text>
      <text className="ml-svg-caption" x={gear.center} y="69" textAnchor="middle">{gear.teeth} dentes</text>
      <g transform={`translate(${gear.center} 206) rotate(${gear.rotation})`}>
        <path d={toothPath(gear.teeth, module)} fill={gear.color} stroke={gear.line} strokeWidth="1.5" strokeLinejoin="round" />
        <circle r={gear.radius * .56} fill="none" stroke={index === 0 ? '#536477' : '#f59a73'} strokeWidth="1.5" />
        <circle r={gear.radius * .36} fill="#f8f9fb" />
        {[0, 120, 240].map(degrees => <line key={degrees} x1={gear.radius * .31} y1="0" x2={gear.radius * .63} y2="0" transform={`rotate(${degrees})`} stroke={gear.color} strokeWidth={gear.radius * .15} />)}
        <circle cx={gear.radius * .74} cy="0" r="4" fill={index === 0 ? '#bdc9d3' : '#fff0e7'} />
      </g>
      <circle cx={gear.center} cy="206" r="8" fill="#f8f9fb" stroke={gear.color} strokeWidth="3" />
      <path d={`M${gear.center - 17} 338 Q${gear.center} 350 ${gear.center + 17} 338`} fill="none" stroke={gear.color} strokeWidth="1.8" strokeLinecap="round" />
      <path d={index === 1 ? `M${gear.center + 12} 337 L${gear.center + 19} 337 L${gear.center + 19} 344` : `M${gear.center - 12} 337 L${gear.center - 19} 337 L${gear.center - 19} 344`} fill="none" stroke={gear.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </g>)}
    <text className="ml-svg-caption" x="310" y="383" textAnchor="middle">Dentes encaixados transmitem o movimento em sentidos opostos.</text>
  </svg>;
}

function BrakeDiagram({ angle, force, color, label }: { angle: number; force: number; color: string; label: string }) {
  const radians = -force * 13 * Math.PI / 180;
  const pivot = (x: number, y: number) => {
    const dx = x - 96, dy = y - 74;
    return [96 + dx * Math.cos(radians) - dy * Math.sin(radians), 74 + dx * Math.sin(radians) + dy * Math.cos(radians)] as const;
  };
  const [footX, footY] = pivot(58, 186);
  const [rodX, rodY] = pivot(80, 121);
  const arm = Math.hypot(footX - 96, footY - 74);
  const padX = -(footY - 74) / arm * 15;
  const padY = (footX - 96) / arm * 15;
  const pistonX = 162 + force * 20;
  const spin = angle * (1 - force * .72);
  const gap = 6 + (1 - force) * 16;
  const clamp = 10 + force * 16;
  const line = 'M302 119 H346 Q366 119 366 139 V210 Q366 230 386 230 H408';

  return <svg className="ml-brakes-svg" viewBox="0 0 660 420" role="img" aria-label={`Circuito de freio hidráulico: pedal, cilindro mestre, linha de freio e pinça sobre o disco. Força no pedal: ${label.toLowerCase()}.`}>
    <defs>
      <marker id="ml-clamp-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 1 L 8 5 L 0 9" fill="none" stroke="currentColor" strokeWidth="1.8" /></marker>
    </defs>

    <text className="ml-svg-label" x="96" y="40" textAnchor="middle">Pedal</text>
    <path d="M96 48 V60" className="ml-leader" />
    <path d={`M96 74 L${footX} ${footY}`} stroke="#43576e" strokeWidth="9" strokeLinecap="round" />
    <path d={`M${footX - padX} ${footY - padY} L${footX + padX} ${footY + padY}`} stroke="#1d2d43" strokeWidth="11" strokeLinecap="round" />
    <circle cx="96" cy="74" r="8" fill="#f8f9fb" stroke="#7b8998" strokeWidth="3" />
    <path d={`M${rodX} ${rodY} L${pistonX} 119`} stroke="#8d9aa8" strokeWidth="7" strokeLinecap="round" />

    <text className="ml-svg-label" x="229" y="40" textAnchor="middle">Cilindro mestre</text>
    <rect x="196" y="56" width="66" height="34" rx="4" fill="#f8f9fb" stroke="#8d9aa8" strokeWidth="2" />
    <rect x="201" y="68" width="56" height="19" rx="2" fill="#d6e7ec" />
    <text className="ml-svg-caption" x="270" y="76">Reservatório</text>
    <rect x="156" y="90" width="146" height="46" rx="7" fill="#edf0f3" stroke="#8d9aa8" strokeWidth="3" />
    <rect x={pistonX + 18} y="95" width={298 - pistonX - 18} height="36" fill={color} opacity=".5" />
    <rect x={pistonX} y="95" width="18" height="36" rx="3" fill="#bec9d2" stroke="#768a9c" strokeWidth="2" />

    <path d={line} fill="none" stroke="#ccd4dc" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
    <path d={line} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeDasharray="9 13" strokeDashoffset={-angle * .9} />
    <text className="ml-svg-label" x="378" y="150">Linha de freio</text>

    <text className="ml-svg-label" x="432" y="70">Pressão na linha</text>
    <rect x="432" y="82" width="172" height="12" rx="6" fill="#e6eaef" />
    <rect x="432" y="82" width={172 * force} height="12" rx="6" fill={color} />

    <g transform={`rotate(${spin} 500 254)`}>
      <circle cx="500" cy="254" r="92" fill="#e6eaee" stroke="#c3ccd6" strokeWidth="2" />
      {Array.from({ length: 14 }, (_, index) => <line key={index} x1="0" y1="-86" x2="0" y2="-56" transform={`translate(500 254) rotate(${index * 360 / 14})`} stroke="#d5dce3" strokeWidth="6" strokeLinecap="round" />)}
      <circle cx="500" cy="254" r="46" fill="#d8dfe5" stroke="#c3ccd6" strokeWidth="2" />
      {[0, 72, 144, 216, 288].map(degrees => <circle key={degrees} cx="0" cy="-30" r="5" transform={`translate(500 254) rotate(${degrees})`} fill="#f8f9fb" stroke="#b6c0ca" strokeWidth="1.5" />)}
      <circle cx="500" cy="254" r="12" fill="#f8f9fb" stroke="#b6c0ca" strokeWidth="2" />
    </g>
    <rect x="406" y="206" width="54" height="96" rx="12" fill="#c3ccd6" stroke="#7b8998" strokeWidth="2.5" />
    <rect x="416" y="222" width="26" height="64" rx="5" fill="#93a0ae" />
    <text className="ml-svg-label" x="433" y="196" textAnchor="middle">Pinça</text>
    <path d="M540 348 V362" className="ml-leader" />
    <text className="ml-svg-label" x="540" y="376" textAnchor="middle">Disco</text>

    <rect x="44" y="264" width="256" height="128" rx="10" fill="#fff" stroke="#dde3e9" strokeWidth="1.5" />
    <text className="ml-svg-caption" x="60" y="288">Corte: as duas faces do disco</text>
    <rect x="164" y="306" width="16" height="64" fill="#c8d1da" stroke="#9aa7b4" strokeWidth="1.5" />
    <rect x={164 - gap - 18} y="314" width="18" height="48" rx="2" fill="#4d6074" />
    <rect x={180 + gap} y="314" width="18" height="48" rx="2" fill="#4d6074" />
    <g style={{ color }}>
      <path d={`M${164 - gap - 26 - clamp} 338 H${164 - gap - 26}`} fill="none" stroke="currentColor" strokeWidth="2.6" markerEnd="url(#ml-clamp-arrow)" />
      <path d={`M${180 + gap + 26 + clamp} 338 H${180 + gap + 26}`} fill="none" stroke="currentColor" strokeWidth="2.6" markerEnd="url(#ml-clamp-arrow)" />
    </g>
    <text className="ml-svg-caption" x="172" y="384" textAnchor="middle">força de aperto</text>

    <text className="ml-svg-caption" x="478" y="406" textAnchor="middle">O fluido não se comprime: a força do pé vira aperto no disco.</text>
  </svg>;
}

function FlowPath({ d, color, active, offset, width = 13, flow = 6.5, dash = '10 14' }: { d: string; color: string; active: boolean; offset: number; width?: number; flow?: number; dash?: string }) {
  return <>
    <path d={d} fill="none" stroke={active ? '#ccd4dc' : '#e7ebef'} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
    {active && <path d={d} fill="none" stroke={color} strokeWidth={flow} strokeLinecap="round" strokeDasharray={dash} strokeDashoffset={offset} />}
  </>;
}

function CoolingDiagram({ angle, open }: { angle: number; open: boolean }) {
  const hot = open ? '#d9743f' : '#7fa8bf';
  const cold = open ? '#5f95b3' : '#7fa8bf';
  const offset = -angle * 1.1;
  const fan = angle * (open ? 1.8 : .6);

  return <svg className="ml-cooling-svg" viewBox="0 0 660 420" role="img" aria-label={`Circuito de arrefecimento com bomba, motor, válvula termostática e radiador. ${open ? 'Válvula aberta: o líquido passa pelo radiador antes de voltar ao motor.' : 'Válvula fechada: o líquido volta direto ao motor, sem passar pelo radiador.'}`}>
    <defs>
      <linearGradient id="ml-radiator-flow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#d9743f" /><stop offset="1" stopColor="#5f95b3" />
      </linearGradient>
    </defs>

    <text className="ml-svg-label" x="72" y="60">Temperatura do motor</text>
    <rect x="72" y="72" width="178" height="12" rx="6" fill="#e6eaef" />
    <rect x="72" y="72" width={open ? 152 : 74} height="12" rx="6" fill={open ? '#d9743f' : '#7fa8bf'} />
    <text className="ml-svg-caption" x="72" y="102">{open ? 'Na temperatura de trabalho' : 'Ainda aquecendo'}</text>

    <FlowPath d="M362 224 H392 V150 H430" color={hot} active={open} offset={offset} />
    <FlowPath d="M430 300 H406 V368 H331" color={cold} active={open} offset={offset} />
    <FlowPath d="M331 248 V368" color={hot} active={!open} offset={offset} />
    <FlowPath d="M331 368 H180" color={cold} active offset={offset} />
    <FlowPath d="M150 338 V322" color={cold} active offset={offset} />

    <rect x="430" y="120" width="176" height="210" rx="9" fill="#f2f5f7" stroke="#8d9aa8" strokeWidth="3" />
    {Array.from({ length: 11 }, (_, index) => <line key={index} x1={444 + index * 15} y1="136" x2={444 + index * 15} y2="314" stroke="#dde3e9" strokeWidth="3" strokeLinecap="round" />)}
    <FlowPath d="M430 150 H568 Q590 150 590 172 V278 Q590 300 568 300 H430" color="url(#ml-radiator-flow)" active={open} offset={offset} />
    <g transform={`rotate(${fan} 520 225)`} opacity=".92">
      {[0, 72, 144, 216, 288].map(degrees => <ellipse key={degrees} cx="0" cy="-26" rx="11" ry="22" transform={`translate(520 225) rotate(${degrees})`} fill="#cfd8e0" stroke="#a9b5c1" strokeWidth="1.5" />)}
    </g>
    <circle cx="520" cy="225" r="12" fill="#edf0f3" stroke="#8d9aa8" strokeWidth="2.5" />
    <path d="M444 84 V116" className="ml-leader" />
    <text className="ml-svg-label" x="436" y="76">Radiador</text>
    <path d="M584 114 L560 180" className="ml-leader" />
    <text className="ml-svg-label" x="606" y="106" textAnchor="end">Ventoinha</text>

    <rect x="72" y="188" width="186" height="134" rx="10" fill="#edf0f3" stroke="#8d9aa8" strokeWidth="3" />
    {[96, 138, 180, 222].map(x => <rect key={x} x={x} y="194" width="30" height="22" rx="3" fill="#dfe5ea" />)}
    <FlowPath d="M150 322 V300 H92 V276 H238 V250 H92 V224 H300" color={hot} active offset={offset} />
    <text className="ml-svg-label" x="165" y="180" textAnchor="middle">Motor</text>

    <rect x="300" y="198" width="62" height="52" rx="7" fill="#f8f9fb" stroke="#7b8998" strokeWidth="2.5" />
    {open
      ? <path d="M331 202 V212 M331 246 V236" stroke="#7b8998" strokeWidth="5" strokeLinecap="round" />
      : <path d="M331 204 V244" stroke="#647183" strokeWidth="6" strokeLinecap="round" />}
    <text className="ml-svg-label" x="331" y="166" textAnchor="middle">Válvula termostática</text>
    <text className="ml-svg-caption" x="331" y="184" textAnchor="middle">{open ? 'aberta' : 'fechada'}</text>

    <circle cx="150" cy="368" r="30" fill="#edf0f3" stroke="#8d9aa8" strokeWidth="3" />
    <g transform={`rotate(${angle * 1.4} 150 368)`}>
      {[0, 60, 120, 180, 240, 300].map(degrees => <path key={degrees} d="M0 -6 Q14 -12 22 -2" fill="none" stroke="#8fa3b5" strokeWidth="4" strokeLinecap="round" transform={`translate(150 368) rotate(${degrees})`} />)}
    </g>
    <circle cx="150" cy="368" r="7" fill="#f8f9fb" stroke="#7b8998" strokeWidth="2.5" />
    <path d="M112 368 H118" className="ml-leader" />
    <text className="ml-svg-label" x="108" y="373" textAnchor="end">Bomba</text>

    <text className="ml-svg-caption" x="400" y="414" textAnchor="middle">A bomba mantém o líquido em movimento. A válvula decide o caminho.</text>
  </svg>;
}

function suspensionTravel(time: number, damped: boolean) {
  return -34 * Math.exp(-(damped ? 1.45 : .13) * time) * Math.cos(time * 3.5);
}

function coilPath(x: number, top: number, bottom: number, turns: number, width: number) {
  const steps = turns * 2;
  const points: string[] = [];
  for (let step = 0; step <= steps; step++) {
    const y = top + (bottom - top) * step / steps;
    points.push(`${(x + (step % 2 ? width : -width)).toFixed(1)} ${y.toFixed(1)}`);
  }
  return `M${x} ${top} L${points.join(' L')} L${x} ${bottom}`;
}

function SuspensionDiagram({ angle, damped, label }: { angle: number; damped: boolean; label: string }) {
  const time = (angle % 720) / 72;
  const travel = suspensionTravel(time, damped);
  const bodyY = 148 - travel;
  const mount = bodyY + 34;
  const trace: string[] = [];
  for (let step = 0; step <= 96; step++) {
    trace.push(`${(420 + step / 96 * 220).toFixed(1)},${(250 + suspensionTravel(step / 96 * 10, damped) * .92).toFixed(1)}`);
  }

  return <svg className="ml-suspension-svg" viewBox="0 0 660 420" role="img" aria-label={`Conjunto de suspensão de uma roda depois de um solavanco, no modo ${label.toLowerCase()}. ${damped ? 'O amortecedor reduz a oscilação até a carroceria parar.' : 'Sem amortecedor, a carroceria continua subindo e descendo.'}`}>
    <text className="ml-svg-label" x="198" y="44" textAnchor="middle">Carroceria</text>
    <path d="M198 52 V64" className="ml-leader" />

    <path d="M40 360 H92 q16 -26 32 0 H344" fill="none" stroke="#c3ccd6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <text className="ml-svg-caption" x="108" y="386" textAnchor="middle">a irregularidade que passou</text>

    <rect x="118" y={bodyY} width="162" height="34" rx="6" fill="#1d2d43" />

    <path d={coilPath(168, mount, 296, 7, 17)} fill="none" stroke="#43576e" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" />
    <path d="M126 244 H150" className="ml-leader" />
    <text className="ml-svg-label" x="120" y="249" textAnchor="end">Mola</text>

    <g opacity={damped ? 1 : .2}>
      <rect x="226" y="238" width="30" height="60" rx="7" fill="#8d9aa8" stroke="#64748a" strokeWidth="2" />
      <path d={`M241 ${mount} V246`} stroke="#64748a" strokeWidth="9" strokeLinecap="round" />
      <circle cx="241" cy={mount + 3} r="6" fill="#f8f9fb" stroke="#64748a" strokeWidth="2.5" />
    </g>
    <path d="M262 244 H272" className="ml-leader" />
    <text className="ml-svg-label" x="278" y="249">Amortecedor</text>
    {!damped && <text className="ml-svg-caption" x="278" y="270">fora do conjunto</text>}

    <path d="M152 296 H264" stroke="#64748a" strokeWidth="8" strokeLinecap="round" />
    <circle cx="196" cy="322" r="38" fill="#2f3d4f" stroke="#1d2d43" strokeWidth="2" />
    <circle cx="196" cy="322" r="18" fill="#c3ccd6" />
    <circle cx="196" cy="322" r="7" fill="#f8f9fb" />

    <text className="ml-svg-label" x="420" y="104">Deslocamento da carroceria</text>
    <path d="M420 250 H640" fill="none" stroke="#dbe1e6" strokeWidth="1.5" strokeDasharray="4 6" />
    <path d="M420 126 V370" fill="none" stroke="#dbe1e6" strokeWidth="1.5" />
    <polyline points={trace.join(' ')} fill="none" stroke={damped ? '#4a7d94' : '#c9532a'} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
    <circle cx={420 + time / 10 * 220} cy={250 + travel * .92} r="6" fill={damped ? '#4a7d94' : '#c9532a'} />
    <text className="ml-svg-caption" x="640" y="390" textAnchor="end">tempo depois do solavanco</text>
    <text className="ml-svg-caption" x="376" y="412" textAnchor="middle">A mola devolve a energia do impacto; o amortecedor a consome.</text>
  </svg>;
}

type Flow = { alternator: number; busLeft: number; battery: number; busRight: number; load: number; starter: number };

function ElectricalDiagram({ angle, flows, label, spin }: { angle: number; flows: Flow; label: string; spin: boolean }) {
  const offset = -angle * 1.4;
  const rotor = spin ? angle * 2.6 : 0;
  const wire = (key: keyof Flow, d: string, color: string) => <FlowPath
    d={d} color={color} active={flows[key] !== 0} offset={offset * (flows[key] || 1)}
    width={8} flow={3.6} dash="7 11" />;

  return <svg className="ml-electrical-svg" viewBox="0 0 660 420" role="img" aria-label={`Sistema elétrico com alternador, bateria, motor de partida e equipamentos. Situação: ${label.toLowerCase()}. ${flows.battery < 0 ? 'A bateria está recebendo carga.' : 'A bateria está fornecendo energia.'}`}>
    <g opacity={spin ? 1 : .3}>
      <path d="M60 68 H160 M60 120 H160" stroke="#647183" strokeWidth="5" strokeLinecap="round" />
      <g transform={`rotate(${spin ? angle * 1.1 : 0} 60 94)`}>
        <circle cx="60" cy="94" r="26" fill="#edf0f3" stroke="#8d9aa8" strokeWidth="3" />
        <path d="M60 74 V114 M40 94 H80" stroke="#c3ccd6" strokeWidth="4" />
      </g>
      <text className="ml-svg-caption" x="72" y="46" textAnchor="middle">correia do motor</text>
    </g>

    <circle cx="160" cy="150" r="54" fill="#edf0f3" stroke="#8d9aa8" strokeWidth="3" />
    {[0, 60, 120, 180, 240, 300].map(degrees => <path key={degrees} d="M-13 -44 a 14 14 0 0 1 26 0" fill="none" stroke="#c3ccd6" strokeWidth="7" strokeLinecap="round" transform={`translate(160 150) rotate(${degrees})`} />)}
    <g transform={`rotate(${rotor} 160 150)`}>
      <rect x="145" y="122" width="30" height="56" rx="8" fill={spin ? '#d9743f' : '#b9c3cd'} />
      <path d="M160 122 V178" stroke="#f8f9fb" strokeWidth="2.5" />
    </g>
    <g transform={`rotate(${rotor} 160 96)`}>
      <circle cx="160" cy="96" r="17" fill="#dfe5ea" stroke="#8d9aa8" strokeWidth="2.5" />
      <path d="M160 82 V110" stroke="#c3ccd6" strokeWidth="3" />
    </g>
    <path d="M118 208 H132" className="ml-leader" />
    <text className="ml-svg-label" x="112" y="213" textAnchor="end">Alternador</text>

    <rect x="452" y="86" width="152" height="90" rx="9" fill="#f8f9fb" stroke="#8d9aa8" strokeWidth="2.5" />
    <g opacity={flows.load !== 0 ? 1 : .3}>
      <circle cx="504" cy="131" r="18" fill={flows.load !== 0 ? '#f0c27a' : '#dfe5ea'} stroke="#b9a06a" strokeWidth="2" />
      <path d="M530 131 H558 M530 117 L556 107 M530 145 L556 155" stroke={flows.load !== 0 ? '#c7912f' : '#c3ccd6'} strokeWidth="3" strokeLinecap="round" />
    </g>
    <text className="ml-svg-label" x="528" y="72" textAnchor="middle">Equipamentos</text>

    <rect x="250" y="300" width="150" height="84" rx="9" fill="#f8f9fb" stroke="#8d9aa8" strokeWidth="3" />
    <rect x="272" y="288" width="22" height="14" rx="3" fill="#8d9aa8" />
    <rect x="356" y="288" width="22" height="14" rx="3" fill="#8d9aa8" />
    <text className="ml-svg-gear-title" x="283" y="330" textAnchor="middle">+</text>
    <text className="ml-svg-gear-title" x="367" y="330" textAnchor="middle">−</text>
    {[0, 1, 2].map(cell => <rect key={cell} x={302 + cell * 16} y="322" width="10" height="46" rx="2" fill={flows.battery < 0 ? '#5f95b3' : '#b9c3cd'} />)}
    <text className="ml-svg-label" x="325" y="406" textAnchor="middle">Bateria · {flows.battery < 0 ? 'recebendo carga' : 'fornecendo energia'}</text>

    <g opacity={flows.starter !== 0 ? 1 : .35}>
      <rect x="452" y="300" width="152" height="84" rx="9" fill="#f8f9fb" stroke="#8d9aa8" strokeWidth="2.5" />
      <g transform={`translate(502 342) rotate(${flows.starter !== 0 ? angle * 2.2 : 0})`}>
        <circle r="19" fill="#dfe5ea" stroke="#8d9aa8" strokeWidth="2" />
        {[0, 45, 90, 135].map(degrees => <line key={degrees} x1="-19" y1="0" x2="19" y2="0" transform={`rotate(${degrees})`} stroke="#a9b5c1" strokeWidth="3" />)}
      </g>
      <text className="ml-svg-label" x="560" y="348" textAnchor="middle">Partida</text>
    </g>

    {wire('alternator', 'M160 204 V262', '#d9743f')}
    {wire('busLeft', 'M160 262 H325', '#d9743f')}
    {wire('battery', 'M325 300 V262', flows.battery < 0 ? '#5f95b3' : '#d9743f')}
    {wire('busRight', 'M325 262 H528', '#d9743f')}
    {wire('load', 'M528 262 V176', '#d9743f')}
    {wire('starter', 'M528 262 V300', '#5f95b3')}

    <text className="ml-svg-caption" x="238" y="244" textAnchor="middle">linha de alimentação</text>
  </svg>;
}
export default function MechanismLab({ initialMode = 'engine' }: MechanismLabProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [running, setRunning] = useState(false);
  const [angle, setAngle] = useState(90);
  const [ratioIndex, setRatioIndex] = useState(0);
  const [pressureIndex, setPressureIndex] = useState(1);
  const [circuitIndex, setCircuitIndex] = useState(0);
  const [bumpIndex, setBumpIndex] = useState(1);
  const [chargeIndex, setChargeIndex] = useState(1);
  const [reducedMotion, setReducedMotion] = useState(false);
  const tabs = useRef<HTMLDivElement>(null);
  const id = useId();
  const stroke = Math.floor((angle % 720) / 180);
  const ratio = ratios[ratioIndex];
  const activeStroke = strokes[stroke];
  const pressure = pressures[pressureIndex];
  const circuit = circuits[circuitIndex];
  const bump = bumps[bumpIndex];
  const charge = charges[chargeIndex];
  const activeMode = modes.find(item => item.id === mode) ?? modes[0];

  useEffect(() => { setMode(initialMode); setRunning(false); setAngle(startAngle(initialMode)); }, [initialMode]);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { setReducedMotion(media.matches); if (media.matches) setRunning(false); };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!running || reducedMotion) return;
    let frame: number;
    let previous: number | undefined;
    const animate = (time: number) => {
      if (previous !== undefined) {
        const delta = Math.min(time - previous, 80);
        setAngle(value => (value + delta * speeds[mode]) % 720);
      }
      previous = time;
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [running, mode, reducedMotion]);

  const changeMode = (next: Mode) => { setMode(next); setRunning(false); setAngle(startAngle(next)); };
  const selectStroke = (index: number) => { setRunning(false); setAngle(index * 180 + 90); };
  const direction = stroke % 2 === 0 ? <ArrowDown size={17} /> : <ArrowUp size={17} />;

  return <section className="mechanism-lab" aria-label="Laboratório de mecânica">
    <div className="ml-intro">
      <div><h2>Entenda o movimento.</h2><p>Um passo de cada vez, por dentro da mecânica.</p></div>
      <div className="ml-tabs" role="tablist" aria-label="Escolha o mecanismo" ref={tabs} onKeyDown={event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const position = modes.findIndex(item => item.id === mode);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? modes.length - 1 : (position + (event.key === 'ArrowRight' ? 1 : modes.length - 1)) % modes.length;
        changeMode(modes[next].id);
        tabs.current?.querySelectorAll<HTMLButtonElement>('button')[next].focus();
      }}>
        {modes.map(item => <button key={item.id} id={`${id}-${item.id}-tab`} role="tab" aria-selected={mode === item.id} aria-controls={`${id}-panel`} tabIndex={mode === item.id ? 0 : -1} onClick={() => changeMode(item.id)}>{item.tab}</button>)}
      </div>
    </div>

    <div className="ml-workbench" id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${mode}-tab`}>
      <div className="ml-visual">
        <div className="ml-visual-header"><span>{activeMode.header}</span><span className="ml-simple-note">Esquema simplificado</span></div>
        <div className="ml-diagram">
          {mode === 'engine' && <EngineDiagram angle={angle} stroke={stroke} />}
          {mode === 'gears' && <GearDiagram angle={angle} input={ratio.input} output={ratio.output} />}
          {mode === 'brakes' && <BrakeDiagram angle={angle} force={pressure.force} color={pressure.color} label={pressure.label} />}
          {mode === 'cooling' && <CoolingDiagram angle={angle} open={circuit.open} />}
          {mode === 'suspension' && <SuspensionDiagram angle={angle} damped={bump.damped} label={bump.label} />}
          {mode === 'electrical' && <ElectricalDiagram angle={angle} flows={charge.flows} label={charge.label} spin={charge.spin} />}
        </div>
        <div className="ml-playback">
          <button className="ml-play-button" onClick={() => setRunning(value => !value)} disabled={reducedMotion} aria-pressed={running}>
            {running ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}{running ? 'Pausar' : reducedMotion ? 'Movimento reduzido' : 'Ver em movimento'}
          </button>
          <button className="ml-reset" onClick={() => { setRunning(false); setAngle(startAngle(mode)); }} aria-label="Reiniciar demonstração"><RotateCcw size={17} /><span>Reiniciar</span></button>
          <span className="ml-playback-hint">{reducedMotion ? 'Explore pelos controles ao lado.' : running ? 'Observe como as peças trabalham juntas.' : 'Você controla o ritmo.'}</span>
        </div>
      </div>

      <div className="ml-explanation">
        {mode === 'engine' && <>
          <div className="ml-stroke-tabs" aria-label="Etapas do motor">
            {strokes.map((item, index) => <button key={item.name} aria-pressed={stroke === index} onClick={() => selectStroke(index)}><span className="ml-step-number">{index + 1}</span><span>{item.name}</span></button>)}
          </div>
          <div className="ml-lesson-copy">
            <h3>{activeStroke.verb}</h3>
            <p>{activeStroke.text}</p>
            <div className="ml-mechanics-state"><span>{direction}{activeStroke.direction}</span><span>{activeStroke.valve}</span></div>
            <p className="ml-analogy">{activeStroke.detail}</p>
          </div>
          <button className="ml-next-step" onClick={() => selectStroke((stroke + 1) % 4)}>Próximo tempo <ArrowRight size={17} /></button>
          <p className="ml-footnote">Um ciclo completo usa duas voltas do virabrequim. Aqui, a abertura das válvulas é aproximada para facilitar a compreensão.</p>
        </>}

        {mode === 'gears' && <>
          <h3 className="ml-ratio-heading">Troque a relação.</h3>
          <p className="ml-ratio-intro">Veja o que muda quando o tamanho das engrenagens muda.</p>
          <div className="ml-ratio-options" aria-label="Relação entre as engrenagens">
            {ratios.map((item, index) => <button key={item.label} aria-pressed={ratioIndex === index} onClick={() => { setRatioIndex(index); setRunning(false); setAngle(0); }}><span>{item.label}</span><span>{item.input} <MoveRight size={13} /> {item.output} dentes</span></button>)}
          </div>
          <div className="ml-lesson-copy ml-gear-copy"><h3>{ratio.title}</h3><p>{ratio.text}</p></div>
          <div className="ml-turns"><span><strong>1 volta</strong>na entrada</span><ArrowRight size={19} /><span><strong>{(ratio.input / ratio.output).toLocaleString('pt-BR')} {ratio.input / ratio.output <= 1 ? 'volta' : 'voltas'}</strong>na saída</span></div>
          <p className="ml-analogy">{ratio.example}</p>
          <p className="ml-footnote">Relações ilustrativas, sem considerar perdas. O formato dos dentes é simplificado; uma caixa de câmbio real tem vários pares e eixos.</p>
        </>}

        {mode === 'brakes' && <>
          <h3 className="ml-ratio-heading">Pise com mais força.</h3>
          <p className="ml-ratio-intro">Veja o que muda na pinça conforme a pressão aplicada no pedal.</p>
          <div className="ml-ratio-options" aria-label="Força aplicada no pedal">
            {pressures.map((item, index) => <button key={item.label} aria-pressed={pressureIndex === index} onClick={() => { setPressureIndex(index); setRunning(false); setAngle(0); }}><span>{item.label}</span><span>{item.hint}</span></button>)}
          </div>
          <div className="ml-lesson-copy"><h3>{pressure.title}</h3><p>{pressure.text}</p></div>
          <div className="ml-mechanics-state"><span><Gauge size={17} />{pressure.state}</span><span>{pressure.effect}</span></div>
          <p className="ml-analogy">{pressure.detail}</p>
          <p className="ml-footnote">Esquema de um único circuito. Um carro real divide a frenagem em circuitos independentes e conta com servofreio e sistemas eletrônicos de assistência.</p>
        </>}

        {mode === 'cooling' && <>
          <h3 className="ml-ratio-heading">Frio ou aquecido.</h3>
          <p className="ml-ratio-intro">Escolha a condição do motor e veja o caminho que o líquido percorre.</p>
          <div className="ml-ratio-options" aria-label="Condição térmica do motor">
            {circuits.map((item, index) => <button key={item.label} aria-pressed={circuitIndex === index} onClick={() => { setCircuitIndex(index); setRunning(false); setAngle(0); }}><span>{item.label}</span><span>{item.open ? 'válvula aberta' : 'válvula fechada'}</span></button>)}
          </div>
          <div className="ml-lesson-copy"><h3>{circuit.title}</h3><p>{circuit.text}</p></div>
          <div className="ml-mechanics-state"><span><Thermometer size={17} />{circuit.temperature}</span><span>{circuit.state}</span></div>
          <p className="ml-analogy">{circuit.detail}</p>
          <p className="ml-footnote">Esquema simplificado. Um sistema real inclui reservatório de expansão, sensores, o trocador de calor do aquecimento interno e uma válvula que abre de forma gradual.</p>
        </>}

        {mode === 'suspension' && <>
          <h3 className="ml-ratio-heading">Tire o amortecedor.</h3>
          <p className="ml-ratio-intro">Compare o que acontece depois do solavanco com e sem ele.</p>
          <div className="ml-ratio-options" aria-label="Composição do conjunto de suspensão">
            {bumps.map((item, index) => <button key={item.label} aria-pressed={bumpIndex === index} onClick={() => { setBumpIndex(index); setRunning(false); setAngle(0); }}><span>{item.label}</span><span>{item.damped ? 'conjunto real' : 'só o princípio'}</span></button>)}
          </div>
          <div className="ml-lesson-copy"><h3>{bump.title}</h3><p>{bump.text}</p></div>
          <div className="ml-mechanics-state"><span><ArrowUpDown size={17} />{bump.state}</span><span>{bump.effect}</span></div>
          <p className="ml-analogy">{bump.detail}</p>
          <p className="ml-footnote">Esquema de uma roda só, com a mola e o amortecedor separados para facilitar a leitura. Em muitos carros os dois formam uma peça única, e cada roda tem seu conjunto.</p>
        </>}

        {mode === 'electrical' && <>
          <h3 className="ml-ratio-heading">Quem alimenta o quê.</h3>
          <p className="ml-ratio-intro">Escolha o momento e veja de onde a energia sai e para onde vai.</p>
          <div className="ml-ratio-options" aria-label="Momento do sistema elétrico">
            {charges.map((item, index) => <button key={item.label} aria-pressed={chargeIndex === index} onClick={() => { setChargeIndex(index); setRunning(false); setAngle(0); }}><span>{item.label}</span><span>{item.hint}</span></button>)}
          </div>
          <div className="ml-lesson-copy"><h3>{charge.title}</h3><p>{charge.text}</p></div>
          <div className="ml-mechanics-state"><span><Zap size={17} />{charge.state}</span><span>{charge.effect}</span></div>
          <p className="ml-analogy">{charge.detail}</p>
          <p className="ml-footnote">Esquema simplificado do caminho da energia. Um sistema real tem fusíveis, chicote, controle de tensão e vários consumidores ligados ao mesmo tempo.</p>
        </>}
      </div>
    </div>
  </section>;
}
