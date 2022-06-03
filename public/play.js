
let altPressed = false;      // redundant with build.js, yet code at bottom still works without either

let cardsInLibrary = [806, 672, 744, 657, 782, 751, 623, 780, 610, 792, 
                      794, 763, 752, 782, 629, 776, 878, 750, 684, 684,
                      765, 785, 754, 768, 804, 672, 613, 876, 876, 876, 
                      892, 892, 892, 892, 889, 889, 889, 889, 889, 889];

const phaseNames = ["Start turn", "Untap", "Upkeep", "Draw", "1st Main", "Combat", "2nd Main", "End of turn"];

// Game play zones
const hand = document.getElementById('hand');
const nonLandsArea = document.getElementById('non-lands-in-play');
const landsArea = document.getElementById('lands-in-play');
const graveyard = document.getElementById('my-graveyard');
const exileZone = document.getElementById('my-exiles');
const oppGraveyard = document.getElementById('opp-graveyard');
const oppExileZone = document.getElementById('opp-exiles');

// Right side-bar elements
const matchMin = $('#round-min');  // shows minutes remaining
const matchSec = $('#round-sec');  // shows seconds
const matchTimerDiv = $('#round-timer');    // holds them both
// const oppName = document.getElementById('opp-name');

const playerName = document.getElementById('player-name');          // <span>
const turnNum = document.getElementById('turn-number');             // <span>
const turnPhase = document.getElementById('turn-phase');            // <div>
const turnProgress = document.getElementById('turn-progress');      // <progress>
const myLifePoints = document.getElementById('my-lifepoints');      // <span>
const oppLifePoints = document.getElementById('opp-lifepoints');    // <span>

// Chat related elements
const chatForm = document.getElementById('chat-form');
const chatLog = document.getElementById('chat-log');
const chatInput = document.getElementById('chat-input');

