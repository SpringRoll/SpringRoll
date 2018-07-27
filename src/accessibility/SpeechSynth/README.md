# SpeechSynth
## Note: This class uses experimental browser features and might not be consistent across all browsers.

SpeechSynth is a Class to make it easy to generate voice for text, when you don't have already voice files to accompany the text.


## Setup
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