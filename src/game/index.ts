import { Renderer } from "../renderer";
import { TerrainManager } from "./classes/Terrain";


export class GameEngine {
  // Engine
  private renderer: Renderer;

  // Game
  private terrainManager: TerrainManager;

  constructor() {
    this.renderer = new Renderer();
    this.terrainManager = new TerrainManager();
  }
}