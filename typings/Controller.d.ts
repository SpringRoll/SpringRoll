export type KeyState = 0 | 1 | 2;
export type KeyTemplate = {
  down?: () => void;
  key: string;
  up?: () => void;
}

export class Key {
  constructor(key: string, down?: () => void, up?: () => void);
  key: string;
  actions: {
    up?: () => void,
    down?: () => void
  }
  updateState(state?: KeyState): void;
  action(): void;
  readonly state: KeyState;

  private _state: KeyState;
}

export class Controller {
  constructor(keys?: KeyTemplate[]);
  update(): void;
  onKeyDown(e: KeyboardEvent): void;
  onKeyUp(e: KeyboardEvent): void;
  assignButtons(keys: Key[]):void;
  private onKey(event: KeyboardEvent, state: KeyState): void;
}
