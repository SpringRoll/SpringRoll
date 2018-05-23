import Client from './Client';

describe('Client', () => {
  const id = 'test';
  it('Should import', () => {
    expect(Client).to.exist;
  });

  const client = new Client();

  it('Should have default properties', () => {
    expect(client.events).to.be.empty;
    expect(client.rebound).to.be.undefined;
  });

  it('Should be able to add new events', () => {
    const test = () => {};

    client.on(id, test);

    expect(client.events[id]).to.equal(test);
  });

  it('Should not be able to over write a event that is already been assigned', () => {
    const test2 = x => x * 2;

    client.on(id, test2);

    expect(client.events[id]).to.not.equal(test2);
  });

  it('Should be able to remove events', () => {
    expect(client.events[id]).to.not.be.undefined;
    client.off(id);
    expect(client.events[id]).to.be.undefined;
  });

  it('Should be able to add a event of the same name after removing', () => {
    const test = () => 1;
    expect(client.events[id]).to.be.undefined;
    client.on(id, test);
    expect(client.events[id]).to.equal(test);
  });
});
