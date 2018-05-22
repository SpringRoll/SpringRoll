import Rebound from './Rebound';

describe('Rebound', () => {
  const rebound = new Rebound();
  const iframe = document.createElement('iframe');
  iframe.id = 'iTest';
  document.body.appendChild(iframe);

  it('Should import', () => {
    expect(Rebound).to.exist;
  });

  it('Should have default settings', () => {
    expect(rebound.id).to.be.string;
    expect(rebound.isChild).to.be.true;
    expect(rebound.receiver).to.be.equal(window);
  });

  it;
});
