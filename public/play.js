
let altPressed = false;      // redundant with build.js, yet code at bottom still works without either

let cardsInLibrary = [806, 672, 744, 657, 782, 751, 623, 780, 610, 792, 
                      794, 763, 752, 782, 629, 776, 878, 750, 684, 684,
                      765, 785, 754, 768, 804, 672, 613, 876, 876, 876, 
                      892, 892, 892, 892, 889, 889, 889, 889, 889, 889];


const phaseNames = ["Start turn", "Untap", "Upkeep", "Draw", "1st Main", "Combat", "2nd Main", "End of turn"];
const phaseColors = ["#fcfe94", "#f8a969", "#9acd32", "#52b7e6", "#64e089", "#f96bb8", "#537aef", "#6f6597"];

// Game play zones
const hand = document.getElementById('hand');
const landsArea = document.getElementById('lands-in-play');
const nonLandsArea = document.getElementById('non-lands-in-play');
const graveyard = document.getElementById('my-graveyard');
const exileZone = document.getElementById('my-exiles');
const oppLands = document.getElementById('opp-lands');
const oppNonLands = document.getElementById('opp-non-lands');
const oppGraveyard = document.getElementById('opp-graveyard');
const oppExileZone = document.getElementById('opp-exiles');

// Right side-bar elements
const matchMin = $('#round-min');  // shows minutes remaining
const matchSec = $('#round-sec');  // shows seconds
const matchTimerDiv = $('#round-timer');    // holds them both

const activePlayerName = document.getElementById('player-name');          // <span>
const turnNum = document.getElementById('turn-number');             // <span>
const turnPhase = document.getElementById('turn-phase');            // <div>
const progressDiv = document.getElementById('turn-progress');       // was <progress>, now <div>
const progBar = document.getElementById('prog-bar');                // <div> inside <div>
const myLifePoints = document.getElementById('my-lifepoints');      // <span>
const oppLifePoints = document.getElementById('opp-lifepoints');    // <span>

// Chat related elements
const chatForm = document.getElementById('chat-form');
const chatLog = document.getElementById('chat-log');
const chatInput = document.getElementById('chat-input');

// Action buttons
const shuffleBtn = document.getElementById('shuffle-btn');
const rollBtn = document.getElementById('roll-btn');
const draw7Btn = document.getElementById('draw7-btn');
const mullBtn = document.getElementById('mull-btn');
const keepBtn = document.getElementById('keep-btn');
const scryBtn = document.getElementById('scry-btn');
const untapBtn = document.getElementById('untap-btn');
const drawBtn = document.getElementById('draw-btn');
const nextPhaseBtn = document.getElementById('nextphase-btn');
const tutorBtn = document.getElementById('tutor-btn');
const view3Btn = document.getElementById('view3-btn');
const reveal3Btn = document.getElementById('reveal3-btn')
const revealHandBtn = document.getElementById('reveal-btn');

const resignBtn = document.getElementById('resign-btn');

// Modal dialog to Scry 1
const scryModal = document.getElementById('scry-modal');
const scryImg = document.getElementById('scryed-card');
const toBottomBtn = document.getElementById('unshift-btn');
// const keepOnTopBtn = document.getElementById('ontop-btn');

// Modal dialog to View top 3 cards with option to reorder or shuffle
const view3Modal = document.getElementById('view3-modal');      // <dialog>
const threeCardDiv = document.getElementById('three-cards');    // <div>
const shuffle2 = document.getElementById('shuffle-btn-2');      // <button>
const reorderBtn = document.getElementById('reorder-btn');      // @TODO: change to drag & drop
// const keepAsIsBtn = document.getElementById('asis-btn');

// For modal to see revealed hand
const oppHand = document.getElementById('opp-hand');            // <div>

// For modal to search library
const tutorModal = document.getElementById('search-modal');     // <dialog>
const myLibrary = document.getElementById('my-library');        // <div>

