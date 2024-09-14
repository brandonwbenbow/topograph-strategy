import { BufferGeometry, Mesh, Vector2, Vector3 } from "three"
import { SimplexNoise } from "three/examples/jsm/Addons.js";

/**
 * Instance for managing terrain generation.
 */
export class TerrainManager {
  constructor() {}

  public generateTerrainMap() {
    return new TerrainMap();
  }
}

/**
 * Map for terrain segments representing a single piece of land.
 */
export class TerrainMap {
  private mapGrid: Terrain[][] = [];

  constructor() {}
}

/**
 * Single terrain mesh extended from THREE.Mesh.
 */
export class Terrain extends Mesh {
  private noise: MapNoise;

  constructor() {
    super();

    this.noise = new MapNoise();
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

  public applyToGeometry(noise: NoiseWrapper, geometry: BufferGeometry, density = 100) {
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