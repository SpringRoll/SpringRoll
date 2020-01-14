import { ScaleManager } from './ScaleManager';
import { newEvent } from '../debug';
import Sinon from 'sinon';

describe('Scale Manager', () => {
  const sm = new ScaleManager();

  it('Should call the callback passed via the constructor', () => {
    new ScaleManager(e => {
      expect(e.width).to.be.a('number');
      expect(e.height).to.be.a('number');
      expect(e.ratio).to.be.a('number');
    });

    window.dispatchEvent(newEvent('resize'));
  });

  it('Should call the callback on resize', () => {
    sm.enable(e => {
      expect(e.width).to.be.a('number');
      expect(e.height).to.be.a('number');
      expect(e.ratio).to.be.a('number');
    });

    window.dispatchEvent(newEvent('resize'));
  });

  it('Should not call the resize if disabled', () => {
    sm.callback = Sinon.fake();

    sm.disable();
    window.dispatchEvent(newEvent('resize'));
    
    expect(sm.callback.callCount).to.equal(0);
  });
});
