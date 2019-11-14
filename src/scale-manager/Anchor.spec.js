import { Anchor } from './Anchor';

describe('Anchor', () => {
  it('should force direction to be -1 to 1', () => {
    const anchor = new Anchor({ direction: { x: -100, y: -100 } });

    expect(anchor.direction.x).to.equal(-1);
    expect(anchor.direction.x).to.equal(-1);
  });

  describe('direction', () => {
    let anchor;

    afterEach(() => {
      anchor.onResize({
        offset: { x: 15, y: 12 },
        gameSize: { x: 800, y: 800 }
      });
    });

    it('should calculate the direction correctly {1, 1}', () => {
      anchor = new Anchor({
        position: { x: 60, y: 30 },
        direction: { x: 1, y: 1 },
        callback: ({ x, y }) => {
          expect(x).to.equal(725);
          expect(y).to.equal(758);
        }
      });
    });

    it('should calculate the direction correctly {-1, 1}', () => {
      anchor = new Anchor({
        position: { x: 60, y: 30 },
        direction: { x: -1, y: 1 },
        callback: ({ x, y }) => {
          expect(x).to.equal(75);
          expect(y).to.equal(758);
        }
      });
    });

    it('should calculate the direction correctly {-1, -1}', () => {
      anchor = new Anchor({
        position: { x: 60, y: 30 },
        direction: { x: -1, y: -1 },
        callback: ({ x, y }) => {
          expect(x).to.equal(75);
          expect(y).to.equal(42);
        }
      });
    });

    it('should calculate the direction correctly {1, -1}', () => {
      anchor = new Anchor({
        position: { x: 60, y: 30 },
        direction: { x: 1, y: -1 },
        callback: ({ x, y }) => {
          expect(x).to.equal(725);
          expect(y).to.equal(42);
        }
      });
    });

    it('should calculate the direction correctly {0, 0}', () => {
      anchor = new Anchor({
        position: { x: 60, y: 30 },
        direction: { x: 0, y: 0 },
        callback: ({ x, y }) => {
          expect(x).to.equal(400);
          expect(y).to.equal(400);
        }
      });
    });
  });
});
