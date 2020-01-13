import { Controller } from './Controller';
import { newEvent } from '../debug';
import Sinon from 'sinon';

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

  it('Should call functions on key press', () => {
    const callback = Sinon.fake();
    const controller = new Controller([
      { key: 'enter', down: callback }
    ]);

    const event = newEvent('keydown');
    event.key = 'Enter';
    window.dispatchEvent(event);
    controller.update();

    expect(callback.callCount).to.equal(1);
  });

  it('Should not be case-sensitive', () => {
    const callback = Sinon.fake();
    const controller = new Controller([
      { key: 'EnTeR', down: callback}
    ]);

    const event = newEvent('keydown');
    event.key = 'Enter';
    window.dispatchEvent(event);
    controller.update();

    expect(callback.callCount).to.equal(1);
  });

  it('Should not call functions when key is not pressed', () => {
    const callback = Sinon.fake();
    const controller = new Controller([
      { key: 'Enter', down: callback }
    ]);

    const eventDown = newEvent('keydown');
    eventDown.key = 'Enter';
    window.dispatchEvent(eventDown);

    const eventUp = newEvent('keyup');
    eventUp.key = 'Enter';
    window.dispatchEvent(eventUp);

    controller.update();

    expect(callback.callCount).to.equal(0);
  });
});
