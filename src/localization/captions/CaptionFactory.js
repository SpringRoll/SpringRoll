import Caption from './Caption';
import TimedLine from './TimedLine';

/**
 * Collection of functions for creating Captions
 *
 * @export
 * @class CaptionBuilder
 */
export default class CaptionsFactory {
  /**
   * Creates a new Object<String, Caption>
   * 
   * @static
   * @param {any} data 
   * @returns 
   * @memberof CaptionsFactory
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
   * @memberof CaptionsFactory
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
   * @memberof CaptionsFactory
   */
  static createLine(lineData)
  {
    //TODO: any future formatting changes should go here.
    return new TimedLine(lineData.content, lineData.start, lineData.end);
  }
}
