export type KeyState = 0 | 1 | 2;
export type KeyTemplate = {
  down: Function;
  key: string;
  up: Function;
}

export class Key {
  constructor(key: string, down: Function, up: Function);
  key: string;
  actions: {
    up: Function,
    down: Function
  }
  updateState(state?: KeyState): void;
  action(): void;
  readonly state: KeyState

  private _state: KeyState
}

export class Controller {
  constructor(keys?: KeyTemplate[]);
  update(): void;
  onKeyDown(e: KeyboardEvent): void;
  onKeyUp(e: KeyboardEvent): void;
  assignButtons(keys: Key[]):void;
  private onKey(event: KeyboardEvent, state: KeyState): void;
}