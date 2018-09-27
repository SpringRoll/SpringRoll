import { HintSequencePlayer } from './HintSequencePlayer';

describe('HintSequencePlayer', function() {
  it('should invoke callbacks that are added', function() {
    const player = new HintSequencePlayer();

    let count = 0;
    player.add(() => {
      count++;
    });

    player.play();

    expect(count).to.equal(1);
  });



  it('should only invoke one callback each time play is invoked', function() {
    const player = new HintSequencePlayer();

    let count = 0;
    player.add(() => {
      count++;
    });

    player.add(() => {
      count--;
    });

    player.play();
    expect(count).to.equal(1);
  });

  it('should invoke callbacks in the order they are added', function() {
    const player = new HintSequencePlayer();

    let count = 0;
    player.add(() => {
      count += 2;
    });

    player.add(() => {
      count *= 3;
    });

    player.play();
    expect(count).to.equal(2);
    player.play();
    expect(count).to.equal(6);
  });

  it('should return to the start of the sequence', function() {
    const player = new HintSequencePlayer();

    let count = 0;
    player.add(() => {
      count += 1;
    });

    player.add(() => {
      //do nothing
    });

    player.play();
    expect(count).to.equal(1);
    player.play();
    expect(count).to.equal(1);
    player.play();
    expect(count).to.equal(2);
  });

  it('should not invoke callbacks that have been removed', function() {
    const player = new HintSequencePlayer();

    let count = 0;
    player.add(() => {
      count += 2;
    });

    const testCallback = () => {
      count *= 3;
    };
    player.add(testCallback);

    player.play();
    expect(count).to.equal(2);

    player.remove(testCallback);

    player.play();
    expect(count).to.equal(4);
  });

  it('should remove all callbacks when cleared', function() {
    const player = new HintSequencePlayer();

    let count = 0;
    player.add(() => {
      count += 2;
    });

    player.add(() => {
      count *= 3;
    });

    player.clear();

    player.play();
    player.play();
    expect(count).to.equal(0);
  });
});
