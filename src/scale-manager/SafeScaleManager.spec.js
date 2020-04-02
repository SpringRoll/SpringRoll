import { SafeScaleManager } from './SafeScaleManager';
import { newEvent } from '../debug';
import { Anchor } from './Anchor';
import Sinon from 'sinon';

describe('Scale Manager', () => {
  const sm = new SafeScaleManager({ width: 400, height: 400 });
  afterEach(() => {
    Sinon.restore();
  });

  it('Should call the callback passed via the constructor', () => {
    new SafeScaleManager({
      width: 400,
      height: 400,
      safeWidth: 200,
      safeHeight: 200,
      callback: e => {
        expect(e.width).to.be.a('number');
        expect(e.height).to.be.a('number');
        expect(e.scale).to.be.an('object');
        expect(e.scale.x).to.be.a('number');
        expect(e.scale.y).to.be.a('number');
      }
    });

    window.dispatchEvent(newEvent('resize'));
  });

  it('Should call the callback on resize', () => {
    sm.enable(e => {
      expect(e.width).to.be.a('number');
      expect(e.height).to.be.a('number');
      expect(e.scale).to.be.an('object');
      expect(e.scale.x).to.be.a('number');
      expect(e.scale.y).to.be.a('number');
    });

    window.dispatchEvent(newEvent('resize'));
  });

  it('Should not call the resize if disabled', () => {
    sm.callback = Sinon.fake();

    sm.disable();
    window.dispatchEvent(newEvent('resize'));

    expect(sm.callback.callCount).to.equal(0);
  });

  it('Should not call resize in IE 11 environemnt', () => {
    sm.callback = Sinon.fake();

    Sinon.replace(window, 'dispatchEvent', () => {});
    sm.resizer.resize();

    expect(sm.callback.callCount).to.equal(0);
  });

  describe('--Anchor Handling--', () => {
    beforeEach(() => {
      sm.entities = [];
    });

    it('should add an anchor', () => {
      sm.addEntity(new Anchor());

      expect(sm.entities.length).to.equal(1);
    });

    it('should add two anchors', () => {
      const anchor1 = new Anchor();
      const anchor2 = new Anchor();

      sm.addEntity([anchor1, anchor2]);

      expect(sm.entities.length).to.equal(2);
    });

    it('should not add an anchor if it already exists', () => {
      const testAnchor = new Anchor();

      sm.addEntity(testAnchor);
      sm.addEntity(testAnchor);

      expect(sm.entities.length).to.equal(1);
    });

    it('should remove anchors', () => {
      const testAnchor = new Anchor();

      sm.addEntity(testAnchor);
      sm.removeEntity(testAnchor);

      expect(sm.entities.length).to.equal(0);
    });

    it('should invoke anchor update when added', () => {
      const callback = Sinon.fake();
      const testAnchor = new Anchor({ callback });

      sm.addEntity(testAnchor);

      expect(callback.callCount).to.equal(1);
    });

    it('should invoke anchor update on resize', () => {
      const callback = Sinon.fake();
      const testAnchor = new Anchor({ callback });

      sm.addEntity(testAnchor);

      window.dispatchEvent(newEvent('resize'));

      expect(callback.callCount).to.equal(1);
    });
  });
});
