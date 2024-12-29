
// type ManagedFunction = (() => void) | (() => Promise<void>)

export abstract class Engine {
  constructor() {}

  public abstract start(): void
}

export type AnimateOptions = {}

export type RendererOptions = {
  guiRootElementID: string
}

export type RendererState =  {
  isRunning: boolean
}

export abstract class Renderer extends Engine {
  constructor() { super(); }

  protected abstract animate(delta: number, _options?: AnimateOptions): void
}