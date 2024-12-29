import { BufferGeometry, Object3D, Vector3, BatchedMesh } from "three";
import { SimplexNoise } from "three/examples/jsm/Addons.js";

/**
 * Instance for managing terrain generation.
 */
export class TerrainManager {
  private currentTerrainMap: TerrainMap | undefined;

  constructor() {}

  public async generateTerrainMap() {
    this.currentTerrainMap = new TerrainMap();
    return this.currentTerrainMap;
  }
}

/**
 * Map for terrain segments representing a single piece of land.
 */
export class TerrainMap {
  private mapGrid: Map<[number, number], Terrain> = new Map();

  constructor() {}

  public setMapToGrid(terrain: Terrain) {
    const pos: Vector3 = (terrain as Object3D).position;
    this.mapGrid.set([pos.x, pos.y], terrain);
  }

  public getTerrainMesh(): BatchedMesh[] {
    return Array.from(this.mapGrid.values()).map((terrain) => terrain.getMesh());
  }
}

/**
 * Single terrain mesh extended from THREE.Mesh.
 */
export class Terrain extends Object3D {
  private mesh: BatchedMesh;
  private noise: MapNoise;

  static generateMeshFromNoise(noise: MapNoise, maxTileCount: number = 100) {
    return new BatchedMesh(maxTileCount, noise.getMeshScale() * maxTileCount);
  }

  constructor({ pos, mesh, noise }: { pos: Vector3, mesh?: BatchedMesh, noise?: MapNoise }) {
    super();

    const defaultLayers: NoiseLayerSettings[] = [{ terrain: { offset: pos, scale: new Vector3(1, 1, 1), weight: 1 } }]
    this.noise = noise ?? new MapNoise({ layers: defaultLayers });
    this.mesh = mesh ?? Terrain.generateMeshFromNoise(this.noise);
  }

  public getMesh() { return this.mesh; }
}

/**
 * Interface to philosophically manage terrain map noise.
 * Contains list of NoiseSettings to manage complex noise generation.
 */
export class MapNoise {
  private settings: MapNoiseSettings;

  constructor(settings: Partial<MapNoiseSettings>) {
    this.settings = {
      minElevation: settings?.minElevation ?? 0,
      maxElevation: settings?.maxElevation ?? 10,
      layers: settings?.layers ?? [],
      meshDensity: settings?.meshDensity ?? 100,
    };
  }

  public applyToGeometry(noise: NoiseWrapper, geometry: BufferGeometry, _density = 100) {
    const verts = geometry.getAttribute('position');
    for(let i = 0; i < verts.count; i++) {
      verts.setZ(i, this.getValueFromLayers(noise, verts.getX(i), verts.getY(i)))
    }

    return geometry;
  }

  public getValueFromLayers(noise: NoiseWrapper, xin: number, yin: number) {
    const layers = this.settings.layers ?? [];
    const tw = layers.map((layer) => layer.terrain.weight).reduce((p, c) => p + c, 0);
    const value = layers.map((layer) => {
      const level = noise(
        (xin + layer.terrain.offset.x) * layer.terrain.scale.x, 
        (yin + layer.terrain.offset.y) * layer.terrain.scale.y
      ) * layer.terrain.scale.z * (layer.terrain.weight / tw);

      return Math.min(this.settings.minElevation, Math.max(this.settings.maxElevation, level));
    }).reduce((p, c) => p + c, 0);

    return value;
  }

  public getMeshScale() { return this.settings.meshDensity; }
}

/**
 * Settings for managing MapNoise interface.
 */
export type MapNoiseSettings = {
  minElevation: number
  maxElevation: number
  layers: NoiseLayerSettings[]
  meshDensity: number
}

type NoiseLayerSettings = {
  terrain: NoiseSettings
  roughness?: NoiseSettings
  precipitation?: NoiseSettings // currenntly not taking weather into calc
  temperature?: NoiseSettings // currenntly not taking weather into calc
  chaos?: NoiseSettings
}

/**
 * General settings directly tied to noise inputs.
 */
export type NoiseSettings = {
  offset: Vector3
  scale: Vector3
  weight: number
}

type NoiseWrapper = SimplexNoise["noise"];