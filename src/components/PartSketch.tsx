import type { ReactNode } from 'react';
import type { SystemId } from '../data/parts';

type PartSketchProps = { system: SystemId; partId?: string };

const primaryPart: Record<SystemId, string> = {
  all: 'engine', engine: 'engine', transmission: 'gearbox', brakes: 'brake-disc',
  suspension: 'shock-absorber', electrical: 'battery', cooling: 'radiator',
};

function gearOutline(cx: number, cy: number, radius: number, teeth: number) {
  const points: string[] = [];
  for (let tooth = 0; tooth < teeth; tooth++) {
    for (const [offset, r] of [[-.5, radius - 2], [-.3, radius - 2], [-.2, radius + 2], [.2, radius + 2], [.3, radius - 2], [.5, radius - 2]]) {
      const angle = (tooth + offset) * Math.PI * 2 / teeth;
      points.push(`${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`);
    }
  }
  return `M${points.join(' L')} Z`;
}

function PartShape({ id }: { id: string }): ReactNode {
  switch (id) {
    case 'spark-plug':
      return <>
        <path d="M61 12h8v11h-8z" fill="var(--part-fill)" />
        <path d="M60 23h10v26H60z" fill="var(--part-fill)" />
        <path d="M57 28h16m-16 6h16m-16 6h16" />
        <path d="M55 49h20l5 8-5 8H55l-5-8z" fill="var(--part-fill)" />
        <path d="M57 65h16v14H57z" fill="var(--part-fill)" />
        <path d="M57 68h16m-16 4h16m-16 4h16" strokeOpacity=".5" />
        <path d="M65 79v5m8-5v10h-8" />
        <path d="M84 77l3 4m-6 6 4 1" strokeOpacity=".4" />
      </>;
    case 'timing-belt':
      return <>
        <path d="M31 40a22 22 0 0 1 38-22l34 39a15 15 0 0 1-18 23L43 60a22 22 0 0 1-12-20Z" fill="var(--part-fill)" />
        <path d="M35 40a18 18 0 0 1 31-19l34 39a11 11 0 0 1-13 17L45 56a18 18 0 0 1-10-16Z" />
        <path d={gearOutline(53, 38, 15, 12)} strokeWidth="1.5" />
        <path d={gearOutline(92, 66, 9, 8)} strokeWidth="1.5" />
        <circle cx="53" cy="38" r="5" /><circle cx="92" cy="66" r="3" />
        <path d="m71 33 4-3m1 9 4-3m1 9 4-3M53 57l-2 4m9-1-2 4m9-1-2 4m9-1-2 4" strokeWidth="1.5" />
      </>;
    case 'oil-filter':
      return <>
        <path d="M42 23v47c0 8 46 8 46 0V23" fill="var(--part-fill)" />
        <ellipse cx="65" cy="23" rx="23" ry="8" fill="var(--part-fill)" />
        <ellipse cx="65" cy="23" rx="7" ry="3" />
        <path d="M48 33v31m8-29v33m9-32v33m9-34v33m8-35v31" strokeOpacity=".45" />
        <path d="M43 69c10 7 34 7 44 0M43 74c10 7 34 7 44 0" strokeOpacity=".55" />
        <path d="M47 23h3m30 0h3m-26-5h3m10 0h3m-16 10h3m10 0h3" strokeWidth="1.5" />
      </>;
    case 'clutch':
      return <>
        <circle cx="65" cy="48" r="33" fill="var(--part-fill)" /><circle cx="65" cy="48" r="24" />
        {Array.from({ length: 8 }, (_, index) => <path key={index} d="M65 15v9m-8-7v4" transform={`rotate(${index * 45} 65 48)`} strokeOpacity=".6" />)}
        <circle cx="65" cy="48" r="11" /><path d={gearOutline(65, 48, 5, 8)} strokeWidth="1.3" />
        {[0, 90, 180, 270].map(angle => <g key={angle} transform={`rotate(${angle} 65 48)`}>
          <rect x="60" y="28" width="10" height="7" rx="2" fill="var(--part-fill)" />
          <path d="M63 29v5m4-5v5" strokeWidth="1.2" />
        </g>)}
      </>;
    case 'gearbox':
      return <>
        <path d="M26 23h40l9 9h23l8 10v24l-9 9H43L26 63Z" fill="var(--part-fill)" />
        <path d="M26 40H15v12h11m80-4h10v11h-10M40 24v-9h14v9M39 76v7m50-8v8" />
        <path d={gearOutline(53, 44, 15, 12)} strokeWidth="1.5" />
        <path d={gearOutline(82, 58, 12, 10)} strokeWidth="1.5" />
        <circle cx="53" cy="44" r="5" /><circle cx="82" cy="58" r="4" />
      </>;
    case 'cv-joint':
      return <>
        <path d="M16 42h15v12H16zM97 43h17v11H97z" fill="var(--part-fill)" />
        <path d="M51 45h29v7H51z" fill="var(--part-fill)" />
        <path d="M30 36h7l3-5h7l4 9v17l-4 10h-7l-3-6h-7z" fill="var(--part-fill)" />
        <path d="M97 33h-7l-4 5h-6v21h6l4 5h7Z" fill="var(--part-fill)" />
        <path d="M35 37v23m6-25v28m6-24v20m37-20v18m6-22v26m6-26v26" strokeOpacity=".65" />
        <path d="M20 43v10m5-10v10m83-9v8" strokeWidth="1.2" />
      </>;
    case 'brake-pad':
      return <>
        <path d="M27 61c4-27 21-40 38-40s34 13 38 40l-7 8H34Z" fill="var(--part-fill)" />
        <path d="M34 60c5-20 17-31 31-31s26 11 31 31l-4 3H38Z" />
        <path d="M29 44h-9v13h8m73-13h9v13h-8M63 31v30m4-30v30" />
        <path d="M37 74h56M48 37l5 10m29-10-5 10" strokeOpacity=".35" />
      </>;
    case 'brake-disc':
      return <>
        <circle cx="65" cy="48" r="34" fill="var(--part-fill)" /><circle cx="65" cy="48" r="29" strokeOpacity=".45" />
        <circle cx="65" cy="48" r="14" /><circle cx="65" cy="48" r="7" />
        {[0, 72, 144, 216, 288].map(angle => <g key={angle} transform={`rotate(${angle} 65 48)`}>
          <circle cx="65" cy="37" r="1.6" fill="currentColor" stroke="none" />
          <path d="M60 24l7-2m-7 6 7-2" strokeWidth="1.5" strokeOpacity=".6" />
        </g>)}
        {Array.from({ length: 16 }, (_, index) => <path key={index} d="M65 14v4" transform={`rotate(${index * 22.5} 65 48)`} strokeWidth="1.2" strokeOpacity=".5" />)}
      </>;
    case 'brake-fluid':
      return <>
        <path d="M49 22h32v8H49z" fill="var(--part-fill)" />
        <path d="M47 30h36l7 10-4 28H44l-4-28Z" fill="var(--part-fill)" />
        <path d="M43 47h44m-36-11h9m-9 25h9" strokeOpacity=".45" />
        <path d="M52 69v11h10V69m13 0v11h-9V69" />
        <path d="M57 79H31m38 0h30M65 38c-4 5-6 7-6 10a6 6 0 0 0 12 0c0-3-2-5-6-10Z" />
      </>;
    case 'shock-absorber':
      return <>
        <circle cx="65" cy="14" r="6" /><path d="M62 20v20h6V20" />
        <rect x="56" y="39" width="18" height="31" rx="3" fill="var(--part-fill)" />
        <path d="M53 39h24M56 47h18m-12 2v16m3 5v8" strokeOpacity=".6" />
        <circle cx="65" cy="84" r="6" />
        <path d="M64 11h2m-2 73h2" strokeWidth="1.5" />
      </>;
    case 'spring':
      return <>
        <path d="M48 17h30c9 0 9 8 0 11L49 38c-9 3-9 11 0 11h29c9 0 9 8 0 11L49 70c-9 3-9 11 0 11h30" />
        <path d="M48 17c-9 0-9 8 0 11l31 10c9 3 9 11 0 11H49c-9 0-9 8 0 11l30 10c9 3 9 11 0 11" strokeOpacity=".35" />
        <path d="M48 28h30M49 70h30" strokeOpacity=".2" />
      </>;
    case 'tire':
      return <>
        <circle cx="65" cy="48" r="35" fill="var(--part-fill)" /><circle cx="65" cy="48" r="26" /><circle cx="65" cy="48" r="20" strokeOpacity=".45" />
        {[0, 72, 144, 216, 288].map(angle => <path key={angle} d="M62 41 57 31h9l2 9" transform={`rotate(${angle} 65 48)`} fill="var(--part-fill)" />)}
        <circle cx="65" cy="48" r="7" />
        {Array.from({ length: 16 }, (_, index) => <path key={index} d="M62 14l3 4" transform={`rotate(${index * 22.5} 65 48)`} strokeWidth="1.4" strokeOpacity=".5" />)}
      </>;
    case 'battery':
      return <>
        <rect x="29" y="29" width="73" height="49" rx="5" fill="var(--part-fill)" />
        <path d="M29 40h73M40 29v-9h13v9m25 0v-9h13v9M43 50v13m-6-6h12m31 0h12M64 48l-7 13h10l-4 12 14-17H67l5-8" />
      </>;
    case 'alternator':
      return <>
        <path d="M42 28v-9h13v5m29 43 10 10-8 8-12-12M33 49H23V37h11" fill="var(--part-fill)" />
        <circle cx="65" cy="48" r="28" fill="var(--part-fill)" />
        <circle cx="65" cy="48" r="20" strokeOpacity=".5" />
        {[0, 60, 120, 180, 240, 300].map(angle => <path key={angle} d="M62 23v7m6-7v7M58 34l5 6" transform={`rotate(${angle} 65 48)`} strokeWidth="1.6" />)}
        <circle cx="65" cy="48" r="11" /><circle cx="65" cy="48" r="5" />
        <circle cx="48" cy="17" r="2" stroke="none" fill="currentColor" />
      </>;
    case 'starter':
      return <>
        <rect x="24" y="37" width="59" height="31" rx="7" fill="var(--part-fill)" />
        <path d="M32 37v31m43-31v31M40 37V25h33v12M44 25v-6h8v6m14 12v-6m-28 14h26m-26 8h26" strokeOpacity=".6" />
        <path d="M83 43h13v19H83m13-15h13v11H96" fill="var(--part-fill)" />
        <path d="M99 44v17m4-17v17m4-17v17M34 68v8h11v-8m27 0v8h11v-9" />
      </>;
    case 'radiator':
      return <>
        <rect x="29" y="21" width="71" height="56" rx="4" fill="var(--part-fill)" />
        <path d="M38 22v54m53-54v54M29 32H18v13m82 18h13V49M55 21v-7h19v7" />
        {Array.from({ length: 9 }, (_, index) => <path key={index} d={`M40 ${28 + index * 5}h49`} strokeWidth="1.2" strokeOpacity=".5" />)}
        <path d="M47 25v47m9-47v47m9-47v47m9-47v47m9-47v47" strokeWidth="1" strokeOpacity=".25" />
      </>;
    case 'water-pump':
      return <>
        <path d="M60 20h20l5 9 14 8v16l-13 5-9 18H51L32 61V37l17-9Z" fill="var(--part-fill)" />
        <path d="M33 42H19v13h14m57-22 11-10 8 8-10 11" />
        <circle cx="65" cy="48" r="22" /><circle cx="65" cy="48" r="6" />
        {[0, 60, 120, 180, 240, 300].map(angle => <path key={angle} d="M68 42q12 0 10-10M67 41l-1-13" transform={`rotate(${angle} 65 48)`} strokeWidth="1.5" />)}
        <circle cx="53" cy="24" r="2" /><circle cx="91" cy="43" r="2" /><circle cx="54" cy="71" r="2" />
      </>;
    case 'thermostat':
      return <>
        <path d="M39 28h52v7H39z" fill="var(--part-fill)" />
        <path d="M47 27c0-15 36-15 36 0m-32 9 4 35h20l4-35M59 70v10h12V70" />
        <path d="M57 41h17l-17 6 17 6-17 6 17 6H57" />
        <path d="M65 23v17m-12 6h-8m32 0h8M61 81h8" strokeOpacity=".5" />
        <path d="M35 36h60" strokeOpacity=".35" />
      </>;
    default:
      return <>
        <path d="M34 37h61v39H34z" fill="var(--part-fill)" />
        <path d="M28 30h73v12H28zM45 21h38v9M48 16v5m12-5v5m12-5v5m12-5v5M34 50H23v20h11m61-18h12v15H95M43 47v21m13-21v21m13-21v21m13-21v21M43 76v7h45v-7M23 60h-7m91 0h8" />
      </>;
  }
}

export default function PartSketch({ system, partId }: PartSketchProps) {
  return <svg viewBox="0 0 130 95" fill="none" aria-hidden="true">
    <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <PartShape id={partId ?? primaryPart[system]} />
    </g>
  </svg>;
}
