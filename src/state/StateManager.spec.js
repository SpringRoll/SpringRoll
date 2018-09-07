import { StateManager } from './StateManager';
import { Property } from './Property';

describe('StateManager', () => {
  describe('addField', () => {
    it('should create a new property when adding a new field', () => {
      const manager = new StateManager();
      const result = manager.addField('paused', false);
      expect(result).to.be.instanceOf(Property);
      expect(manager.paused).to.be.instanceOf(Property);
    });

    it('should throw if the field already exists', () => {
      const manager = new StateManager();
      manager.addField('x', 1);

      expect(() => manager.addField('x', 2)).to.throw();
    });
  });
});
