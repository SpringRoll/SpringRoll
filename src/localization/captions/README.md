# Caption Player 
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