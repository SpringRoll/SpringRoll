import { IHintPlayer } from './IHintPlayer';
import { Debugger } from '../debug';

/**
 *
 * @export
 * @class HintSequencePlayer
 */
export class HintSequencePlayer extends IHintPlayer {
  /**
   * Creates an instance of HintSequencePlayer.
   * @memberof HintSequencePlayer
   */
  constructor() {
    super();
    this.hints = [];
    this.index = 0;
  }

  /**
   * invokes the next hint
   * @return {void}@memberof HintSequencePlayer
   */
  play() {
    if (this.hints.length == 0) {
      Debugger.log('warn', '[HintSequencePlayer.play()] No hints?!');
      return;
    }

    if (this.index >= this.hints.length) {
      this.index = 0;
    }

    this.hints[this.index]();
    this.index++;
  }

  /**
   * removes all hints
   * @return {void}@memberof HintSequencePlayer
   */
  clear() {
    this.index = 0;
    this.hints.length = 0;
  }

  /**
   * @param  {function()[]} callbacks
   * @return {void}@memberof HintSequencePlayer
   */
  add(...callbacks) {
    const length = callbacks.length;
    for (let i = 0; i < length; i++) {
      this.hints.push(callbacks[i]);
    }
  }

  /**
   * @param  {function()[]} callbacks
   * @return {void}@memberof HintSequencePlayer
   */
  remove(...callbacks) {
    const length = callbacks.length;
    for (let i = 0; i < length; i++) {
      this.hints = this.hints.filter(call => call !== callbacks[i]);

    }
  }
}
