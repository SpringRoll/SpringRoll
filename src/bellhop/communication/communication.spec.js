import Rebound from './rebound/Rebound';
import Client from './client/Client';

const client = new Client();
const rebound = new Rebound();

const testUrl = 'data:text/html;base64,R0lG';
const iFrameId = 'testIframe';

const testIframe = document.createElement('iframe');
testIframe.setAttribute('id', iFrameId);
testIframe.setAttribute('src', testUrl);
document.body.appendChild(testIframe);

describe('Bellhop Communication', () => {
  it('should not error when recieving events without a client', () => {
    // expect(rebound.id).to.be.undefined;

    rebound.setIFrame(iFrameId);

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

    // expect(rebound.id).to.be.undefined;
  });

  it('should not error when recieving events without a rebound id', () => {
    // expect(rebound.id).to.be.undefined;

    rebound.setIFrame(iFrameId);

    let init = {
      data: {
        event: 'connected',
        value: 'testvalue'
      },
      origin: '*'
    };

    rebound.onMessage(new MessageEvent('message', init));

    // expect(rebound.id).to.be.undefined;
  });

  it('should not dispatch events if ids dont match', () => {
    // expect(rebound.id).to.be.undefined;

    client.addEvent('testevent');

    rebound.setIFrame(iFrameId);
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

    expect(rebound.id).to.exist;

    init.data.id = 'wrongid';
    init.data.event = 'testevent';

    rebound.onMessage(new MessageEvent('message', init));
  });

  it('should set rebound id if is undefined and event is connected', () => {
    // expect(rebound.id).to.be.undefined;

    rebound.setIFrame(iFrameId);
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

    expect(rebound.id).to.equal('testid');
  });

  it('should be able to handle events from child', done => {
    // expect(rebound.id).to.be.undefined;

    rebound.setIFrame(iFrameId);
    rebound.setClient(client);
    client.addEvent('connected');
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

    expect(rebound.id).to.equal(randId);
  });
});
