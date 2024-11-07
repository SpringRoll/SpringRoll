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
    captions: false, // whether or not the game supports muting/unmuting captions
    sound: false, // whether or not the game supports muting/unmuting all sound
    vo: false, // whether or not the game supports muting/unmuting VO
    music: false, // whether or not the game supports muting/unmuting music
    sfx: false, // whether or not the game supports muting/unmuting sound effects
    soundVolume: false, // whether or not the game supports granular volume controls for all sound
    voVolume: false, // whether or not the game supports granular volume controls for VO
    musicVolume: false, // whether or not the game supports granular volume controls for music
    sfxVolume: false, // whether or not the game supports granular volume controls for sound effects
    pointerSize: false, // whether or not the game has a resizable pointer
    controlSensitivity: false, // whether or not the game has adjustable control sensitivity
    buttonSize: false, // whether or not the game has adjustable button sizes
    removableLayers: false, // whether or not the game supports the removal of distracting game layers
    hudPosition: false, // whether or not the game supports multiple HUD positions
    hitAreaScale: true, // whether or not the game supports adjustable hit areas
    dragThresholdScale: true, // whether or not the game supports adjustable drag thresholds
    health: true, // whether or not the game supports adjustable health amounts
    objectCount: true, // whether or not the game supports adjustable object count requirements
    completionPercentage: true, // whether or not the game supports adjustable completion percentage requirements
    speedScale: true, // whether or not the game supports adjustable speeds
    timersScale: true, // whether or not the game supports adjustable timers
    inputCount: true, // whether or not the game supports adjustable input count requirements
    keyBinding: true, // whether or not the game supports re-mappable key bindings.
    colorVision: true, // whether or not the game supports alternate color schemes for color blind users
  }
});
```

Note that if any of `vo`, `music`, or `sfx` are available features, `sound` will be marked as a feature implicitly.
Also, all of these features are marked `false` by default.

If a feature is excluded or marked as `false` Container will automatically hide associated controls on the containing webpage, so if you intend to support a feature ensure it is included in your feature list.

## Configurable Mechanics
The following mechanics are represented by a value between 0 and 1, and default to 0.5.

### Hit Area Scale
Enable this feature if your game has scalable hit boxes for entities. This value will allow you to increase the size of hit boxes for potentially hard-to-hit buttons or UI elements. Caution: Prevent overlapping hit boxes for larger settings

### Drag Threshold Scale
Enable this feature to make dragging detection more sensitive and allows the distance delta to be configurable. Typically developers need to use a distance delta for the detection of a drag but it can sometimes be too large or small for users.

### Health
Enable this feature if your game does have a configurable number of attempts, retries, lives, or health. Players may want to adjust these numbers manually to control the number of tries they get at an objective.

### Object Count
Enable this feature in the game to allow players to adjust the number of objects used to complete objectives. This will allow players to increase or decrease the number of items used in the game, hidden and visible.

### Speed Scale
Enable this feature if the speed of the game mechanics is configurable.

### Completion Percentage
Enable this feature if your game includes mechanics with a configurable completion percentage for a task. This allows the player to change the amount of times they need to interact before moving forward in the game. Example: How many swipes it takes to clear dirt off a puzzle.

### Timer Scale
Enable this feature if your game includes an adjustable timer mechanic. This allows players to give themselves more or less time to complete a challenge.

### Input Count
Enable this feature if your game includes a configurable mechanic that requires multiple clicks, taps or keyboard input to complete an objective. This allows players to interact with the elements more or less times in order to complete an objective.

## Handling State Change
The SpringRoll Application class has a general [StateManager](./state) instance attached for managing important
properties that can be changed via the container or outside environment.
Developers can subscribe to property changes, allowing the game to react appropriately to the given situation.
When certain features are enabled, SpringRoll warns if an associated state change listener is missing. For instance,
if the developer enables `sound` as a feature of the game, a subscriber to the `soundVolume` state must exist:

```javascript
const myApp = new springroll.Application({
  features: {
    sound: true
  }
});