// Quantity elements for the 6 kinds of mana
const colorless = document.getElementById('colorless-qty');     // <span>
const white = document.getElementById('white-qty');
const blue = document.getElementById('blue-qty');
const black = document.getElementById('black-qty');
const red = document.getElementById('red-qty');
const green = document.getElementById('green-qty');

let myRollValue;
let oppRollValue;
let iPlayFirst = false;
let myTurn = false;
let cardsInHand = [];
let numCardsInHand = 0;         // @TODO: just use cardsInHand.length?
let landsInPlay = [];
let nonLandsInPlay = []
let numCardsInPlay = 0;         // @TODO: just use .length?
let cardsInGY = [];
let numCardsInGY = 0;           // @TODO: just use cardsInGY.length
let cardsInExile = [];
let numCardsInExile = 0;        // @TODO: just use cardsInGY.length
let oppNumCardsInHand = 0;
let myGyShown = true;
let oppGyShown = true;
let currentSelectedCard;
// let oppLandsInPlay = [];
// let oppNonLandsInPlay = [];
// let oppCardsInGY = [];          
// let oppCardsInExile = [];

shuffleDeck();  // auto shuffle first
//for(let c = 0; c < 7; c++ ) addCardToHand( cardsInLibrary.pop() );    // to automatically draw 7


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

    cardImage.addEventListener( 'dblclick', event => {
        // if parent element is nonLandArea or landArea...
        if( cardImage.parentElement == landsArea || cardImage.parentElement == nonLandsArea) {
            if( cardImage.classList.contains('tapped') )
                cardImage.classList.remove('tapped');
            else {
                // tap card if it's a basic land // later we'll add non-basics and artifacts
                // perhaps including how much many card produces when tapped within the card object
                cardImage.classList.add('tapped');
                const cardNumber = Number(cardImage.getAttribute('src').slice(7,10));
                addManaToPool( cardNumber );
            }
        }
    });
    // cardImage.addEventListener( 'mouseover', () => {     // could also use 'rightclick'
    //     // if hover more than a sec or two...
    //          // transform: scale to 130%
    // });
    // cardImage.addEventListener('auxclick', (e) => {
    //     e.preventDefault();      // need to prevent system defalt or contextual menu
    //     //toggle transform
    // });

    hand.appendChild(cardImage);
}

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
    document.cookie = `cardsinhand=${cardsInHand}`;     
    landsArea.appendChild(currentSelectedCard);
    document.cookie = `landsinplay=${landsInPlay}`;

    //clientSocket.emit("cardMoved", { ourDraftID: myDraftID, ourMatchID: myMatchID, srcArea: "hand", destArea: "lands", cardNum: cardNum });
    
    numCardsInHand--;           // or just refer to cardsInHand.length
    landsInPlay.push(cardNum);
    numCardsInPlay++;
    landsArea.style = "border: 2px solid yellowgreen";
});

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
    document.cookie = `cardsinhand=${cardsInHand}`;     
    document.cookie = `nonlandsinplay=${nonLandsInPlay}`;
    //clientSocket.emit("cardMoved", { ourDraftID: myDraftID, ourMatchID: myMatchID, srcArea: "hand", destArea: "nonlands", cardNum: cardNum });
    
    numCardsInHand--;                   // or just refer to cardsInHand.length
    nonLandsInPlay.push(cardNum);
    // refresh NL area
    numCardsInPlay++;
    nonLandsArea.style = "border: 2px solid yellowgreen";
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
    if(currentSelectedCard.parent == hand) {
        // clientSocket.emit("cardMoved", { ourDraftID: myDraftID, ourMatchID: myMatchID, srcArea: "hand", destArea: "graveyard", cardNum: cardNum });
        numCardsInHand--;           
        document.cookie = `cardsinhand=${cardsInHand}`;     
    } else if(currentSelectedCard.parent == nonLandsArea) {
        // clientSocket.emit("cardMoved", { ourDraftID: myDraftID, ourMatchID: myMatchID, srcArea: "nonlands", destArea: "graveyard", cardNum: cardNum });
        numCardsInPlay--;
        document.cookie = `nonlands=${nonLandsInPlay}`;
    }
    graveyard.appendChild(currentSelectedCard);
    numCardsInGY++;
    document.cookie = `cardsinyard=${cardsInGY}`;
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
    // @TODO: adjust non-lands
    exileZone.appendChild(currentSelectedCard);
    // clientSocket.emit("cardMoved", { ourDraftID: myDraftID, ourMatchID: myMatchID, srcArea: "nonlands", destArea: "exile", cardNum: cardNum });
    numCardsInPlay--;           // TODO: UPDATE ... depends on source of removal
    numCardsInExile++;
    document.cookie = `cardsinexile=${cardsInExile}`;
});

