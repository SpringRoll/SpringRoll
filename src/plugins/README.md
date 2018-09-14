# Application Plugins
SpringRoll provides the ability to register plugins for the application to attach new behavior.
Here's an example of a plugin:

```javascript
import { ApplicationPlugin } from 'springroll/plugins/ApplicationPlugin';

export default class CustomPlugin extends ApplicationPlugin {
  constructor() {
    super({
      name: 'custom',
      required: ['another-plugin'],
      optional: ['would-be-nice']
    });
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

## Plugin Dependencies
All plugins declare a unique key `name` which allows other plugins to depend on it. For instance, in the above case,
`CustomPlugin` declares it's name as `'custom'`. Moreover it declares a required dependency called `'another-plugin'`.
It also declares an optional dependency called `'would-be-nice'`. Whenever a new SpringRoll `Application` object is
instantiated it will sort the dependencies in order so that `'custom'` is loaded _after_ `'another-plugin'` and
`'would-be-nice'` (if it's there). The `Application` will throw an error if a required dependency is missing, and only
warn if an optional is missing.
