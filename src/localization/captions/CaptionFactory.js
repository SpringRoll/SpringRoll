import Caption from './Caption';
import TimedLine from './TimedLine';
import { assert } from '../../utils/utils';
/**
 * Collection of functions for creating Captions
 *
 * @export
 * @class CaptionBuilder
 */
export default class CaptionFactory {
  /**
   * Creates a new Object<String, Caption>
   *
   * @static
   * @param {JSON} data
   * @returns {Object} 
   * @memberof CaptionFactory
   */
  static createCaptionMap(data) {
    let captions = {};
    for (let key in data) {
      let caption = this.createCaption(data[key]);
      captions[key] = caption;
    }
    return captions;
  }

  /**
   * Creates a new Caption from JSON data
   *
   * @static
   * @param {JSON} captionData
   * @returns {Caption} new Caption
   * @memberof CaptionFactory
   */
  static createCaption(captionData) {
    let lines = [];
    for (let i = 0; i < captionData.length; i++) {
      lines.push(this.createLine(captionData[i]));
    }
    return new Caption(lines);
  }

  /**
   * Creates a new TimedLine from JSON data.
   *
   * @static
   * @param {JSON} lineData
   * @returns {TimedLine} new TimedLine;
   * @memberof CaptionFactory
   */
  static createLine(lineData) {
    assert(typeof(lineData.start) === 'number' ,'[CaptionFactory.createLine] lineData.start must be defined as a number');
    assert(typeof(lineData.end) === 'number' ,'[CaptionFactory.createLine] lineData.end must be defined as a number');

    //TODO: any future formatting changes should go here.
    return new TimedLine(lineData.content, lineData.start, lineData.end);
  }
}
