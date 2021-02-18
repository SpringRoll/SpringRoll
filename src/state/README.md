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
### [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
This plugin is an abstraction of some of IndexedDBs functionality. Data passed in should conform to their documentation unless otherwise specified.
Any work with indexedDB or the UserData plugin as a whole should be done inside the 'connected' callback method

``` javascript
import { UserData } from 'springroll';

app.container.on('connected', async () => {
  // connect to your database
  let response = await UserData.OpenDb('dbName');
  
  // Work with IndexedDB below
  ...
}
```

In order to  change the structure of the database, such as adding/removing stores to a database or an index to a store, you should do so in the IDBOpen method. [Structuring the database](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB#creating_or_updating_the_version_of_the_database) has documentation on the options able to be passed into indexes and stores

``` javascript
  
  // Additions is an optional parameter expecting a JSON object with any additions to the databases structure namely new stores and indexes. These are placed inside of an array 
  let additions = {
    // []
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
  let response = await UserData.OpenDb( dbName, dbVersion, additions, deletions);
  ```

There are other methods currently supported to interact with the database. These allow you to [Add a record](https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/add), [Deleting a record](https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/delete), [Reading](https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/get), [reading all records](https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/getAll) Each will return a success, or on failure, an error message 

  ``` javascript

  // add a record to a store. The record can be any type of object accepted by indexedDB
  let response = await UserData.IDBAdd('storeName', 'record');

  //Delete a record by the key in a specific store
  let response = await UserData.IDBRemove('storeName', 'key');

  // returns the record with the given key from the store with the given storeName
  let response = await UserData.IDBRead('storeName', 'key');
  // Expected Output:  {data: Object { result: "item", success: true }, type: IDBRead}

  console.log(response.data.result); // The value of the record given

  // Return all records from a database or optionally a specified amount defined by the second parameter
  let response = await IDBReadAll('storeName');
  let response = await IDBReadAll('storeName', 5);

  // Expected Output:  {data: Object { result: ["item1", "item2"], success: true }, type: IDBRead}


  // Finally, close the connection to the database
  let response = await UserData.closeDb();

  // One may also choose to delete a database 
  let response = await UserData.IDBDeleteDB();
```


Return the version of the given database
``` javascript
let version = await UserData.IDBGetVersion('dbName');
```

All functions will return either a success or a failure message with error details
``` javascript
// Successes will return something similar to this
{
  data: { 
    result: 'Success: IDBOpen', 
    success: true 
  },
  type: 'IDBOpen'
}

// Failures will return something similar to this
  data: { 
    result: 'Failure: Current version is greater than given version', 
    success: true 
  },
  type: 'IDBOpen'
}
```
