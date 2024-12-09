import { BufferGeometry, Object3D, Vector2, Vector3, BatchedMesh } from "three";
import { SimplexNoise } from "three/examples/jsm/Addons.js";

/**
 * Instance for managing terrain generation.
 */
export class TerrainManager {
  constructor() {}

  public async generateTerrainMap() {
    return new TerrainMap();
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
}

/**
 * Single terrain mesh extended from THREE.Mesh.
 */
export class Terrain extends Object3D {
  private mesh: BatchedMesh;
  private noise: MapNoise;

  static generateMeshFromNoise(noise: MapNoise) {
    return new BatchedMesh();
  }

  constructor({ pos, mesh, noise }: { pos: Vector3, mesh?: BatchedMesh, noise?: MapNoise }) {
    super();

    const defaultLayers = [{ terrain: { offset: pos, scale: Vector3.ONE, weight: 1 } }]
    this.noise = noise ?? new MapNoise({ layers: defaultLayers });
    this.mesh = mesh ?? Terrain.generateMeshFromNoise(this.noise);
  }
}

/**
 * Interface to philosophically manage terrain map noise.
 * Contains list of NoiseSettings to manage complex noise generation.
 */
export class MapNoise {
  private computedLayers: NoiseLayerSettings[];
  private elevationBounds: Vector2;

  constructor(settings?: MapNoiseSettings) {
    this.elevationBounds = new Vector2(
      settings?.minElevation ?? 0, 
      settings?.maxElevation ?? 10
    );

    this.computedLayers = settings?.layers ?? [];
  }

  public applyToGeometry(noise: NoiseWrapper, geometry: BufferGeometry, _density = 100) {
    const verts = geometry.getAttribute('position');
    for(let i = 0; i < verts.count; i++) {
      verts.setZ(i, this.getValueFromLayers(noise, verts.getX(i), verts.getY(i)))
    }

    return geometry;
  }

  public getValueFromLayers(noise: NoiseWrapper, xin: number, yin: number) {
    const tw = this.computedLayers.map((layer) => layer.terrain.weight).reduce((p, c) => p + c, 0);
    const value = this.computedLayers.map((layer) => {
      const level = noise(
        (xin + layer.terrain.offset.x) * layer.terrain.scale.x, 
        (yin + layer.terrain.offset.y) * layer.terrain.scale.y
      ) * layer.terrain.scale.z * (layer.terrain.weight / tw);

      return Math.min(this.elevationBounds.y, Math.max(this.elevationBounds.x, level));
    }).reduce((p, c) => p + c, 0);

    return value;
  }
}

/**
 * Settings for managing MapNoise interface.
 */
export type MapNoiseSettings = {
  minElevation?: number
  maxElevation?: number
  layers?: NoiseLayerSettings[]
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
  offset: Vector2
  scale: Vector3
  weight: number
}

type NoiseWrapper = SimplexNoise["noise"];