import Property from './Property';

describe('Property', () => {
  describe('subscribe', () => {
    it('should notify the subscriber whenever the property changes', (done) => {
      let property = new Property(7);
      property.subscribe(() => {
        expect(property.value).to.equal(8);
        done();
      });
      property.value = 8;
    });
  });

  describe('unsubscribe', () => {
    it('should notify listeners that are unsubscribed', (done) => {
      let oops = () => {
        throw new Error('I should not execute');
      };
      let property = new Property(1);
      property.subscribe(oops);
      property.unsubscribe(oops);
      property.value = 0;
      done();
    });
  });
});
