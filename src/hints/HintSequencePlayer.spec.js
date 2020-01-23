import { HintSequencePlayer } from './HintSequencePlayer';
import Sinon from 'sinon';

describe('HintSequencePlayer', function() {
  it('should invoke callbacks that are added', function() {
    const player = new HintSequencePlayer();
    const callback = Sinon.fake();

    player.add(callback);
    player.play();

    expect(callback.callCount).to.equal(1);
  });

  it('should only invoke one callback each time play is invoked', function() {
    const player = new HintSequencePlayer();
    const callback1 = Sinon.fake();
    const callback2 = Sinon.fake();

    player.add(callback1);
    player.add(callback2);

    player.play(); // plays callback1

    expect(callback1.callCount).to.equal(1);
    expect(callback2.callCount).to.equal(0);
  });

  it('should invoke callbacks in the order they are added', function() {
    const player = new HintSequencePlayer();
    const callback1 = Sinon.fake();
    const callback2 = Sinon.fake();

    player.add(callback1);
    player.add(callback2);

    player.play(); // plays callback1

    expect(callback1.callCount).to.equal(1);
    expect(callback2.callCount).to.equal(0);

    player.play(); // plays callback2

    expect(callback1.callCount).to.equal(1);
    expect(callback2.callCount).to.equal(1);
  });

  it('should return to the start of the sequence', function() {
    const player = new HintSequencePlayer();
    const callback1 = Sinon.fake();
    const callback2 = Sinon.fake();

    player.add(callback1);
    player.add(callback2);

    player.play(); // plays callback1
    player.play(); // plays callback2
    player.play(); // plays callback1

    expect(callback1.callCount).to.equal(2);
    expect(callback2.callCount).to.equal(1);
  });

  it('should not invoke callbacks that have been removed', function() {
    const player = new HintSequencePlayer();
    const callback = Sinon.fake();

    player.add(callback);
    player.play();

    expect(callback.callCount).to.equal(1);

    player.remove(callback);
    player.play();

    expect(callback.callCount).to.equal(1);
  });

  it('should remove all callbacks when cleared', function() {
    const player = new HintSequencePlayer();
    const callback1 = Sinon.fake();
    const callback2 = Sinon.fake();

    player.add(callback1);
    player.add(callback2);

    player.clear();

    player.play();
    player.play();

    expect(callback1.callCount).to.equal(0);
    expect(callback2.callCount).to.equal(0);
  });
});
