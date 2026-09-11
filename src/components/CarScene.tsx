import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import './car-scene.css';

type View = 'perspective' | 'side' | 'top';
type Vec = [number, number, number];
interface Props {
  activeSystem: string;
  selectedPart: string;
  onSelectPart: (id: string) => void;
  bodyVisible: boolean;
  autoRotate?: boolean;
  view?: View;
  zoomDelta?: number;
  resetKey?: number;
}
interface Pin { id: string; label: string; position: Vec; offset: [number, number]; system: string }
const PINS: Pin[] = [
  { id: 'engine', label: 'Motor', position: [-1.52, 1.06, 0], offset: [-47, -58], system: 'engine' },
  { id: 'battery', label: 'Bateria', position: [-1.28, 1.02, -.65], offset: [8, -57], system: 'electrical' },
  { id: 'gearbox', label: 'Câmbio', position: [-.67, .63, .24], offset: [-8, 64], system: 'transmission' },
  { id: 'brake-disc', label: 'Freios', position: [-1.68, .49, 1.04], offset: [-48, 39], system: 'brakes' },
  { id: 'shock-absorber', label: 'Suspensão', position: [1.67, .81, .79], offset: [48, -50], system: 'suspension' },
  { id: 'radiator', label: 'Radiador', position: [-2.22, .74, -.05], offset: [-35, -42], system: 'cooling' },
  { id: 'spark-plug', label: 'Velas', position: [-1.53, 1.2, .13], offset: [42, -44], system: 'engine' },
  { id: 'timing-belt', label: 'Correia', position: [-1.53, .82, .49], offset: [-55, 42], system: 'engine' },
  { id: 'clutch', label: 'Embreagem', position: [-.93, .6, 0], offset: [-64, -38], system: 'transmission' },
  { id: 'cv-joint', label: 'Semieixo', position: [-1.67, .48, .63], offset: [30, 50], system: 'transmission' },
  { id: 'brake-pad', label: 'Pastilhas', position: [-1.61, .64, 1.11], offset: [40, -48], system: 'brakes' },
  { id: 'brake-fluid', label: 'Fluido de freio', position: [-.77, 1.03, -.64], offset: [25, -55], system: 'brakes' },
  { id: 'spring', label: 'Mola', position: [-1.67, .81, .78], offset: [-15, -55], system: 'suspension' },
  { id: 'tire', label: 'Pneu', position: [1.68, .48, 1.15], offset: [35, 39], system: 'suspension' },
  { id: 'alternator', label: 'Alternador', position: [-1.97, .64, .47], offset: [-35, 45], system: 'electrical' },
  { id: 'water-pump', label: 'Bomba d’água', position: [-1.97, .63, -.39], offset: [20, 45], system: 'cooling' },
  { id: 'thermostat', label: 'Válvula termostática', position: [-1.86, .89, -.42], offset: [45, -46], system: 'cooling' },
];

const CAMERA: Record<View, Vec> = { perspective: [-6.4, 4.5, 6.2], side: [.01, 1.45, 8.4], top: [-.01, 9, .001] };
const COLORS = { engine: '#c5653b', transmission: '#729fa2', brakes: '#d07843', suspension: '#9588ad', electrical: '#c4a35a', cooling: '#699cae', metal: '#bcc6ca', dark: '#354044', rubber: '#343c3d', body: '#b7cbd0' };

/** A deliberately generic, front-engine teaching model. Coordinates locate functions,
 * not the service points of a particular manufacturer's vehicle. */
