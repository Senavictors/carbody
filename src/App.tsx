import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, BookA, BookOpen, Box, Check, CheckCircle2, ChevronRight, CircleDot, Cog, Droplets, ExternalLink, Fuel, GraduationCap, Layers3, Menu, Minus, Move, Play, Plus, RotateCcw, Search, Settings2, ShieldCheck, Sparkles, Wrench, X, Zap } from 'lucide-react';
import { parts, sources, systems } from './data/parts';
import { glossary } from './data/glossary';
import type { Part, SystemId } from './data/parts';
import type { Mode } from './components/MechanismLab';
import PartSketch from './components/PartSketch';

const CarScene = lazy(() => import('./components/CarScene'));
const MechanismLab = lazy(() => import('./components/MechanismLab'));

type Page = 'explore' | 'mechanisms' | 'parts' | 'glossary' | 'progress';
type View = 'perspective' | 'side' | 'top';
const STORAGE_KEY = 'por-dentro:learned:v1';
const systemIcons: Record<SystemId, LucideIcon> = { all: Layers3, engine: Cog, transmission: Settings2, brakes: CircleDot, suspension: Move, electrical: Zap, cooling: Droplets, fuel: Fuel };
const systemMechanism: Partial<Record<Exclude<SystemId, 'all'>, Mode>> = { engine: 'engine', fuel: 'engine', transmission: 'gears', brakes: 'brakes', cooling: 'cooling', suspension: 'suspension', electrical: 'electrical' };
const mechanismParts: Record<Mode, string[]> = {
  engine: ['engine', 'spark-plug', 'air-filter', 'fuel-injector'],
  gears: ['clutch', 'gearbox', 'cv-joint'],
  brakes: ['brake-pad', 'brake-disc', 'brake-caliper', 'brake-fluid'],
  cooling: ['radiator', 'water-pump', 'thermostat', 'coolant-reservoir'],
  suspension: ['spring', 'shock-absorber', 'tire', 'sway-bar'],
  electrical: ['battery', 'alternator', 'starter', 'fuses'],
};
const navigation: { id: Page; title: string; icon: LucideIcon }[] = [
  { id: 'explore', title: 'Explorar o carro', icon: Box },
  { id: 'mechanisms', title: 'Como funciona', icon: Cog },
  { id: 'parts', title: 'Peças e cuidados', icon: Wrench },
  { id: 'glossary', title: 'Glossário', icon: BookA },
  { id: 'progress', title: 'Meu aprendizado', icon: BookOpen },
];

function loadLearned(): string[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(stored) ? [...new Set(stored.filter((id): id is string => typeof id === 'string' && parts.some(part => part.id === id)))] : [];
  } catch { return []; }
}
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function Brand({ compact = false }: { compact?: boolean }) {
  return <span className={`brand ${compact ? 'brand-compact' : ''}`}><span className="brand-symbol"><Box size={25} strokeWidth={1.6} /></span><span>carbody<span className="brand-period">.</span><small>mecânica descomplicada</small></span></span>;
}