//
const handleToggleGraveyardExile = (gyDiv, exDiv, evt) => {
    if( myGyShown ) {
        gyDiv.style.display = "none";       // hide GY
        exDiv.style.display = "flex";       // show Exiled cards
        myGyShown = false;
        evt.currentTarget.textContent = "Show Graveyard";
    } else {
        exDiv.style.display = "none";       // hide Exiled cards
        gyDiv.style.display = "flex";       // show GY
        myGyShown = true;
        evt.currentTarget.textContent = "Show Exiles";
    }
};

// Button to Toggle display of MY Graveyard and Exile zones
document.getElementById('toggle-gy-exile').addEventListener( 'click', event => handleToggleGraveyardExile(graveyard, exileZone, event) );

// Button to Toggle display of OPPONENT'S Graveyard and Exile zones
document.getElementById('toggle-opp-gy-exile').addEventListener( 'click', event => handleToggleGraveyardExile(oppGraveyard, oppExileZone, event) );

// oppName.textContent = `[opp name]`;     // USE:  oppName.textContent = `${myOpponentID}-${myOppName}`;

// CHAT FORM/LOG
chatForm.addEventListener('submit', (evt) => {      // @TODO:  ENSURE default is ACTUALLY prevented!
    evt.preventDefault();
    if(chatInput.value) {
        const nameElem = document.createElement('span');
        const msgElem = document.createElement('span');       // Yessss! 2 Spans solves the issue!

        nameElem.classList.add('my-chat-name');                // styling for username

        nameElem.textContent = `username:`;   // USE: nameElem.textContent = `${myName}:`;               
        msgElem.innerText =  ` ${chatInput.value}\n`;           // must use .innerText to get \n characters

        //clientSocket.emit("privateMsg", { ourDraftID: myDraftID, ourMatchID: myMatchID, msg: chatInput.value } );

        chatLog.appendChild(nameElem);
        chatLog.appendChild(msgElem);

        chatLog.scrollTo(0,100000);
        chatInput.value = "";
    }
});

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
    notifyOpponent("shuffles deck");
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
    for(let i = 1; i < numCardsHad; i++) addCardToHand( cardsInLibrary.pop() );  // start with i = 1 instead of checking i < num - 1
}
                        /////////////////// HANDLERS ////////////////////
                                    
// HANDLER function for untap step
const handleUntapping = () => {
    let tappedCards = document.querySelectorAll('.tapped'); // querySelectorAll() WORKED!
                                                            // Previous behavior with getElementsByClassName()
    for( card of tappedCards) {                             // was a bit strange, requiring multiple clicks
        card.classList.remove('tapped');                    // only every other tapped card would be untapped each time
    }
    notifyOpponent("untaps");     
    // clientSocket.emit("justUntapped", { ourDraftID: myDraftID, ourMatchID: myMatchID } );        
};