export default function CarScene({ activeSystem, selectedPart, onSelectPart, bodyVisible, autoRotate = false, view = 'perspective', zoomDelta = 0, resetKey = 0 }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const pinElements = useRef(new Map<string, HTMLButtonElement>());
  const props = useRef({ activeSystem, selectedPart, onSelectPart, bodyVisible, autoRotate, view });
  props.current = { activeSystem, selectedPart, onSelectPart, bodyVisible, autoRotate, view };
  const control = useRef<{ appearance: () => void; camera: (view: View, reset?: boolean) => void; zoom: (amount: number) => void } | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [ready, setReady] = useState(false);
  const lastZoom = useRef(zoomDelta);
  const shownPins = activeSystem === 'all' ? PINS.slice(0, 5) : PINS.filter(p => p.system === activeSystem).slice(0, 3);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' }); }
    catch { setUnavailable(true); return; }
    const scene = new THREE.Scene();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    element.prepend(renderer.domElement);
    renderer.domElement.setAttribute('aria-label', 'Maquete tridimensional de um carro com peças exploráveis. Arraste para girar e use os botões com nomes das peças para explorar.');
    renderer.domElement.setAttribute('role', 'img');
    const camera = new THREE.OrthographicCamera(-4, 4, 2.5, -2.5, .1, 60);
    camera.position.set(...CAMERA[props.current.view]);
    const orbit = new OrbitControls(camera, renderer.domElement);
    renderer.domElement.style.touchAction = 'pan-y';
    orbit.target.set(0, .7, 0);
    orbit.enableDamping = true;
    orbit.dampingFactor = .075;
    orbit.enablePan = false;
    orbit.minZoom = .7;
    orbit.maxZoom = 1.75;
    orbit.minPolarAngle = .025;
    orbit.maxPolarAngle = Math.PI / 2.04;
    orbit.autoRotateSpeed = .6;
    orbit.enableZoom = false; // Page scroll remains a page scroll. Explicit controls zoom the exhibit.
    orbit.update();
    const car = new THREE.Group();
    scene.add(car);
    const pickables: THREE.Mesh[] = [];
    const appearances: { mesh: THREE.Mesh; material: THREE.MeshStandardMaterial; opacity: number; system: string; part: string }[] = [];
    const bodyItems: THREE.Object3D[] = [];

    const mat = (color: string, metalness = .25, roughness = .44, opacity = 1) => new THREE.MeshStandardMaterial({ color, metalness, roughness, transparent: true, opacity, depthWrite: opacity > .5 });
    function solid(geometry: THREE.BufferGeometry, position: Vec, color: string, system = '', part = '', options: { opacity?: number; metalness?: number; roughness?: number; rotation?: Vec; body?: boolean } = {}) {
      const material = mat(color, options.metalness ?? .32, options.roughness ?? .46, options.opacity ?? 1);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      if (options.rotation) mesh.rotation.set(...options.rotation);
      mesh.castShadow = (options.opacity ?? 1) > .5;
      mesh.receiveShadow = true;
      mesh.userData.part = part;
      mesh.userData.system = system;
      car.add(mesh);
      if (part) pickables.push(mesh);
      if (options.body) bodyItems.push(mesh);
      else appearances.push({ mesh, material, opacity: options.opacity ?? 1, system, part });
      return mesh;
    }
    const box = (size: Vec, position: Vec, color: string, system = '', part = '', radius = .045, options = {}) => solid(new RoundedBoxGeometry(...size, 6, Math.min(radius, Math.min(...size) / 2)), position, color, system, part, options);
    const cyl = (radius: number, length: number, position: Vec, color: string, system = '', part = '', axis: 'x' | 'y' | 'z' = 'y', options = {}) => solid(new THREE.CylinderGeometry(radius, radius, length, 32), position, color, system, part, { rotation: axis === 'z' ? [Math.PI / 2, 0, 0] as Vec : axis === 'x' ? [0, 0, Math.PI / 2] as Vec : [0, 0, 0] as Vec, ...options });
    const torus = (radius: number, tube: number, position: Vec, color: string, system = '', part = '', options = {}) => solid(new THREE.TorusGeometry(radius, tube, 18, 48), position, color, system, part, options);
    function tube(points: Vec[], radius: number, color: string, system = '', part = '', options = {}) {
      const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
      return solid(new THREE.TubeGeometry(curve, Math.max(12, points.length * 6), radius, 8, false), [0, 0, 0], color, system, part, options);
    }
    function line(points: Vec[], color = '#839ca3', opacity = .4, body = true) {
      const geometry = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(...p)));
      const mesh = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
      car.add(mesh);
      if (body) bodyItems.push(mesh);
      return mesh;
    }
    function panel(points: Vec[], opacity = .1) {
      const vertices: number[] = [];
      for (let i = 1; i < points.length - 1; i++) vertices.push(...points[0], ...points[i], ...points[i + 1]);
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.computeVertexNormals();
      const mesh = solid(geometry, [0, 0, 0], COLORS.body, '', '', { opacity, body: true, metalness: .2, roughness: .25 });
      (mesh.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
      return mesh;
    }

    // Longitudinal frame, subframes and floor. Cutouts preserve visibility of the drivetrain.
    for (const z of [-.64, .64]) {
      box([4.6, .14, .14], [0, .38, z], '#9aa9ac', '', '', .035);
      box([2.48, .07, .54], [.38, .42, z * .63], '#aebbbd', '', '', .02, { opacity: .74 });
    }
    for (const x of [-1.66, -.75, .6, 1.67]) box([.13, .12, 1.62], [x, .4, 0], '#a3b1b4', '', '', .025);
    box([.78, .15, 1.63], [1.78, .49, 0], '#9caaad', '', '', .035);
    box([1.22, .1, .24], [.43, .52, 0], '#9cabad', 'transmission', 'gearbox');
    // Exhaust: warm steel, muffler and a visible tailpipe.
    tube([[-1.5, .5, -.3], [-1, .3, -.29], [-.4, .28, -.16], [.6, .28, -.23], [1.75, .3, -.32], [2.57, .33, -.46]], .047, '#a29885', 'engine', 'exhaust');
    box([.74, .2, .4], [1.58, .29, -.35], '#b6b3a9', 'engine', 'exhaust', .1);

    // Four complete wheels, each with a tread crown, sidewalls, spokes, hub and ventilated disc.
    for (const x of [-1.68, 1.68]) for (const side of [-1, 1]) {
      const z = side * 1.01;
      torus(.345, .135, [x, .49, z], COLORS.rubber, 'suspension', 'tire', { roughness: .93, metalness: 0 });
      cyl(.426, .21, [x, .49, z], COLORS.rubber, 'suspension', 'tire', 'z', { roughness: .92, metalness: .03 });
      for (const edge of [-1, 1]) torus(.342, .036, [x, .49, z + edge * .116], '#4f5758', 'suspension', 'tire', { roughness: .87 });
      // Fine, separate radial grooves give the rubber its physical scale.
      for (let i = 0; i < 40; i++) {
        const a = i * Math.PI * 2 / 40;
        box([.022, .017, .235], [x + Math.sin(a) * .472, .49 + Math.cos(a) * .472, z], '#535b5b', 'suspension', 'tire', .004, { rotation: [0, 0, -a] });
      }
      const outer = z + side * .138;
      cyl(.286, .026, [x, .49, outer - side * .04], '#3d494d', 'suspension', 'tire', 'z');
      torus(.28, .025, [x, .49, outer], '#d0d6d6', 'suspension', 'tire', { metalness: .75, roughness: .25 });
      torus(.252, .008, [x, .49, outer + side * .012], '#89979a', 'suspension', 'tire');
      for (let i = 0; i < 5; i++) {
        const a = i * Math.PI * 2 / 5;
        for (const delta of [-.045, .045]) {
          const spoke = box([.04, .21, .032], [x + Math.sin(a + delta) * .15, .49 + Math.cos(a + delta) * .15, outer], '#bbc6c8', 'suspension', 'tire', .012, { metalness: .8, roughness: .3 });
          spoke.rotation.z = -a - delta;
        }
      }
      cyl(.076, .055, [x, .49, outer + side * .025], '#ced5d4', 'suspension', 'tire', 'z');
      cyl(.033, .06, [x, .49, outer + side * .03], '#687a80', 'suspension', 'tire', 'z');
      // Lug bolts, offset from the spokes so they read as a separate ring on the hub face.
      for (let i = 0; i < 5; i++) {
        const a = i * Math.PI * 2 / 5 + Math.PI / 5;
        cyl(.013, .022, [x + Math.sin(a) * .1, .49 + Math.cos(a) * .1, outer + side * .033], '#4d5555', 'suspension', '', 'z');
      }
      const discZ = z - side * .145;
      cyl(.256, .035, [x, .49, discZ], '#c0c7c7', 'brakes', 'brake-disc', 'z', { metalness: .83, roughness: .3 });
      torus(.224, .009, [x, .49, discZ + side * .022], '#8f9b9e', 'brakes', 'brake-disc');
      for (let i = 0; i < 14; i++) {
        const a = i * Math.PI * 2 / 14;
        cyl(.009, .039, [x + Math.sin(a) * .19, .49 + Math.cos(a) * .19, discZ], '#768387', 'brakes', 'brake-disc', 'z');
      }
      box([.14, .27, .125], [x + .19, .54, discZ], COLORS.brakes, 'brakes', 'brake-pad', .045);
      // A wishbone, strut and wound coil on the inboard face of every wheel.
      tube([[x - .27, .39, side * .41], [x, .43, side * .84], [x + .25, .39, side * .42]], .036, '#88969c', 'suspension', 'shock-absorber');
      cyl(.04, .6, [x, .7, side * .78], '#b9c4c8', 'suspension', 'shock-absorber');
      cyl(.067, .25, [x, .65, side * .78], COLORS.suspension, 'suspension', 'shock-absorber');
      const spring: Vec[] = [];
      for (let i = 0; i <= 120; i++) {
        const a = i / 120 * Math.PI * 12;
        spring.push([x + Math.cos(a) * .086, .71 + i / 120 * .27, side * .78 + Math.sin(a) * .086]);
      }
      tube(spring, .018, COLORS.suspension, 'suspension', 'spring');
      cyl(.112, .032, [x, .995, side * .78], '#879499', 'suspension', 'shock-absorber');
      cyl(.05, .95, [x, .46, side * .45], '#7f8f95', x < 0 ? 'transmission' : 'suspension', x < 0 ? 'cv-joint' : 'shock-absorber', 'z');
      if (x < 0) {
        for (let i = 0; i < 5; i++) cyl(.084 - i * .005, .028, [x, .46, side * (.61 + i * .028)], '#414d50', 'transmission', 'cv-joint', 'z');
      }
    }

    // Cast engine block, copper cylinder head, plugs and individual intake runners.
    box([.94, .43, .69], [-1.49, .71, 0], '#aab4b4', 'engine', 'engine', .075);
    box([1.01, .25, .76], [-1.49, 1.01, 0], COLORS.engine, 'engine', 'engine', .085);
    box([.79, .045, .4], [-1.49, 1.155, 0], '#d4865e', 'engine', 'engine', .02);
    for (let i = 0; i < 4; i++) {
      const x = -1.84 + i * .232;
      cyl(.081, .27, [x, .82, .335], '#c9cecc', 'engine', 'engine', 'y');
      cyl(.028, .085, [x, 1.207, .105], '#e4e3d9', 'engine', 'spark-plug');
      cyl(.017, .05, [x, 1.268, .105], '#586970', 'engine', 'spark-plug');
      tube([[x, 1.28, .1], [x, 1.28, -.05], [-1.02, 1.22, -.23]], .013, '#374748', 'engine', 'spark-plug');
      tube([[x, .96, -.36], [x, .92, -.51], [x, .74, -.5], [-1.7, .57, -.36]], .036, '#b79e82', 'engine', 'engine');
      box([.025, .23, .012], [x, .73, .356], '#6e7a7a', 'engine', 'engine', .005);
    }
    cyl(.055, .045, [-1.17, 1.176, -.18], '#394748', 'engine', 'oil-filter');
    cyl(.075, .16, [-1.83, .57, .37], '#ded7c8', 'engine', 'oil-filter', 'y');
    // A small breather hose off the valve cover — a generic, decorative accessory line.
    tube([[-1.32, 1.16, .16], [-1.16, 1.04, .2], [-1.04, .89, .17]], .012, '#3a4444', 'engine');
    // Two timing pulleys joined by a continuous belt, deliberately exposed for teaching.
    for (const [x, y, r] of [[-1.75, .96, .13], [-1.4, .65, .105]]) {
      cyl(r, .04, [x, y, .445], '#667b80', 'engine', 'timing-belt', 'z');
      torus(r, .018, [x, y, .478], '#363e3c', 'engine', 'timing-belt');
      cyl(.039, .048, [x, y, .463], '#bdc5c3', 'engine', 'timing-belt', 'z');
    }
    tube([[-1.82, 1.06, .476], [-1.85, .88, .476], [-1.48, .58, .476], [-1.33, .61, .476], [-1.32, .72, .476], [-1.67, 1.05, .476], [-1.82, 1.06, .476]], .018, '#37413f', 'engine', 'timing-belt');

    // The engine's power passes through the clutch housing, gearbox and front axle.
    cyl(.25, .22, [-.96, .65, .05], '#8aa4a7', 'transmission', 'clutch', 'x');
    torus(.208, .024, [-.84, .65, .05], '#c6d1d0', 'transmission', 'clutch', { rotation: [0, Math.PI / 2, 0] });
    box([.59, .34, .44], [-.62, .62, .05], COLORS.transmission, 'transmission', 'gearbox', .075);
    for (let i = 0; i < 5; i++) box([.028, .365, .465], [-.83 + i * .105, .62, .05], '#93b1b2', 'transmission', 'gearbox', .01);
    tube([[-.61, .75, .01], [-.33, .61, 0], [.04, .71, 0], [.04, .91, 0]], .022, '#83989b', 'transmission', 'gearbox');
    cyl(.045, .07, [.04, .97, 0], '#263b3d', 'transmission', 'gearbox');

    // Radiator fins, fan and a closed pair of cooling hoses.
    box([.13, .57, 1.1], [-2.17, .76, 0], COLORS.cooling, 'cooling', 'radiator', .025);
    for (let i = 0; i < 17; i++) box([.015, .49, .017], [-2.244, .76, -.49 + i * .061], '#aec3c7', 'cooling', 'radiator', .005);
    for (const y of [.47, 1.055]) box([.17, .06, 1.12], [-2.17, y, 0], '#506f7a', 'cooling', 'radiator', .018);
    const fan = new THREE.Group();
    fan.position.set(-2.07, .76, 0);
    car.add(fan);
    for (let i = 0; i < 7; i++) {
      const blade = new THREE.Mesh(new RoundedBoxGeometry(.025, .2, .07, 2, .02), mat('#829ca3', .2, .55));
      const a = i * Math.PI * 2 / 7;
      blade.position.set(0, Math.cos(a) * .14, Math.sin(a) * .14);
      blade.rotation.x = a;
      blade.userData.part = 'radiator';
      blade.userData.system = 'cooling';
      pickables.push(blade);
      appearances.push({ mesh: blade, material: blade.material, opacity: 1, system: 'cooling', part: 'radiator' });
      fan.add(blade);
    }
    cyl(.055, .04, [-2.04, .76, 0], '#4f6d76', 'cooling', 'radiator', 'x');
    tube([[-2.13, .98, -.39], [-1.98, 1.02, -.51], [-1.8, .98, -.45], [-1.82, .81, -.32]], .043, '#547c86', 'cooling', 'thermostat');
    tube([[-2.12, .51, .39], [-1.98, .48, .48], [-1.8, .5, .45], [-1.77, .62, .32]], .045, '#547c86', 'cooling', 'water-pump');
    cyl(.094, .11, [-1.94, .64, -.38], '#7898a2', 'cooling', 'water-pump', 'x');

    // Electrical components and routes. Yellow is reserved for electrical energy.
    box([.47, .28, .31], [-1.26, .9, -.68], '#c0a664', 'electrical', 'battery', .035);
    box([.48, .045, .32], [-1.26, 1.056, -.68], '#4e5550', 'electrical', 'battery', .012);
    for (const x of [-1.41, -1.1]) cyl(.028, .045, [x, 1.09, -.68], x < -1.2 ? '#ca7150' : '#a6aea6', 'electrical', 'battery');
    tube([[-1.41, 1.12, -.68], [-1.53, 1.12, -.64], [-1.73, 1.04, -.61], [-1.94, .69, -.43]], .014, '#a8764e', 'electrical', 'battery');
    cyl(.113, .22, [-1.99, .64, .4], '#baa779', 'electrical', 'alternator', 'z');
    for (let i = 0; i < 6; i++) cyl(.115, .012, [-1.99, .64, .31 + i * .033], '#8a9389', 'electrical', 'alternator', 'z');
    cyl(.069, .2, [-1.03, .49, -.3], '#b89e62', 'electrical', 'starter', 'x');
    box([.16, .17, .18], [-.78, .98, -.62], '#d5d4ba', 'brakes', 'brake-fluid', .03, { opacity: .9 });
    cyl(.065, .028, [-.78, 1.08, -.62], '#585f5a', 'brakes', 'brake-fluid');

    // Cabin: sculpted seats, center console, dashboard and an actual steering wheel.
    box([.25, .42, 1.57], [-.74, .94, 0], '#7e9296', '', '', .07, { opacity: .75 });
    box([.18, .05, 1.58], [-.78, 1.19, 0], '#485c62', '', '', .025, { opacity: .8 });
    for (const z of [-.46, .46]) {
      box([.61, .13, .53], [.12, .68, z], '#82999c', '', '', .055);
      const back = box([.14, .57, .52], [.43, .98, z], '#9bafb0', '', '', .065);
      back.rotation.z = -.14;
      box([.13, .16, .29], [.49, 1.365, z], '#718c90', '', '', .05);
      for (let i = 0; i < 4; i++) box([.014, .016, .34], [-.07 + i * .12, .751, z], '#b4c3c2', '', '', .005);
      for (const zz of [-.24, .24]) box([.54, .08, .055], [.12, .76, z + zz], '#69878d', '', '', .025);
    }
    box([.55, .14, 1.35], [1.18, .71, 0], '#95a9aa', '', '', .06);
    box([.13, .49, 1.34], [1.47, 1, 0], '#a8b9b9', '', '', .06);
    for (const z of [-.46, .46]) box([.12, .14, .3], [1.5, 1.33, z], '#839c9f', '', '', .045);
    box([.56, .23, .17], [.1, .6, 0], '#778f93', '', '', .035);
    const steering = torus(.17, .018, [-.4, 1.18, .47], '#455e63', 'suspension', 'steering', { rotation: [0, Math.PI / 2 - .5, 0] });
    tube([[-.43, 1.17, .47], [-.71, .99, .47]], .03, '#849b9e');
    for (let i = 0; i < 3; i++) {
      const a = i * Math.PI * 2 / 3;
      const spoke = new THREE.Mesh(new THREE.CylinderGeometry(.009, .009, .15, 8), mat('#82979b'));
      spoke.position.set(Math.cos(a) * .075, Math.sin(a) * .075, 0);
      spoke.rotation.z = a - Math.PI / 2;
      steering.add(spoke);
    }

    // The ghost shell is authored from automotive proportions, with curved sill and roof rails.
    const outline: Vec[] = [[-2.53, .58, .78], [-2.43, .88, .84], [-2.05, 1.02, .88], [-1.18, 1.02, .9], [-.62, 1.65, .73], [-.35, 1.76, .72], [.76, 1.76, .73], [1.12, 1.58, .78], [1.59, 1.03, .89], [2.18, .99, .87], [2.47, .79, .82], [2.5, .58, .8]];
    for (const sign of [-1, 1]) {
      const side = outline.map(([x, y, z]) => [x, y, z * sign] as Vec);
      tube(side, .014, '#8da8b0', '', '', { opacity: .4, body: true, metalness: .45 });
      // A-pillar, B-pillar and C-pillar frame the cabin without concealing it.
      tube([[-1.18, 1.02, .9 * sign], [-.62, 1.65, .73 * sign], [-.35, 1.76, .72 * sign]], .025, '#bacdd1', '', '', { opacity: .4, body: true });
      tube([[.52, .91, .94 * sign], [.48, 1.76, .74 * sign]], .024, '#b8cdd1', '', '', { opacity: .38, body: true });
      tube([[1.58, 1.01, .89 * sign], [1.11, 1.58, .78 * sign], [.76, 1.76, .73 * sign]], .035, '#b0c5cc', '', '', { opacity: .32, body: true });
      tube([[-1.13, .94, .95 * sign], [-.3, .96, .97 * sign], [.7, .96, .98 * sign], [1.57, .98, .93 * sign]], .014, '#93aab0', '', '', { opacity: .42, body: true });
      tube([[-1.14, .36, .97 * sign], [-.2, .35, 1 * sign], [.8, .35, 1 * sign], [1.17, .4, .98 * sign]], .05, '#bdcdd0', '', '', { opacity: .47, body: true });
      panel([[-1.17, .93, .94 * sign], [-.59, 1.63, .744 * sign], [.47, 1.71, .752 * sign], [.51, .94, .975 * sign]], .055);
      panel([[.54, .95, .975 * sign], [.52, 1.71, .75 * sign], [.88, 1.67, .78 * sign], [1.52, 1.02, .91 * sign]], .055);
      panel([[-1.14, .87, .965 * sign], [.5, .93, .98 * sign], [.51, .39, .99 * sign], [-1.09, .4, .97 * sign]], .065);
      line([[.5, .94, .99 * sign], [.53, .4, 1 * sign]], '#8b9fa5', .32);
      box([.17, .025, .027], [.27, .87, .996 * sign], '#7b929a', '', '', .008, { opacity: .6, body: true });
      box([.17, .025, .027], [1.17, .9, .97 * sign], '#7b929a', '', '', .008, { opacity: .5, body: true });
      // Wheel arch splines make the translucent body unmistakably a car.
      for (const x of [-1.68, 1.68]) {
        const arch: Vec[] = [];
        for (let j = 0; j <= 22; j++) {
          const a = Math.PI * j / 22;
          arch.push([x - Math.cos(a) * .55, .47 + Math.sin(a) * .55, .99 * sign]);
        }
        tube(arch, .026, '#a8bdc3', '', '', { opacity: .54, body: true });
      }
      // Floating mirrors.
      tube([[-.91, 1.03, .9 * sign], [-.87, 1.01, 1.08 * sign]], .022, '#9cafb3', '', '', { opacity: .6, body: true });
      box([.22, .095, .12], [-.87, 1.025, 1.13 * sign], '#b7cacd', '', '', .04, { opacity: .58, body: true });
    }
    // Curved translucent bonnet, roof and boot, deliberately lighter than the anatomy.
    panel([[-2.38, .92, -.8], [-1.2, 1.055, -.9], [-1.2, 1.055, .9], [-2.38, .92, .8]], .085);
    panel([[-1.18, 1.05, -.89], [-.6, 1.665, -.72], [-.6, 1.665, .72], [-1.18, 1.05, .89]], .065);
    panel([[-.52, 1.72, -.73], [.75, 1.79, -.74], [.75, 1.79, .74], [-.52, 1.72, .73]], .095);
    for (const x of [-.49, .75]) tube([[x, 1.72, -.73], [x, 1.8, -.3], [x, 1.8, .3], [x, 1.72, .73]], .019, '#a7bdc4', '', '', { opacity: .4, body: true });
    panel([[.89, 1.68, -.76], [1.55, 1.06, -.89], [1.55, 1.06, .89], [.89, 1.68, .76]], .08);
    panel([[1.59, 1.025, -.89], [2.27, .93, -.82], [2.27, .93, .82], [1.59, 1.025, .89]], .1);
    for (const x of [-2.46, 2.44]) {
      box([.16, .22, 1.64], [x, .62, 0], '#b5c9ce', '', '', .075, { opacity: .48, body: true });
      tube([[x, .81, -.81], [x * 1.03, .83, -.3], [x * 1.03, .83, .3], [x, .81, .81]], .023, '#8ca4ad', '', '', { opacity: .55, body: true });
      for (const sign of [-1, 1]) box([.065, .1, .4], [x - .025, .79, .6 * sign], x < 0 ? '#e4edeb' : '#bb8f7d', '', '', .025, { opacity: .75, body: true });
    }
    box([.05, .16, .73], [-2.57, .61, 0], '#667f85', '', '', .028, { opacity: .55, body: true });
    for (let j = 0; j < 7; j++) box([.057, .011, .68], [-2.59, .555 + j * .019, 0], '#b0c3c7', '', '', .003, { opacity: .65, body: true });

    scene.add(new THREE.HemisphereLight('#f2f5f3', '#858c87', 2.25));
    const key = new THREE.DirectionalLight('#fff6eb', 3.5);
    key.position.set(-3.5, 7, 4.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: .5, far: 20 });
    key.shadow.bias = -.001;
    key.shadow.normalBias = .025;
    key.shadow.radius = 4;
    scene.add(key);
    const rim = new THREE.DirectionalLight('#e7f1f5', 2);
    rim.position.set(3, 4, -5);
    scene.add(rim);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: .13 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = .006;
    floor.receiveShadow = true;
    scene.add(floor);

    // Procedural environment, baked locally via PMREM (no HDR download — keeps the
    // "no runtime network calls" constraint) so metal, glass and rubber reflect
    // something instead of rendering as flat PBR color.
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnvironment = new RoomEnvironment();
    const envRenderTarget = pmremGenerator.fromScene(roomEnvironment, .04);
    scene.environment = envRenderTarget.texture;
    roomEnvironment.dispose();
    pmremGenerator.dispose();

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDown = { x: 0, y: 0 };
    const down = (event: PointerEvent) => { pointerDown = { x: event.clientX, y: event.clientY }; };
    const up = (event: PointerEvent) => {
      if (Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) > 7) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(pickables).filter(hit => (hit.object as THREE.Mesh).visible && (props.current.activeSystem === 'all' || hit.object.userData.system === props.current.activeSystem));
      if (hits[0]) props.current.onSelectPart(hits[0].object.userData.part as string);
    };
    renderer.domElement.addEventListener('pointerdown', down);
    renderer.domElement.addEventListener('pointerup', up);
    function appearance() {
      for (const object of bodyItems) object.visible = props.current.bodyVisible;
      for (const { material, opacity, system, part } of appearances) {
        const relevant = props.current.activeSystem === 'all' || system === props.current.activeSystem;
        material.opacity = relevant ? opacity : system ? .14 : .19;
        material.depthWrite = material.opacity > .5;
        material.emissive.set(part && part === props.current.selectedPart ? '#9f491d' : '#000000');
        material.emissiveIntensity = part === props.current.selectedPart ? .08 : 0;
      }
      orbit.autoRotate = props.current.autoRotate;
    }
    control.current = {
      appearance,
      camera(nextView, reset) {
        camera.position.set(...CAMERA[nextView]);
        orbit.target.set(0, .7, 0);
        if (reset) camera.zoom = 1;
        camera.updateProjectionMatrix();
        orbit.update();
      },
      zoom(amount) { camera.zoom = THREE.MathUtils.clamp(camera.zoom + amount * .13, .7, 1.75); camera.updateProjectionMatrix(); },
    };
    appearance();

    // A light ambient-occlusion pass gives contact shadow to reentrances (engine bay,
    // wheel wells) that direct lighting alone leaves flat. OutputPass carries the
    // renderer's tone mapping/color space to the end of the chain — it must stay last.
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const gtaoPass = new GTAOPass(scene, camera, 1, 1);
    gtaoPass.updateGtaoMaterial({ radius: .3, distanceExponent: 1, thickness: 1, scale: 1 });
    gtaoPass.blendIntensity = .65; // Subtle: a hint of depth, not a heavy darkening pass.
    composer.addPass(gtaoPass);
    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    let width = 1;
    let height = 1;
    // Read each label once after it mounts or the viewport/font changes. Orbiting
    // only updates the numeric layout; it never forces layout measurements.
    const pinSizes = new Map<string, { button: HTMLButtonElement; width: number; height: number }>();
    const clearPinSizes = () => pinSizes.clear();
    function resize() {
      if (!element) return;
      width = element.clientWidth;
      height = element.clientHeight;
      clearPinSizes();
      if (!width || !height) return;
      renderer.setSize(width, height);
      composer.setSize(width, height);
      const aspect = width / height;
      const vertical = aspect < 1.25 ? 5.8 / aspect : 4.05;
      camera.left = -vertical * aspect / 2;
      camera.right = vertical * aspect / 2;
      camera.top = vertical / 2;
      camera.bottom = -vertical / 2;
      camera.updateProjectionMatrix();
    }
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    document.fonts?.addEventListener('loadingdone', clearPinSizes);
    resize();
    let frame = 0;
    let running = true;
    let inView = true;
    const intersection = new IntersectionObserver(entries => { inView = entries[0]?.isIntersecting ?? true; });
    intersection.observe(element);
    const projected = new THREE.Vector3();
    function render() {
      if (!running) return;
      frame = requestAnimationFrame(render);
      if (!inView || document.hidden) return;
      orbit.update();
      const projectedPins: { pin: Pin; button: HTMLButtonElement; px: number; py: number; x: number; y: number; width: number; height: number }[] = [];
      // Finish the read phase before changing any button styles.
      for (const pin of PINS) {
        const button = pinElements.current.get(pin.id);
        if (!button) continue;
        projected.set(...pin.position).project(camera);
        if (projected.z > 1 || projected.z < -1) {
          button.style.visibility = 'hidden';
          continue;
        }
        const px = (projected.x * .5 + .5) * width;
        const py = (-projected.y * .5 + .5) * height;
        const compact = width < 500;
        const ox = pin.offset[0] * (compact ? .52 : 1);
        const oy = pin.offset[1] * (compact ? .64 : 1);
        let size = pinSizes.get(pin.id);
        if (!size || size.button !== button) {
          size = { button, width: button.offsetWidth, height: button.offsetHeight };
          pinSizes.set(pin.id, size);
        }
        projectedPins.push({ pin, button, px, py, x: px + ox, y: py + oy, width: size.width, height: size.height });
      }
      // Selected labels keep the position closest to their anchor. A bounded
      // greedy search places the others around them, including in top/side views.
      projectedPins.sort((a, b) => Number(b.pin.id === props.current.selectedPart) - Number(a.pin.id === props.current.selectedPart));
      const occupied: { left: number; right: number; top: number; bottom: number }[] = [];
      const gutter = 7;
      const edge = 8;
      for (const { button, px, py, x: preferredX, y: preferredY, width: labelWidth, height: labelHeight } of projectedPins) {
        const halfWidth = labelWidth / 2;
        const halfHeight = labelHeight / 2;
        const clampX = (value: number) => THREE.MathUtils.clamp(value, halfWidth + edge, Math.max(halfWidth + edge, width - halfWidth - edge));
        const clampY = (value: number) => THREE.MathUtils.clamp(value, halfHeight + edge, Math.max(halfHeight + edge, height - halfHeight - edge));
        const originX = clampX(preferredX);
        const originY = clampY(preferredY);
        const stepX = Math.max(34, labelWidth * .66);
        const stepY = labelHeight + gutter;
        const xs = [0, -1, 1, -2, 2].map(step => clampX(originX + step * stepX));
        const ys = [0, -1, 1, -2, 2, -3, 3].map(step => clampY(originY + step * stepY));
        // Exact rectangle edges avoid a near miss when two labels differ in width.
        for (const rect of occupied) {
          xs.push(clampX(rect.left - halfWidth - gutter), clampX(rect.right + halfWidth + gutter));
          ys.push(clampY(rect.top - halfHeight - gutter), clampY(rect.bottom + halfHeight + gutter));
        }
        let x = originX;
        let y = originY;
        let bestScore = Infinity;
        for (const candidateX of xs) for (const candidateY of ys) {
          let overlapArea = 0;
          for (const rect of occupied) {
            const overlapX = Math.max(0, Math.min(candidateX + halfWidth + gutter, rect.right) - Math.max(candidateX - halfWidth - gutter, rect.left));
            const overlapY = Math.max(0, Math.min(candidateY + halfHeight + gutter, rect.bottom) - Math.max(candidateY - halfHeight - gutter, rect.top));
            overlapArea += overlapX * overlapY;
          }
          const movement = (candidateX - originX) ** 2 + (candidateY - originY) ** 2;
          const leaderLength = (candidateX - px) ** 2 + (candidateY - py) ** 2;
          const score = (overlapArea > .01 ? 1e9 + overlapArea * 1e4 : 0) + movement + leaderLength * .08;
          if (score < bestScore) { bestScore = score; x = candidateX; y = candidateY; }
        }
        occupied.push({ left: x - halfWidth, right: x + halfWidth, top: y - halfHeight, bottom: y + halfHeight });
        button.style.left = `${x}px`;
        button.style.top = `${y}px`;
        button.style.setProperty('--pin-dx', `${px - x}px`);
        button.style.setProperty('--pin-dy', `${py - y}px`);
        button.style.setProperty('--pin-length', `${Math.hypot(px - x, py - y)}px`);
        button.style.setProperty('--pin-angle', `${Math.atan2(py - y, px - x)}rad`);
        button.style.visibility = 'visible';
      }
      composer.render();
    }
    render();
    setReady(true);
    const contextLost = (event: Event) => { event.preventDefault(); setUnavailable(true); };
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    return () => {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.fonts?.removeEventListener('loadingdone', clearPinSizes);
      intersection.disconnect();
      orbit.dispose();
      renderer.domElement.removeEventListener('pointerdown', down);
      renderer.domElement.removeEventListener('pointerup', up);
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse(object => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
          geometries.add(object.geometry);
          for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
        }
      });
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(material => material.dispose());
      envRenderTarget.dispose();
      gtaoPass.dispose();
      outputPass.dispose();
      composer.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      control.current = null;
    };
  }, []);

  useEffect(() => control.current?.appearance(), [activeSystem, selectedPart, bodyVisible, autoRotate]);
  useEffect(() => control.current?.camera(view), [view]);
  useEffect(() => control.current?.camera(view, true), [resetKey]); // A reset returns this view to its original framing.
  useEffect(() => { control.current?.zoom(zoomDelta - lastZoom.current); lastZoom.current = zoomDelta; }, [zoomDelta]);

  return <div className={`car-scene${ready ? ' car-scene--ready' : ''}${unavailable ? ' car-scene--fallback' : ''}`} ref={host}>
    {!unavailable && <div className="car-scene__pins" aria-label="Peças do carro">
      {shownPins.map(pin => <button
        key={pin.id}
        type="button"
        className={`car-pin${selectedPart === pin.id ? ' car-pin--selected' : ''}`}
        ref={element => { if (element) pinElements.current.set(pin.id, element); else pinElements.current.delete(pin.id); }}
        onClick={() => onSelectPart(pin.id)}
        aria-pressed={selectedPart === pin.id}
        aria-label={`Explorar ${pin.label.toLocaleLowerCase('pt-BR')}`}
      ><span className="car-pin__line" aria-hidden="true"/><span className="car-pin__point" aria-hidden="true"/><span className="car-pin__label">{pin.label}</span></button>)}
    </div>}
    {unavailable && <div className="car-fallback">
      <svg viewBox="0 0 500 190" role="img" aria-label="Esquema lateral de um carro: motor e radiador na frente, cabine no centro e suspensão junto às rodas">
        <path d="M42 127 50 87 123 75 171 28 308 28 355 75 444 89 462 126Z" fill="#e2eaeb" stroke="#879c9f" strokeWidth="2"/>
        <path d="m137 73 43-35h50v35Zm107-35h57l39 35h-96Z" fill="#f5f7f5"/>
        <rect x="65" y="91" width="69" height="36" rx="7" fill="#c5653b"/>
        <rect x="146" y="108" width="46" height="22" rx="5" fill="#729fa2"/>
        <rect x="47" y="88" width="10" height="40" rx="3" fill="#699cae"/>
        <circle cx="116" cy="133" r="31" fill="#414c4f"/><circle cx="116" cy="133" r="16" fill="#c4cece"/>
        <circle cx="384" cy="133" r="31" fill="#414c4f"/><circle cx="384" cy="133" r="16" fill="#c4cece"/>
      </svg>
      <p>A visualização 3D está indisponível neste navegador. Explore as peças abaixo.</p>
      <div className="car-fallback__parts">{shownPins.map(pin => <button key={pin.id} type="button" onClick={() => onSelectPart(pin.id)} aria-pressed={selectedPart === pin.id}>{pin.label}</button>)}</div>
    </div>}
  </div>;
}
