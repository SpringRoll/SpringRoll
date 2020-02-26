import { Property } from './Property';
import Sinon from 'sinon';

describe('Property', () => {
  describe('subscribe', () => {
    it('should notify the subscriber whenever the property changes', () => {
      const callback = Sinon.fake();
      const property = new Property(7);

      property.subscribe(callback);
      property.value = 8;

      expect(callback.callCount).to.equal(1);
      expect(property.value).to.equal(8);
    });

    it('should not invoke listeners if the provided value is the same as the current value', () => {
      const callback = Sinon.fake();
      const property = new Property(8);

      property.subscribe(callback);
      property.value = 8;

      expect(callback.callCount).to.equal(0);
    });

    it('should invoke listeners if flagged to always notify and provided value is the same as the current value.', () => {
      const callback = Sinon.fake();
      const property = new Property(8, true);

      property.subscribe(callback);
      property.value = 8;

      expect(callback.callCount).to.equal(1);
    });
  });

  describe('unsubscribe', () => {
    it('should notify listeners that are unsubscribed', () => {
      const callback = Sinon.fake();
      const property = new Property(1);

      property.subscribe(callback);
      property.unsubscribe(callback);
      property.value = 0;

      expect(callback.callCount).to.equal(0);
      expect(property.value).to.equal(0);
    });
  });

  describe('hasListeners', () => {
    it('should be true if the property has a listener', () => {
      const property = new Property(0);
      property.subscribe(() => {});
      expect(property.hasListeners).to.equal(true);
    });

    it('should be false if the property does not have a listener', () => {
      const property = new Property(0);
      expect(property.hasListeners).to.equal(false);
    });
  });
});
