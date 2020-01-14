import { IdleTimer } from './IdleTimer';
import Sinon from 'sinon';

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
      const callback1 = Sinon.fake();
      const callback2 = Sinon.fake();

      timer.subscribe(callback1);
      timer.subscribe(callback2);

      timer.dispatch();

      expect(callback1.callCount).to.equal(1);
      expect(callback2.callCount).to.equal(1);
    });

    it('should not invoke functions that have been unsubscribed', function() {
      const timer = new IdleTimer();
      const callback = Sinon.fake();

      timer.subscribe(callback);
      timer.dispatch();

      expect(callback.callCount).to.equal(1);

      timer.unsubscribe(callback);
      timer.dispatch();

      expect(callback.callCount).to.equal(1);
    });
  });
});
