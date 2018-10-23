## Property
`Property` is a subscribable class that will emit changes to all callbacks when the property instance has been modified

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
