import { AmbientLight, BoxGeometry, Camera, Clock, Color, ColorRepresentation, Mesh, Object3D, PerspectiveCamera, PlaneGeometry, Scene, WebGLRenderer } from "three";
import { AnimateOptions, Renderer } from "../types";
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise.js";
import { FlatMaterial } from "./shaders";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { getWindowAspect } from "../util/helper";


export class MeshTest extends Renderer {
  _renderer: WebGLRenderer;
  _scenes: Map<string, Scene>;
  _cameras: Map<string, Camera>;
  _state: {
    clock: Clock,
    scene: string | undefined,
    camera: string | undefined
  }

  constructor() { 
    super(); 

    this._renderer = new WebGLRenderer();
    this._scenes = new Map<string, Scene>();
    this._cameras = new Map<string, Camera>();
    this._state = {
      clock: new Clock(),
      scene: undefined,
      camera: undefined
    }

    this._renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this._renderer.domElement);

    window.addEventListener('resize', () => {
      this._renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  public start() {
    const camera = new PerspectiveCamera(75, getWindowAspect(), 0.1, 1000);
    camera.position.z = 5;
    camera.position.y = 3;
    new OrbitControls(camera, this._renderer.domElement);
    this.addCamera("default_camera", camera);

    const scene = new Scene();
    const map = getTerrainMap();
    scene.add(map);
    scene.add(new AmbientLight(0xffffff, 5));
    this.addScene("default_scene", scene);

    const box = new Mesh(new BoxGeometry(), FlatMaterial(0x234567));
    box.position.set(0, 1, 0);
    scene.add(box);

    this._renderer.setAnimationLoop(() => {
      this.animate(this._state.clock.getDelta());
    });

    console.log("Map:", map);
  }

  public animate(delta: number, _options?: AnimateOptions): void {
    if(this._state.scene && this._state.camera) {
      this._renderer.render(this._scenes.get(this._state.scene)!, this._cameras.get(this._state.camera)!)
    }

    // on render
  }

  public addCamera(key: string, camera: Camera) {
    this._cameras.set(key, camera);
    this.setActiveCamera(key);
  }

  public setActiveCamera(key: string) {
    this._state = { ...this._state, camera: key };
  }

  public addScene(key: string, scene: Scene) {
    this._scenes.set(key, scene);
    this.setActiveScene(key);
  }

  public setActiveScene(key: string) {
    this._state = { ...this._state, scene: key };
  }
}

function getTerrainMap(width = 11, height = 11): Object3D {
  const obj = new Object3D();
  const half_w = Math.ceil(width / 2);
  const half_h = Math.ceil(height / 2);

  for(let x = half_w - width; x < half_w; x++) {
    for(let y = half_h - height; y < half_h; y++) {
      const value = 255 - Math.abs(x + y);
      const color = new Color().setRGB(value / 2, value, value / 2)
      const mesh = generateTerrain(width, height, 100, color);
      mesh.position.set(x * width, 0, y * height);
      obj.add(mesh);
    }
  }

  return obj;
}

function generateTerrain(width: number = 16, height: number = 16, density: number = 300, color?: ColorRepresentation) {
  const geometry = new PlaneGeometry(width, height, density, density);
  // const verts = geometry.getAttribute('position');

  // const noiseSettings: MapNoise[] = [
  //   // {
  //   //   xOffset: 0,
  //   //   xScale: 0.2,
  //   //   yOffset: 0,
  //   //   yScale: 0.2,
  //   //   elevationScale: 1,
  //   //   weight: 2
  //   // }
  // ];

  // MapGenerator.initalize(undefined, undefined, ...noiseSettings);

  // const area = Math.sqrt(verts.count) / density;
  // const smooth = 2;
  // for(let i = 0; i < verts.count; i++) {
  //   const loc = { x: verts.getX(i), y: verts.getY(i) }
  //   verts.setZ(i, MapGenerator.getValue(loc.x, loc.y, area) / smooth);
  // }

  const mesh = new Mesh(geometry, FlatMaterial(color));
  mesh.rotateX(Math.PI * -0.5);
  return mesh
}

interface MapNoise {
  xOffset: number,
  xScale: number,

  yOffset: number,
  yScale: number,

  elevationScale: number,
  weight?: number
}

interface MapSettings {
  width: number,
  length: number,
  density: number,
  elevationScale: number,

  randomWeight?: boolean,
  weightValue?: number
}

interface MapType {
  geometry: PlaneGeometry,
  settings: MapSettings
}

class MapGenerator {
  private static _simplex = new SimplexNoise();

  private static _settings: MapSettings | null;
  private static _noises: MapNoise[] = [];

  static bakeNoise = (map: MapSettings | MapType, layers: number, ...noises: MapNoise[]) => {
    const settings = (map as MapType)?.settings  ?? map;

    MapGenerator._noises = [...noises];
    for(let i = 0; i < layers - noises.length; i++) {
      const scaleLayerNoise = Math.random() / 2;

      MapGenerator._noises.push({
        xOffset: Math.random() * settings.width,
        xScale: scaleLayerNoise * (settings.width / (settings.density)) / (settings.elevationScale / (settings.weightValue ?? 1)),

        yOffset: Math.random() * settings.length,
        yScale: scaleLayerNoise * (settings.length / (settings.density)) / (settings.elevationScale / (settings.weightValue ?? 1)),

        elevationScale: Math.random() * settings.elevationScale,
        weight: settings.randomWeight ? Math.random() * (settings.weightValue ?? 1) : 1
      });
    }
  }

  static initalize = (settings?: MapSettings, layers = 10, ...noises: MapNoise[]) => {
    settings = settings ?? {
      width: 100,
      length: 100,
      elevationScale: 10,
      density: Math.random() * 100 + 50,

      randomWeight: true,
      weightValue: 5
    }

    MapGenerator._settings = settings;
    MapGenerator.bakeNoise(settings, layers, ...noises);
  }

  static getValue = (xin: number, yin: number, _vertCount: number) => {
    // const distFromCenter = -1 * (((xin**2 + yin**2) / 2) - (vertCount)) / 18;
    const length = MapGenerator._noises.length;
    const totalWeight = MapGenerator._noises.map((noise) => noise.weight ?? 1).reduce((p, c) => p + c, 0);
    const noiseValue = MapGenerator._noises.map((noise) => this._simplex.noise(
      (xin + noise.xOffset) * noise.xScale, 
      (yin + noise.yOffset) * noise.yScale
    ) * noise.elevationScale * ((noise.weight ?? 1) / totalWeight)).reduce((p, c) => p + c, 0) / (length);

    var value = noiseValue * (this._settings?.elevationScale ?? 1);
    return value;
  }
}