function PartDetail({ part, learned, onLearn, onMechanism }: { part: Part; learned: boolean; onLearn: () => void; onMechanism: (() => void) | null }) {
  const [tab, setTab] = useState<'about' | 'care'>('about');
  const [wearView, setWearView] = useState<'normal' | 'worn'>('normal');
  const tabs = useRef<HTMLDivElement>(null);
  useEffect(() => { setTab('about'); setWearView('normal'); }, [part.id]);
  const category = systems.find(system => system.id === part.system)!;
  return <aside className="part-detail" aria-label={`Sobre ${part.name}`}>
    <div className={`part-illustration system-${part.system}`}><span className="detail-system"><span className="system-dot"/>{category.name}</span><PartSketch system={part.system} partId={part.id} variant={part.wear?wearView:'normal'}/><span className="part-level">{part.difficulty}</span></div>
    {part.wear&&<div className="wear-compare"><div className="wear-toggle" role="group" aria-label={`Comparar a ${part.shortName.toLowerCase()} em bom estado e com uso`}><button aria-pressed={wearView==='normal'} onClick={()=>setWearView('normal')}>Em bom estado</button><button aria-pressed={wearView==='worn'} onClick={()=>setWearView('worn')}>Com uso</button></div><p className="wear-copy" aria-live="polite">{wearView==='normal'?part.wear.normal:part.wear.worn}</p><p className="wear-note"><ShieldCheck size={14}/>{part.wear.note}</p></div>}
    <div className="detail-body">
      <button className="back-to-model text-link" onClick={()=>{document.querySelector('.atlas-panel')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});document.querySelector<HTMLElement>('.atlas-panel')?.focus({preventScroll:true});}}>Voltar ao modelo <Box size={14}/></button>
      <h2 tabIndex={-1}>{part.name}</h2><p className="part-summary">{part.summary}</p>
      <div ref={tabs} className="detail-tabs" role="tablist" aria-label="Informações da peça" onKeyDown={event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?'about':event.key==='End'?'care':tab==='about'?'care':'about';setTab(next);tabs.current?.querySelectorAll<HTMLButtonElement>('button')[next==='about'?0:1].focus();}}>
        <button id="part-about-tab" role="tab" aria-selected={tab === 'about'} tabIndex={tab==='about'?0:-1} aria-controls="part-information" onClick={()=>setTab('about')}>A peça por dentro</button>
        <button id="part-care-tab" role="tab" aria-selected={tab === 'care'} tabIndex={tab==='care'?0:-1} aria-controls="part-information" onClick={()=>setTab('care')}>Sinais e cuidados</button>
      </div>
      <div id="part-information" className="part-information" role="tabpanel" aria-labelledby={tab === 'about' ? 'part-about-tab' : 'part-care-tab'}>
        {tab === 'about' ? <><h3>O que faz</h3><p>{part.function}</p><h3>Como funciona</h3><p>{part.how}</p><div className="analogy"><Sparkles size={16}/><p>{part.analogy}</p></div>{onMechanism && <button className="text-link mechanism-link" onClick={onMechanism}>Veja o movimento acontecer <ArrowUpRight size={16}/></button>}</> : <><h3>Perceba os sinais</h3><ul className="symptom-list">{part.signs.map(sign=><li key={sign}>{sign}</li>)}</ul><h3>O cuidado essencial</h3><p>{part.care}</p><span className="care-tag"><ShieldCheck size={14}/>{part.attention}</span></>}
      </div>
      <button className={`learn-button ${learned?'is-learned':''}`} onClick={onLearn}>{learned ? <CheckCircle2 size={17}/> : <Check size={17}/>} {learned ? 'Aprendido! Revisar quando quiser' : 'Marcar como aprendido'}</button>
      <details className="source-details"><summary>Consultar fontes <ExternalLink size={11}/></summary><div>{part.sourceIds.map(id=>{const source=sources.find(item=>item.id===id);return source?<a key={id} href={source.url} target="_blank" rel="noreferrer">{source.organization} — {source.title}<ArrowUpRight size={12}/></a>:null;})}</div></details>
    </div>
  </aside>;
}

