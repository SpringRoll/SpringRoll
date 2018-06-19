# Application Plugins
SpringRoll provides the ability to register plugins for the application to attach new behavior.
Here's an example of a plugin:

```javascript
import { ApplicationPlugin } from 'springroll/plugins/ApplicationPlugin';

let priority = 20;
let CustomPlugin = new ApplicationPlugin(priority); // higher priority plugins execute sooner

CustomPlugin.setup = function() {
  // custom synchronous code. `this` is bound to the current Application
  this.customContent = {};
};

CustomPlugin.preload = function() {
  // custom asynchronous code. Expected to return a Promise.
  return fetch(someApiEndpoint)
    .then(response => response.json())
    .then(json => this.customContent = json);
};

export default CustomPlugin
```

Once you've created a plugin, you'll need to register it before instantiating the application:

```javascript
import { Application } from 'springroll';
import CustomPlugin from './CustomPlugin';

Application.uses(CustomPlugin);

const myApp = new Application();
myApp.on('init', function() {
  console.log('Ready!');
});
```
