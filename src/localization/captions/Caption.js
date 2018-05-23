/**
 * @export
 * @class Caption
 */
export default class Caption {
  /**
   * Creates an instance of Caption.
   * @param {Object} data
   * @param {Object[]} data.lines
   * @memberof Caption
   */
  constructor({ lines = [] } = {}) {
    this.lines = lines;

    if (this.lines.length < 1) {
      //TODO: Warning empty caption.
    }

    // Sort by end time, this ensures proper exicution order of lines.
    this.lines.sort(function(a, b) {
      if (a.end < b.end) {
        return -1;
      }
      if (a.end > b.end) {
        return 1;
      }
      return 0;
    });

    this.reset();
  }

  /**
   * 
   * 
   * @memberof Caption
   */
  reset()
  {
    this.time = 0;
    this.lineIndex = 0;
    this.line = null;
    this.text = '';
  }

  /**
   *
   *
   * @param {any} deltaTime
   * @memberof Caption
   */
  update(deltaTime) {
    this.time += deltaTime;

    if (this.time > this.lines[this.lineIndex].end) {
      this.lineIndex++;
      this.line = this.lines[this.lineIndex];
    }
    
    if(this.lineIndex >= this.lines.length)
    {
      //STOP;
    }

    if (this.time < this.line.end) 
    {
      if (this.time > this.line.start) 
      {
        this.text = this.line.content;
      } 
      else 
      {
        this.text = '';
      }
    }
  }

  /**
   *
   *
   * @param {number} [time=0]
   * @memberof Caption
   */
  start(time = 0) 
  {
    this.reset();
    if(time > 0)
    {
      this.lineIndex = this.findClosestIndex(time);
    }
  }

  /**
   * 
   * @param {*} time 
   */
  findClosestIndex(time)
  {
    for(let i = 0; i < this.lines.length; i ++)
    {
      if(time < this.lines[i].end)
      {
        return i;
      }
    }
  }

  /**
   *
   *
   * @memberof Caption
   */
  stop() {}
}
