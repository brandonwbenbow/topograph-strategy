import { Vector2 } from "three";

export const getWindowAspect = () => window.innerWidth / window.innerHeight;

export const addWindowEvents = (callback: (event: any) => void, ...types: string[]) => {
  types.forEach((type) => {
    window.addEventListener(type, callback);
  })

  return () => {
    types.forEach((type) => {
      window.removeEventListener(type, callback);
    })
  }
}

export const VectorFromWASD = (w: boolean | undefined, a: boolean | undefined, s: boolean | undefined, d: boolean | undefined) => {
  return new Vector2(
    !a && !d ? 0 : a ? -1 : d ? 1 : 0,
    !w && !s ? 0 : w ? -1 : s ? 1 : 0
  )
}