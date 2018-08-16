import { Debugger } from './../../debug/Debugger';
import { Caption } from './Caption';
import { TimedLine } from './TimedLine';

/**
 * Collection of functions for creating Captions
 *
 * @export
 * @class CaptionFactory
 */
export class CaptionFactory {
  /**
   * Creates a new Object<String, Caption>.
   *
   * @static
   * @param {JSON} data
   * @returns {Object}
   * @memberof CaptionFactory
   */
  static createCaptionMap(data) {
    const captions = {};
    for (const key in data) {
      const caption = this.createCaption(data[key]);
      if (!caption) {
        Debugger.log(
          'error',
          '[CaptionFactory.createCaptionMap] failed to create caption:',
          key
        );
      } else {
        captions[key] = caption;
      }
    }
    return captions;
  }

  /**
   * Creates a new Caption from JSON data.
   *
   * @static
   * @param {*} captionData
   * @returns {Caption} new Caption
   * @memberof CaptionFactory
   */
  static createCaption(captionData) {
    const lines = [];
    for (let i = 0, length = captionData.length; i < length; i++) {
      const line = this.createLine(captionData[i]);
      if (line) {
        lines.push(line);
      }
    }

    if (lines.length <= 0) {
      Debugger.log(
        'error',
        '[CaptionFactory.createCaption] captions should not have 0 lines.'
      );
      return;
    }

    return new Caption(lines);
  }

  /**
   * Creates a new TimedLine from JSON data.
   *
   * @static
   * @param {*} lineData
   * @returns {TimedLine} new TimedLine;
   * @memberof CaptionFactory
   */
  static createLine(lineData) {
    if (typeof lineData.start !== 'number') {
      Debugger.log(
        'error',
        '[CaptionFactory.createLine] lineData.start must be defined as a number'
      );
      return;
    }

    if (typeof lineData.end !== 'number') {
      Debugger.log(
        'error',
        '[CaptionFactory.createLine] lineData.end must be defined as a number'
      );
      return;
    }

    if (typeof lineData.content !== 'string') {
      Debugger.log(
        'error',
        '[CaptionFactory.createLine] lineData.content must be defined as a string'
      );
      return;
    }

    if (lineData.content === '') {
      Debugger.log(
        'warn',
        '[CaptionFactory.createLine] lineData.content should not be empty',
        'Its recommended to add time to the start of the next line to add delays.'
      );
      return;
    }

    return new TimedLine(lineData.start, lineData.end, lineData.content);
  }
}
