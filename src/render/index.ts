import * as THREE from 'three';
import { getWindowAspect } from './helper';
import { OrbitControls, SimplexNoise } from 'three/examples/jsm/Addons.js';

const topo = new THREE.ShaderMaterial({
  name: 'Topo Shader',
	uniforms: {
    time: { value: 1.0 }
  },

	vertexShader: `
    varying vec3 vertex;

    void main() {
      vertex = position; // Pass the position to the fragment shader
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

	fragmentShader: `
    varying vec3 vertex;

    void main() {
      // Pick a coordinate to visualize in a grid
      float coord = vertex.z;

      // Compute anti-aliased world-space grid lines
      float line = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);

      // Just visualize the grid lines directly
      float color = 1.0 - min(line, 1.0);

      // Apply gamma correction
      color = pow(color, 1.0 / 2.2);
      gl_FragColor = vec4(vec3(color), 0.75);
    }
  `
});

const flat = new THREE.MeshPhongMaterial({ 
  name: 'Flat Material',

  // color: 0x33ff33,
  // specular: 0x773300,
  side: THREE.DoubleSide,
  flatShading: true,
  shininess: 10,
  
  // wireframe: true,
  // wireframeLinewidth: 1
})

export class Renderer {
  _renderer: THREE.WebGLRenderer;
  _scene: THREE.Scene;
  _camera: THREE.PerspectiveCamera;
  _clock: THREE.Clock;

  _meshes: Set<THREE.Mesh> = new Set();
  _terrain = new THREE.Object3D();

  _vertHighlight = new THREE.Mesh(new THREE.SphereGeometry(), new THREE.MeshBasicMaterial({ color: 0xffffff }))

  _autoGenTerrain = false;
  _genTime = 5;
  _gen_counter = 0;

  constructor() {
    this._scene = new THREE.Scene();
    this._camera = new THREE.PerspectiveCamera(75, getWindowAspect(), 0.1, 1000);
    this._clock = new THREE.Clock();

    this._renderer = new THREE.WebGLRenderer();
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this._renderer.domElement);

    // console.log(this._renderer.getContextAttributes());

    // this._scene.add(new THREE.AmbientLight(0x000055, 5))
    const light = new THREE.PointLight(0x33ff33, 2);
    light.position.z = 3;
    light.position.x = 4;
    light.position.y = 2;
    this._scene.add(light);

    const light2 = new THREE.PointLight(0x0000ff, 2);
    light2.position.z = -3;
    light2.position.x = -4;
    light2.position.y = 2;
    this._scene.add(light2);

    this._camera.position.z = 5;
    this._camera.position.y = 3;
    this._renderer.setAnimationLoop(() => {
      const delta = this._clock.getDelta();
      this.animate(delta);
    });

    // this.addMeshToScene(this.generateTerrain());
    this._terrain.add(this.generateTerrain());
    this._scene.add(this._terrain);

    // this._vertHighlight.geometry.scale(0.03, 0.03, 0.03);
    // this._scene.add(this._vertHighlight);

    window.addEventListener("resize", () => {
      this._camera.aspect = getWindowAspect();
      this._camera.updateProjectionMatrix();
      this._renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener("keydown", (e: KeyboardEvent) => {
      if(e.code === 'KeyR') { 
        this._terrain.clear();
        this._terrain.add(this.generateTerrain());
      }

      if(e.code === 'Space') {
        this._autoGenTerrain = !this._autoGenTerrain;
      }
    });

    // window.addEventListener("mousedown", (e: MouseEvent) => {
    //   const ray = new THREE.Raycaster();
    //   ray.setFromCamera(new THREE.Vector2(e.clientX / window.innerWidth, e.clientY / window.innerHeight), this._camera);
    //   const hits = ray.intersectObject(this._terrain.children[0], true);

    //   if(hits.length > 0) {
    //     const inPos = this._terrain.children[0].worldToLocal(hits[0].point);
    //     const { position } = this.findNearestVertexIndex(inPos);
    //     const { x, y, z } = this._terrain.children[0].localToWorld(position);
    //     // console.log("Click:", x, y, z);
    //     this._vertHighlight.position.set(x, y, z);
    //   }
    // });

    new OrbitControls(this._camera, this._renderer.domElement);
  }

  animate(delta: number) {
    this._renderer.render(this._scene, this._camera);
    if(this._autoGenTerrain) {
      this._terrain.rotateY(delta * 0.21);

      this._gen_counter += delta;
      if(this._gen_counter > this._genTime) {
        this._terrain.clear();
        this._terrain.add(this.generateTerrain());
        this._gen_counter = 0;
      }
    }
  }

  generateTerrain(width: number = 8, height: number = 8) {
    const geometry = new THREE.PlaneGeometry(width, height, 150, 150);
    const verts = geometry.getAttribute('position');

    const noiseSettings: MapNoise[] = [
      // {
      //   xOffset: 0,
      //   xScale: 0.2,
      //   yOffset: 0,
      //   yScale: 0.2,
      //   elevationScale: 1,
      //   weight: 2
      // }
    ];

    MapGenerator.initalize(undefined, undefined, ...noiseSettings);

    for(let i = 0; i < verts.count; i++) {
      const loc = { x: verts.getX(i), y: verts.getY(i) }
      verts.setZ(i, MapGenerator.getValue(loc.x, loc.y));
    }

    const mesh = new THREE.Mesh(geometry, topo);
    mesh.rotateX(Math.PI * -0.5);
    return mesh
  }

  addMeshToScene(mesh: THREE.Mesh) {
    this._meshes.add(mesh);
    this._scene.add(mesh);
  }

  findNearestVertexIndex(point: THREE.Vector3) {
    const { x: x0, y: y0, z: z0 } = point;
    let minDistance = Infinity;
    let nearestVertexIndex = -1;
    let position = new THREE.Vector3();
    const terrain = this._terrain.children[0] as THREE.Mesh;
    const vertices = terrain.geometry.getAttribute('position');
    for (let i = 0; i < vertices.count; i++) {
      const pos = { x: vertices.getX(i), y: vertices.getY(i), z: vertices.getZ(i) };
      const distance = Math.sqrt(
        Math.pow(pos.x - x0, 2) +
        Math.pow(pos.y - y0, 2) +
        Math.pow(pos.z - z0, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestVertexIndex = i;
      }
    }
    try {
      position = new THREE.Vector3(
        vertices.getX(nearestVertexIndex),
        vertices.getY(nearestVertexIndex),
        vertices.getZ(nearestVertexIndex)
      );
    } catch (err) {
      console.log(err);
    }

    return {
      position,
      index: nearestVertexIndex,
    };
  }
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

interface Map {
  geometry: THREE.PlaneGeometry,
  settings: MapSettings
}

class MapGenerator {
  private static _simplex = new SimplexNoise();

  private static _settings: MapSettings | null;
  private static _noises: MapNoise[] = [];

  static bakeNoise = (map: MapSettings | Map, layers: number, ...noises: MapNoise[]) => {
    const settings = (map as Map)?.settings  ?? map;

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

  static getValue = (xin: number, yin: number) => {
    const length = MapGenerator._noises.length;
    const totalWeight = MapGenerator._noises.map((noise) => noise.weight ?? 1).reduce((p, c) => p + c, 0);
    const noiseValue = MapGenerator._noises.map((noise) => this._simplex.noise(
      (xin + noise.xOffset) * noise.xScale, 
      (yin + noise.yOffset) * noise.yScale
    ) * noise.elevationScale * ((noise.weight ?? 1) / totalWeight)).reduce((p, c) => p + c, 0) / (length);

    var value = noiseValue * (this._settings?.elevationScale ?? 1);
    value = value - (value / 2);

    // if(this._settings !== null) {
    //   // const centeredValue = Math.abs(xin / 2 - (this._settings.width / 2)) + Math.abs(yin / 2 - (this._settings.length / 2));
    //   const centeredValue = 
    // }

    return value;
  }
}