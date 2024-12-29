import { Camera } from "three"

type GameCameraProps = {
  key: string;
  onRender: (delta: number) => void
}

export class GameCamera extends Camera {
  private _key: string;
  public get key() { return this._key };

  private _controls: unknown | undefined;
  protected get controls() { return this._controls }

  public onRender: (delta: number) => void;

  constructor(props?: GameCameraProps) {
    super();

    this._key = props?.key ?? '';

    this.onRender = props?.onRender ?? (() => {});
  }

  public setControls<T>(controls: unknown) {
    this._controls = controls as T;
  }
}