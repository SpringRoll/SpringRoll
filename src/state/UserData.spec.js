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
  } catch(e) {
    didThrow = true;
  }

  expect(didThrow).to.equal(true);
}

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
    })
  });

  // ---------------------------------------------------------------------
  //                               IndexedDB
  // ---------------------------------------------------------------------

  // connecting ----------------------------------------------------------

  describe('connect', () => {
    it('Should reject if Bellhop is not connected', async () => {
      container.connected = false;
      await assertThrows(() => UserData.IDBOpen('value'));
    });

    it('Should timeout if no response from Container', async () => {
      await assertThrows(() => UserData.IDBOpen('value'));
    });

    describe('data formatting', () => {
      beforeEach(() => {
        sinon.stub(container, 'send');
      });

      afterEach(() => {
        container.send.restore();
      });

      it('should properly format, send, and receive an event', async () => {
        // start the IDBOpen workflow
        const promise = UserData.IDBOpen('test');

        // trigger the fake response from the client
        container.trigger({
          type: 'IDBOpen',
          data: { result: "Success: IDBOpen", success: true }
        });

        // wait for UserData to receive the event
        const result = await promise;

        // make sure the UserData formatted it properly
        expect(result.success).to.equal(true);
      });
    });
  });

  // Reading ------------------------------------------------------------------

  describe('IDB read', () => {
    it('Should reject if Bellhop is not connected', async () => {
      container.connected = false;
      await assertThrows(() => UserData.IDBRead('value'));
    });

    it('Should timeout if no response from Container', async () => {
      await assertThrows(() => UserData.IDBRead('value'));
    });

    describe('data formatting', () => {
      beforeEach(() => {
        sinon.stub(container, 'send');
      });

      afterEach(() => {
        container.send.restore();
      });

      it('should properly format, send, and receive an event', async () => {
        // start the IDBRead workflow
        const promise = UserData.IDBRead('test', 'testKey');

        // trigger the fake response from the client
        container.trigger({
          type: 'IDBRead',
          data: { result: "item", success: true}
        });

        // wait for UserData to receive the event
        const result = await promise;

        // make sure the UserData formatted it properly
        expect(result.data.result).to.equal('item');
      });
    });
  });

  // Adding ------------------------------------------------------------------

  describe('IDB add', () => {
    it('Should reject if Bellhop is not connected', async () => {
      container.connected = false;
      await assertThrows(() => UserData.IDBAdd('value'));
    });

    it('Should timeout if no response from Container', async () => {
      await assertThrows(() => UserData.IDBAdd('value'));
    });

    describe('data formatting', () => {
      beforeEach(() => {
        sinon.stub(container, 'send');
      });

      afterEach(() => {
        container.send.restore();
      });

      it('should properly format, send, and receive an event', async () => {
        // start the IDBAdd workflow
        const promise = UserData.IDBAdd('test', 'testKey');

        // trigger the fake response from the client
        container.trigger({
          type: 'IDBAdd',
          data: { result: "Success: IDBAdd", success: true}
        });

        // wait for UserData to receive the event
        const result = await promise;

        // make sure the UserData formatted it properly
        expect(result.data.success).to.equal(true);
      });
    });
  });

  // Updating ------------------------------------------------------------------

  describe('IDB Update', () => {
    it('Should reject if Bellhop is not connected', async () => {
      container.connected = false;
      await assertThrows(() => UserData.IDBUpdate('value'));
    });

    it('Should timeout if no response from Container', async () => {
      await assertThrows(() => UserData.IDBUpdate('value'));
    });

    describe('data formatting', () => {
      beforeEach(() => {
        sinon.stub(container, 'send');
      });

      afterEach(() => {
        container.send.restore();
      });

      it('should properly format, send, and receive an event', async () => {
        // start the IDBUpdate workflow
        const promise = UserData.IDBUpdate('test', 'testKey');

        // trigger the fake response from the client
        container.trigger({
          type: 'IDBUpdate',
          data: { result: "Success: IDBUpdate", success: true}
        });

        // wait for UserData to receive the event
        const result = await promise;

        // make sure the UserData formatted it properly
        expect(result.data.success).to.equal(true);
      });
    });
  });

  // Deleting ------------------------------------------------------------------

  describe('IDB Delete', () => {
    it('Should reject if Bellhop is not connected', async () => {
      container.connected = false;
      await assertThrows(() => UserData.IDBAdd('value'));
    });

    it('Should timeout if no response from Container', async () => {
      await assertThrows(() => UserData.IDBAdd('value'));
    });

    describe('data formatting', () => {
      beforeEach(() => {
        sinon.stub(container, 'send');
      });

      afterEach(() => {
        container.send.restore();
      });

      it('should properly format, send, and receive an event', async () => {
        // start the IDBAdd workflow
        const promise = UserData.IDBAdd('test');

        // trigger the fake response from the client
        container.trigger({
          type: 'IDBAdd',
          data: { result: "Success: IDBAdd", success: true}
        });

        // wait for UserData to receive the event
        const result = await promise;

        // make sure the UserData formatted it properly
        expect(result.data.success).to.equal(true);
      });
    });
  });

  // Read All ------------------------------------------------------------------

  describe('IDB read all', () => {
    it('Should reject if Bellhop is not connected', async () => {
      container.connected = false;
      await assertThrows(() => UserData.IDBReadAll('value'));
    });

    it('Should timeout if no response from Container', async () => {
      await assertThrows(() => UserData.IDBReadAll('value'));
    });

    describe('data formatting', () => {
      beforeEach(() => {
        sinon.stub(container, 'send');
      });

      afterEach(() => {
        container.send.restore();
      });

      it('should properly format, send, and receive an event', async () => {
        // start the IDBReadAll workflow
        const promise = UserData.IDBReadAll('test');

        // trigger the fake response from the client
        container.trigger({
          type: 'IDBReadAll',
          data: { result: ["item1", "item2"], success: true }
        });

        // wait for UserData to receive the event
        const result = await promise;

        // make sure the UserData formatted it properly
        expect(result.data.result[1]).to.equal('item2');
      });
    });
  });
  // closing ------------------------------------------------------------------

  describe('IDB Close', () => {
    it('Should reject if Bellhop is not connected', async () => {
      container.connected = false;
      await assertThrows(() => UserData.IDBClose('value'));
    });

    it('Should timeout if no response from Container', async () => {
      await assertThrows(() => UserData.IDBClose('value'));
    });

    describe('data formatting', () => {
      beforeEach(() => {
        sinon.stub(container, 'send');
      });

      afterEach(() => {
        container.send.restore();
      });

      it('should properly format, send, and receive an event', async () => {
        // start the IDBClose workflow
        const promise = UserData.IDBClose('test');

        // trigger the fake response from the client
        container.trigger({
          type: 'IDBClose',
          data: { result: 'Success: IDBClose', success: true }
        });

        // wait for UserData to receive the event
        const result = await promise;

        // make sure the UserData formatted it properly
        expect(result.data.success).to.equal(true);
      });
    });
  });
});
