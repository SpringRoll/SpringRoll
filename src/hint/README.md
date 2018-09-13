# Hint Timer

The hint timer is a simple resettable timer.

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