// Phase update helper function
function updatePhase(newValue) {            // proceeds to the next phase of the turn
    let index = (newValue / 12.5);
    let currentPhase = phaseNames[index];
    turnPhase.textContent = currentPhase;
    document.cookie = `turnphase=${currentPhase}`;

    if(myTurn) {
        if(currentPhase == "Untap") handleUntapping();
        else if(currentPhase == "Draw") handleDraw();
        emptyManaPool();
    }
    // let red = randomInt(155) + 100; let green = randomInt(155) + 100; let blue = randomInt(155) + 100;
    // turnPhase.style.color = `rgb(${red}, ${green}, ${blue})`;
    // console.log(`rgb(${red}, ${green}, ${blue})`);
    progBar.style.backgroundColor = phaseColors[index];
    turnPhase.style.color = phaseColors[index];
}

        let myName = "my name"; let myOppName = "opp's name";
// HANDLER function for phase update click/event
function handlePhaseUpdate() {  // handle phases of "my turn"
    let totalWidth = Number( window.getComputedStyle(progressDiv).width.slice(0,-2) );  // chop off 'px'
    let barStartPos = Number(window.getComputedStyle(progBar).marginLeft.slice(0,-2) );  // using slice()
    let oneFU = totalWidth / 8
    let ratio = barStartPos / totalWidth;

    if( ratio <= 0.750 ) {
        let newPercentage = (barStartPos + oneFU) / totalWidth * 100;
        progBar.style.marginLeft = `${newPercentage}%`;
        updatePhase(newPercentage);
        // send event entering/leaving phase
        // clientSocket.emit("phaseUpdate", { ourDraftID: myDraftID, ourMatchID: myMatchID, phaseValue: newPercentage } );
    } 
    else {                                // if value > 87.5 or equals 100 then proceed to opponent's turn 
        nextPhaseBtn.setAttribute('disabled', true);
        progBar.style.marginLeft = "0";
        updatePhase(0);
        // clientSocket.emit("phaseUpdate", { ourDraftID: myDraftID, ourMatchID: myMatchID, phaseValue: 0 } );
        // clientSocket.emit("yourTurn", { ourDraftID: myDraftID, ourMatchID: myMatchID } );
        // activePlayerName.textContent = myOppName;
        // @TODO: disable buttons like Search Library for opponent's turn
        myTurn = false;
        document.cookie = "myturn=false";  
        activePlayerName.textContent = myOppName;                             
        alert("It's now opponent's turn");      // it will now be their turn
        // then if opponent went first increment turn #
        if(!iPlayFirst) {
            turnNum.textContent++;    // works! instead of Number(string)++     
            document.cookie = `turn=${turnNum.textContent}`;                // SAVE GAME STATE
        } 
    }
}

// HANDLER function to draw for turn
const handleDraw = () => {
    if (cardsInLibrary.length == 0) {
        alert("0 cards left to draw — game lost");
        // clientSocket.emit("gameDone", { draftID: myDraftID, playerID: myPlayerID, oppID: myOpponentID, gameResult: "resigns"} );
        return;
    }
    if (numCardsInHand > 7) {
        alert("8 cards in hand is the max for now");
        return;
    }
    addCardToHand( cardsInLibrary.pop() );
    notifyOpponent("draws for the turn");
    //clientSocket.emit("cardDrawn", { draftID: myDraftID, playerID: myPlayerID } );
};

