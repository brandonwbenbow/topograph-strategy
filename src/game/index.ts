import { OrbitControls } from "three/examples/jsm/Addons.js";
import { Renderer } from "../renderer";
import { GameCamera } from "../renderer/classes/Camera";
import { GameScene } from "../renderer/classes/Scene";
import { TerrainManager } from "./classes/Terrain";

import { Renderer as DemoRenderer } from './demo';
export { DemoRenderer }

export class GameEngine {
  // Engine
  private renderer: Renderer;

  // Game
  private terrainManager: TerrainManager;

  constructor() {
    this.renderer = new Renderer();
    this.terrainManager = new TerrainManager();
  }

  public async start() {
    // engine setup
    const map = await this.terrainManager.generateTerrainMap();
    const scene = new GameScene();

    const meshes = map.getTerrainMesh();
    console.log("Terrain Mesh:", meshes)
    scene.add(...meshes);

    this.renderer.addScene("default_terrain", scene);
    this.renderer.setActiveScene("default_terrain");

    const camera = new GameCamera();
    camera.setControls(new OrbitControls(camera, this.renderer.getCanvasElement()));
    this.renderer.addCamera("default_camera", camera);
    this.renderer.setActiveCamera("default_camera");

    this.renderer.start();
  }
}
