## Comm
`comm` is the shared instance of Bellhop that SpringRoll uses to handle communication between your app and SpringRoll Container. It can be imported and used anywhere within your app.

```javascript
import { BellhopSingleton } from 'springroll'

BellhopSingleton.send('my-event', {foo: 'bar'});
```
