![logo](http://springroll.io/assets/images/logo.png)

# SpringRoll


SpringRoll is a light-weight toolset for building accessible HTML5 games. The latest version, SpringRoll 2 is a large departure from its predecessor in that it provides less structure for game development while instead focusing on utilities to help make games more accessible and deployable at scale.

## Design Considerations

The SpringRoll ecosystem provides a combination of mechanisms for deploying games via the web:

* [SpringRollConnect](), a release management system for games.
* The [SpringRollContainer](https://github.com/SpringRoll/SpringRollConnect), a iframe-based controller for interacting with games.
* [Bellhop](https://github.com/SpringRoll/Bellhop), an event layer that enriches the [postMessage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) for improved communication between the container and game.

SpringRoll games, also referred to as Applications, are typically hosted in iframe and controlled via a SpringRoll Container instance. This extra layer is mainly used to separate the game's internals from the environment in which it lives. This allows the game to live in multiple environments without having to be coded for all of them at once. The application can request relevant information from the container without having to know where that information came from.

## Installation
SpringRoll is both ES6 module and UMD compatible, and is [available via NPM](https://www.npmjs.com/package/springroll). NPM can install it directly from the command line:

```
npm install --save springroll@2
```

However, to request a specific commit or branch, update package.json directly:

```json
{
  ...
  "dependencies" : {
    "springroll": "git+https://github.com/SpringRoll/SpringRoll.git#v2"
  }
  ...
}
```

Once the module is installed, SpringRoll can be imported in ES6 directly:

```javascript
import * as springroll from 'springroll';

const app = new springroll.Application();
```

or with CommonJS:

```javascript
const springroll = require('springroll');

const app = new springroll.Application();
```

or even as a browser global:

```html
<script src="node_modules/springroll/dist/SpringRoll.js"></script>
<script>
const app = new window.springroll.Application();
</script>
```

## Module Overview
SpringRoll consists of a handful of modules intended to help developers improve the accessibility of their game.

### Application Module
The `Application` class provides the main communication bus through which the game can send and receive messages to the container. It also manages global game state, such as pause and captions display. More information can be found in the [Application module documentation](./src/README.md)

### Accessibility Module
SpringRoll contains submodules for various accessibility testing and enhancement. The [Color Filter module](./accessibility/ColorFilter/README.md) provides filters for testing color blindness support in your game. Enabling the class allows developers to see what their game would look like for various types of color vision deficiency. The [Speech Synth module](./accessibility/SpeechSynth/README.md) gives developers the ability to synthesize speech from text.

### Controller Module
The [Controller module](./controller/README.MD) provides a mechanism for mapping keyboard input to functions which can help centralize user input management and make supporting multiple input mechanisms easier.

### Debugger Module
The Debugger module provides a centralized set of methods for logging that can be enabled or disabled at runtime.

### Localization Module
The Localization module provides support for supporting [multiple languages in a  game](./localization/localizer/README.md) and also [captions](./localization/captions/README.md)

### Scale Manager Module
The Scale Manager module helps developers to react to screen size changes.

### State Manager Module
The State Manager module provides classes for creating subscribable properties that notify listeners when they are changed. This is used for managing pause, captions, and audio mute state in the [Application class](./src/README.md) but can also be used for other generic uses.