// HANDLER function for Tutor button click
const handleSearchLib = () => {
    notifyOpponent("searches library");
    tutorModal.showModal();
    myLibrary.innerHTML = "";                           // empty out div in case there was a last time

    let cardToGet = 0;          // will hold the card #
    let noneleft = false;       // if no more cards left to show

    for(let j = 0; j< 7; j++) {                         // outer loop to place rows in div
        let rowX = document.createElement('div');
        rowX.classList.add('lib-row');

        for(let i = 0; i < 5; i++ ) {                   // inner loop to place img in row
            if( !cardsInLibrary[5*j + i] ) {
                noneleft = true;
                break;                                  // if there's no next card then stop
            }
            let cImg = document.createElement('img');
            cImg.src = `images/${cardsInLibrary[5*j + i]}.jpeg`;
            cImg.style.maxWidth = "159px";                          // styling constraints
            cImg.style.maxHeight = "221px";
            cImg.style.zIndex = `${j}`;
            cImg.classList.add('rounded-sm');
            cImg.addEventListener('click', (evt) => {                   // add click listener to each card
                let tempStr = evt.currentTarget.src.slice(-8,-5);       // 8th char, 7th, and 6th...but not 5th from end
                cardToGet = Number( tempStr );
                evt.currentTarget.style.opacity = "0.3";
                cardsInLibrary.splice( cardsInLibrary.indexOf( cardToGet, 0 ), 1); // remove card from lib
                addCardToHand( cardToGet );                                        // and add it to hand
                setTimeout( () => {  tutorModal.close();  }, 1500);
            })
            rowX.appendChild(cImg);
        }
        myLibrary.appendChild(rowX);                    // render row of cards
        if(noneleft) break;                             // (if no more then stop)
    }  
    shuffleDeck();                                      // auto shuffle "when done"
};

// HANDLER function for "View Top 3" button click
const handleViewTop3 = () => {
    threeCardDiv.innerHTML = "";
    let selectedCard;
    for(let i = cardsInLibrary.length-3; i<cardsInLibrary.length; i++) {
        if(i < 0) continue;                                             // if undefined, go to next index
        let img1 = new Image();                                 // quicker than document.createElement('img') ?
        img1.setAttribute('src', `images/${cardsInLibrary[i]}.jpeg`);
        img1.classList.add('rounded');
        img1.setAttribute('draggable', true);                           // does this work?
        img1.addEventListener( 'dragstart', (evt) => {
            selectedCard = evt.currentTarget;                           // @TODO: instead try setData()
            // allow them to drag to reorder
            
            // evt.currentTarget.hidden = true;
        });
        threeCardDiv.appendChild(img1);
    }
    view3Modal.showModal();

    threeCardDiv.addEventListener('dragover', (evt) => {
        evt.preventDefault();
    });
    threeCardDiv.addEventListener('drop', () => {
        threeCardDiv.appendChild(selectedCard);                         // and getData
        console.log("threeCardDiv: " + threeCardDiv.childElementCount); // this count is increasing
    });

    // SHUFFLE button click
    shuffle2.addEventListener('click', shuffleDeck);

    // REORDER button click
    reorderBtn.addEventListener('click', () => {
        // grab value from input 
        // const orderAsArray = document.getElementById('#spec-order').value.split(',');
        // and swap cards
        // clear input
        // BETTER approach: 
    });
};

const fadeOutPlay = () => {
    document.getElementById('black-curtain').style.zIndex = 20;
    document.getElementById('black-curtain').style.opacity = "1";
}
const fadeInPlay = () => {
    window.setTimeout( () => {
        document.getElementById('black-curtain').style.opacity = "0";
        document.getElementById('black-curtain').style.zIndex = -1;
    }, 5000);
}

////////////////////// BUTTON CLICK LISTENERS ///////////////////////

// SHUFFLE deck
shuffleBtn.addEventListener('click', () => {
    shuffleDeck();
});

// ROLL 2 6-sided dice
rollBtn.addEventListener('click', () => {
    let die1 = randomInt(6) + 1;
    let die2 = randomInt(6) + 1;

    notifyOpponent(`rolled a ${die1} and a ${die2} = ${die1 + die2}`);  
    // @TODO: make separate message so we can compare players' roll result and determine who goes first
    // clientSocket.emit("diceRolled", { ourDraftID: myDraftID, ourMatchID: myMatchID, rollValue: (die1 + die2) } );
    alert(`You rolled a ${die1} and a ${die2}  =  ${die1 + die2}`);
});

// DRAW 7 button click
draw7Btn.addEventListener( 'click', () => {
    if ( cardsInLibrary.length >= 7 && numCardsInHand == 0) {
        for(let c = 0; c < 7; c++ ) addCardToHand( cardsInLibrary.pop() );
    }
    //clientSocket.emit("cardsDrawn", { draftID: myDraftID, playerID: myPlayerID, numDrawn: 7 } );
});

