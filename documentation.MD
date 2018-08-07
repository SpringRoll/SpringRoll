# SpringRoll

The latest version, SpringRoll 2, is a large departure from its predecessor. SpringRoll 2 is less prescriptive and contains only a few guidelines and restrictions. Instead, the framework focuses on utilities to help developers make games more accessible and deployable at scale.

-   Adding Sound (WebAudio)
-   Hardware Rendered Games (via WebGL)
-   Implementing Captions
-   Remote Debugging
-   Responsive Interfaces
-   Game State Management
-   Preloading Assets
-   Browser Cache Control

## Browser Support

The primary objective of the framework is to build content which supports WebAudio API and WebGL (with Context2d fallback). We have intentionally avoided support for these browsers:

-   Android stock browser (no WebAudio support or suitable fallback support)
-   Internet Explorer 7/8 (no HTML5 canvas support)

## Application Documentation

#### Table of Contents

-   [ColorFilter](#colorfilter)
    -   [applyFilter](#applyfilter)
        -   [Parameters](#parameters)
    -   [changeFilter](#changefilter)
        -   [Parameters](#parameters-1)
    -   [removeFilter](#removefilter)
    -   [types](#types)
-   [SpeechSynth](#speechsynth)
    -   [Parameters](#parameters-2)
    -   [Properties](#properties)
    -   [pause](#pause)
    -   [resume](#resume)
    -   [cancel](#cancel)
    -   [say](#say)
        -   [Parameters](#parameters-3)
    -   [setVoice](#setvoice)
        -   [Parameters](#parameters-4)
    -   [getVoice](#getvoice)
    -   [rate](#rate)
        -   [Parameters](#parameters-5)
    -   [rate](#rate-1)
    -   [pitch](#pitch)
        -   [Parameters](#parameters-6)
    -   [pitch](#pitch-1)
    -   [volume](#volume)
        -   [Parameters](#parameters-7)
    -   [volume](#volume-1)
-   [Application](#application)
    -   [state](#state)
    -   [promisify](#promisify)
        -   [Parameters](#parameters-8)
    -   [validateListeners](#validatelisteners)
    -   [\_plugins](#_plugins)
    -   [uses](#uses)
        -   [Parameters](#parameters-9)
-   [Controller](#controller)
    -   [Parameters](#parameters-10)
    -   [update](#update)
    -   [onKeyDown](#onkeydown)
        -   [Parameters](#parameters-11)
    -   [onKeyUp](#onkeyup)
        -   [Parameters](#parameters-12)
    -   [assignButtons](#assignbuttons)
        -   [Parameters](#parameters-13)
-   [Key](#key)
    -   [Parameters](#parameters-14)
    -   [Properties](#properties-1)
    -   [updateState](#updatestate)
        -   [Parameters](#parameters-15)
    -   [action](#action)
    -   [state](#state-1)
-   [Debugger](#debugger)
    -   [Parameters](#parameters-16)
    -   [Properties](#properties-2)
    -   [params](#params)
    -   [minLevel](#minlevel)
        -   [Parameters](#parameters-17)
    -   [emit](#emit)
        -   [Parameters](#parameters-18)
    -   [LEVEL](#level)
    -   [log](#log)
        -   [Parameters](#parameters-19)
    -   [assert](#assert)
        -   [Parameters](#parameters-20)
    -   [isEnabled](#isenabled)
    -   [enable](#enable)
        -   [Parameters](#parameters-21)
    -   [paramKey](#paramkey)
-   [Caption](#caption)
    -   [update](#update-1)
        -   [Parameters](#parameters-22)
    -   [updateState](#updatestate-1)
        -   [Parameters](#parameters-23)
    -   [isFinished](#isfinished)
    -   [start](#start)
        -   [Parameters](#parameters-24)
-   [CaptionFactory](#captionfactory)
    -   [createCaptionMap](#createcaptionmap)
        -   [Parameters](#parameters-25)
    -   [createCaption](#createcaption)
        -   [Parameters](#parameters-26)
    -   [createLine](#createline)
        -   [Parameters](#parameters-27)
-   [CaptionPlayer](#captionplayer)
    -   [Parameters](#parameters-28)
    -   [update](#update-2)
        -   [Parameters](#parameters-29)
    -   [start](#start-1)
        -   [Parameters](#parameters-30)
    -   [stop](#stop)
-   [CaptionPlayer](#captionplayer-1)
    -   [update](#update-3)
        -   [Parameters](#parameters-31)
    -   [start](#start-2)
        -   [Parameters](#parameters-32)
    -   [stop](#stop-1)
-   [milliToSec](#millitosec)
    -   [Parameters](#parameters-33)
-   [TimedLine](#timedline)
    -   [setContent](#setcontent)
        -   [Parameters](#parameters-34)
-   [Localizer.Options](#localizeroptions)
-   [Localizer](#localizer)
    -   [resolve](#resolve)
        -   [Parameters](#parameters-35)
    -   [setPrimaryLocale](#setprimarylocale)
        -   [Parameters](#parameters-36)
    -   [setFallbackLocale](#setfallbacklocale)
        -   [Parameters](#parameters-37)
    -   [getLocaleKey](#getlocalekey)
        -   [Parameters](#parameters-38)
    -   [getBrowserLanguages](#getbrowserlanguages)
-   [ApplicationPlugin](#applicationplugin)
    -   [setup](#setup)
    -   [preload](#preload)
        -   [Parameters](#parameters-39)
-   [ScaleManager](#scalemanager)
    -   [Parameters](#parameters-40)
    -   [Properties](#properties-3)
    -   [enable](#enable-1)
        -   [Parameters](#parameters-41)
    -   [disable](#disable)
-   [Property](#property)
    -   [notifyChange](#notifychange)
    -   [subscribe](#subscribe)
        -   [Parameters](#parameters-42)
    -   [unsubscribe](#unsubscribe)
        -   [Parameters](#parameters-43)
    -   [hasListeners](#haslisteners)
-   [StateManager](#statemanager)
    -   [addField](#addfield)
        -   [Parameters](#parameters-44)

### ColorFilter

The Color filter allows you to simulate colorblindness.

It has built in support for:
```
  Protanopia
  Protanomaly
	Deuteranopia
  Deuteranomaly
  Tritanopia
  Tritanomaly
  Achromatopsia
  Achromatomaly
```

To use it, all you have to do is pass it a element and your desired filter.

```
import { ColorFilter } from './ColorFilter';

const colorFilter = new ColorFilter();

colorFilter.applyFilter(document.getElementById('your-id'), 'protanopia');
```

You can change the filter at any time. using changeFilter();

```
colorFilter.changeFilter('deuteranopia');
```

#### applyFilter

Applies the specified filter to the element.

##### Parameters

-   `element` **[HTMLElement](https://developer.mozilla.org/docs/Web/HTML/Element)**
-   `type` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**

#### changeFilter

Changes the currently applied filter to the element if the color filter has it.

##### Parameters

-   `type` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**

Returns **any**

#### removeFilter

Removes the filter from the element.

#### types

Supported filter types.

Returns **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** Returns an object { name, value } with the colorblindness type:
(Protanopia, Protanomaly, Deuteranopia, Deuteranomaly, Tritanopia, Tritanomaly, Achromatopsia, Achromatomaly)

### SpeechSynth

SpeechSync makes it easy to convert text to speech.

#### Setup
Using it is as easy as constructing and passing it a string.

```
  import { SpeechSynth } from '...';

  const speaker = new SpeechSynth();

  speaker.say('Hello world!');
```

- Any additional strings passed to it while it's still playing will be queued and will automatically start playing after finishing the current string, unless canceled.

You can also control what the starting params of the voice are by passing in a params object on construction.

```
const speaker = new SpeechSynth({voice:0, rate:1, pitch:0, volume:1});
```

You can also change it any time by changing the properties on the object.

```
speaker.rate = 10;
speaker.pitch = 2;
speaker.volume  = 0.5;
speaker.voice = 30; //Note this one is browser specific and won't work in all cases
```

- If you would like to know what voice options are available for your browser, the class instance contains a reference to all options.
```
speaker.voiceOptions // [Object]
```
#### Parameters

-   `params` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**
    -   `params.voice` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Indicates what voice to use. (optional, default `0`)
    -   `params.rate` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** The rate at which the text is said. Supports a range from 0.1 to 10. (optional, default `1`)
    -   `params.pitch` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Voice Pitch. Supports a pitch from 0 to 2. (optional, default `0`)
    -   `params.volume` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Volume. Supports 0 to 1. (optional, default `1`)

#### Properties

-   `voicesLoaded` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** voices are loaded async. This is will be set to true when they are loaded.

#### pause

Pauses the announcer.

#### resume

Resumes the announcer.

#### cancel

Pauses the announcer and clears the queue.

#### say

Causes the announcer to say whatever message is passed to it.
If the announcer is already saying something then it will be added to a queue.

##### Parameters

-   `message` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**

#### setVoice

Sets the voice by array index.

##### Parameters

-   `index` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**

#### getVoice

Returns the voice object.

Returns **([object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | null)**

#### rate

Rate at which text is spoken.

##### Parameters

-   `rate` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**

#### rate

Returns rate which text is spoken.

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**

#### pitch

Sets the pitch at which text is spoken.

##### Parameters

-   `pitch` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**

#### pitch

Returns the pitch at which text is spoken.

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**

#### volume

Sets the current volume of the announcer.

##### Parameters

-   `volume` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**

#### volume

Returns the current volume of the announcer.

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**

### Application

The SpringRoll Application provides the main entrypoint for games. In particular, it provides access to any
functionality provided by plugins along with access to any state set or changed by the container.

#### Usage Example
```javascript
var application = new springroll.Application();
application.state.ready.subscribe(function(isReady) {
  if(!isReady) {
    return;
  }

  // all plugins have loaded
});
```

#### Features
When an Application is embedded via a [SpringRollContainer](https://github.com/SpringRoll/SpringRollContainer) it can
notify the container of it's supported features. To do this in a SpringRoll Application, pass them as an object to the
constructor:

```javascript
var myApp = new springroll.Application({
  captions: false, // whether or not the game has captions
  sound: false, // whether or not the game has any sound
  vo: false, // whether or not the game has a VO
  music: false, // whether or not the game has music
  sfx: false, // whether or not the game has any sound effects
});
```

Note that if any of `vo`, `music`, or `sfx` are available features, `sound` will be marked as a feature implicitly.
Also, all of these features are marked `false` by default.

#### Handling State Change
When certain features are enabled, SpringRoll warns if an associated state change listener is missing. For instance,
if `sound` is enabled as a feature of the game, there must be a subscriber to the `soundMuted` state:

```javascript
var myApp = new springroll.Application({
  sound: true
});

myApp.state.sound.subscribe(result => console.log('Is sound muted?', result));
```

For each possible feature, there is an associated state that can be subscribed to:

```javascript
var myApp = new springroll.Application({
  captions: true,
  sound: true,
  vo: true,
  music: true,
  sfx: true
});

myApp.state.captionsMuted.subscribe(result => console.log('Are captions muted?', result));
myApp.state.sound.subscribe(result => console.log('Is sound muted?', result));
myApp.state.vo.subscribe(result => console.log('Is VO muted?', result));
myApp.state.music.subscribe(result => console.log('Is music muted?', result));
myApp.state.sfx.subscribe(result => console.log('Is SFX muted?', result));
```

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

#### state

#### promisify

Converts a callback-based or synchronous function into a promise. This method is used for massaging plugin preload
methods before they are executed.

##### Parameters

-   `callback` **[Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)** A function that takes either a callback, or returns a promise.

Returns **any** Promise A promise that resolves when the function finishes executing (whether it is asynchronous or not).

#### validateListeners

Validates that appropriate listeners are added for the features that were enabled in the constructor

-   Throws **any** Error

#### \_plugins

The list of plugins that are currently registered to run on Applications.

#### uses

Registers a plugin to be used by applications, sorting it by priority order.

##### Parameters

-   `plugin` **[ApplicationPlugin](#applicationplugin)** The plugin to register.

### Controller

Controller interface class to simplify working with key presses.

It accepts a array of objects that follow this format `Object {key: string, down?: function, up?: function}`

```
import { Controller } from ...

const controller = new Controller([
  { key: 'ArrowLeft', down: () => console.log('left arrow pushed down!')},
  { key: 'ArrowDown', down: () => console.log('down arrow pushed down!')},
  { key: 'ArrowRight', down: () => console.log('right arrow pushed down!')},
  { key: 'ArrowUp', down: () => console.log('up arrow pushed down!')},
  { key: 'Enter', down: () => console.log('enter pushed down!')},
  { key: ' ', down: () => console.log('space bar pushed down!'), up: () => console.log('space bar stopped being pushed down!')},
]);
```
- Key values can be found [here](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values)

- Key values are case insensitive.

The controller will monitor key inputs for you. Call the function when you wish to call the functions that are related to the currently active keys.

```
controller.update();
```

If at any time you wish to change the keys currently being watched, you can call the assignButtons function. This follows the same format as the constructor:

```
controller.assignButtons([
  { key: 'a', down: () => console.log('a pushed down!')},
  { key: 's', down: () => console.log('s pushed down!')},
  { key: 'd', down: () => console.log('d pushed down!')},
  { key: 'w', down: () => console.log('w arrow pushed down!')},
  { key: 'Enter', down: () => console.log('enter pushed down!')},
  { key: ' ', down: () => console.log('space bar pushed down!'), up: () => console.log('space bar stopped being pushed down!')},
]);
```

#### Parameters

-   `buttons` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)** An object containing all keys you want to watch and their functions. e.g. {enter: () => {}}. See <https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values> for potential values. (optional, default `[]`)

#### update

Calls all functions for buttons that are currently set to enabled.

#### onKeyDown

Called on keyup. Sets flag to 1 if key is being watched.

##### Parameters

-   `e` **[KeyboardEvent](https://developer.mozilla.org/docs/Web/API/KeyboardEvent)**

#### onKeyUp

Called on keyup. Sets flag to 2 if key is being watched.

##### Parameters

-   `e` **[KeyboardEvent](https://developer.mozilla.org/docs/Web/API/KeyboardEvent)**

#### assignButtons

Sets an object of button functions to the controller to be called.

##### Parameters

-   `buttons` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)**

### Key

Represents a single key on the keyboard and the functions related to it.

#### Parameters

-   `key` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** What this object represents.
-   `down` **[function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)** Function to be called while the key is held down. (optional, default `()=>{}`)
-   `up` **[function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)** Function to be called when the key is lifted up. (optional, default `()=>{}`)

#### Properties

-   `state` **(`0` \| `1` \| `2`)** The current state of the key. 0 = inactive, 1 = active, 2 = to be set to inactive.
-   `key` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the key we are targeting.
-   `actions` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**
    -   `actions.down` **[function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)** Function to be called while the key is held down.
    -   `actions.up` **[function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)** Function to be called when the key is lifted up.

#### updateState

Updates the internal state of the key. Accepts a range between 0-2. Will set key state to 0 if nothing is passed.

##### Parameters

-   `state` **(`0` \| `1` \| `2`)**  (optional, default `0`)

#### action

Calls the relevant action for the current state of the key.

#### state

Returns the current state of the key.

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**

### Debugger

Type: [object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Simplifies logging events to the console for debugging purposes.

#### Parameters

-   `params` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** Options
    -   `params.emitEnabled` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** If this should emit events to the window. (optional, default `false`)
    -   `params.minLevel` **(`"GENERAL"` \| `"DEBUG"` \| `"INFO"` \| `"WARN"` \| `"ERROR"`)** The starting log level for the logger. (optional, default `'GENERAL'`)

#### Properties

-   `emitEnabled` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**
-   `enabled` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**
-   `minLevel` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**

#### params

Returns the params of the debugger.

Returns **DebuggerParams**

#### minLevel

Sets the logging level of the debugger.

##### Parameters

-   `level` **([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \| [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number))** The name of the level.

Returns **void**

#### emit

If emitting is enabled for this instance, then it will dispatch an event on the window.

##### Parameters

-   `eventName` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of the event (optional, default `'Debugger'`)

#### LEVEL

Returns logging levels.

Returns **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**

#### log

Console logs all supplied arguments if the log level is low enough for them to be logged.

##### Parameters

-   `type` **(`"log"` \| `"general"` \| `"warn"` \| `"error"` \| `"debug"` \| `"info"`)** minimum level for this log to run at (optional, default `'log'`)
-   `args` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;any>** Arguments you wish to log.

#### assert

Will throw if statement is false.

##### Parameters

-   `isTrue` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** The expression to evaluate.

#### isEnabled

Returns a boolean indicating if the debugger has been enabled or not.

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**

#### enable

Disables or enables all debugger instances.

##### Parameters

-   `flag` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**

Returns **void**

#### paramKey

Returns the global params key.

### Caption

#### update

Updates content based on time passed.
This ~should~ be called every frame that the caption is active.

##### Parameters

-   `deltaTime` **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Time in seconds since last frame.

#### updateState

Handles calling callbacks and updating caption's current state.

##### Parameters

-   `currentTime` **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**
-   `lastTime` **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**

#### isFinished

Checks if caption has completed.

Returns **[Boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**

#### start

Sets time and line index of caption.

##### Parameters

-   `time` **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Time in milliseconds. (optional, default `0`)
-   `beginCallback`   (optional, default `()=>{}`)
-   `endCallback`   (optional, default `()=>{}`)

### CaptionFactory

Collection of functions for creating

The CaptionPlayer object provides a simplified way to handle playing captions in your game.

### Initializing
In order to play a caption you'll first need to initialize a captions player and an object for rendering your captions.

```javascript
  import { CaptionPlayer, CaptionFactory } from 'springroll/localization'

  // Start and end times are in Milliseconds
  const captionData = {
    "welcome":[
      {
        "content": "This is the first line"
        "start":0,
        "end": 1200
      },
      {
        "content": "This is the second line"
        "start":1300,
        "end": 2400
      }
    ],
    "other":[
      {
        "content": "this caption only has on line"
        "start":0,
        "end": 3000
      }
    ]
  }

  const captionsElement = document.getElementById("captions");
  const captionMap = CaptionFactory.createCaptionMap(captionData);
  const captionPlayer = new CaptionPlayer(captionMap, {
    start:() => {
      captionsElement.style.visibility = "visible";
    },
    lineBegin:(line) => {
      captionsElement.innerHTML = line.content;
    },
    lineEnd:() => {
      captionsElement.innerHTML = '';
    },
    stop:() => {
      captionsElement.style.visibility = "hidden";
    }
  });
```
Each line in a caption must have a start and end time, if you want to have a delay between lines you should add time to the start of the next line. It's not recommended to use a line with an empty content.

If line `B`'s start time is before line `A`'s end time, then `A` will finish before `B` starts.

A caption renderer can have the following callbacks.
| Name              | Time  |
|-------------------|-------|
| `start()`         | Called when `CaptionPlayer.start()` is called
| `stop()`          | Called when `CaptionPlayer.stop()` is called or when caption is finished
| `lineBegin(line)` | Called at the beginning of each line after `CaptionPlayer.start()`
| `lineEnd()`       | Called at the end of each line, called before `CaptionPlayer.stop()`

### Updating
The caption player needs to be updated regularly in order for it to function properly. It's recommended to call update on every frame for the most accurate timing.

```javascript
  // DeltaTime is the time passed in SECONDS since the last update call.
  captionPlayer.update(deltaTime);
```

### Playing a caption
To start playing a caption, you call start. You can pass a start time in as an optional parameter.

```javascript
  captionPlayer.start('welcome');
```

```javascript
  captionPlayer.start('welcome', 1200);
```
__Note:__ the CaptionPlayer can only play one caption at a time

### Stopping a caption
Captions automatically stop when the time passed is greater than the end time. You can manually stop them if you need to.

```javascript
  captionPlayer.stop();
```

### _Example:_
```javascript
class HTMLCaptionRenderer
{
  constructor(element)
  {
    this.element = element;
  }

  start() => {
    element.style.visibility = "visible";
  }

  lineBegin(line) => {
    element.innerHTML = line.content;
  }

  lineEnd() => {
    element.innerHTML = '';
  }

  stop() => {
    element.style.visibility = "hidden";
  }
}

class YourGame
{
  preload()
  {
    this.loader.load('assets/captions.json', 'captionData');
  }

  start()
  {
    const captionsElement = document.getElementById("captions");
    const captionMap = CaptionFactory.createCaptionMap(this.cache.getJSON('captionData'));
    this.captionPlayer = new CaptionPlayer(captionMap, new HTMLCaptionRenderer(captionsElement));

    this.captionPlayer.start('example');
  }

  update()
  {
    this.captionPlayer.update(this.Time.DeltaTime * this.Time.scale);
  }
}
```

[//]: # (TODO: add links to jsDoc)

#### createCaptionMap

Creates a new Object&lt;String, Caption>.

##### Parameters

-   `data` **[JSON](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/JSON)**

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**

#### createCaption

Creates a new Caption from JSON data.

##### Parameters

-   `captionData` **[JSON](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/JSON)**

Returns **[Caption](#caption)** new Caption

#### createLine

Creates a new TimedLine from JSON data.

##### Parameters

-   `lineData` **[JSON](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/JSON)**

Returns **[TimedLine](#timedline)** new TimedLine;

### CaptionPlayer

Object used to render caption.

#### Parameters

-   `captions`
-   `renderer`

#### update

Updates any currently playing caption.
This ~should~ be called every frame.

##### Parameters

-   `deltaTime` **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Time passed in seconds since last update call.

#### start

Starts playing a caption.

##### Parameters

-   `name` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of caption.
-   `time` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Atart time in milliseconds. (optional, default `0`)

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** True if caption started.

#### stop

Stops any caption currently playing.

### CaptionPlayer

CaptionPlayer is used to start, stop and update captions.
 It applies the content of an active caption to a given CaptionRenderer.

#### update

Updates any currently playing caption.
This ~should~ be called every frame.

##### Parameters

-   `deltaTime` **[Number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Time passed in seconds since last update call.

#### start

Starts playing a caption.

##### Parameters

-   `name` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Name of caption.
-   `time` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Atart time in milliseconds. (optional, default `0`)

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** True if caption started.

#### stop

Stops any caption currently playing.

### milliToSec

#### Parameters

-   `time`

### TimedLine

#### setContent

Sets line's content. Removes HTML formatting for text.

##### Parameters

-   `content` **any**

Returns **void** @memberof TimedLine

### Localizer.Options

Type: {language: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), fallback: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)}

### Localizer

The localizer object provides a layer above your file loader to help with loading localized files.

## Initializing
In order to use the localizer you'll have to provide a config with a default locale,
as well as all the locales you wish to use.
```javascript
import { Localizer } from 'springroll/localization';

const config = {
  "default":"en",
  "locales":
  {
    "en": { "path": "assets/en/" },
    "fr": { "path": "assets/fr/" },
    "fr-ca": { "path": "assets/fr-CA/" }
  }
}

const localizer = new Localizer(config);
```

The localizer will automatically look for the browser's language and use it. A fallback locale will also be set from default in the config. The fallback is used automatically if a specified language can't be found in locales.

An options object can also be provided to manually set the target and fallback languages.
```javascript
const localizer = new Localizer(config, { language:'fr', fallback:'en'});
```

## Loading a File

`localizer.resolve()` Returns an object that contains the resolved path.

```javascript
let result = localizer.resolve('vo/welcome.mp3');
loader.load(result.path, 'welcome');
```

This will load a file relative to the current locale, for example if the browser language was set to French-Canadian, the path supplied to the load function would look like: `assets/fr-CA/vo/welcome.mp3`.

You can also provide an options object to override the target and fallback languages for only a single load event.

```javascript
let result = localizer.resolve('vo/welcome.mp3', { language: 'es-ES', fallback: 'en' });
loader.load(result.path, 'welcome');
```

If the language or fallback are not found in the locales, then it will load with the default fallback. For example: if `'es-ES'` is not found, the load function will try `'es'` if that isn't found, it will use the fallback language `'en'`.

Result also contains the language key of the language used.

```javascript
let result = localizer.resolve('vo/welcome.mp3', { language: 'es-ES', fallback: 'en' })
console.log(result.language); // 'en'
```

### _Example:_
```javascript
class YourGame
{
	init()
		this.localizer = new Localizer(this.localizerConfig);
	}

	preload()
	{
		// load all your localized files.
		let result = this.localizer.resolve('vo/welcome.mp3')
		this.loader.load(result.path, 'welcome');

		result = this.localizer.resolve('local.json')
		this.loader.load(result.path, 'local');
		//...

		// Any non localized files don't have to go though the localizer.
		this.loader.load('assets/images/Foo.png', 'fooSprite');
		//...
	}

	start()
	{
		//Do things with loaded files;
		let welcome = new Sound('welcome');
		welcome.play();
		//...
	}
}
```
#### resolve

##### Parameters

-   `path`
-   `options` **any**  (optional, default `{}`)
-   `Path` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)**

#### setPrimaryLocale

##### Parameters

-   `localeKey` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** True if language is set.

#### setFallbackLocale

##### Parameters

-   `localeKey` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** True if fallback is set.

#### getLocaleKey

##### Parameters

-   `localeKey` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**

#### getBrowserLanguages

Returns **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>** An array of browser languages.

### ApplicationPlugin

Represents a single plugin for applications. Allows developers to inject code in the start up process of an
application providing new features to the application.

```javascript
import { ApplicationPlugin } from 'springroll/plugins/ApplicationPlugin';

export default class CustomPlugin extends ApplicationPlugin {
  constructor() {
    let priority = 20;
    super(priority);
  }

  setup() {
    // custom synchronous code. `this` is bound to the current Application
    this.customContent = {};
  }

  preload() {
    // custom asynchronous code. Expected to return a Promise.
    return fetch(someApiEndpoint)
      .then(response => response.json())
      .then(json => this.customContent = json);
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

#### setup

A setup method for the plugin. This method is ran synchronously in the constructor of the Application.

#### preload

A preload method for the plugin which allows for asynchronous setup tasks. Either takes a callback as first
parameter, or should return a Promise indicating that loading is finished.

##### Parameters

-   `callback` **([Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function) \| [undefined](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/undefined))** A callback to call when finished (or no parameter at all).

Returns **([Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) \| [undefined](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/undefined))** If defined, treated as promise indicating when the plugin is finished loading.

### ScaleManager

Simplifies listening to resize events by passing the relevant data to a provided callback.

#### Parameters

-   `callback` **[Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)**  (optional, default `undefined`)

#### Properties

-   `callback` **[Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)?**

#### enable

Enables the scale manager listener. Will not be enabled if a callback is not supplied.

##### Parameters

-   `callback` **[Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)** The function to be called on resize events. (optional, default `undefined`)

#### disable

Disables the scale manager.

### Property

A class for representing changeable/subscribable properties.

#### notifyChange

Notifies all subscribers to the property of a new value.

#### subscribe

Adds a subscriber to this property.

##### Parameters

-   `callback`
-   `Function`  callback The callback to call whenever the property changes.

#### unsubscribe

Unsubscribes a listener from this property.

##### Parameters

-   `callback`
-   `Function`  callback The callback to unsubscribe.

#### hasListeners

Whether or not this property has any subscribed listeners

Returns **any** Boolean True if this property has at least one subscriber

### StateManager

A class for managing a group of subscribable properties together. Allows for the registration of new properties.

For example:
```
var manager = new StateManager();
manager.addField('paused', false);
manager.paused.subscribe(function(newValue) {
  console.log('New value is ', newValue);
})

manager.paused = true;
```

#### addField

Adds a new subscribable field field to the state manager. Throws an error if the field already exists.

##### Parameters

-   `name` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the field.
-   `initialValue` **Any** The initial value of the property.

Returns **any** Property The newly created property.