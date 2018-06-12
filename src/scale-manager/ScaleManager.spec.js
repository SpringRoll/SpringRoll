import { ScaleManager } from './ScaleManager';

describe('Scale Manager', () => {
  const sm = new ScaleManager();

  it('Should call the callback on resize', done => {
    sm.enable(e => {
      expect(e.width).to.be.a('number');
      expect(e.height).to.be.a('number');
      expect(e.scale).to.be.an('object');
      expect(e.scale.ratio).to.be.a('number');
      expect(e.scale.x).to.be.not.NaN;
      expect(e.scale.y).to.be.not.NaN;
      done();
    });

    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('resize'));
  });

  it('Should not call the resize if disabled', done => {
    sm.callback = () => {
      //Should not be called
      done(new Error());
    };

    sm.disable();
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('resize'));

    setTimeout(() => {
      done();
    }, 1);
  });
});
