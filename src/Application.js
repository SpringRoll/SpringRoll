export class Application {
  constructor() {
    this.listeners = {};
    Application._plugins.forEach(plugin => plugin.setup.call(this));
    
    let preloads = Application._plugins
      .map(plugin => this.promisify(plugin.preload))
    Promise.all(preloads).then(() => this.emit('init'));
  }

  on(eventName, method) {
    this.listeners[eventName] = this.listeners[eventName] || [];
    this.listeners[eventName].push(method);
  }

  emit(eventName, data) {
    if(this.listeners[eventName] instanceof Array) {
      this.listeners[eventName].forEach(function(callback) {
        callback(data);
      });
    }
  }

  promisify(f) {
    // if it takes no argument, assume that it's synchronous or returns a Promise
    if(f.length === 0) {
      return Promise.resolve(f.call(this));
    }
    
    // if it has an argument, that means it uses a callback structure    
    return new Promise((resolve, reject) => {
      f.call(this, function(error) {
        if(error) {
          reject(error);
        } else {
          resolve(error);
        }
      });
    });
  }
}

Application._plugins = [];
