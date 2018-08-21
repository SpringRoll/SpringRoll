import { IRender } from './IRenderer';
/**
 *
 * TestRenderer is for internal testing. Not intended production
 * @class TestRenderer
 * @extends {IRender}
 */
export class TestRenderer extends IRender {
  /**
   *Creates an instance of TestRenderer.
   * @memberof TestRenderer
   */
  constructor() {
    super();
    this.reset();
    this.content = '';
  }

  /**
   *
   *
   * @memberof TestRenderer
   */
  start() {
    this.startCalled = true;
  }

  /**
   *
   *
   * @memberof TestRenderer
   */
  stop() {
    this.stopCalled = true;
  }

  /**
   *
   *
   * @memberof TestRenderer
   */
  lineBegin(line) {
    this.content = line.content;
    this.lineBeginCalled = true;
    if (!this.startCalled) {
      this.failed = true;
    }
  }

  /**
   *
   *
   * @memberof TestRenderer
   */
  lineEnd() {
    this.lineEndCalled = true;
  }

  /**
   *
   *
   * @memberof TestRenderer
   */
  reset() {
    this.startCalled = false;
    this.stopCalled = false;
    this.lineBeginCalled = false;
    this.lineEndCalled = false;
    this.failed = false;
  }
}
