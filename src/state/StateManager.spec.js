import StateManager from './StateManager';
import Property from './Property';

describe('StateManager', () => {
  describe('addField', () => {
    it('should create a new property when adding a new field', () => {
      var manager = new StateManager();
      var result = manager.addField('paused', false);
      expect(result).to.be.instanceOf(Property);
      expect(manager.paused).to.be.instanceOf(Property);
    });
  });
});
