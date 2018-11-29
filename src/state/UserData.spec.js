import { UserData } from './UserData';

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
  });
  describe('write', () => {
    it('Should reject if Bellhop is not connected', done => {
      UserData.write('value', { foo: 'bar' }).catch(() => {
        done();
      });
    });
  });
});