// Action buttons
const rollBtn = document.getElementById('roll-btn');
const untapBtn = document.getElementById('untap-btn');
const drawBtn = document.getElementById('draw-btn');
const draw7Btn = document.getElementById('draw7-btn');
const tutorBtn = document.getElementById('tutor-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const mullBtn = document.getElementById('mull-btn');
const scryBtn = document.getElementById('scry-btn');
const view3Btn = document.getElementById('view3-btn');
const revealBtn = document.getElementById('reveal-btn');
const nextPhaseBtn = document.getElementById('nextphase-btn');
const resignBtn = document.getElementById('resign-btn');

// Modal dialog to Scry 1
const scryModal = document.getElementById('scry-modal');
const scryImg = document.getElementById('scryed-card');
const toBottomBtn = document.getElementById('unshift-btn');
// const keepOnTopBtn = document.getElementById('ontop-btn');

// Modal dialog to View top 3 cards with option to reorder or shuffle
const view3Modal = document.getElementById('view3-modal');      // <dialog>
const threeCardDiv = document.getElementById('three-cards');
const shuffle2 = document.getElementById('shuffle-btn-2');
const reorderBtn = document.getElementById('reorder-btn');      // @TODO: change to drag & drop
const keepAsIsBtn = document.getElementById('asis-btn');

// For modal to see revealed hand
const oppHand = document.getElementById('opp-hand');            // <div>

// For modal to search library
const myLibrary = document.getElementById('my-library');

// Quantity elements for the 6 kinds of mana
const colorless = document.getElementById('colorless-qty');     // <span>
const white = document.getElementById('white-qty');
const blue = document.getElementById('blue-qty');
const black = document.getElementById('black-qty');
const red = document.getElementById('red-qty');
const green = document.getElementById('green-qty');
// let colorlessQty = 0, whiteQty = 0, blueQty = 0, blackQty = 0, redQty = 0, greenQty = 0;

let cardsInHand = [];
let numCardsInHand = 0;
let landsInPlay = [];
let nonLandsInPlay = []
let numCardsInPlay = 0;
let cardsInGY = [];
let numCardsInGY = 0;
let cardsInExile = [];
let numCardsInExile = 0;
let myGyShown = true;
let oppGyShown = true;
let currentSelectedCard;


shuffleDeck();  // auto shuffle first
//for(let c = 0; c < 7; c++ ) addCardToHand( cardsInLibrary.pop() );    // to automatically draw 7

// BUTTON CLICK LISTENERS
shuffleBtn.addEventListener('click', () => {
    shuffleDeck();
    //clientSocket.emit("privateMsg", { ourDraftID: myDraftID, ourMatchID: myMatchID, msg: "shuffles deck" } );
});

rollBtn.addEventListener('click', () => {
    let die1 = randomInt(6) + 1;
    let die2 = randomInt(6) + 1;

    notifyOpponent(`rolled a ${die1} and a ${die2} = ${die1 + die2}`);
    // AS OPPOSED TO:  clientSocket.emit("diceRolled", { ourDraftID: myDraftID, ourMatchID: myMatchID, rollValue: (die1 + die2) } );
    alert(`You rolled a ${die1} and a ${die2}  =  ${die1 + die2}`);
});

// UNTAP ALL button click
untapBtn.addEventListener( 'click', () => {
    let tappedCards = document.querySelectorAll('.tapped'); // querySelectorAll() WORKED!
                                                            // Previous behavior with getElementsByClassName()
    for( card of tappedCards) {                             // was a bit strange, requiring multiple clicks
        card.classList.remove('tapped');                    // only every other tapped card would be untapped each time
    }
    notifyOpponent("untaps");
    turnProgress.value = 12.5;
    turnPhase.innerText = "Start turn";
});

// DRAW 1 button click
drawBtn.addEventListener( 'click', () => {
    if (cardsInLibrary.length == 0) {
        alert("0 cards left to draw — game lost");
        return;
    }
    if (numCardsInHand > 6) {
        alert("7 cards in hand is the max");
        return;
    }
    addCardToHand( cardsInLibrary.pop() );
    notifyOpponent("draws for the turn");
});

// DRAW 7 button click
draw7Btn.addEventListener( 'click', () => {
    if ( cardsInLibrary.length >= 7 && numCardsInHand == 0) {
        for(let c = 0; c < 7; c++ ) addCardToHand( cardsInLibrary.pop() );
    }
});

// MULLIGAN button click
mullBtn.addEventListener('click', () => {
    notifyOpponent(`mulligans to ${numCardsInHand - 1}` );
    mulligan(numCardsInHand);
});

// SCRY button click (shows top card)
scryBtn.addEventListener('click', () => {
    const topCard = cardsInLibrary[cardsInLibrary.length-1];    // get the top card (last card in array)
    scryImg.src = `images/${topCard}.jpeg`;             // show image of top card
    scryImg.classList.add('rounded');
    scryModal.showModal();
});
    // TO-BOTTOM button (move top card to bottom)
    toBottomBtn.addEventListener('click', () => {
        cardsInLibrary.unshift( cardsInLibrary.pop() );     // Shift LEFT = move item at pos 0 to top;  
    });                                                     // Shift RIGHT (UNshift) = top to pos 0

// "VIEW TOP 3 CARDS" button click
view3Btn.addEventListener('click', () => {
    for(let i = cardsInLibrary.length-3; i<cardsInLibrary.length; i++) {
        if(i < 0) continue;                                             // if undefined, go to next index
        let img1 = document.createElement('img');
        img1.setAttribute('src', `images/${cardsInLibrary[i]}.jpeg`);
        img1.classList.add('rounded');
        img1.setAttribute('draggable', true);                           // does this work?
        threeCardDiv.appendChild(img1);
    }
    view3Modal.showModal();
});
    // SHUFFLE button click
    shuffle2.addEventListener('click', () => {
        clearChildImages(threeCardDiv);                         // @TODO: more efficient way to do this??
        shuffleDeck();
    });
    // REORDER button click
    // Sequence Input box will be replaced with drag-&-drop ability
    reorderBtn.addEventListener('click', () => {
        // clearChildImages(threeCardDiv);
        // grab value from input 
        const orderAsArray = document.getElementById('#spec-order').value.split(',');
        //and swap cards
        // clear input
        // BETTER approach: allow them to drag to reorder
    });
    // "KEEP AS IS" button click
    keepAsIsBtn.addEventListener('click', () => {
        clearChildImages(threeCardDiv);
    })

// "REVEAL HAND to opponent" button click
revealBtn.addEventListener('click', () => {
    document.getElementById('reveal-modal').showModal();
//     // that will be replaced by...
//     // sending hand data to opponent
//     //clientSocket.emit("handRevealed", { ourDraftID: myDraftID, ourMatchID: myMatchID, hand: cardsInHand} );
});

// "PROCEED TO NEXT PHASE" button click
nextPhaseBtn.addEventListener('click', () => {
    if(turnProgress.value <= 87.5) {
        turnProgress.value += 12.5;
        // turnProgress.innerText = ... does this matter for accessibility?
        updatePhase(turnProgress.value);
    }
});

// Temporary Button to Search Library that brings up an alert
// Eventually this will be replaced with a larger Modal showing all cards in library with a click
// event listener on each to select the desired card and move it from libaray to hand
tutorBtn.addEventListener( 'click', () => {
    notifyOpponent("searches library");
    document.getElementById('search-modal').showModal();
    myLibrary.innerHTML = "";

    let cardToGet = 0;
    let noneleft = false;

    for(let j = 0; j< 7; j++) {
        let rowX = document.createElement('div');
        rowX.classList.add('lib-row');
        for(let i = 0; i < 5; i++ ) {
            if( !cardsInLibrary[5*j + i] ) {
                noneleft = true;
                break;          // if there's no next card then stop
            }
            let cImg = document.createElement('img');
            cImg.src = `images/${cardsInLibrary[5*j + i]}.jpeg`;
            cImg.style.maxWidth = "159px";
            cImg.style.maxHeight = "221px";
            cImg.style.zIndex = `${j}`;
            cImg.classList.add('rounded-sm');
            cImg.addEventListener('click', (evt) => {
                cardToGet = Number( evt.currentTarget.src.slice(7,10) );
                evt.currentTarget.style.opacity = "0.4";
                cardsInLibrary.splice( cardsInLibrary.indexOf( cardToGet, 0 ), 1); 
                addCardToHand( cardToGet );
            })
            rowX.appendChild(cImg);
        }
        myLibrary.appendChild(rowX);
        if(noneleft) break;
    }  

    shuffleDeck();  // auto shuffle
});

// RESIGN/CONCEDE GAME button click
resignBtn.addEventListener('click', () => {
    const affirmative = confirm("Are you sure you want to resign?");
    if (affirmative) {
        alert("Resigning this game");
        //clientSocket.emit("resigns", { draftID: myDraftID, oppID: myOpponentID } );
        // update client's game info, status
    }  
});


// DRAWS 1 card to hand, adding various event listeners to/for it
function addCardToHand( card ) {
    cardsInHand.push(card);
    numCardsInHand++;

    let cardImage = document.createElement('img');

    cardImage.src = `images/${card}.jpeg`;        // DO NOT CHANGE PATH, otherwise slice() will need a new range
    cardImage.classList.add('scale-in-hand');
    cardImage.draggable = true;

    // Event listeners for newly added/drawn card
    cardImage.addEventListener( 'dragstart', (e) => {   
        currentSelectedCard = e.currentTarget ;
            // ^ combine? v
        currentSelectedCard.style = "opacity: 0.3; cursor: grabbing";
    });

    cardImage.addEventListener( 'dragend', (e) => {
        e.currentTarget.style = "opacity: 1;"; // change cursor type?
        setTimeout( () => {
            nonLandsArea.style = "border: 0px";
            landsArea.style = "border: 0px";
        },200);
    });

    // cardImage.addEventListener('auxclick', (e) => {
    //     e.preventDefault();
    //     //toggle transform
    // });

    cardImage.addEventListener( 'dblclick', event => {
        // if parent element is nonLandArea or landArea...
        if( cardImage.parentElement == landsArea || cardImage.parentElement == nonLandsArea) {
            // if( cardImage.classList.contains('tapped') )
            //     cardImage.classList.remove('tapped');
            // else {
                // tap card if it's a basic land // later we'll add non-basics and artifacts
                // perhaps including how much many card produces when tapped within the card object
                cardImage.classList.add('tapped');
                const cardID = Number(cardImage.getAttribute('src').slice(7,10));
                if( cardID > 896) {
                    white.innerText = `${Number( white.innerText ) + 1}`;        // increase white mana
                    white.style.color = "yellow";
                    document.getElementById('w-symbol').classList.add('halo');
                }                      
                else if( cardID > 893) {
                    blue.innerText = `${Number( blue.innerText ) + 1}`;          // increase blue mana
                    blue.style.color = "rgb(0, 170, 255)";
                    document.getElementById('u-symbol').classList.add('halo');
                }                 
                else if( cardID > 890) {
                    red.innerText = `${Number( red.innerText ) + 1}`;           // increase red mana
                    red.style.color = "red";
                    document.getElementById('r-symbol').classList.add('halo');
                }                 
                else if( cardID > 887) {
                    green.innerText = `${Number( green.innerText ) + 1}`;        // increase green mana
                    green.style.color = "rgb(64, 255, 47)";
                    document.getElementById('g-symbol').classList.add('halo');
                }                 
                else if( cardID > 874 && cardID < 878) {
                    black.innerText = `${Number( black.innerText )+1}`;         // increase black mana
                    black.style.color = "purple";
                    document.getElementById('b-symbol').classList.add('halo');
                } 
            // }
        }
    });

    // cardImage.addEventListener( 'mouseover', () => {     // could also use 'rightclick'
    //     // if hover more than a sec or two...
    //          // transform: scale to 130%
    // });

    hand.appendChild(cardImage);
}

// Non-Land Area event listeners
nonLandsArea.addEventListener( 'dragover', (event) => {
    event.preventDefault();
    nonLandsArea.style = "background: #555;";
});

nonLandsArea.addEventListener( 'dragleave', (event) => {
    nonLandsArea.style = "background: #1e1e1e;";
});

nonLandsArea.addEventListener( 'drop', event => {
    //currentSelectedCard.draggable = false;
    //currentSelectedCard.style = "width: 90px; height: 125px;";

    nonLandsArea.appendChild(currentSelectedCard);
    currentSelectedCard.classList.replace('scale-in-hand', 'scale-on-battlefield');
    let cardNum = currentSelectedCard.src.slice(7,10);
    let index = cardsInHand.indexOf( cardNum, 0);
    cardsInHand.splice( index, 1 );
    
    numCardsInHand--;                   // or just refer to cardsInHand.length
    // nonLandsInPlay.push(cardNum);
    // refresh NL area
    numCardsInPlay++;
    nonLandsArea.style = "border: 1px solid yellowgreen";
});


// Land Area event listeners
landsArea.addEventListener( 'dragover', (event) => {
    event.preventDefault();
    landsArea.style = "background: #555;";
});

landsArea.addEventListener( 'dragleave', (event) => {
    landsArea.style = "background: #1e1e1e;";
});

landsArea.addEventListener( 'drop', event => {
    currentSelectedCard.draggable = false;
    currentSelectedCard.classList.replace('scale-in-hand', 'scale-on-manafield');
    //currentSelectedCard.style = "width: 72px; height: 100px;";
    let cardNum = currentSelectedCard.src.slice(7,10);
    let index = cardsInHand.indexOf( cardNum, 0);
    cardsInHand.splice( index, 1 );            
    landsArea.appendChild(currentSelectedCard);
    numCardsInHand--;           // or just refer to cardsInHand.length
    // landsInPlay.push(cardNum);
    // refresh NL area
    numCardsInPlay++;
    landsArea.style = "border: 1px solid yellowgreen";
});


// Graveyard event listeners
graveyard.addEventListener( 'dragover', (event) => {
    event.preventDefault();
    graveyard.style = "background: #555;";
});

graveyard.addEventListener( 'dragleave', (event) => {
    graveyard.style = "background: #1e1e1e;";
});

graveyard.addEventListener( 'drop', event => {
    currentSelectedCard.draggable = false;
    currentSelectedCard.classList.remove('scale-in-hand', 'scale-on-battlefield');
    graveyard.appendChild(currentSelectedCard);
    numCardsInHand--;           // TODO: UPDATE ... different depending on source/spell
    numCardsInGY++;
    //graveyard.style = "";
});

// Exile zone event listeners
exileZone.addEventListener( 'dragover', (event) => {
    event.preventDefault();
    // exileZone.setAttribute('style', "background-color: #555");
});

exileZone.addEventListener( 'dragleave', (event) => {
    // exileZone.setAttribute('style', "background-color: #1e1e1e");
});

exileZone.addEventListener( 'drop', event => {
    currentSelectedCard.draggable = false;
    currentSelectedCard.classList.remove('scale-in-hand', 'scale-on-battlefield');
    exileZone.appendChild(currentSelectedCard);
    numCardsInPlay--;           // TODO: UPDATE ... depends on source of removal
    numCardsInExile++;
    //exileZone.style = "";
});

// Button to Toggle display of MY Graveyard and Exile zones
document.getElementById('toggle-gy-exile').addEventListener( 'click', (evt) => {
    if( myGyShown ) {
        // hide GY
        graveyard.style.display = "none";
        // show Exiled cards
        exileZone.style.display = "flex";
        myGyShown = false;
        evt.currentTarget.innerText = "Show Graveyard";
    } else {
        // hide Exiled cards
        exileZone.style.display = "none";
        // show GY
        graveyard.style.display = "flex";
        myGyShown = true;
        evt.currentTarget.innerText = "Show Exiles";
    }
});         // @TODO:  ^ CONSOLIDATE? v

// Button to Toggle display of OPPONENT'S Graveyard and Exile zones
document.getElementById('toggle-opp-gy-exile').addEventListener( 'click', (evt) => {
    if( oppGyShown ) {
        // hide GY
        oppGraveyard.style.display = "none";
        // show Exiled cards
        oppExileZone.style.display = "flex";
        oppGyShown = false;
        evt.currentTarget.innerText = "Show GY";
    } else {
        // hide Exiled cards
        oppExileZone.style.display = "none";
        // show GY
        oppGraveyard.style.display = "flex";
        oppGyShown = true;
        evt.currentTarget.innerText = "Show Exiles";
    }
});

// oppName.innerText = `[opp name]`;     // USE:  oppName.innerText = `${myOpponentID}-${myOppName}`;

// CHAT FORM/LOG
chatForm.addEventListener('submit', (evt) => {
    evt.preventDefault();
    if(chatInput.value) {
        const nameElem = document.createElement('span');
        const msgElem = document.createElement('span');       // Yessss! 2 Spans solves the issue!

        nameElem.classList.add('my-chat-name');                // styling for username

        nameElem.innerText = `username:`;   // USE: nameElem.innerText = `${myName}:`;               
        msgElem.innerText =  ` ${chatInput.value}\n`;

        //clientSocket.emit("privateMsg", { ourDraftID: myDraftID, ourMatchID: myMatchID, msg: chatInput.value } );

        chatLog.appendChild(nameElem);
        chatLog.appendChild(msgElem);

        chatLog.scrollTo(0,100000);
        chatInput.value = "";
    }
});

// clientSocket.on("privateMsg", (data) => {     // socket ID & name OR opp ID & name
//     console.log("received message: \"" + data.msg + "\" from " + myOppName);
//     const nameElem = document.createElement('span');
//     const msgElem = document.createElement('span');       // Yessss! 2 Spans solves the issue!

//     nameElem.classList.add('opp-chat-name');

//     nameElem.innerText = `${myOppName}:`;         // @TODO: change once to opponent's name each match
//     msgElem.innerText =  ` ${data.msg}\n`;

//     // post message to chat log
//     chatLog.appendChild(nameElem);
//     chatLog.appendChild(msgElem);
    
//     chatLog.scrollTo(0,100000);
// });

// clientSocket.on("handRevealed", (data) => {          // data.hand is their array of cards in hand
//     console.log("Opponent's hand has cards " + data.hand);

//     for(let c = 0; c < data.hand.length; c++) {
//         let cImg = document.createElement('img');
//         cImg.setAttribute('src', `images/${data.hand[c]}.jpeg`);
//         cImg.classList.add('rounded-sm');
//         oppHand.appendChild(cImg);
//     }
//     document.getElementById('reveal-modal').showModal();
// });

function notifyOpponent( myMessage ) {
    //clientSocket.emit("privateMsg", { ourDraftID: myDraftID, ourMatchID: myMatchID, msg: myMessage } );
}

// SHUFFLE
function shuffleDeck() {
    let pos1, pos2;
    for( let i = 0; i < 4*cardsInLibrary.length; i++ ) {    // make (4 * the # of cards in lib) passes
        pos1 = randomInt(cardsInLibrary.length);  // 0-39
        pos2 = randomInt(cardsInLibrary.length);  // 0-39
        if( pos1 == pos2 ) pos2 = randomInt(cardsInLibrary.length);  // if same #, try again

        let temp = cardsInLibrary[pos1];
        cardsInLibrary[pos1] = cardsInLibrary[pos2];
        cardsInLibrary[pos2] = temp;
    }
}

// MULLIGAN
function mulligan(numCardsHad) {
    let imgNum;
    for(let c = 0; c < numCardsHad; c++) {
        imgNum =  Number( hand.lastChild.getAttribute('src').slice(7,10) ) ;
        hand.removeChild(hand.lastChild);
        numCardsInHand--;
        cardsInLibrary.push(imgNum);
    }
    shuffleDeck();
    for(let i = 0; i < numCardsHad - 1; i++) addCardToHand( cardsInLibrary.pop() );
}

// Mana quantity adjustments
document.getElementById('c-symbol').addEventListener( 'click', (evt) => {
    adjustQuantity(colorless, 'c');   // change qty of colorless mana
});

document.getElementById('w-symbol').addEventListener( 'click', (evt) => {
    adjustQuantity(white, 'w');      // change qty of white mana
});

document.getElementById('u-symbol').addEventListener( 'click', (evt) => {
    adjustQuantity(blue, 'u');       // change qty of blue mana
});

document.getElementById('b-symbol').addEventListener( 'click', (evt) => {
    adjustQuantity(black, 'b');      // change qty of black mana
});

document.getElementById('r-symbol').addEventListener( 'click', (evt) => {
    adjustQuantity(red, 'r');        // change qty of red mana
});

document.getElementById('g-symbol').addEventListener( 'click', (evt) => {
    adjustQuantity(green, 'g');      // change qty of green mana
});


// Life point inc/dec
myLifePoints.addEventListener('click', () => {
    adjustQuantity(myLifePoints, null);
});
oppLifePoints.addEventListener('click', () => {
    adjustQuantity(oppLifePoints, null);
});


// Alt key listening also in build script so redundant here in live app

// 1.
// Window listener for ALT key                           
// capture Alt key up & down events  (Alt key is #18)
window.addEventListener( 'keydown', keyEvent => {
    if(keyEvent.key == "Alt") {
        altPressed = true;
    }                                    
});
window.addEventListener( 'keyup', keyEvent => {
    if(keyEvent.key == "Alt") {
        altPressed = false;
    }
});

// 2.
// Adjust of quantity of MANA element passed in            
function adjustQuantity(textElem, iconLetter) {
    // get current quantity
    let prevQty = Number( textElem.innerText );
    let currentQty = Number( textElem.innerText );
       
    // if Alt key is down...
    if(altPressed) {
        if(currentQty > 0) currentQty--;    // if quantity > 0, decrement quantity
    }
    else {
        currentQty++;       // otherwise, increment quantity
    }
    // render updated value
    textElem.innerText = `${currentQty}`;

    if(iconLetter) {
        // remove or add halo
        if(textElem.innerText == "0") {
            document.getElementById(`${iconLetter}-symbol`).classList.remove('halo'); // needed otherwise JS doesn't think it has a classList
            textElem.style.color = "lightgray";
        }
        else if(currentQty > prevQty) {
            document.getElementById(`${iconLetter}-symbol`).classList.add('halo');
            textElem.style.color = getColor(iconLetter);
        }   
    }
}

function randomInt( max ) {
    return Math.floor(Math.random() * max);  // returns an integer from 0 to max-1
}

function updatePhase(newValue) {
    let index = (newValue / 12.5) - 1;
    turnPhase.innerText = phaseNames[index];
}
        
function getColor( char ) {
    switch(char) {
        case 'w':  return "yellow";
        case 'u':  return "rgb(0, 170, 255)";
        case 'b':  return "purple";
        case 'r':  return "red";
        case 'g':  return "rgb(64, 255, 47)";
    }
}

function clearChildImages( parentElem ) {
    while(parentElem.lastChild) parentElem.removeChild(parentElem.lastChild);
}