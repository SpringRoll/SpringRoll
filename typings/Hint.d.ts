export interface IHintPlayer {
  play:Function;
}

export type HintCallback = () => any;

export class HintSequencePlayer implements IHintPlayer {
  play:Function;
  add(...hints: HintCallback[]):void;
  remove(...hints: HintCallback[]):void;
  clear:Function;
}

export class IdleTimer
{
  start(time:Number);
  stop:Function;
  reset:Function;
  dispatch:Function;
  subscribe(callback:Function);
  unsubscribe(callback:Function);
}
