import { Scene } from "three"

type GameSceneProps = {
  key: string;
  onRender: (delta: number) => void
}

export class GameScene extends Scene {
  private _key: string;
  public get key() { return this._key };

  public onRender: (delta: number) => void;

  constructor(props?: GameSceneProps) {
    super();

    this._key = props?.key ?? '';
    
    this.onRender = props?.onRender ?? (() => {});
  }
}