# Caption Player
The CaptionPlayer object provides a simplified way to handle playing captions in your game.

### Initializing
In order to play a caption you'll first need to initialize a captions player and an object for rendering your captions.

```javascript
  import { CaptionPlayer, HtmlRenderer } from 'springroll'

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
  const captionPlayer = new CaptionPlayer(captionData,  new HtmlRenderer(captionsElement));
```
Each line in a caption must have a start and end time, if you want to have a delay between lines you should add time to the start of the next line. It's not recommended to use a line with an empty content.

If line `B`'s start time is before (or the same as) line `A`'s end time, then `A` will finish before `B` starts.

A caption renderer can have the following callbacks.

| Name | Time |
| --- | --- |
| `start(args)` | Called when `CaptionPlayer.start()` is called |
| `stop()` | Called when `CaptionPlayer.stop()` is called or when caption is finished |
| `lineBegin(line)` | Called at the beginning of each line after `CaptionPlayer.start()` |
| `lineEnd()` | Called at the end of each line, called before `CaptionPlayer.stop()` |

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

### Variable Captions
Renderers have the option to accept arguments from the player and insert them into the caption.

```javascript
    const captionsElement = document.getElementById("captions");
    const captionData = {
    "greeting":[
      {
        "content": "Hello {{name}}"
        "start":0,
        "end": 1200
      },
      {
        "content": "You last logged in on {{lastLogin}}"
        "start":1300,
        "end": 2400
      }
    ]
  };
  const captionPlayer = new CaptionPlayer(captionData,  new HtmlRenderer(captionsElement));
  captionPlayer.start('greeting', 0, { name: 'Admin', lastLogin: 'August 13th, 2018' });
```
__Note:__ Caption variables are case sensitive


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
    const captions = this.cache.getJSON('captionData');
    this.captionPlayer = new CaptionPlayer(captions, new HTMLCaptionRenderer(captionsElement));

    this.captionPlayer.start('example');
  }

  update()
  {
    this.captionPlayer.update(this.Time.DeltaTime * this.Time.scale);
  }
}
```
# [Caption Studio](http://springroll.io/#/captions)
To make generating captions easier we have provided a online tool that will let you make captions for all the sound files in your project.

To get started, open the tool at the link provided or by going to [springroll.io](http://springroll.io) and import your projects directory. Caption Studio will parse your project for all sound files.

[//]: # (TODO: add links to jsDoc)
