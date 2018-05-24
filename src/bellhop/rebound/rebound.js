/**
 * @export
 * @class Rebound
 * A string that contains a random id value used to tell rebound that the
 * events are still from rebound
 * @property {String} events
 * @property {Object} client
 * @property {Boolean} isChild
 * @property {Window} reciever
 * @property {HTMLIFrameElement} iframe
 * @property {String} iframeId
 */
export class Rebound {
  /**
   * Creates an instance of Rebound.
   * @memberof Rebound
   */
  constructor() {
    this.isChild = !window.frames.length;
    if (this.isChild) {
      this.randId = 'Rebound' + Math.random().toString();
      this.reciever = parent;
      this.dispatch({ event: 'connected', id: this.randId });
    }
    window.addEventListener('message', this.onMessage.bind(this));
  }

  /**
   * If an id is passed in and rebound in currently not in the iframe then it
   * will set the id, get the iframe context and the contentWindow while also
   * focusing the iframe
   *
   * @method setID
   * @param id string that contains the id of the iframe
   */
  setID(id) {
    if (!this.isChild && typeof id !== 'undefined') {
      this.iframeId = id;
      this.iframe = document.getElementById(id);
      this.reciever = this.iframe.contentWindow;

      this.iframe.focus();
    }
  }

  /**
   * if client is defined and has not been already set then set the client and
   * set the rebound on that instance of client
   *
   * @method setClient
   * @param client object that contains reference to the current client
   */
  setClient(client) {
    if (typeof client !== 'undefined' && typeof this.client === 'undefined') {
      this.client = client;
      client.setRebound(this);
    }
  }

  /**
   * if reciever is defined, a postMessage event will be sent from parent to
   * child of iframe or vise versa and will pass the specified data along with
   * it. Also if there is no random id created it will create on and pass it
   * along
   *
   * @method dispatch
   * @param event object that contains event data to be passed with event
   */
  dispatch(event) {
    if (typeof this.reciever === 'undefined') {
      return;
    }

    if (!this.isChild) {
      this.reciever.focus();
    }

    if (typeof this.randId === 'undefined') {
      this.randId = 'Rebound' + Math.random().toString();
    }

    event.id = this.randId;

    this.reciever.postMessage(event, '*');
  }

  /**
   * if a proper random id is set and client is also setup a dispatch event will
   * be set to client and the proper data will be passed along
   *
   * @method onMessage
   * @param event object that contains the info of a postMessage event from rebound
   */
  onMessage(event) {
    let data = event.data;

    if (typeof data.id === 'undefined' || typeof this.client === 'undefined') {
      return;
    }

    if (typeof this.randId === 'undefined' && data.event === 'connected') {
      this.randId = data.id;
    }

    if (data.id === this.randId) {
      this.client.dispatch(data.event, data.value, true);
    }
  }
}
