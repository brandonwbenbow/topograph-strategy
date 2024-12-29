

export class GUIManager {
  private state: unknown;

  constructor(rootElement: HTMLElement | null) {}

  public updateState<T>(state: any) {
    this.state = state as T;
  }
}