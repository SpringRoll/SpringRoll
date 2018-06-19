import { Controller } from './Controller';

describe('controller', () => {
  it('Should only accept functions', () => {
    const controller = new Controller({
      1: null,
      2: () => {},
      3: 'a',
      4: 4,
      5: {},
      6: undefined
    });

    expect(controller.keys.length).to.equal(1);
  });

  it('Should call functions on key press', done => {
    const controller = new Controller({
      enter: function() {
        done();
      }.bind(this)
    });

    const event = new Event('keydown');
    event.key = 'Enter';
    window.dispatchEvent(event);
    controller.update();
  });

  it('Should not call functions when key is not pressed', done => {
    const controller = new Controller({
      enter: function() {
        done(new Error());
      }.bind(this)
    });

    const eventDown = new Event('keydown');
    eventDown.key = 'Enter';
    window.dispatchEvent(eventDown);

    const eventUp = new Event('keyup');
    eventUp.key = 'Enter';
    window.dispatchEvent(eventUp);

    controller.update();
    setTimeout(() => {
      done();
    }, 10);
  });
});
