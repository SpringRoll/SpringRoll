## Property
`Property` is a class that monitors a value and notifies listeners whenever it has changed.

```javascript
// creates the property, defaulting the value to false
const isPaused = new Property(false);

// subscribe for changes to the property
isPaused.subscribe(function(newValue, oldValue) {
  console.log('Value changed from', oldValue, 'to', newValue);
});

// the property can change similarly to the previous case, the handler triggering appropriately
isPaused.value = true;
```

A `Property` only notifies listeners when the value set is different than the current value it has. To
tell the `Property` to always notify regardless if the values are equal, provide a `true` as a second argument in the constructor.

```javascript
const width = 1024;
const height = 768;

// Creates a property that will always notify.
const aspectRatio = new Property(width / height, true);

// subscribe for changes to the property
aspectRatio.subscribe(function(newValue, oldValue) {
  if (newValue === oldValue) {
    console.log("Property value has not changed, but the listener was still called.");
  }
});

aspectRatio.value = width / height;
```

## UserData

The `UserData` provides a mechanism for storing game/session data _outside of the game instance_ by saving it in
`localStorage` at the Container level. This mechanism can be used to share information across games on the same domain.
Since this feature relies on Bellhop communication, you must wait for Bellhop to be connected first

```javascript
import { UserData } from 'springroll'

app.container.on('connected', async () => {
    await UserData.write('my-value', { foo:'bar' });

    const value = await UserData.read('my-value');
    console.log('Value retrieved:', value);

    await UserData.delete('my-value');
});
```

## DateUtil

The DateUtil class is for date-related utilities and helpers. It includes isInSeason(startDate, endDate), which returns true if the current date is in the inclusive range.
```javascript
import { DateUtil } from "springroll";
 
const summerStart = new Date(2024, 5, 21); // June 21, 2024
const summerEnd = new Date(2024, 8, 22);   // September 22, 2024
if (DateUtil.isInSeason(summerStart, summerEnd)) {
  showSummerContent();
}
```