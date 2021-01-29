# Safe Scale Manager
A utility class that listens for resize events and calculates the width and height your game should be to fit within the screen without stretching or squishing the game. 

```javascript
let scaleManager = new SafeScaleManager({
  width: 1320,
  height: 780,
  callback: function(resizeData) {
    console.log('This is called on window resize');

    console.log('game width is', resizeData.width);
    console.log('game height is', resizeData.height);
    console.log('game scale is', resizeData.scale);
  }
});
```

The `enable` method exists in case you do not have a listener ready at the time of construction or need to replace the existing listener. 

```javascript
scaleManager.enable(function(resizeData) {
  console.log('The old listener is replaced with this one!', resizeData);
});
```

**Note:** The Resize event will fire twice. A 500ms debounce was added to the event to solve an issues where on iOS the window inner height/width are not guaranteed to match actual the dimensions when the event fires.

For more info check out the [WebKit Bug](https://bugs.webkit.org/show_bug.cgi?id=170595).

| Member Variables | values | Description |
|---|---|---|
| `gameWidth` | number | The gameWidth is the maximum horizontal dimension of your game. This value should be used when initializing the width of your game |
| `gameHeight` | number | The gameHeight is the maximum vertical dimension of your game. This value should be used when initializing the height of your game |
| `safeWidth` | number | The safeWidth is the minimum horizontal dimension of your game. This value defines the width of your game's safe playable area. |
| `safeHeight` | number | The safeHeight in the minimum vertical dimension of your game. This value defines the height of your game's safe playable area. |
| `callback` | function | The callback is the handler function given to the SafeScaleManager that will be called on window resize events, after scaling calculation shave been done. The results of these scaling calculations will be passed to this handler function. See example below. |
| `scaleRatio` | number | The scaleRatio is a scaler value calculated on window resize events. This value is the ratio between the `safeWidth` and `safeHeight`, and the width and height of the container your game lives in (typically `window.innerWidth` and `window.innerHeight`). This value is passed to the callback on resize events, along with being accessible through a SafeScaleManager instance. You can use this value to scale your game's canvas.style width and height to the appropriate size to fill the game's container. |
| `viewArea` | rectangle | The viewArea is a rectangle that defines the total viewable area of your game. It is calculated on window resize events and is passed into the callback. It can also be accessed through a SafeScaleManager instance. It contains values for the `left`, `right`, `top`, `bottom` edges of the viewable area, along with `x`, `y`, `width`, and `height` of the rectangle. This rectangle is useful for knowing where the viewable edges of your game content are. |


## Callback Example

The safe scale manager's callback parameter contains `width`, `height`, `scale`, and `scaleRatio`. these values can be used to resize your game. Depending on the engine you choose you'll have to use them differently. `scale` contains `x` and `y`, these are the independent scaling values for the x and y axis. You may also need to use the `scaleRatio` value, this is the minimum size ratio either `width/safeWidth` or `height/safeHeight`. The `viewArea` value is also passed along to the callback.

```javascript
scaleManager.enable(({ scaleRatio }) => {
  // -- PIXI -- //
  const renderer = this.pixi.renderer;

  renderer.view.style.width = `${GAMEPLAY.WIDTH * scaleRatio}px`;
  renderer.view.style.height = `${GAMEPLAY.HEIGHT * scaleRatio}px`; 
});
```

**Note**: A Phaser3 example can be found [here](https://github.com/SpringRoll/Springroll-Seed/tree/templates/phaser3)

## Safe Scaling
Safe scaling is enabled by setting `safeWidth` and `safeHeight` in the scaleManager's config. 

```javascript
let scaleManager = new SafeScaleManager({
  width: 1320,
  height: 780,
  safeWidth: 1024,
  safeHeight: 660,
  callback: pixiResize
});
```

This allows for the scale manager to calculate the canvas's target size and scale to ensure that the viewport's minimum is never smaller than `safeWidth` and `safeHeight`, and It's maximum never larger than `width` and `height`.

## Scaled Entities

If your game has any code that needs to be updated after the game resizes it can be implemented as a ScaledEntity. A ScaledEntity's `onResize` function is automatically called by the ScaleManager.

```javascript
class MyEntity extends ScaledEntity
{
  onResize({ scaleRatio })
  {
    //Resize dependant code.
  }
}

const myEntity = new MyEntity();

scaleManager.addEntity(myEntity);
scaleManager.removeEntity(myEntity);

```

| Parameter | values | Description |
|---|---|---|
|`offset`| `x,y` | (deprecated)distance calculated between the game size and the viewport size |
|`scale`| `x,y ` | (deprecated)scale values calculated for viewport |
|`gameSize`| `x,y` | (deprecated)actual game space size, set during scale manager initialization |
|`scaleRatio`| `number` | scaling ratio between the safe resolution and container resolution |
|`viewArea`| `rect` | viewable area of game content |

An example of a ScaledEntity might be offsetting a camera to keep the game in view.

```javascript
class CameraPositioner extends ScaledEntity
{
  constructor(camera)
  {
    super();
    this.camera = camera;
  }

  onResize({ viewArea })
  {
    this.camera.setViewport(viewArea.x, viewArea.y, viewArea.width, viewArea.height);
  }
}
```

### Anchor

An Anchor is another example of a scaled entity provided by SpringRoll. It's primary use is to keep UI elements in a relative position regardless of the size of the viewport. For example if you always wanted to keep a health bar in the top left corner:

```javascript
const healthBar = new StatusBar("#ff0000"); // <-- not a springroll object.
const healthAnchor = new Anchor({
  position: { x: 66, y: 25 }, 
  direction: { x: -1, y: -1 }, 
  callback: (x, y) => healthBar.position.set(x, y)
});
scaleManager.addEntity(healthAnchor);
```

| Parameter | Description |
|---|---|
|`position`| desired `x,y` position of the element relative to the Anchor's `direction` |
|`direction`| `x,y` axis that the Anchor is attached to, `x:-1` is left, and `y:-1` is up. `x:0` and `y:0` locks the element to the center of the viewport. |
|`callback`| function to be call anytime the screen is resized, the parameters contain the `x,y` position in world space to set your object too. |

# ResizeHelper
The ResizeHelper is a utility class that is used by the SafeScaleManager to handle detecting the dimension of the game container and when it resizes. Typically this utility class is meant to be used internally, however if needed developers can create their own instances to listen for resize events and get the current dimensions of the game container.

```javascript
const maxWidth = 1320;
const maxHeight = 780;

const minWidth = 1024;
const minHeight = 660;

function onGameResize({ width, height }) {  
  const scale = Math.min(width / minWidth, height / minHeight);

  const scaledWidth = maxWidth * scale;
  const scaledHeight = maxHeight * scale;

  const canvas = document.getElementById('gameCanvas');

  canvas.style.width = `${scaledWidth}px`;
  canvas.style.height = `${scaledHeight}px`;
}

this.resizer = new ResizeHelper(onGameResize);
```

**Note:** The above scaling logic requires the following canvas style setup in order for the game to scale relative to the center of the game container.

```css
canvas {
    margin: auto;
    position: absolute;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
}
```

## iOS
The Resizehelper also provides a property that will return whether for not the game container is running in an iOS devices. There are some instances where a developer may need to implement separate logic if the game is running on an iOS device.

```javascript
if (resizeHelper.iOS) {
  // Add iOS specific logic here.
}
```

## Get Window Resolution
The `ResizeHelper.getWindowResolution()` method is used to get the current width and height of the game container. It returns an object that containers the width and height values.

```javascript
const resolution = resizeHelper.getWindowResolution();

console.log(resolution.width, resolution.height);
```