/**
 * SpeechSync makes it easy to convert text to speech.
 * Note: This is not supported on IE11 and below because of the underlying APIs are not implemented in those browsers
 * @class SpeechSynth
 * @param {object} params
 * @param {number} [params.voice=0] Indicates what voice to use.
 * @param {number} [params.rate=1] The rate at which the text is said. Supports a range from 0.1 to 10.
 * @param {number} [params.pitch=0] Voice Pitch. Supports a pitch from 0 to 2.
 * @param {number} [params.volume=1] Volume. Supports 0 to 1.
 * @property {boolean} voicesLoaded voices are loaded async. This is will be set to true when they are loaded.
 */
export class SpeechSynth {
  /**
   * Creates an instance of SpeechSynth.
   */
  constructor({ voice = 0, rate = 1, pitch = 0, volume = 1 } = {}) {
    if (!window.speechSynthesis) {
      console.error(
        'Springroll SpeechSynth is not supported on on this Device'
      );
      return;
    }
    this.voiceOptions = [];
    this.voicesLoaded = false;
    this.queue = [];

    this.options = {
      voice: {},
      rate,
      pitch,
      volume
    };

    /**
     * Called when voices are ready to be used.
     * @private
     */
    const loadVoices = function() {
      this.voiceOptions = window.speechSynthesis.getVoices();
      this.voice = this.setVoice(voice);
      this.voicesLoaded = true;
    }.bind(this);

    const voiceOptions = window.speechSynthesis.getVoices();
    if (Array.isArray(voiceOptions) && 0 < voiceOptions.length) {
      loadVoices();
    } else {
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices, {
        once: true
      });
    }
  }

  /**
   * Pauses the announcer.
   */
  pause() {
    this.speaking = false;
    window.speechSynthesis.pause();
  }

  /**
   * Resumes the announcer.
   */
  resume() {
    this.speaking = true;
    window.speechSynthesis.resume();
  }

  /**
   * Pauses the announcer and clears the queue.
   */
  cancel() {
    this.speaking = false;
    this.pause();
    this.queue.length = 0;
    window.speechSynthesis.cancel();
  }

  /**
   * Causes the announcer to say whatever message is passed to it.
   * If the announcer is already saying something then it will be added to a queue.
   * @param {string} message
   */
  say(message) {
    if (this.speaking || !this.voicesLoaded) {
      this.queue.push(message);
      return;
    }

    const onEnd = () => {
      this.speaking = false;

      if (0 < this.queue.length) {
        this.say(this.queue.shift());
      }
    };

    this.speaking = true;

    const speaker = new SpeechSynthesisUtterance(message);

    Object.assign(speaker, this.options);

    speaker.onend = onEnd;

    window.speechSynthesis.speak(speaker);
  }

  /**
   * Helper function to control the range of values.
   * Will return the min value if not a number.
   * @private
   * @param {number} min
   * @param {number} max
   * @param {number} value
   * @returns {number}
   */
  rangeLimit(min, max, value) {
    if (isNaN(value)) {
      console.warn(`'${value}' is not a valid number!`);
      return min;
    }

    if (value >= max) {
      return max;
    }

    if (min >= value) {
      return min;
    }

    return value;
  }

  /**
   * Sets the voice by array index.
   * @param {number} index
   */
  setVoice(index) {
    this.options.voice = this.voiceOptions[index];
  }

  /**
   * Returns the voice object.
   * @returns {object | null}
   */
  getVoice() {
    return this.options.voice;
  }

  /**
   * Rate at which text is spoken.
   * @param {number} rate
   */
  set rate(rate) {
    this.options.rate = this.rangeLimit(0.1, 10, rate);
  }

  /**
   * Returns rate which text is spoken.
   * @returns {number}
   */
  get rate() {
    return this.options.rate;
  }

  /**
   * Sets the pitch at which text is spoken.
   * @param {number} pitch
   */
  set pitch(pitch) {
    this.options.pitch = this.rangeLimit(0, 2, pitch);
  }

  /**
   * Returns the pitch at which text is spoken.
   * @returns {number}
   */
  get pitch() {
    return this.options.pitch;
  }

  /**
   * Sets the current volume of the announcer.
   * @param {number} volume
   */
  set volume(volume) {
    this.options.volume = this.rangeLimit(0, 1, volume);
  }

  /**
   * Returns the current volume of the announcer.
   * @returns {number}
   */
  get volume() {
    return this.options.volume;
  }
}
