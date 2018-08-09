import Property from './Property';

describe('Property', () => {
  describe('subscribe', () => {
    it('should notify the subscriber whenever the property changes', done => {
      const property = new Property(7);
      property.subscribe(() => {
        expect(property.value).to.equal(8);
        done();
      });
      property.value = 8;
    });
  });

  describe('unsubscribe', () => {
    it('should notify listeners that are unsubscribed', done => {
      const oops = () => {
        throw new Error('I should not execute');
      };
      const property = new Property(1);
      property.subscribe(oops);
      property.unsubscribe(oops);
      property.value = 0;
      done();
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
