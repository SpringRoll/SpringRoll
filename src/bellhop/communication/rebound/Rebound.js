/**
 *
 *
 * @export
 * @class Rebound
 * @property {window | contentWindow} receiver The object that
 * @property {boolean} isChild
 * @property {string} iFrameId The id for the instance of rebound
 * @property {Client} client the client object instance used by Rebound
 */
export default class Rebound {
  /**
   * Creates an instance of Rebound.
   * @memberof Rebound
   */
  constructor({
    iFrameId = undefined,
    client = undefined,
    autoConnect = false
  } = {}) {
    this.isChild = !window.frames.length;
    if ('string' === typeof iFrameId) {
      this.setIFrame(iFrameId);
    }
    if ('undefined' !== typeof client) {
      this.setClient(client);
    }

    if (this.isChild && autoConnect) {
      this.randId = 'Rebound_' + Math.random().toString();
      this.receiver = parent;
      this.dispatch({ event: 'connected', id: this.randId });
    }
    window.addEventListener('message', this.onMessage.bind(this));
  }

  /**
   * This method creates a connection with the host and starts the message listener
   * this method should be overridden in case the connect message that is recieved
   * back is in a different format other than an object.
   * @memberof Rebound
   */
  connect() {
    this.dispatch({ event: 'connected', id: this.randId });
  }

  /**
   * will set the id, get the iframe context and the contentWindow while also
   * focusing the iframe
   * @param {string} id
   * @memberof Rebound
   */
  setIFrame(id) {
    if ('undefined' !== typeof id && !this.isChild) {
      this.receiver = document.getElementById(id).contentWindow;

      this.receiver.focus();
    }
  }

  /**
   * set the rebound on that instance of client
   * @param {any} client
   * @memberof Rebound
   */
  setClient(client) {
    if ('undefined' !== typeof client && 'undefined' === typeof this.client) {
      this.client = client;
      client.setRebound(this);
    }
  }

  /**
   * if a receiver is defined, a postMessage event will be sent from the parent to
   * the child of iframe or vise versa and will pass the specified data along with
   * it.
   * @param {Object} event
   * @memberof Rebound
   */
  dispatch(event) {
    if (!this.receiver) {
      return;
    }

    if (!this.isChild) {
      this.receiver.focus();
    }

    event.id = this.randId;

    console.log(this.receiver);

    this.receiver.postMessage(event, '*');
  }

  /**
   * if a proper random id is set and client is also setup a dispatch event will
   * be set to client and the proper data will be passed along
   * @param {Object} event
   * @memberof Rebound
   */
  onMessage(event) {
    const data = event.data;

    if ('undefined' === typeof data.id || !this.client) {
      return;
    }

    if (data.event === 'connected') {
      this.randId = data.id;
    }

    if (data.id === this.randId) {
      this.client.dispatch(data.event, data.value, true);
    }
  }
}
