import { WebGLRenderer } from "three";
import { GameScene } from "./classes/Scene";
import { GameCamera } from "./classes/Camera";

type AnimateOptions = {}

type MetaObject = GameScene | GameCamera;

export class Renderer {
  private renderer: WebGLRenderer;

  private scenes: Map<string, GameScene> = new Map<string, GameScene>();
  private activeScene: GameScene | undefined;

  private cameras: Map<string, GameCamera> = new Map<string, GameCamera>();
  private activeCamera: GameCamera | undefined;

  constructor() {
    this.renderer = new WebGLRenderer();
  }

  public animate(delta: number, options?: AnimateOptions) {
    if(this.activeScene && this.activeCamera) {
      this.renderer.render(this.activeScene, this.activeCamera);
      
      this.activeScene.onRender(delta);
      this.activeCamera.onRender(delta);
    }
  }

  // #region Meta Objects
  private addMetaObjectToMap(key: string, obj: MetaObject, map: Map<string, MetaObject>): boolean {
    if(map.has(key)) { return false; }

    const currentObjCount = map.size
    map.set(key, obj)
    return currentObjCount > map.size;
  }

  private removeMetaObjectFromMap(obj: MetaObject | string, map: Map<string, MetaObject>): boolean {
    if(typeof(obj) === 'string') {
      return map.delete(obj);
    }

    for(let [key, value] of map) { if(value === obj) { return map.delete(key); } }
    return false;
  }

  private setActiveMetaObjectFromMap(
    obj: MetaObject | string, 
    map: Map<string, MetaObject>, 
    setter: (obj: MetaObject | undefined) => boolean
  ): boolean {
    if(typeof(obj) === 'string') {
      return setter(map.get(obj));
    }

    if(this.addMetaObjectToMap(obj.key, obj, map)) {
      return setter(obj);
    }

    return false;
  }

  public addScene(key: string, scene: GameScene): boolean {
    return this.addMetaObjectToMap(key, scene, this.scenes);
  }

  public removeScene(scene: GameScene | string): boolean {
    return this.removeMetaObjectFromMap(scene, this.scenes);
  }

  public setActiveScene(scene: GameScene | string): boolean {
    return this.setActiveMetaObjectFromMap(scene, this.scenes, (activeScene) => {
      this.activeScene = activeScene as GameScene | undefined;
      return this.activeScene !== undefined;
    });
  }

  public addCamera(key: string, camera: GameCamera): boolean {
    return this.addMetaObjectToMap(key, camera, this.cameras);
  }

  public removeCamera(camera: GameCamera | string): boolean {
    return this.removeMetaObjectFromMap(camera, this.cameras);
  }

  public setActiveCamera(camera: GameCamera | string): boolean {
    return this.setActiveMetaObjectFromMap(camera, this.cameras, (activeCamera) => {
      this.activeCamera = activeCamera as GameCamera | undefined;
      return this.activeCamera !== undefined;
    });
  }
  // #endregion
}