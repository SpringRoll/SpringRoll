 # Hints


## Reset Timer
The reset timer provides a small layer of abstraction above javascript's builtin timeout.

## Example
```Javascript

class GameClass
{
    constructor()
    {
        this.hints = new HintTimer();
        this.hints.subscribe(()=>{
            // Show your hint here.
        });
    }

    onGameStart()
    {
        this.hints.start(15000);
    }

    onGameStop()
    {
        this.hints.stop();
    }

    onUserInteraction()
    {
        this.hints.reset();
    }  
}
```
