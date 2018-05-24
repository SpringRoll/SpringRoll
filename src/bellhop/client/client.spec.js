import { Client } from './client';
import { Rebound } from '../rebound/rebound';

describe('Bellhop Client:', () => {
  let client;
  let rebound;
  beforeEach(() => {
    client = new Client();
    rebound = new Rebound();

    rebound.setClient(client);
  });

  describe('the basic use of this', () => {
    it('should have created a client', () => {
      expect(client).to.not.be.undefined;
    });

    it('should not be able to set rebound after setting client', () => {
      client.rebound.randId = 'test';
      client.setRebound();
      expect(client.rebound.randId).to.equal('test');
    });

    it('should be able to set an on event', () => {
      client.addEvents('focus');

      client.on('focus', () => {
        return 100;
      });

      client.on('focus', () => {
        return 200;
      });

      expect(client.events.focus).to.not.be.undefined;
      expect(client.events.focus()).to.equal(100);
    });

    it('should not be able to set an unauthorized event', () => {
      client.on('notanevent', () => {
        return 100;
      });

      expect(client.events.hasOwnProperty('notanevent')).to.be.false;
    });

    it('should not be able to set an event after destroying client', () => {
      expect(client.events).to.not.be.undefined;

      client.destroy();

      client.on('focus', () => {
        return 100;
      });

      client.off('focus');

      expect(client.events).to.be.undefined;
    });

    it('should be able to add a single new possible event', () => {
      expect(client.events.hasOwnProperty('testevent')).to.be.false;

      client.addEvents('testevent');

      expect(client.events.hasOwnProperty('testevent')).to.be.true;
    });

    it('should be able to add multiple new possible event', () => {
      expect(client.events.hasOwnProperty('testevent')).to.be.false;
      expect(client.events.hasOwnProperty('testevent2')).to.be.false;

      client.addEvents(['testevent', 'testevent2']);

      expect(client.events.hasOwnProperty('testevent')).to.be.true;
      expect(client.events.hasOwnProperty('testevent2')).to.be.true;
    });

    it('should only be able to add strings as new possible event', () => {
      let numOfKeysBefore = Object.keys(client.events).length;
      let eventTypes = [1, [], {}, 1.2, undefined, null, true];

      expect(client.events.hasOwnProperty('testevent')).to.be.false;

      for (let i = 0; i < eventTypes.length; i++) {
        expect(client.events.hasOwnProperty(eventTypes[i])).to.be.false;
        client.addEvents(eventTypes[i]);
      }

      client.addEvents('testevent');
      expect(client.events.hasOwnProperty('testevent')).to.be.true;

      for (let i = 0; i < eventTypes.length; i++) {
        expect(client.events.hasOwnProperty(eventTypes[i])).to.be.false;
      }

      let numOfKeysAfter = Object.keys(client.events).length;
      expect(numOfKeysBefore + 1).to.equal(numOfKeysAfter);
    });

    it('should not be able to overwrite a possible event', () => {
      expect(client.events.hasOwnProperty('testevent')).to.be.false;

      client.addEvents('testevent');
      client.on('testevent', function() {});

      expect(client.events.hasOwnProperty('testevent')).to.be.true;
      expect(client.events.testevent).to.not.be.undefined;

      client.addEvents('testevent');

      expect(client.events.testevent).to.not.be.undefined;
    });

    it('should not be able to add an empty string as a new possible event', () => {
      expect(client.events.hasOwnProperty('')).to.be.false;

      client.addEvents('');

      expect(client.events.hasOwnProperty('')).to.be.false;
    });

    it('should not be able to add a new possible event after destroying client', () => {
      expect(client.events).to.not.be.undefined;

      client.destroy();
      client.addEvents('testevent');

      expect(client.events).to.be.undefined;
    });

    it('should be able to dispatch an event', () => {
      client.addEvents('focus');

      client.on('focus', () => {
        return 100;
      });

      expect(client.events.focus).to.not.be.undefined;
      client.dispatch('focus');
    });

    it('should not error when not able to dispatch an event', () => {
      client.dispatch('focus', undefined, true);
    });

    it('should not be able to dispatch an event after destroying client', () => {
      expect(client.events).to.not.be.undefined;

      client.destroy();

      client.on('focus', () => {
        return 100;
      });

      client.dispatch('focus');

      expect(client.events).to.be.undefined;
    });

    it('should not be able to dispatch an unauthorized event', () => {
      client.on('notanevent', () => {
        return 100;
      });

      expect(client.events.hasOwnProperty('notanevent')).to.be.false;
      client.dispatch('notanevent');
    });

    it('should be able to remove an event', () => {
      client.addEvents(['focus', 'blur']);

      client.on('blur', () => {
        return 100;
      });

      client.on('focus', () => {
        return 100;
      });

      expect(client.events.blur).to.not.be.undefined;
      expect(client.events.focus).to.not.be.undefined;

      client.off('focus');

      expect(client.events.blur).to.not.be.undefined;
      expect(client.events.focus).to.be.undefined;
    });

    it('should not try to remove an event that doesnt exist', () => {
      client.off('notanevent');

      expect(client.events.hasOwnProperty('notanevent')).to.be.false;
    });

    it('should be able to destroy all events', () => {
      client.addEvents('focus');

      client.on('focus', () => {
        return 100;
      });

      expect(client.events.focus).to.not.be.undefined;

      client.destroy();

      expect(client.events).to.be.undefined;
    });
  });
});