// MULLIGAN button click
mullBtn.addEventListener('click', () => {
    notifyOpponent(`mulligans to ${numCardsInHand - 1}` );
    mulligan(numCardsInHand);
});

keepBtn.onclick = () => {       // after deciding to keep...
    shuffleBtn.hidden = true;
    rollBtn.hidden = true;      // no need to roll, unless for certain cards added later
    mullBtn.hidden = true;      // no more mulligans until maybe next game
    keepBtn.hidden = true;      // hide keep button too
    //scryBtn.hidden = true;
};

// SCRY button click (shows top card)
scryBtn.addEventListener('click', () => {
    scryImg.src = "";
    const topCard = cardsInLibrary[cardsInLibrary.length-1];    // get the top card (last card in array)
    scryImg.src = `images/${topCard}.jpeg`;                     // show image of top card
    scryImg.classList.add('rounded');
    scryModal.showModal();
});
    // TO-BOTTOM button (move top card to bottom)
    toBottomBtn.addEventListener('click', () => {
        cardsInLibrary.unshift( cardsInLibrary.pop() );         // Shift LEFT = move item at pos 0 to top;  
    });                                                         // Shift RIGHT (UNshift) = top to pos 0

// UNTAP ALL button click
untapBtn.addEventListener( 'click', handleUntapping);

// DRAW 1 button click
drawBtn.addEventListener( 'click', handleDraw);

// "VIEW TOP 3 CARDS" button click
view3Btn.addEventListener('click', handleViewTop3 );
    
// Reveal top 3 cards to opponent (Natural Selection)
reveal3Btn.onclick = () => {
    // send top 3 cards to opponent for viewing
    let myTop3 = [];
    for(let i = cardsInLibrary.length-3; i<cardsInLibrary.length; i++) {
        if(i < 0) continue;
        myTop3.push( cardsInLibrary[i] );
    }
    //clientSocket.emit("top3Revealed", { ourDraftID: myDraftID, ourMatchID: myMatchID, topThree: myTop3 } );
};

// "REVEAL HAND to opponent" button click
revealHandBtn.addEventListener('click', () => {
    document.getElementById('reveal-modal').showModal();
//     // that will be replaced by...
//     // sending hand data to opponent
//     //clientSocket.emit("handRevealed", { ourDraftID: myDraftID, ourMatchID: myMatchID, hand: cardsInHand} );
});

// "PROCEED TO NEXT PHASE" button click
nextPhaseBtn.addEventListener('click', handlePhaseUpdate);

// Large Modal showing all cards in library with a click listener on each to select the desired card
tutorBtn.addEventListener( 'click', handleSearchLib );

// RESIGN/CONCEDE GAME button click
resignBtn.addEventListener('click', () => {
    const affirmative = confirm("Are you sure you want to resign?");
    if (affirmative) {
        fadeOutPlay();
        // alert("Resigning this game...");
        //clientSocket.emit("gameDone", { draftID: myDraftID, playerID: myPlayerID, oppID: myOpponentID, gameResult: "resigns"} );
        // update client's game info, 
        fadeInPlay();
    }  
});

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
    if(altPressed == true )
        if(keyEvent.code == 'KeyA' || keyEvent.code == 'KeyP') handlePhaseUpdate();                                 
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
    let prevQty = Number( textElem.textContent );
    let currentQty = Number( textElem.textContent );
       
    // if Alt key is down...
    if(altPressed) {
        if(currentQty > 0) currentQty--;    // if quantity > 0, decrement quantity
    }
    else {
        currentQty++;       // otherwise, increment quantity
    }
    // render updated value
    textElem.textContent = `${currentQty}`;

    if(iconLetter) {
        // remove or add halo
        if(textElem.textContent == "0") {
            document.getElementById(`${iconLetter}-symbol`).classList.remove('halo'); // needed otherwise JS doesn't think it has a classList
            textElem.style.color = "lightgray";
        }
        else if(currentQty > prevQty) {
            document.getElementById(`${iconLetter}-symbol`).classList.add('halo');
            textElem.style.color = getColor(iconLetter);
        }   
    }
}

