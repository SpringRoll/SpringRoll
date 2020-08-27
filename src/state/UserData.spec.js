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
});
