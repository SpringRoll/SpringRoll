import PageVisibility from './PageVisibility';

describe('Utility PageVisibility', () => {
  /**
   *
   * Function for testing the event listeners
   */
  function callTest() {
    console.log('did call');
    this.callCount++;
  }

  const pv = new PageVisibility(callTest, callTest);

  it('Should call functions from defined events', () => {
    pv.callCount = 0;
    pv.enable();

    window.dispatchEvent(new Event('pagehide'));
    window.dispatchEvent(new Event('pageshow'));
    window.dispatchEvent(new Event('blur'));
    window.dispatchEvent(new Event('focus'));
    window.dispatchEvent(new Event('visibilitychange'));

    expect(pv.callCount).to.equal(5);
    // expect(pv.callCount)
  });

  it('Should stop listening to events when disabled', () => {
    pv.callCount = 0;

    pv.disable();

    window.dispatchEvent(new Event('pagehide'));
    window.dispatchEvent(new Event('pageshow'));
    window.dispatchEvent(new Event('blur'));
    window.dispatchEvent(new Event('focus'));
    window.dispatchEvent(new Event('visibilitychange'));
    expect(pv.callCount).to.equal(0);
  });
});