function App() {
  const [page,setPage]=useState<Page>('explore');
  const [activeSystem,setActiveSystem]=useState<SystemId>('all');
  const [selectedId,setSelectedId]=useState('engine');
  const [learned,setLearned]=useState<string[]>(loadLearned);
  const [query,setQuery]=useState('');
  const [menuOpen,setMenuOpen]=useState(false);
  const [bodyVisible,setBodyVisible]=useState(true);
  const [view,setView]=useState<View>('perspective');
  const [resetKey,setResetKey]=useState(0);
  const [zoomDelta,setZoomDelta]=useState(0);
  const [mechanismMode,setMechanismMode]=useState<Mode>('engine');
  const [toast,setToast]=useState('');
  const [storageAvailable,setStorageAvailable]=useState(true);
  const [libraryFilter,setLibraryFilter]=useState<SystemId>('all');
  const [returnToResults,setReturnToResults]=useState(false);
  const [termQuery,setTermQuery]=useState('');
  const [detailRequest,setDetailRequest]=useState(0);
  const searchRef=useRef<HTMLInputElement>(null);
  const sidebarRef=useRef<HTMLElement>(null);
  const selectedPart=parts.find(part=>part.id===selectedId) || parts[0];
  const partMechanism=systemMechanism[selectedPart.system];
  const progress=Math.round(learned.length/parts.length*100);

  useEffect(()=>{
    const keydown=(event: KeyboardEvent)=>{
      if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();searchRef.current?.focus();}
      if(event.key==='Escape'){setMenuOpen(false);searchRef.current?.blur();}
    };
    window.addEventListener('keydown',keydown);
    return()=>window.removeEventListener('keydown',keydown);
  },[]);
  useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(''),3300);return()=>clearTimeout(timer);},[toast]);
  useEffect(()=>{document.title=`${navigation.find(item=>item.id===page)?.title} — Carbody`;},[page]);
  useEffect(()=>{
    if(!detailRequest || !window.matchMedia('(max-width: 1050px)').matches)return;
    document.querySelector('.part-detail')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
    document.querySelector<HTMLElement>('.detail-body>h2')?.focus({preventScroll:true});
  },[detailRequest]);
  useEffect(()=>{
    if(!menuOpen)return;
    const previous=document.activeElement as HTMLElement|null;
    sidebarRef.current?.querySelector<HTMLButtonElement>('.close-menu')?.focus();
    const trap=(event:KeyboardEvent)=>{
      if(event.key!=='Tab')return;
      const buttons=Array.from(sidebarRef.current?.querySelectorAll<HTMLButtonElement>('button')||[]).filter(button=>button.offsetParent!==null);
      const first=buttons[0],last=buttons.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    };
    document.addEventListener('keydown',trap);
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    return()=>{document.removeEventListener('keydown',trap);document.body.style.overflow=previousOverflow;previous?.focus();};
  },[menuOpen]);

  const navigate=(next:Page)=>{setPage(next);setMenuOpen(false);setReturnToResults(false);if(next!=='parts')setQuery('');window.scrollTo({top:0,behavior:'instant'});};
  const selectSystem=(id:SystemId)=>{setActiveSystem(id);if(id!=='all'){setSelectedId(parts.find(part=>part.system===id)!.id);}setPage('explore');setMenuOpen(false);setQuery('');};
  const selectPart=(id:string)=>{setSelectedId(id);setDetailRequest(value=>value+1);};
  const openPart=(part:Part)=>{setSelectedId(part.id);setActiveSystem(part.system);setReturnToResults(page==='parts');setPage('explore');setMenuOpen(false);window.scrollTo({top:0,behavior:'instant'});setDetailRequest(value=>value+1);};
  const openMechanism=(mode:Mode)=>{setMechanismMode(mode);navigate('mechanisms');};
  const toggleLearned=(id:string)=>{
    const next=learned.includes(id)?learned.filter(item=>item!==id):[...learned,id];setLearned(next);
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(next));setStorageAvailable(true);}catch{setStorageAvailable(false);}
    setToast(next.includes(id)?'Mais uma peça compreendida. Bom aprendizado!':'Peça removida das aprendidas.');
  };
  const resultTerms=glossary.filter(entry=>!termQuery||normalize(`${entry.term} ${entry.definition} ${entry.relatedParts.map(id=>parts.find(part=>part.id===id)?.name??'').join(' ')}`).includes(normalize(termQuery)));
  const resultParts=parts.filter(part=>(libraryFilter==='all'||part.system===libraryFilter)&&(!query||normalize(`${part.name} ${part.summary} ${part.signs.join(' ')} ${systems.find(system=>system.id===part.system)?.name}`).includes(normalize(query))));

  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
    {menuOpen&&<button className="sidebar-scrim" aria-label="Fechar menu" onClick={()=>setMenuOpen(false)}/>}
    <aside ref={sidebarRef} className={`sidebar ${menuOpen?'is-open':''}`} aria-label={menuOpen?'Menu principal':undefined} role={menuOpen?'dialog':undefined} aria-modal={menuOpen?true:undefined}>
      <button className="brand-button" onClick={()=>navigate('explore')} aria-label="Carbody, página inicial"><Brand/></button>
      <button className="close-menu icon-button" onClick={()=>setMenuOpen(false)} aria-label="Fechar menu"><X size={21}/></button>
      <nav aria-label="Navegação principal" className="main-nav">{navigation.map(({id,title,icon:Icon})=><button key={id} className={`nav-item ${page===id?'active':''}`} aria-current={page===id?'page':undefined} onClick={()=>navigate(id)}><Icon size={19}/><span>{title}</span>{id==='progress'&&learned.length>0&&<span className="nav-count">{learned.length}</span>}{page===id&&<span className="nav-active-dot"/>}</button>)}</nav>
      <div className="sidebar-systems"><h2>Sistemas do carro</h2><nav aria-label="Explorar por sistema">{systems.filter(system=>system.id!=='all').map(system=>{const Icon=systemIcons[system.id];return <button key={system.id} className={`system-nav system-${system.id} ${page==='explore'&&activeSystem===system.id?'selected':''}`} onClick={()=>selectSystem(system.id)}><Icon size={17}/><span>{system.name}</span><span className="system-dot"/></button>;})}</nav></div>
      <div className="sidebar-bottom"><div className="sidebar-note"><span className="note-icon"><GraduationCap size={24} strokeWidth={1.5}/></span><h3>Curiosidade é o primeiro passo.</h3><p>Você não precisa ser mecânico para entender seu carro.</p></div><span className="sidebar-footer">Feito para aprender, sem complicar.</span></div>
    </aside>
    <div className="workspace">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu icon-button" onClick={()=>setMenuOpen(true)} aria-label="Abrir menu"><Menu size={22}/></button><span className="topbar-context">Seu guia de mecânica <ChevronRight size={14}/> <strong>{navigation.find(item=>item.id===page)?.title}</strong></span><span className="mobile-brand">carbody<span>.</span></span></div><form className="search-form" role="search" onSubmit={event=>{event.preventDefault();setPage('parts');}}><Search size={17}/><input ref={searchRef} value={query} onChange={event=>{setQuery(event.target.value);setPage('parts');setLibraryFilter('all');}} placeholder="Buscar uma peça..." aria-label="Buscar uma peça ou sintoma"/>{query?<button type="button" className="clear-search" aria-label="Limpar busca" onClick={()=>setQuery('')}><X size={14}/></button>:<kbd>Ctrl K</kbd>}</form><div className="essential-label"><span/>Guia essencial</div></header>
      <main id="main-content" className={`main-content page-${page}`}>
        {page==='explore'&&<>
          <div className="page-heading"><div><h1>Entenda o que te move<span>.</span></h1><p>Seu carro, peça por peça. Explore, descubra e faça as conexões.</p></div><button className="subtle-button" onClick={()=>openMechanism('engine')}><Play size={14}/> Como tudo funciona <ArrowUpRight size={15}/></button></div>
          {returnToResults&&<button className="return-to-results text-link" onClick={()=>{setPage('parts');setReturnToResults(false);window.scrollTo({top:0,behavior:'instant'});}}><ArrowLeft size={14}/> Voltar {query?`aos resultados de “${query}”`:'às peças'}</button>}<div className="system-tabs" aria-label="Filtrar sistemas">{systems.map(system=>{const Icon=systemIcons[system.id];return <button key={system.id} className={`system-tab system-${system.id} ${activeSystem===system.id?'selected':''}`} aria-pressed={activeSystem===system.id} onClick={()=>selectSystem(system.id)}><Icon size={16}/>{system.name}</button>;})}</div>
          <div className="explorer-layout">
            <section className="atlas-panel" tabIndex={-1} aria-label="Modelo interativo do carro"><div className="atlas-top"><div><h2>{activeSystem==='all'?'Uma visão do conjunto':systems.find(system=>system.id===activeSystem)?.name}</h2><p>{activeSystem==='all'?'Cada sistema tem um papel. Juntos, colocam você em movimento.':systems.find(system=>system.id===activeSystem)?.description}</p></div><label className="body-toggle"><input type="checkbox" checked={bodyVisible} onChange={event=>setBodyVisible(event.target.checked)}/><span className="toggle-track"/><span>Carroceria</span></label></div>
              <div className="scene-shell"><div className="scene-caption"><span className="live-dot"/>MODELO INTERATIVO</div><Suspense fallback={<div className="scene-loading" role="status">Preparando o carro para você explorar…</div>}><CarScene activeSystem={activeSystem} selectedPart={selectedId} onSelectPart={selectPart} bodyVisible={bodyVisible} autoRotate={false} resetKey={resetKey} zoomDelta={zoomDelta} view={view}/></Suspense><div className="scene-zoom"><button className="icon-button" aria-label="Aproximar carro" onClick={()=>setZoomDelta(value=>value+1)}><Plus size={18}/></button><button className="icon-button" aria-label="Afastar carro" onClick={()=>setZoomDelta(value=>value-1)}><Minus size={18}/></button><span/><button className="icon-button" aria-label="Restaurar visualização" onClick={()=>{setResetKey(value=>value+1);setView('perspective');}}><RotateCcw size={16}/></button></div><span className="model-note">Representação didática · carro a combustão</span></div>
              <div className="atlas-bottom"><span className="drag-hint"><Move size={15}/> Arraste para girar · clique para explorar</span><div className="view-picker" aria-label="Ângulo de visualização">{([{id:'perspective',label:'Perspectiva'},{id:'side',label:'Lateral'},{id:'top',label:'Superior'}] as const).map(item=><button key={item.id} onClick={()=>setView(item.id)} aria-pressed={view===item.id} className={view===item.id?'active':''}>{item.label}</button>)}</div></div>
              <div className="parts-strip"><span>Explore as peças <ArrowRight size={13}/></span><div>{parts.filter(part=>activeSystem==='all'?['engine','gearbox','brake-pad','battery'].includes(part.id):part.system===activeSystem).map(part=><button key={part.id} onClick={()=>selectPart(part.id)} className={selectedId===part.id?'active':''}>{part.shortName}</button>)}</div></div>
            </section>
            <PartDetail part={selectedPart} learned={learned.includes(selectedId)} onLearn={()=>toggleLearned(selectedId)} onMechanism={partMechanism?()=>openMechanism(partMechanism):null}/>
          </div>
          <section className="next-section"><div className="section-heading"><h2>Um bom lugar para começar</h2><span>O essencial, no seu ritmo</span></div><div className="learning-paths"><button className="learning-path" onClick={()=>openMechanism('engine')}><span className="path-drawing path-engine"><PartSketch system="engine"/></span><span className="path-copy"><strong>O que acontece dentro do motor?</strong><span>Veja os quatro tempos em ação.</span></span><ArrowUpRight size={21}/></button><button className="learning-path" onClick={()=>{setLibraryFilter('all');navigate('parts');}}><span className="path-drawing path-care"><ShieldCheck size={36} strokeWidth={1.25}/></span><span className="path-copy"><strong>Seu carro dá alguns sinais.</strong><span>Aprenda a observar o desgaste.</span></span><ArrowUpRight size={21}/></button></div></section>
          <footer className="page-footer"><span>Uma peça por vez. Um pouco mais de confiança.</span><span><BookOpen size={13}/> {parts.length} peças para descobrir</span></footer>
        </>}
        {page==='mechanisms'&&<><div className="page-heading"><div><h1>O movimento faz sentido<span>.</span></h1><p>Pause, observe e conecte as peças. A mecânica fica mais simples assim.</p></div><button className="subtle-button" onClick={()=>navigate('explore')}><Box size={15}/> Voltar ao carro</button></div><Suspense fallback={<div className="scene-loading" role="status">Preparando os mecanismos…</div>}><MechanismLab key={mechanismMode} initialMode={mechanismMode}/></Suspense><section className="mechanism-connections"><h2>Agora, encontre no carro</h2><div>{mechanismParts[mechanismMode].map(id=>parts.find(part=>part.id===id)).filter((part):part is Part=>Boolean(part)).map(part=><button key={part.id} onClick={()=>openPart(part)}><span className={`system-dot system-${part.system}`}/>{part.name}<ArrowUpRight size={16}/></button>)}</div></section><p className="learning-footnote">Os diagramas são esquemas simplificados, feitos para explicar o princípio de cada mecanismo. O projeto real varia conforme o veículo.</p></>}
        {page==='parts'&&<><div className="page-heading"><div><h1>Conhecer também é cuidar<span>.</span></h1><p>O que cada peça faz, como se desgasta e os sinais que merecem atenção.</p></div><span className="page-counter">{parts.length} peças essenciais</span></div><div className="library-controls"><div className="system-tabs">{systems.map(system=><button key={system.id} className={`system-tab ${libraryFilter===system.id?'selected':''}`} aria-pressed={libraryFilter===system.id} onClick={()=>setLibraryFilter(system.id)}>{system.name}</button>)}</div></div>{query&&<p className="search-results-copy">{resultParts.length} {resultParts.length===1?'resultado':'resultados'} para “{query}” <button className="text-link" onClick={()=>setQuery('')}>Limpar busca <X size={13}/></button></p>}<div className="library-table"><div className="library-table-header"><span>Peça / função</span><span>Sistema</span><span>O que observar</span><span/></div>{resultParts.map(part=><button className="library-row" key={part.id} onClick={()=>openPart(part)}><span className="library-part"><span className={`library-drawing system-${part.system}`}><PartSketch system={part.system} partId={part.id}/></span><span><strong>{part.name}{learned.includes(part.id)&&<CheckCircle2 size={15} className="learned-check"/>}</strong><small>{part.summary}</small></span></span><span className={`library-system system-${part.system}`}><span className="system-dot"/>{systems.find(system=>system.id===part.system)?.name}</span><span className="library-attention">{part.attention}</span><ArrowUpRight size={17}/></button>)}</div>{resultParts.length===0&&<div className="empty-state"><Search size={32} strokeWidth={1.3}/><h2>Nenhuma peça por aqui.</h2><p>Tente um nome como “bateria” ou um sinal como “ruído”.</p><button className="primary-button" onClick={()=>{setQuery('');setLibraryFilter('all');}}>Ver todas as peças</button></div>}<div className="content-note"><ShieldCheck size={19}/><p>Desgaste depende do uso e do veículo. Estes são exemplos comuns de manutenção, sem ordem de frequência. Um mesmo sinal pode ter várias causas.</p></div></>}
        {page==='glossary'&&<><div className="page-heading"><div><h1>O vocabulário do carro<span>.</span></h1><p>As palavras que aparecem nas peças e nos mecanismos, explicadas em uma frase.</p></div><span className="page-counter">{glossary.length} termos</span></div><div className="glossary-search" role="search"><Search size={17}/><input value={termQuery} onChange={event=>setTermQuery(event.target.value)} placeholder="Buscar um termo..." aria-label="Buscar um termo no glossário"/>{termQuery&&<button type="button" className="clear-search" aria-label="Limpar busca do glossário" onClick={()=>setTermQuery('')}><X size={14}/></button>}</div>{termQuery&&<p className="search-results-copy">{resultTerms.length} {resultTerms.length===1?'resultado':'resultados'} para “{termQuery}”</p>}<dl className="glossary-list">{resultTerms.map(entry=><div className="glossary-entry" key={entry.id}><dt>{entry.term}</dt><dd><p>{entry.definition}</p>{entry.relatedParts.length>0&&<div className="glossary-related"><span className="glossary-related-label">Onde aparece</span>{entry.relatedParts.map(id=>parts.find(part=>part.id===id)).filter((part): part is Part=>Boolean(part)).map(part=><button key={part.id} className={`glossary-part system-${part.system}`} onClick={()=>openPart(part)}><span className="system-dot"/>{part.name}<ArrowUpRight size={14}/></button>)}</div>}</dd></div>)}</dl>{resultTerms.length===0&&<div className="empty-state"><Search size={32} strokeWidth={1.3}/><h2>Nenhum termo por aqui.</h2><p>Tente “freio”, “calor” ou “elétrica”.</p><button className="primary-button" onClick={()=>setTermQuery('')}>Ver todos os termos</button></div>}<div className="content-note"><BookA size={19}/><p>Cada definição explica o termo do jeito que ele é usado neste guia, apoiada nas mesmas fontes da peça onde ele aparece. Um mesmo termo pode ter usos mais amplos fora daqui.</p></div></>}

        {page==='progress'&&<><div className="page-heading"><div><h1>Cada descoberta conta<span>.</span></h1><p>O que você já aprendeu fica por aqui. Volte sempre que quiser revisar.</p></div><GraduationCap className="heading-icon" size={44} strokeWidth={1.1}/></div><div className="progress-overview"><div><h2>Seu caminho pela mecânica</h2><p><strong>{learned.length}</strong> de {parts.length} peças compreendidas</p></div><div className="progress-meter"><span>{progress}% explorado</span><div role="progressbar" aria-label="Peças aprendidas" aria-valuenow={learned.length} aria-valuemin={0} aria-valuemax={parts.length}><span style={{transform:`scaleX(${progress/100})`}}/></div><small>{storageAvailable?'Salvo neste navegador, sem precisar de conta.':'O navegador não permitiu salvar. Seu progresso vale nesta sessão.'}</small></div></div><div className="progress-systems">{systems.filter(system=>system.id!=='all').map(system=>{const systemParts=parts.filter(part=>part.system===system.id);const count=systemParts.filter(part=>learned.includes(part.id)).length;const Icon=systemIcons[system.id];return <section key={system.id} className={`progress-system system-${system.id}`}><div className="progress-system-heading"><Icon size={22} strokeWidth={1.6}/><h2>{system.name}</h2><span>{count}/{systemParts.length}</span></div><div>{systemParts.map(part=><button key={part.id} onClick={()=>openPart(part)}>{learned.includes(part.id)?<CheckCircle2 size={16} className="learned-check"/>:<span className="unlearned-circle"/>}<span>{part.name}</span><ChevronRight size={14}/></button>)}</div></section>;})}</div>{learned.length===0&&<div className="progress-start"><p>Comece pelo motor e descubra como a energia vira movimento.</p><button className="primary-button" onClick={()=>openPart(parts.find(part=>part.id==='engine')!)}>Explorar minha primeira peça <ArrowRight size={16}/></button></div>}<p className="learning-footnote"><ArrowDown size={14}/> Para marcar uma peça, abra sua explicação e selecione “Marcar como aprendido”.</p></>}
      </main>
    </div>
    <div className={`toast ${toast?'visible':''}`} role="status" aria-live="polite">{toast&&<><CheckCircle2 size={18}/><span>{toast}{!storageAvailable&&' Progresso salvo apenas nesta sessão.'}</span></>}</div>
  </div>;
}
export default App;
