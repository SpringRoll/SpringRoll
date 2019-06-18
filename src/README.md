# Application Class
The SpringRoll Application provides the main entrypoint for games. In particular, it provides access to any
[functionality provided by plugins](./plugins) along with access to any state set or changed by the container.

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

## Features
When an Application is embedded via a [SpringRollContainer](https://github.com/SpringRoll/SpringRollContainer) it can
notify the container of it's supported features. To do this in a SpringRoll Application, pass them as an object to the
constructor:

```javascript
var myApp = new springroll.Application({
  features: {
    captions: false, // whether or not the game has captions
    sound: false, // whether or not the game has any sound
    vo: false, // whether or not the game has a VO
    music: false, // whether or not the game has music
    sfx: false, // whether or not the game has any sound effects
  }
});
```

Note that if any of `vo`, `music`, or `sfx` are available features, `sound` will be marked as a feature implicitly.
Also, all of these features are marked `false` by default.

## Handling State Change
The SpringRoll Application class has a general [StateManager](./state) instance attached for managing important
properties that can be changed via the container or outside environment.
Developers can subscribe to property changes, allowing the game to react appropriately to the given situation.
When certain features are enabled, SpringRoll warns if an associated state change listener is missing. For instance,
if the developer enables `sound` as a feature of the game, a subscriber to the `soundVolume` state must exist:

```javascript
var myApp = new springroll.Application({
  features: {
    sound: true
  }
});

myApp.state.soundVolume.subscribe(result => console.log('Value Between 0-1 for volume', result));
```

For each possible feature, there is an associated state that can be subscribed to:

```javascript
var myApp = new springroll.Application({
  features: {
    captions: true,
    sound: true,
    vo: true,
    music: true,
    sfx: true,
    pointerSize: true,
    controlSensitivity: true,
    buttonSize: true,
    removableLayers: true,
    hudPosition: true
  }
});

myApp.state.captionsMuted.subscribe(result => console.log('Are captions muted?', result));
myApp.state.soundVolume.subscribe(result => console.log('Value Between 0-1', result));
myApp.state.voVolume.subscribe(result => console.log('Value Between 0-1', result));
myApp.state.musicVolume.subscribe(result => console.log('Value Between 0-1', result));
myApp.state.sfxVolume.subscribe(result => console.log('Value Between 0-1', result));
myApp.state.pointerSize.subscribe(result => console.log('Value Between 0-1', result));
myApp.state.buttonSize.subscribe(result => console.log('Value Between 0-1', result));
myApp.state.controlSensitivity.subscribe(result => console.log('Value Between 0-1', result));
myApp.state.removableLayers.subscribe(result => console.log('Object containing the layers and their state(boolean)', result));
myApp.state.hudPosition.subscribe(result => console.log('String position of the HUD', result));
```

Springroll V1 had the audio events:
```javascript
myApp.state.soundMuted.subscribe(result => console.log('true/false', result));
myApp.state.voMuted.subscribe(result => console.log('true/false', result));
myApp.state.musicMuted.subscribe(result => console.log('true/false', result));
myApp.state.sfxMuted.subscribe(result => console.log('true/false', result));
```
these have been internally mapped to set volume to 0 and it's previous value.

Lastly, there are two other states available, one that has already been mentioned:

```javascript
var myApp = new Application();

myApp.state.ready.subscribe(() => {
  console.log('The app is ready. All plugins have finished their setup and preload calls');
});

myApp.state.pause.subscribe(isPaused => {
  console.log('Is the game paused?', isPaused);
});

// the playOptions that the container passes (see https://github.com/SpringRoll/SpringRollContainer#play-options)
myApp.state.playOptions.subscribe(playOptions => {
  console.log('New playOptions value set to', playOptions);
});
```

## Custom State Management
The Application's `StateManager` instance can also be used for custom purposes.
For instance, developers can declaratively control scene management:

```javascript
var myApp = new Application();

myApp.state.addField('scene', null);
myApp.state.scene.subscribe(function(newScene, oldScene) {
  renderer.stage.removeChild(oldScene);
  oldScene.teardown();

  renderer.stage.addChild(newScene);
  newScene.setup();
});

myApp.state.ready.subscribe(function() {
  myApp.state.scene.value = new TitleScene();
});
```

For more information on adding your own properties, see the [StateManager documentation](./state)
