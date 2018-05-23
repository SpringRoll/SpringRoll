import Rebound from './Rebound';

describe('Rebound', () => {
  it('Should import', () => {
    expect(Rebound).to.exist;
  });

  const rebound = new Rebound();

  it('Should have default settings', () => {
    expect(rebound.id).to.be.string;
    expect(rebound.isChild).to.be.a('boolean');

    expect(rebound.receiver).to.equal(window);
  });

  // it('setIFrame should not update update receiver when isChild is true', () => {
  //   const iframe = document.createElement('iframe');
  //   const iFrameID = 'iTest';
  //   iframe.src = 'about:blank';
  //   iframe.id = iFrameID;
  //   document.body.appendChild(iframe);

  //   rebound.setIFrame(iFrameID);
  //   expect(rebound.receiver).to.equal(window);
  // });
});
