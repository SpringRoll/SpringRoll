## Bellhop Singleton
SpringRoll exposes a shared [`Bellhop`](https://github.com/SpringRoll/Bellhop) instance that allows you to communicate to a SpringRoll Container instance.
It can be imported and used anywhere within your app.

```javascript
import { BellhopSingleton } from 'springroll'

BellhopSingleton.send('my-event', { foo: 'bar' });
```
