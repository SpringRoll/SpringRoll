import { Anchor } from './Anchor';

describe('Anchor', () => {
  describe('direction', () => {
    let anchor;

    afterEach(() => {
      anchor.onResize({
        viewArea: {
          x: 0, y: 0, width: 800, height: 800
        }
      });
    });

    it('should calculate the direction correctly {1, 1}', () => {
      anchor = new Anchor({
        position: { x: -50, y: -40 },
        direction: { x: 1, y: 1 },
        callback: ({ x, y }) => {
          expect(x).to.equal(750);
          expect(y).to.equal(760);
        }
      });
    });

    it('should calculate the direction correctly {-1, 1}', () => {
      anchor = new Anchor({
        position: { x: 50, y: -40 },
        direction: { x: -1, y: 1 },
        callback: ({ x, y }) => {
          expect(x).to.equal(50);
          expect(y).to.equal(760);
        }
      });
    });

    it('should calculate the direction correctly {-1, -1}', () => {
      anchor = new Anchor({
        position: { x: 50, y: 40 },
        direction: { x: -1, y: -1 },
        callback: ({ x, y }) => {
          expect(x).to.equal(50);
          expect(y).to.equal(40);
        }
      });
    });

    it('should calculate the direction correctly {1, -1}', () => {
      anchor = new Anchor({
        position: { x: -50, y: 40 },
        direction: { x: 1, y: -1 },
        callback: ({ x, y }) => {
          expect(x).to.equal(750);
          expect(y).to.equal(40);
        }
      });
    });

    it('should calculate the direction correctly {0, 0}', () => {
      anchor = new Anchor({
        position: { x: 50, y: -40 },
        direction: { x: 0, y: 0 },
        callback: ({ x, y }) => {
          expect(x).to.equal(450);
          expect(y).to.equal(360);
        }
      });
    });
  });
});
