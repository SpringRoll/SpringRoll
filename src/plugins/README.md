# Application Plugins
SpringRoll provides the ability to register plugins for the application to attach new behavior.
Here's an example of a plugin:

```javascript
import { ApplicationPlugin } from 'springroll/plugins/ApplicationPlugin';

export default class CustomPlugin extends ApplicationPlugin {
  constructor() {
    let priority = 20;
    super(priority);
  }

  setup(application) {
    // custom synchronous code.
    application.customContent = {};
  }

  preload(application) {
    // custom asynchronous code. Expected to return a Promise.
    return fetch(someApiEndpoint)
      .then(response => response.json())
      .then(json => application.customContent = json);
  }
}
```

Once you've created a plugin, you'll need to register it before instantiating the application:

```javascript
import { Application } from 'springroll';
import CustomPlugin from './CustomPlugin';

Application.uses(new CustomPlugin());

const myApp = new Application();
myApp.on('init', function() {
  console.log('Ready!');
});
```
