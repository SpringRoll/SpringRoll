import { SafeScaleManager } from './SafeScaleManager';
import { newEvent } from '../debug';
import { Anchor } from './Anchor';

describe('Scale Manager', () => {
  const sm = new SafeScaleManager({ width: 400, height: 400 });

  it('Should call the callback passed via the constructor', done => {
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
        done();
      }
    });

    window.dispatchEvent(newEvent('resize'));
    window.dispatchEvent(newEvent('resize'));
  });

  it('Should call the callback on resize', done => {
    sm.enable(e => {
      expect(e.width).to.be.a('number');
      expect(e.height).to.be.a('number');
      expect(e.scale).to.be.an('object');
      expect(e.scale.x).to.be.a('number');
      expect(e.scale.y).to.be.a('number');
      done();
    });

    window.dispatchEvent(newEvent('resize'));
    window.dispatchEvent(newEvent('resize'));
  });

  it('Should not call the resize if disabled', done => {
    sm.callback = () => {
      //Should not be called
      done(new Error());
    };

    sm.disable();
    window.dispatchEvent(newEvent('resize'));
    window.dispatchEvent(newEvent('resize'));

    setTimeout(() => {
      done();
    }, 1);
  });

  describe('--Anchor Handling--', () => {
    beforeEach(() => {
      sm.entities = [];
    });

    it('should add an anchor', () => {
      sm.addEntity(new Anchor());

      expect(sm.entities.length).to.equal(1);
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

    it('should invoke anchor update when added', done => {
      const testAnchor = new Anchor({
        callback: () => {
          done();
        }
      });
      sm.addEntity(testAnchor);
    });

    it('should invoke anchor update on resize', done => {
      let count = 0;

      const testAnchor = new Anchor({
        callback: () => {
          if (count == 1) {
            done();
          }
          count++;
        }
      });

      sm.addEntity(testAnchor);

      window.dispatchEvent(newEvent('resize'));
      // window.dispatchEvent(newEvent('resize'));
    });
  });
});
