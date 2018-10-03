# Debugger

The Debugger module provides a centralized logging solution for SpringRoll games.

```javascript
Debugger.log('general', 'A general log');
Debugger.log('log', 'Normal log');
Debugger.log('warn', 'A warning');
Debugger.log('debug', 'A debug message');
Debugger.log('error', 'An error has occurred');
```

The debugger can be toggled off with the enable flag:

```javascript
Debugger.enable(false);
```

For more fine-grained control, you can set the minimum logging level:

```javascript
Debugger.minLevel('WARN');
```

Now, only `WARN` and `ERROR` level messages will print, and `GENERAL`, `DEBUG`, and `INFO` will not.
In particular, the message levels are as follows:
* `GENERAL` : 1
* `DEBUG` : 2
* `INFO` : 3
* `WARN` : 4
* `ERROR` : 5

Due to the message level ordering, if the minimum debug level is set to `INFO`, then `DEBUG` and `GENERAL` are disabled
and will not print, but `WARN` and `ERROR` will still print.

This mapping is programmatically accessible from `Debugger.LEVEL`.
