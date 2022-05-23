// Note: Requires jQuery for shorthand methods

// HTML elements to display MM:SS
let title = $('#time-title');
let timerDiv = $('#time-left');
let minElem = $('#minutes');
let secElem = $('#seconds');

// Timer class using iTimer function (see below)
export default class Timer {
    constructor(initMin, initSec) {
        this.min = initMin;
        this.sec = initSec;
    }

    start() {
        // ENSURE start time of AT LEAST 1 second
        // Otherwise...
        // if(this.sec == 0 && this.min == 0) return;
        decOneSec();
        if(this.sec == 0 && this.min == 0) return;      // hopefully not needed (start time of at least 2 sec)
        setInterval( decOneSec, 998);
    }

    reset(min, sec) {
        this.min = min;
        this.sec = sec;
    }

    stop() {                // hopefully not needed
        clearInterval();
    }

    decOneSec() {
        // display 
        minElem.text(`${this.min}`);
        if(this.sec < 10) {
            if(this.min == 0) {
                timerDiv.removeClass('text-white');
                timerDiv.addClass('text-red');
            }
            secElem.text(`0${this.sec}`);
        }
        else secElem.text(`${this.sec}`);

        // decrement 1 second
        if(this.sec == 0) {
            if(this.min == 0) {
                // TIMES UP!
                clearInterval();
                title.text('Time\'s up! :(');
            }
            else {
                this.min--;
                this.sec = 59;
            }
        }
        else this.sec--;
    }
}

//////////////////////////////////////////////////////////




// Timer using setInterval()
function iTimer(min, sec) {
    if(sec == 0 && min == 0) return;
    decOneSec();
    if(sec == 0 && min == 0) return;
    setInterval( decOneSec, 998);

    function decOneSec() {
        // display 
        minElem.text(`${min}`);
        if(sec < 10) {
            if(min == 0) {
                timerDiv.removeClass('text-white');
                timerDiv.addClass('text-red');
            }
            secElem.text(`0${sec}`);
        }
        else secElem.text(`${sec}`);

        // decrement 1 second
        if(sec == 0) {
            if(min == 0) {
                // TIMES UP!
                clearInterval();
                title.text('Time\'s up! :(');
            }
            else {
                min--;
                sec = 59;
            }
        }
        else sec--;
    }
}

// Timer using Recursion and setTimeout()
function rTimer(min, sec) {
    if(sec == 0 && min == 0) return;
    decOneSec();

    function decOneSec() {
        minElem.text(`${min}`);
        if(sec < 10) secElem.text(`0${sec}`);
        else secElem.text(`${sec}`);

        if(sec == 0) {
            if(min == 0) {
                // TIMES UP!
                return;
            }
            else {
                min--;
                
                sec = 59;
            }
        }
        else sec--;

        setTimeout( decOneSec, 1000); // The recursive call
    }
}


// Now let's try it out

// let m = 0;
// let s = 12;

// iTimer(m,s);










// Study:  Can we check minutes first and be logically just as efficient?

// const decOneSec2 = () => {
//     if(min == 0) {
//         if(sec == 0) {
//             // times up!
//             return;
//         }
//         else sec--;
//     }
//     else if(sec == 0) {
//         min--;
//         sec = 59;
//     }
//     else sec--;
// };