export interface IHintPlayer {
  play:() => void;
}

export type HintCallback = () => any;

export class HintSequencePlayer implements IHintPlayer {
  play(): void;
  add(...hints: HintCallback[]):void;
  remove(...hints: HintCallback[]):void;
  clear(): void;
}

export class IdleTimer
{
  start(time?:Number): void;
  stop(): void;
  reset(): void;
  dispatch(): void;
  subscribe(callback:() => void): void;
  unsubscribe(callback:() => void): void;
}
