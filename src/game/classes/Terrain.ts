import { Mesh, Vector2, Vector3 } from "three"
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
  private computedLayers: NoiseSettings[] = [];
  private elevationBounds: Vector2;

  constructor(settings?: MapNoiseSettings) {
    this.elevationBounds = new Vector2(
      settings?.minElevation ?? 0, 
      settings?.maxElevation ?? 10
    );
  }
}

/**
 * Settings for managing MapNoise interface.
 */
export type MapNoiseSettings = {
  minElevation?: number,
  maxElevation?: number,
  maps?: {
    roughness?: NoiseSettings,
    precipitation?: NoiseSettings,
    temperature?: NoiseSettings,
    chaos?: NoiseSettings
  }
}

/**
 * General settings directly tied to noise inputs.
 */
export type NoiseSettings = {
  offset: Vector2,
  scale: Vector3
  weight: number
}