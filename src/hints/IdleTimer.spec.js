import { IdleTimer } from './IdleTimer';

describe('IdleTimer', function() {
  describe('#start()', function() {
    it('should create a timeout', function() {
      const timer = new IdleTimer();
      timer.start(1000);
      expect(timer.timer != null && timer.timer != undefined).to.be.true;
    });

    it('should not create a timeout if time is null or 0', function() {
      const timer = new IdleTimer();
      timer.start(null);
      expect(timer.timer == null || timer.timer == undefined).to.be.true;
    });
  });

  describe('#stop()', function() {
    it('should clear the timer', function() {
      const timer = new IdleTimer();
      timer.start(1000);
      timer.stop();
      expect(timer.timer == null || timer.timer == undefined).to.be.true;
    });

    it('should do nothing if the time is not started', function() {
      const timer = new IdleTimer();
      timer.stop();
      expect(timer.timer == null || timer.timer == undefined).to.be.true;
    });
  });

  describe('#reset()', function() {
    it('should reset the timer', function() {
      const timer = new IdleTimer();
      timer.start(1000);

      const temp = timer.timer;
      timer.reset();

      expect(timer.timer != temp).to.be.true;
    });

    it('should do nothing if the time is not started', function() {
      const timer = new IdleTimer();
      timer.reset();
      expect(timer.timer == null || timer.timer == undefined).to.be.true;
    });
  });

  describe('#dispatch()', function() {
    it('should invoke each subscribed function', function() {
      const timer = new IdleTimer();
      let callCount = 0;
      timer.subscribe(function() {
        callCount++;
      });
      timer.subscribe(function() {
        callCount++;
      });
      timer.dispatch();
      expect(callCount).to.equal(2);
    });

    it('should not invoke functions that have been unsubscribed', function() {
      const timer = new IdleTimer();
      let testCalled = false;
      /** Test Func */
      const testFunc = function() {
        testCalled = true;
      };

      timer.subscribe(testFunc);
      timer.unsubscribe(testFunc);
      timer.dispatch();

      expect(testCalled).to.equal(false);
    });
  });
});
