import { UserData } from './UserData';
import comm from '../communication/BellhopSingleton';

document.body.addEventListener('message', t => {
  console.log('called =>', t);
});

describe('UserData', () => {
  describe('read', () => {
    it('Should reject if Bellhop is not connected', done => {
      UserData.read('value').catch(() => {
        done();
      });
    });
    it('Should timeout if no response from Container', done => {
      comm.connected = true;
      UserData.read('name').catch(err => {
        expect(err).to.equal('No Response');
        done();
      });
    });
  });
  describe('write', () => {
    it('Should reject if Bellhop is not connected', done => {
      UserData.write('value', { foo: 'bar' }).catch(() => {
        done();
      });
    });
    it('Should timeout if no response from Container', done => {
      comm.connected = true;
      UserData.write('name', { foo: 'bar' }).catch(err => {
        expect(err).to.equal('No Response');
        done();
      });
    });
  });
});
