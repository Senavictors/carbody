import { useEffect, useId, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUp, MoveRight, Pause, Play, RotateCcw } from 'lucide-react';
import './mechanism-lab.css';

type Mode = 'engine' | 'gears';
type MechanismLabProps = { initialMode?: Mode };

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

export default function MechanismLab({ initialMode = 'engine' }: MechanismLabProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [running, setRunning] = useState(false);
  const [angle, setAngle] = useState(90);
  const [ratioIndex, setRatioIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const tabs = useRef<HTMLDivElement>(null);
  const id = useId();
  const stroke = Math.floor((angle % 720) / 180);
  const ratio = ratios[ratioIndex];
  const activeStroke = strokes[stroke];

  useEffect(() => { setMode(initialMode); setRunning(false); setAngle(initialMode === 'engine' ? 90 : 0); }, [initialMode]);
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
        setAngle(value => (value + delta * (mode === 'engine' ? .07 : .025)) % 720);
      }
      previous = time;
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [running, mode, reducedMotion]);

  const changeMode = (next: Mode) => { setMode(next); setRunning(false); setAngle(next === 'engine' ? 90 : 0); };
  const selectStroke = (index: number) => { setRunning(false); setAngle(index * 180 + 90); };
  const direction = stroke % 2 === 0 ? <ArrowDown size={17} /> : <ArrowUp size={17} />;

  return <section className="mechanism-lab" aria-label="Laboratório de mecânica">
    <div className="ml-intro">
      <div><h2>Entenda o movimento.</h2><p>Um passo de cada vez, por dentro da mecânica.</p></div>
      <div className="ml-tabs" role="tablist" aria-label="Escolha o mecanismo" ref={tabs} onKeyDown={event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 'engine' : event.key === 'End' ? 'gears' : mode === 'engine' ? 'gears' : 'engine';
        changeMode(next);
        tabs.current?.querySelectorAll<HTMLButtonElement>('button')[next === 'engine' ? 0 : 1].focus();
      }}>
        <button id={`${id}-engine-tab`} role="tab" aria-selected={mode === 'engine'} aria-controls={`${id}-panel`} tabIndex={mode === 'engine' ? 0 : -1} onClick={() => changeMode('engine')}>Motor de 4 tempos</button>
        <button id={`${id}-gears-tab`} role="tab" aria-selected={mode === 'gears'} aria-controls={`${id}-panel`} tabIndex={mode === 'gears' ? 0 : -1} onClick={() => changeMode('gears')}>Engrenagens</button>
      </div>
    </div>

    <div className="ml-workbench" id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${mode}-tab`}>
      <div className="ml-visual">
        <div className="ml-visual-header"><span>{mode === 'engine' ? 'Motor a gasolina · um cilindro' : 'Um par de engrenagens'}</span><span className="ml-simple-note">Esquema simplificado</span></div>
        <div className="ml-diagram">{mode === 'engine' ? <EngineDiagram angle={angle} stroke={stroke} /> : <GearDiagram angle={angle} input={ratio.input} output={ratio.output} />}</div>
        <div className="ml-playback">
          <button className="ml-play-button" onClick={() => setRunning(value => !value)} disabled={reducedMotion} aria-pressed={running}>
            {running ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}{running ? 'Pausar' : reducedMotion ? 'Movimento reduzido' : 'Ver em movimento'}
          </button>
          <button className="ml-reset" onClick={() => { setRunning(false); setAngle(mode === 'engine' ? 90 : 0); }} aria-label="Reiniciar demonstração"><RotateCcw size={17} /><span>Reiniciar</span></button>
          <span className="ml-playback-hint">{reducedMotion ? 'Explore pelos controles ao lado.' : running ? 'Observe como as peças trabalham juntas.' : 'Você controla o ritmo.'}</span>
        </div>
      </div>

      <div className="ml-explanation">
        {mode === 'engine' ? <>
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
        </> : <>
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
      </div>
    </div>
  </section>;
}
