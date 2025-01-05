import { Vector2 } from "three";
import { VectorFromWASD } from "../../util/helper";

export type OnInputProps = {
  type: 'mousemove' | 'click' | 'touch' | 'keydown' | 'keyup', 
  screenPosition: Vector2,
  event: any
}

export type TriggerEvent = {
  value: Vector2,
  initialTrigger: boolean
}

export type TouchEvent = TriggerEvent & {
  held: boolean
}

export class InputMap {
  private _keys: { [key: string]: { value: boolean, count: number } | undefined }
  private _inputs: { inputAxis: TriggerEvent, touchAxis: TouchEvent }

  private _EventMap: OnInputProps['type'][] = [
    'mousemove',
    'click',
    'touch',
    'keydown',
    'keyup'
  ]
  public get EventMap() { return this._EventMap; }

  private _KeyMap = {
    Up: 'KeyW',
    Left: 'KeyA',
    Down: 'KeyS',
    Right: 'KeyD'
  }
  public get KeyMap() { return this._KeyMap; }

  constructor() {
    this._keys = {};
    this._inputs = {
      inputAxis: { value: new Vector2(), initialTrigger: false },
      touchAxis: { value: new Vector2(), initialTrigger: false, held: false }
    }
  }

  public onInput({ type, event }: OnInputProps) {
    this._inputs.inputAxis.initialTrigger = false;
    this._inputs.touchAxis.initialTrigger = false;

    const getWASD = () => {
      return VectorFromWASD(
        this._keys[this._KeyMap.Up]?.value, 
        this._keys[this._KeyMap.Left]?.value, 
        this._keys[this._KeyMap.Down]?.value, 
        this._keys[this._KeyMap.Right]?.value
      );
    }
  
    const onKey = (code: string, down: boolean, addCount: number) => {
      this._keys[code] = { value: down, count: (this._keys[code]?.count ?? 0) + addCount }
      if(Object.values(this._KeyMap).includes(event.code)) {
        this._inputs.inputAxis = { value: getWASD(), initialTrigger: true }
      }
    }
  
    switch(type) {
      case 'mousemove':
        break;
      case 'click':
        break;
      case 'touch':
        break;
      case 'keydown':
        onKey(event.code, true, 1);
        break;
      case 'keyup':
        onKey(event.code, false, 0);
        break;
    }
  }
}