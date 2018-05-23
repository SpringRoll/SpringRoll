import Rebound from './Rebound';

describe('Rebound', () => {
  it('Should import', () => {
    expect(Rebound).to.exist;
  });

  const rebound = new Rebound();

  it('Default Settings', () => {
    expect(rebound.randId).to.be.undefined;
    expect(rebound.isChild).to.be.a('boolean');
    expect(rebound.receiver).to.undefined;
  });
});
