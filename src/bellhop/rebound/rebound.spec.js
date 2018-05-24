import { Client } from '../client/client';
import { Rebound } from './rebound';

describe('Bellhop Rebound:', () => {
  let client;
  let rebound;
  let testIframe;
  let testUrl = 'data:text/html;base64,R0lG';

  beforeEach(done => {
    testIframe = document.createElement('iframe');
    testIframe.setAttribute('id', 'testIframe');
    testIframe.setAttribute('src', testUrl);
    document.body.appendChild(testIframe);

    testIframe.onload = () => {
      client = new Client();
      rebound = new Rebound();
      done();
    };
  });

  describe('the basic use of this', () => {
    it('should have created rebound', () => {
      expect(rebound).to.exist;
    });

    it('should not error if the iframe id is not set', () => {
      expect(rebound.iframeId).to.be.undefined;
      rebound.setID();
      expect(rebound.iframeId).to.be.undefined;
    });

    it('should be able to set the iframe id', () => {
      expect(rebound.iframeId).to.be.undefined;
      rebound.setID('testIframe');
      expect(rebound.iframeId).to.equal('testIframe');
    });

    it('should not error when recieving events without a client', () => {
      expect(rebound.randId).to.be.undefined;

      rebound.setID('testIframe');

      let randId = 'Rebound_' + Math.random().toString();
      let init = {
        data: {
          event: 'connected',
          value: 'testvalue',
          id: randId
        },
        origin: '*'
      };

      rebound.onMessage(new MessageEvent('message', init));

      expect(rebound.randId).to.be.undefined;
    });

    it('should not error when recieving events without a rebound id', () => {
      expect(rebound.randId).to.be.undefined;

      rebound.setID('testIframe');

      let init = {
        data: {
          event: 'connected',
          value: 'testvalue'
        },
        origin: '*'
      };

      rebound.onMessage(new MessageEvent('message', init));

      expect(rebound.randId).to.be.undefined;
    });

    it('should not dispatch events if ids dont match', () => {
      expect(rebound.randId).to.be.undefined;

      client.addEvents('testevent');

      rebound.setID('testIframe');
      rebound.setClient(client);

      let init = {
        data: {
          event: 'connected',
          value: 'testvalue',
          id: 'testid'
        },
        origin: '*'
      };

      rebound.onMessage(new MessageEvent('message', init));

      expect(rebound.randId).to.not.be.undefined;

      init.data.id = 'wrongid';
      init.data.event = 'testevent';

      rebound.onMessage(new MessageEvent('message', init));
    });

    it('should set rebound id if is undefined and event is connected', () => {
      expect(rebound.randId).to.be.undefined;

      rebound.setID('testIframe');
      rebound.setClient(client);

      let init = {
        data: {
          event: 'connected',
          value: 'testvalue',
          id: 'testid'
        },
        origin: '*'
      };

      rebound.onMessage(new MessageEvent('message', init));

      expect(rebound.randId).to.equal('testid');
    });

    it('should be able to handle events from child', done => {
      expect(rebound.randId).to.be.undefined;

      rebound.setID('testIframe');
      rebound.setClient(client);
      client.addEvents('connected');
      client.on('connected', value => {
        expect(value).to.equal('testvalue');
        done();
      });

      let randId = 'Rebound_' + Math.random().toString();
      let init = {
        data: {
          event: 'connected',
          value: 'testvalue',
          id: randId
        },
        origin: '*'
      };

      rebound.onMessage(new MessageEvent('message', init));

      expect(rebound.randId).to.equal(randId);
    });

    it('should not error if dispatching without client set', () => {
      expect(rebound.randId).to.be.undefined;
      rebound.setID('testIframe');
      rebound.dispatch({ event: 'connected' });
      expect(rebound.randId).to.be.not.undefined;
    });

    it('should not dispatch without a reciever set', () => {
      expect(rebound.randId).to.be.undefined;
      rebound.dispatch({ event: 'connected' });
      expect(rebound.randId).to.be.undefined;
    });

    it('should not add client if client is not passed in', () => {
      expect(rebound.client).to.be.undefined;
      rebound.setClient();
      expect(rebound.client).to.be.undefined;
    });
  });
});
