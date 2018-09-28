/**
 * Hint Player interface to help enforce minimum requirements for hint players
 * @interface
 * @class IHintPlayer
 * @property {function} play called by application to
 */
export class IHintPlayer {
  /**
   * Creates an instance of IHintPlayer.
   * @memberof IHintPlayer
   */
  constructor() {
    if ('function' !== typeof this.play) {
      console.error(
        'Springroll Hint Player not implemented correctly. Please ensure you have a "play" function in your class.'
      );
    }
  }
}
