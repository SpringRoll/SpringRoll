import Rebound from './rebound/Rebound';
import Client from './client/Client';

const testUrl = 'data:text/html;base64,R0lG';
const iFrameId = 'testIframe';

let testIframe = document.createElement('iframe');

let client = new Client();
let rebound = new Rebound();

testIframe.setAttribute('id', iFrameId);
testIframe.setAttribute('src', testUrl);
document.body.appendChild(testIframe);

beforeEach(done => {
  testIframe = document.createElement('iframe');
  testIframe.setAttribute('id', iFrameId);
  testIframe.setAttribute('src', testUrl);
  document.body.appendChild(testIframe);

  testIframe.onload = () => {
    client = new Client();
    rebound = new Rebound();
    done();
  };
});

describe('Bellhop Communication', () => {
  it('should not error when recieving events without a client', () => {
    rebound.setIFrame(iFrameId);

    let init = {
      data: {
        event: 'connected',
        value: 'testvalue',
        id: 'Rebound_' + Math.random().toString()
      },
      origin: '*'
    };

    rebound.onMessage(new MessageEvent('message', init));
  });

  it('should not error when recieving events without a rebound id', () => {
    rebound.setIFrame(iFrameId);

    let init = {
      data: {
        event: 'connected',
        value: 'testvalue'
      },
      origin: '*'
    };

    rebound.onMessage(new MessageEvent('message', init));
  });

  it('should not dispatch events if ids dont match', () => {
    expect(rebound.receiver).to.be.undefined;
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

    expect(rebound.randId).to.exist;

    init.data.id = 'wrongid';
    init.data.event = 'testevent';

    rebound.onMessage(new MessageEvent('message', init));
  });

  it('should set rebound id if is undefined and event is connected', () => {
    expect(rebound.randId).to.be.undefined;

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

    expect(rebound.randId).to.equal('testid');
  });

  it('should be able to handle events from child', done => {
    expect(rebound.randId).to.be.undefined;
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

    expect(rebound.randId).to.equal(randId);
  });
});
