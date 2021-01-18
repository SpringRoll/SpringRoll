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
### IndexedDB
Any work with indexedDB or the userData plugin as a whole should be done inside the 'connected' callback method

``` javascript
import { UserData } from 'springroll';

app.container.on('connected', async () => {
  // Conect to your database
  let responce = await userData.OpenDb('dbName');
  
  // Work with IndexedDB below
  ...
}
```

In order to  change the structure of the database, such as adding/removing stores to a database or an index to a store, you should do so in the IDBOpen method

``` javascript
  
  // Additions is an optional parameter expecting a JSON object with any additions to the databases structure namely new stores and indexes. These are placed inside of an array 
  let additions = {
    stores: [{
      storeName: 'storeOne',
      // optionally define a keyPath and/or set autoIncrement to true or false
      options: { keyPath: "taskTitle" }
    },
    {
      storeName: 'storeTwo'
    }],
    indexes: [{
      indexName: 'newIndex',
      keyPath: 'key',
      // Any objectParameters for the Index can be placed here
      options: {
        unique: false
      }
    }]
  };

  // Deletions is an optional parameter used to delete any indexes or stores. All needed is the key of the store or index
  let deletions = {
    stores: ['storeOne', 'storeTwo'],
    indexes: ['newIndex']
  };

  // Optionally pass in the new database version. Set to true to increment the database version. 
  // Additions and deletions will be ignored if this is lower than the current database version, as per the functionality of IndexedDB
  // Leave this parameter out or pass in false to connect without making any changes to the structure of the database
  let dbVersion = 1 

  // The name of the database to connect to
  let dbName = 'dbName';

  // Finally, open the connection with the database. This will return a success or failure
  let responce = await userData.OpenDb( dbName, dbVersion, additions, deletions);
  ```

There are other methods currently supported to interact with the database. Each will return a success, or on failiure, an error messege 

  ``` javascript

  //Delete a record by the key in a specific store
  let responce = await userData.deleteRecord('storeName', 'key');

  // add a record to a store. The record can be any type of object accepted by indexedDB
  let responce = await userData.onIDBAdd('storeName', 'record');

  // returns the record with the given key from the store with the given storeName
  let responce = await userData.onIDBRead('storeName', 'key');

  // Return all records from a database or optionally a specified amount defined by the second parameter
  let responce = await IDBReadAll('storeName');
  let responce = await IDBReadAll('storeName', 5);

  // Finally, close the connection to the database
  let responce = await userData.closeDb();

}
```