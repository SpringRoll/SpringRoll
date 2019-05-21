# Application Plugins
SpringRoll provides the ability to register plugins for the application to attach new behavior.

## Execution Order and Intent
| Function | Description | Intent |
| --- | --- | --- |
| `constructor` | called when the plugin is created | Used for setting options |
| `preload` | asynchronously called during `Application` startup | Used for any api calls that are needed to load data for the plugin to operate correctly |
| `init` | called synchronously after all plugin's `preload` functions have resolved | Used for any further initialization |
| `start` | called synchronously after all plugin's `init` functions have been called | this is where your plugin should start any of it's operations, if required. |

**Note**: `preload`, `init` and `start` functions are all optional. 


## Example
here is a brief example of how a plugin might be created:
```javascript
import { ApplicationPlugin } from 'springroll/plugins/ApplicationPlugin';

export default class CustomPlugin extends ApplicationPlugin {
  constructor(options) {
    super({ name: 'custom' });
    // custom constructor code
  }

  preload(app) {
    // custom asynchronous code. Expected to return a Promise.
    return fetch(someApiEndpoint)
      .then(response => response.json())
      .then(json => this.json = json);
  }

  init(app) {
    // custom initialization synchronous code
    this.otherPlugin = Application.getPlugin('otherPlugin');

    app.state.musicVolume.subscribe(() => {
      // app state change code.
      this.otherPlugin.update();
    });
  }

  start(app) {
    // custom kick off synchronous code.
    app.state.musicVolume.value = this.json.music.volume;
  }
}
```

Once you've created a plugin, you'll need to register it before instantiating the application:

```javascript
import { Application } from 'springroll';
import CustomPlugin from './CustomPlugin';

Application.uses(new CustomPlugin());

const myApp = new Application();
myApp.state.ready.subscribe(() => {
  console.log('Ready!');
});
```

## Plugin Dependencies
All plugins must declare a unique key `name` which allows other plugins to depend on it. For instance, in the above case, `CustomPlugin` declares it's name as `'custom'`, and during initialization it calls `getPlugin` to retrieve a reference to `'otherPlugin'`.

`getPlugin` can be called at any time. but we recommend keeping it in `init` but recognize this might not always be possible.

it is highly recommended that plugins do not have circular dependencies, if `A` depends on `B`, `B` **should not** depend on `A`. 


