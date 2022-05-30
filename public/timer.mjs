// Timer class using cleaner version of my iTimer function
export default class Timer {
    constructor(initMin, initSec) {
        this.min = initMin;
        this.sec = initSec;
    }

    updateDisplay(min, sec) {
        // assignment accepted!
    }

    setDisplayFunc (updateDisplay ) {
        this.updateDisplay = updateDisplay;
    }

    start(  ) {
        // ENSURE start time of AT LEAST 1 second
        // Otherwise...
        // if(this.sec == 0 && this.min == 0) return;
        this.decOneSec();
        if(this.sec == 0 && this.min == 0) return;      // hopefully not needed (start time of at least 2 sec)
        setInterval( this.decOneSec.bind(this), 1000);
    }

    getTime() {
        return {min: this.min, sec: this.sec};
    }

    timeLeft() {
        return (this.sec !== 0 || this.min !== 0);
    }

    timesUp() {
        return (this.sec === 0 && this.min === 0);
    }

    stop() {                // hopefully needed only when round finishes in time
        clearInterval();
    }

    reset(min, sec) {
        this.min = min;
        this.sec = sec;
    }

    decOneSec() {
        // displayed in client's UI
        this.updateDisplay(this.min, this.sec);

        // decrement 1 second
        if(this.sec == 0) {
            if(this.min == 0) {
                // TIMES UP!
                clearInterval();
                //title.text('Time\'s up! :(');
            }
            else {
                this.min--;
                this.sec = 59;
            }
        }
        else this.sec--;
    }
}