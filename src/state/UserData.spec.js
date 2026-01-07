import sinon from 'sinon';

import { UserData } from './UserData';
import container from '../communication/BellhopSingleton';

document.body.addEventListener('message', t => {
  console.log('called =>', t);
});

const assertThrows = async (F) => {
  let didThrow = false;
  try {
    await F();
  // eslint-disable-next-line no-unused-vars
  } catch (e) {
    didThrow = true;
  }

  expect(didThrow).to.equal(true);
};

describe('UserData', () => {
  beforeEach(() => {
    container.connected = true;
  });

  afterEach(() => {
    container.connected = false;
  });

  describe('read', () => {
    it('Should reject if Bellhop is not connected', async () => {
      container.connected = false;
      await assertThrows(() => UserData.read('value'));
    });

    it('Should timeout if no response from Container', async () => {
      await assertThrows(() => UserData.read('value'));
    });

    describe('data formatting', () => {
      beforeEach(() => {
        sinon.stub(container, 'send');
      });

      afterEach(() => {
        container.send.restore();
      });

      it('should properly format, send, and receive an event', async () => {
        // start the read workflow
        const promise = UserData.read('test');

        // make sure that the event was properly formatted before being sent over the iframe boundary
        expect(container.send.calledWith('userDataRead', 'test')).to.equal(true);

        // trigger the fake response from the client
        container.trigger({
          type: 'userDataRead',
          data: 'hello'
        });

        // wait for UserData to receive the event
        const result = await promise;

        // make sure the UserData formatted it properly
        expect(result).to.equal('hello');
      });
    });
  });

  describe('write', () => {
    it('Should reject if Bellhop is not connected', async () => {
      container.connected = false;
      await assertThrows(() => UserData.write('value', { foo: 'bar' }));
    });

    it('Should timeout if no response from Container', async () => {
      await assertThrows(() => UserData.write('name', { foo: 'bar' }));
    });
  });

  describe('delete', () => {
    it('should reject if Bellhop is not connected', async () => {
      container.connected = false;
      await assertThrows(() => UserData.delete('value'));
    });

    describe('data formatting', () => {
      beforeEach(() => sinon.stub(container, 'send'));
      afterEach(() => container.send.restore());

      it('should properly format, send, and receive an event', async () => {
        // start the delete workflow
        const promise = UserData.delete('test');

        // make sure that the event was properly formatted before sent over the iframe boundary
        expect(container.send.calledWith('userDataRemove', 'test')).to.equal(true);

        // trigger the fake response from the client
        container.trigger('userDataRemove');

        // make sure the promise resolves properly
        await promise;
      });
    });
  });
});
