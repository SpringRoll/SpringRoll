import { Controller } from './Controller';
import { newEvent } from '../debug';

describe('controller', () => {
  it('Should accept a array of buttons', () => {
    const controller = new Controller([
      {
        key: 'Enter',
        down: console.log('key down')
      },
      { key: 'w', down: console.log('key down') },
      { key: 'a', down: console.log('key down') },
      { key: 's', down: console.log('key down') },
      { key: 'd', down: console.log('key down') },
      { key: ' ', down: console.log('key down') }
    ]);

    expect(controller.keys.length).to.equal(6);
  });

  it('Should call functions on key press', done => {
    const controller = new Controller([
      {
        key: 'enter',
        down: function() {
          done();
        }.bind(this)
      }
    ]);

    const event = newEvent('keydown');
    event.key = 'Enter';
    window.dispatchEvent(event);
    controller.update();
  });

  it('Should not be case-sensitive', done => {
    const controller = new Controller([
      {
        key: 'EnTeR',
        down: function() {
          done();
        }.bind(this)
      }
    ]);

    const event = newEvent('keydown');
    event.key = 'Enter';
    window.dispatchEvent(event);
    controller.update();
  });

  it('Should not call functions when key is not pressed', done => {
    const controller = new Controller([
      {
        key: 'Enter',
        down: function() {
          done(new Error());
        }.bind(this)
      }
    ]);

    const eventDown = newEvent('keydown');
    eventDown.key = 'Enter';
    window.dispatchEvent(eventDown);

    const eventUp = newEvent('keyup');
    eventUp.key = 'Enter';
    window.dispatchEvent(eventUp);

    controller.update();
    setTimeout(() => {
      done();
    }, 10);
  });
});