function addManaToPool( cardID ) {
    if( cardID > 896) {                                             // BASIC LANDS
        white.textContent = `${Number( white.textContent ) + 1}`;        // increase white mana
        white.style.color = "yellow";
        document.getElementById('w-symbol').classList.add('halo');
    }                      
    else if( cardID > 893) {
        blue.textContent = `${Number( blue.textContent ) + 1}`;          // increase blue mana
        blue.style.color = "rgb(0, 170, 255)";
        document.getElementById('u-symbol').classList.add('halo');
    }                 
    else if( cardID > 890) {
        red.textContent = `${Number( red.textContent ) + 1}`;           // increase red mana
        red.style.color = "red";
        document.getElementById('r-symbol').classList.add('halo');
    }                 
    else if( cardID > 887) {
        green.textContent = `${Number( green.textContent ) + 1}`;        // increase green mana
        green.style.color = "rgb(64, 255, 47)";
        document.getElementById('g-symbol').classList.add('halo');
    }                 
    else if( cardID > 874 && cardID < 878) {
        black.textContent = `${Number( black.textContent )+1}`;         // increase black mana
        black.style.color = "purple";
        document.getElementById('b-symbol').classList.add('halo');
    } 
    else if( cardID < 638) {        // ARTIFACT MANA
        switch(cardID) {
            case 599:
            case 627:
                colorless.textContent++;  colorless.textContent++;  colorless.textContent++;   
                // basalt monolith or mana vault - increase colorless mana
                colorless.style.color = "white";
                document.getElementById('c-symbol').classList.add('halo');
                break;
            case 600:
                // lotus - ask player what color they want
                break;
            case 629:
                green.textContent++;        // mox emerald - increase green mana
                green.style.color = "rgb(64, 255, 47)";
                document.getElementById('g-symbol').classList.add('halo');
                break;
            case 630:
                black.textContent++;         // jet - increase black mana
                black.style.color = "purple";
                document.getElementById('b-symbol').classList.add('halo');
                break;
            case 631:
                white.textContent++;        // pearl - increase white mana
                white.style.color = "yellow";
                document.getElementById('w-symbol').classList.add('halo');
                break;
            case 632:
                red.textContent++;           // ruby - increase red mana
                red.style.color = "red";
                document.getElementById('r-symbol').classList.add('halo');
                break;
            case 633:
                blue.textContent++;          // sapphire - increase blue mana
                blue.style.color = "rgb(0, 170, 255)";
                document.getElementById('u-symbol').classList.add('halo');
                break;
            case 637:
                colorless.textContent += 2;        // basalt monolith or mana vault - increase colorless mana
                //colorless.style.color = "white";
                document.getElementById('c-symbol').classList.add('halo');
        }
    }
}

function resetQuantity(textElem, iconLetter) {
    textElem.textContent = "0";
    textElem.style.color = "lightgray";
    document.getElementById(`${iconLetter}-symbol`).classList.remove('halo'); // needed otherwise JS doesn't think it has a classList
}

function emptyManaPool() {
    resetQuantity(white, 'w');
    resetQuantity(blue, 'u');
    resetQuantity(black, 'b');
    resetQuantity(red, 'r');
    resetQuantity(green, 'g');
    resetQuantity(colorless, 'c');
}

