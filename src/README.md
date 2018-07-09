# Application Class
The SpringRoll Application provides the main entrypoint for games. In particular, it provides access to any
functionality provided by plugins along with access to any state set or changed by the container.

## Usage Example
```javascript
var application = new springroll.Application();
application.state.ready.subscribe(function(isReady) {
  if(!isReady) {
    return;
  }

  // all plugins have loaded
});
```