myApp.state.soundVolume.subscribe(result => console.log('Value Between 0-1 for volume', result));
```

For each possible feature, there is an associated state that can be subscribed to:

```javascript
const myApp = new springroll.Application({
  features: {
    captions: true,
    sound: true,
    vo: true,
    music: true,
    sfx: true,
    soundVolume: true,
    voVolume: true, 
    musicVolume: true,
    sfxVolume: true,
    pointerSize: true,
    controlSensitivity: true,
    buttonSize: true,
    removableLayers: true,
    hudPosition: true,
    hitAreaScale: true,
    dragThresholdScale: true,
    health: true,
    objectCount: true,
    completionPercentage: true,
    speedScale: true,
    timersScale: true,
    inputCount: true,
    keyBinding: true,
    colorVision: true,
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
myApp.state.removableLayers.subscribe(result => console.log('Value Between 0-1', result));
myApp.state.hudPosition.subscribe(result => console.log('String position of the HUD', result)); //See below about responding to the container
myApp.state.hitAreaScale.subscribe(result => console.log('Value Between 0-1', result));
myApp.state.dragThresholdScale.subscribe(result => console.log('Value Between 0-1', result));
myApp.state.health.subscribe(result => console.log('Value Between 0-1', result));
myApp.state.objectCount.subscribe(result => console.log('Value Between 0-1', result));
myApp.state.completionPercentage.subscribe(result => console.log('Value Between 0-1', result));
myApp.state.speedScale.subscribe(result => console.log('Value Between 0-1', result));
myApp.state.timersScale.subscribe(result => console.log('Value Between 0-1', result));
myApp.state.inputCount.subscribe(result => console.log('Value Between 0-1', result));
myApp.state.keyBinding.subscribe(result => console.log('Value Between 0-1', result));
myApp.state.colorVision.subscribe(result => console.log('Value Between 0-1', result));
myApp.state.keyBinding.subscribe(result => console.log('Array of key/value pairs reflecting the currently selected keys', result)); //See below about responding to the container
myApp.state.colorVision.subscribe(result => console.log('String representing the chose type of color blindness', result)); //See below about responding to the container
```
### Important note about sound features

Audio controls like `sound` and `soundVolume` both refer to the `state.soundVolume` property, they just denote different HTML controls at the container level. If you intend to support both muting, and volume control you will need to include both `sound` and `soundVolume` but only require the one subscriber.

e.g.
```javascript
const myApp = new springroll.Application({
  features: {
    sound: true,
    soundVolume: true,
  }
});

// this will recieve events from both mute/unmute buttons as well as finer volume controls
myApp.state.soundVolume.subscribe(result => console.log('Value Between 0-1', result));
```

### Responding to the Container
*the HUDPosition, keyBinding, and colorVision states requires one additional bit of configuration to interact with Springroll Container correctly. The examples below shows the `respond` call you need to implement to report back to the container.
```javascript
var myApp = new springroll.Application({
  features: {
    hudPosition: true,
    keyBinding: true,
    colorVision: true,
  }
});

//this should be an array of strings(representing the positions the game supports).
myApp.container.respond('hudPositions', ['top', 'bottom', 'left', 'right']);

//this should be an array of objects that represent the user actions and the default key used in the game
myApp.container.respond('keyBinding', [
  {actionName: 'Jump', defaultKey: 'w'},
  {actionName: 'Left', defaultKey: 'a'},
  {actionName: 'Right', defaultKey: 'd'},
  {actionName: 'Crouch', defaultKey: 's'},
]);

//there is an 'enum' object available that will help with the available options for color filters. *All available options are listed in the below example*
myApp.container.respond('colorFilters', [
  springroll.COLOR_VISION.NONE,
  springroll.COLOR_VISION.PROTANOPIA,
  springroll.COLOR_VISION.DEUTERANOPIA,
  springroll.COLOR_VISION.TRITANOPIA,
  springroll.COLOR_VISION.ACHROMATOPSIA,
]);
```
The positions accepted for the HUD are `top`, `bottom`, `right`, `left` (any positions other than these are discarded). However, the application doesn't need to support all of them, it can support only a subset (e.g. `['top', 'left']`) depending on the layout of the Heads Up Display.

The keyBinding actionName can be whatever you want, the only constraint is that defaultKey currently uses the `KeyboardEvent.key` when setting keys.

Similar to the HUDPositions call only the options in the Color Vision example are accepted, and only the options your game supports need to be included. Anything outside of the options above wil be discarded by the container.

## Legacy Audio Events
Springroll V1 had the audio events:
```javascript
myApp.state.soundMuted.subscribe(result => console.log('true/false', result));
myApp.state.voMuted.subscribe(result => console.log('true/false', result));
myApp.state.musicMuted.subscribe(result => console.log('true/false', result));
myApp.state.sfxMuted.subscribe(result => console.log('true/false', result));
```
These have been internally mapped to set volume to 0 and it's previous value.

## Ready and Pause States

Lastly, there are two other states available, one that has already been mentioned:

```javascript
var myApp = new Application();

myApp.state.ready.subscribe(() => {
  console.log('The app is ready. All plugins have finished their setup and preload calls');
});

myApp.state.pause.subscribe(isPaused => {
  console.log('Is the game paused?', isPaused);
});
```
## Play Options

Play options allows developers to pass values from the container environment to the SpringRoll environment. These values can contain any key value pairs the developer requires. These can be used to modify the game with such values as difficulty or theme.

```javascript
var myApp = new Application();
// The playOptions that the container passes (see https://github.com/SpringRoll/SpringRollContainer#play-options)
myApp.state.playOptions.subscribe(playOptions => {
  console.log('New playOptions value set to', playOptions);
});
```

For rapid development/testing it is possible to insert `playOption` values into the url. `Ex. localhost:8080?playOptions={difficulty: "hard", theme: "winter"}` (use a url encoder for your query string)

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