function randomInt( max ) {
    return Math.floor(Math.random() * max);  // returns an integer from 0 to max-1
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

// clientSocket.on("privateMsg", (data) => {     // socket ID & name OR opp ID & name
//     console.log("received message: \"" + data.msg + "\" from " + myOppName);
//     const nameElem = document.createElement('span');
//     const msgElem = document.createElement('span');       // Yessss! 2 Spans solves the issue!

//     nameElem.classList.add('opp-chat-name');

//     nameElem.textContent = `${myOppName}:`;         // @TODO: change once to opponent's name each match
//     msgElem.textContent =  ` ${data.msg}\n`;

//     // post message to chat log
//     chatLog.appendChild(nameElem);
//     chatLog.appendChild(msgElem);
    
//     chatLog.scrollTo(0,100000);
// });

// clientSocket.on("diceRolled", (data) => {       // opponent rolled the dice
//     // record their value
//     oppRollValue = data.rollValue
     
//     if(myRollValue) {                       // did I roll already? if so, 
//         if( myRollValue > oppRollValue) {           //compare and decide who begins the game
//             iPlayFirst = true;
//             alert("You won the die roll. You go first");            // I go first
//         }
//         else if(oppRollValue > myRollValue) {     
//             iPlayFirst = false;  
//             alert("Opponent won the die roll. They go first");      // They go first
//         }
//         else {                                                      // Tie. Roll again
//             myRollValue = null;     // zero out previous roll!
//             alert("Tie - roll again");
//             // clientSocket.emit("rollAgain", { ourDraftID: myDraftID, ourMatchID: myMatchID } );
//             // roll again
//         }
//     }
//     // Else I didn't roll yet. But when I do, I prefer Dos Equis
//     // I mean...But when I do, it will be sent to opponent
// });

// clientSocket.on("rollAgain", () => {
//     myRollValue = null;
//     alert("Tie - roll again");
// });

// clientSocket.on("cardsDrawn", (data) => {
//    oppNumCardsInHand += data.numDrawn;
//    // @TODO: then update visual
// });

// clientSocket.on("phaseUpdate", (data) => {   // data.phaseValue
//     updatePhase(data.phaseValue);
// });

// clientSocket.on("cardMoved", (data) => {       // Take area(s) & card (#) and append new image to opp's battlefield
//     let oppCard = document.createElement('img');
//     oppCard.src = `images/${data.cardNum}.jpeg`;
//     oppCard.classList.add('inverted');

//     if(data.srcArea === "hand") {
//         oppNumCardsInHand--;
//         if(data.destArea === "lands") {
//             oppLands.appendChild(oppCard);          // add opponent's newly played card to our display
//         } else if(data.destArea === "nonlands") {
//             oppNonLands.appendChild(oppCard);
//         } else if(data.destArea === "graveyard") {
//             oppGraveyard.appendChild(oppCard);
//         } 
//     } else if(data.srcArea !== "nonlands" && data.destArea === "graveyard") {
//         // move card from oppNonLands to oppGraveyard
//     }
// });

// clientSocket.on("yourTurn", () => {
//     myTurn = true;
//     document.cookie = "myturn=true";
//     activePlayerName.textContent = myName;
//     if(iPlayFirst) turnNum.textContent++;
//     alert("It's now your turn");
//     nextPhaseBtn.setAttribute('disabled', false);
// });

// clientSocket.on("justUntapped", () => {
//     // untap opponent's permanents in my view
//     let tappedCards = document.querySelectorAll('.opp-tapped'); 
                                                            
//     for( card of tappedCards) {                             
//         card.classList.replace('.opp-tapped', '.inverted');              
//     }
// });

// clientSocket.on("cardDrawn", () => {
//    oppNumCardsInHand++;
//    // @TODO: then update visual
// });

// clientSocket.on("top3Revealed", (data) => {
//     // use data.topThree    and call up viewtop3 modal
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

// clientSocket.on("nextGame", () => {      
//     console.log("moving on to next game");
//     // empty all our zones
//     // reset life totals and stuff
//     // reload deck, shuffle
//     // GL HF begin game
// });

// clientSocket.on("matchDone", () => {          
//     //clientSocket.emit("leavesMatch", { ourDraftID: myDraftID, ourMatchID: myMatchID, msg: chatInput.value } ); 
// });