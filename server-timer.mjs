
export default class Timer {      // Timer class for server

    constructor(initMin, initSec) {
        this.min = initMin;
        this.sec = initSec;
    }

    start() {   // ENSURE start time of AT LEAST 1 second. Otherwise...
        // if(this.sec == 0 && this.min == 0) return;
        this.decOneSec();
        if(this.sec == 0 && this.min == 0) return;      // hopefully not needed (start time of at least 2 sec)
        setInterval( this.decOneSec.bind(this), 1000);
    }

    stop() {  clearInterval();  }       // hopefully needed only when round finishes in time :)
    
    reset(min, sec) {
        this.min = min;
        this.sec = sec;
    }

    decOneSec() {           // decrement time by 1 second
        if(this.sec == 0) {
            if(this.min == 0) 
                clearInterval();    // TIMES UP!
            else {
                this.updateDisplay(this.min, this.sec);  // displayed time left every minute
                this.min--;
                this.sec = 59;
            }
        }
        else this.sec--;
    }

    updateDisplay(min, sec) {  console.log(min + ":" + sec);  }    // or however we want to see the time

    getTime() {  return {min: this.min, sec: this.sec};  }         // returns time remaining

    timeLeft() {  return (this.sec !== 0 || this.min !== 0);  }    // returns true if there's time left
}