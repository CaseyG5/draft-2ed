// let altPressed = false;      // redundant with build.js, yet code at bottom still works without either
// Game play zones
const hand = document.getElementById('hand');                       // <div>
const landsArea = document.getElementById('lands-in-play');
const nonLandsArea = document.getElementById('non-lands-in-play');
const graveyard = document.getElementById('my-graveyard');
const exileZone = document.getElementById('my-exiles');
const oppLands = document.getElementById('opp-lands');
const oppNonLands = document.getElementById('opp-non-lands');
const oppGraveyard = document.getElementById('opp-graveyard');
const oppExileZone = document.getElementById('opp-exiles');

// Right side-bar elements                                                      @TODO: FIX triple-time!
const matchMin = $('#round-min');  // shows minutes remaining       // <span>
const matchSec = $('#round-sec');  // shows seconds                 // <span>
const matchTimerDiv = $('#round-timer');    // holds them both

const activePlayerName = document.getElementById('whos-turn');      // <span>
const turnNum = document.getElementById('turn-number');             // <span>
const turnPhase = document.getElementById('turn-phase');            // <div>
const progressDiv = document.getElementById('progress-div');        // was <progress>, now <div>
const progBar = document.getElementById('prog-bar');                // <div> inside <div>
const myLifePoints = document.getElementById('my-lifepoints');      // <span>
const oppLifePoints = document.getElementById('opp-lifepoints');    // <span>
const oppHandCount = document.getElementById('opp-cardsinhand');

// Chat related elements
const chatForm = document.getElementById('chat-form');              // <form>
const chatLog = document.getElementById('chat-log');                // <div>
const chatInput = document.getElementById('chat-input');            // <input>

// Action buttons
const shuffleBtn = document.getElementById('shuffle-btn');          // <button>
const rollBtn = document.getElementById('roll-btn');
const draw7Btn = document.getElementById('draw7-btn');
const mullBtn = document.getElementById('mull-btn');
const keepBtn = document.getElementById('keep-btn');
const scryBtn = document.getElementById('scry-btn');
const untapBtn = document.getElementById('untap-btn');
const drawBtn = document.getElementById('draw-btn');
const manaBtn = document.getElementById('mana-btn');
const nextPhaseBtn = document.getElementById('nextphase-btn');
      nextPhaseBtn.setAttribute('disabled', true);
const tutorBtn = document.getElementById('tutor-btn');
const view3Btn = document.getElementById('view3-btn');
const reveal3Btn = document.getElementById('reveal3-btn')
const revealHandBtn = document.getElementById('reveal-btn');
const resignBtn = document.getElementById('resign-btn');

// Modal dialog to Scry 1
const scryModal = document.getElementById('scry-modal');            // <dialog>
const scryImg = document.getElementById('scryed-card');             // <img>
const toBottomBtn = document.getElementById('unshift-btn');         // <button>
// const keepOnTopBtn = document.getElementById('ontop-btn');

// Modal dialog to View top 3 cards with option to reorder or shuffle
const view3Modal = document.getElementById('view3-modal');          // <dialog>
const threeCardDiv = document.getElementById('three-cards');        // <div>
const shuffle2 = document.getElementById('shuffle-btn-2');          // <button>
const reorderBtn = document.getElementById('reorder-btn');          // @TODO: change to drag & drop
// const keepAsIsBtn = document.getElementById('asis-btn');

// For modal to see revealed hand
const oppHand = document.getElementById('opp-hand');                // <div>

// For modal to search library
const tutorModal = document.getElementById('search-modal');         // <dialog>
const myLibrary = document.getElementById('my-library');            // <div>

// Color picker modal for dual lands and Lotus
const colorPicker = document.getElementById('color-picker');        // <dialog>

// Icons for the 6 kinds of mana
const square = document.getElementById('c-symbol');                 // <img>
const sun = document.getElementById('w-symbol');
const droplet = document.getElementById('u-symbol');
const skull = document.getElementById('b-symbol');
const flame = document.getElementById('r-symbol');
const tree = document.getElementById('g-symbol');

// Quantity elements for the 6 kinds of mana
const colorless = document.getElementById('colorless-qty');         // <span>
const white = document.getElementById('white-qty');
const blue = document.getElementById('blue-qty');
const black = document.getElementById('black-qty');
const red = document.getElementById('red-qty');
const green = document.getElementById('green-qty');

// Opponent's icons & quantities
const oppSquare = document.getElementById('opp-c-symbol');                 // <img>
const oppSun = document.getElementById('opp-w-symbol');
const oppDroplet = document.getElementById('opp-u-symbol');
const oppSkull = document.getElementById('opp-b-symbol');
const oppFlame = document.getElementById('opp-r-symbol');
const oppTree = document.getElementById('opp-g-symbol');
const oppColorless = document.getElementById('opp-c-qty');          // <span>
const oppWhite = document.getElementById('opp-w-qty');
const oppBlue = document.getElementById('opp-u-qty');
const oppBlack = document.getElementById('opp-b-qty');
const oppRed = document.getElementById('opp-r-qty');
const oppGreen = document.getElementById('opp-g-qty');


const phaseNames = ["Start turn", "Untap", "Upkeep", "Draw", "1st Main", "Combat", "2nd Main", "End of turn"];
const phaseColors = ["#fcfe94", "#f8a969", "#9acd32", "#52b7e6", "#64e089", "#f96bb8", "#537aef", "#6f6597"];

let cardsInLibrary = myDeck.slice();    // create deck/library from "decklist"
let gameNumber = 1;             document.cookie = "gamenumber=1";
let myRollValue = 0;
let oppRollValue = 0;
let iPlayFirst = false;
let myTurn = false;
let barPosAsPerc = 0.0;

let cardsInHand = [];
let landsInPlay = [];
let nonLandsInPlay = [];
let allMyCardsInView = [];      // array of card ID #s for all my cards in view (my hand, in play, in GY, in exile) ... 603a, or 603b if duplicate, 603c, 603d, 603e
let cardsInGY = [];
let cardsInExile = [];
let myGyShown = true;

let oppNumCardsInHand = 0;
let oppLandsInPlay = [];
let oppNonLandsInPlay = [];
let oppCardsInGY = [];          
let oppCardsInExile = [];
let oppAllCardsInView = [];     // array of card ID #s for all opponent's cards in view ... e.g. 603o, or 603p if duplicate, 603q, 603r, 603s 
let oppGyShown = true;

let currentSelectedCard;        // img element

myTimer.stop();
myTimer.setDisplayFunc( pickTimer(matchTimerDiv, matchMin, matchSec) );   // set timer to display on play page

shuffleDeck();  // auto shuffle first
//for(let c = 0; c < 7; c++ ) addCardToHand( cardsInLibrary.pop() );    // to automatically draw 7

// DRAWS 1 card to hand, adding various event listeners to/for it
function addCardToHand( cardNumber ) {
    cardsInHand.push(cardNumber);

    let cardImage = document.createElement('img');

    cardImage.src = `images/${cardNumber}.jpeg`;        // DO NOT CHANGE PATH, otherwise slice() will need a new range
    // cardImage.classList.add('scale-in-hand');
    const newID = newCardID(cardNumber);              // checks allMyCardsInView and returns a unique ID
    cardImage.id = newID;   

    cardImage.draggable = true;

    // Event listeners for newly added/drawn card
    cardImage.addEventListener( 'dragstart', (e) => {   
        currentSelectedCard = e.currentTarget;                          // should be a ref to cardImage
        currentSelectedCard.style = "opacity: 0.3; cursor: grabbing; border-radius: 10px";
    });

    cardImage.addEventListener( 'dragend', (e) => {
        e.currentTarget.style = "opacity: 1;"; // change cursor type?
        setTimeout( () => {
            nonLandsArea.style = "border: 0px";     // @TODO:  test style.border = "0px"
            landsArea.style = "border: 0px";        //  "       "
        },200);
    });

    cardImage.addEventListener( 'dblclick', event => {  // @TODO:  switch to function handleDoubleClick() { }
        // if parent element is nonLandArea or landArea...
        if( cardImage.parentElement == landsArea || cardImage.parentElement == nonLandsArea) {
            if( cardImage.classList.contains('tapped') )
                cardImage.classList.remove('tapped');
            else {
                // tap card if it's a basic land or artifact // later we'll add non-basics/duals
                // perhaps including how much many card produces when tapped within the card object
                const cardNumber = Number(cardImage.getAttribute('src').slice(7,10));
                addManaToPool( cardNumber );

                cardImage.classList.add('tapped');
                
                if( cardImage.parentElement == landsArea) {
                    clientSocket.emit("cardTapped", { ourDraftID: myDraftID, ourMatchID: myMatchID, area: "lands", cardNum: cardNumber, cardID: newID } );
                }
                else if(cardImage.parentElement == nonLandsArea) {
                    clientSocket.emit("cardTapped", { ourDraftID: myDraftID, ourMatchID: myMatchID, area: "nonlands", cardNum: cardNumber, cardID: newID } );
                }
            }
        }
    });

    // cardImage.addEventListener('drop', event => {   // another card is dropped on this card
        // TEST 1: first step may be to move dropped card (not this card) NEXT to this card
        // by making it the next sibling (easy with jQuery)

        // place currentSelectedCard (dropped card) behind cardImage (this card) and offset (20, -20) ish
        // but still on manafield / battlefield, whatever zone this card is in, cardImage.parentElement
        // flex-start/center may no longer be suitable for zone divs
        // z-index must be lower than this card, and "position: relative" can be used for dropped card
        // they must be "linked" so they tap together
        // how to link them?
        // later perhaps: how to handle doubly enchanted/equipped cards
    // });

    // cardImage.addEventListener('auxclick', (e) => {     // @TODO:  Find out why this does not work
    //     e.preventDefault();      // need to prevent system defalt or contextual menu
    //     
    //     else if(cardImage.parentElement == landsArea) cardImage.classList.toggle('scale-on-manafield');
    //     else if(cardImage.parentElement == nonLandsArea) cardImage.classList.toggle('scale-on-battlefield');
    // });

    hand.appendChild(cardImage);
}

// Land Area event listeners
landsArea.addEventListener( 'dragover', (event) => {
    event.preventDefault();
    landsArea.style = "background: #444;";
});

landsArea.addEventListener( 'dragleave', (event) => {
    landsArea.style = "background: #1e1e1e;";
});

landsArea.addEventListener( 'drop', event => {
    if(currentSelectedCard.parentElement != landsArea && currentSelectedCard.parentElement != nonLandsArea) {     // drop in place (no movement) has no effect

        const cardNumber = Number(currentSelectedCard.getAttribute('src').slice(7,10) );  // let cardNum = currentSelectedCard.src.slice(7,10); did NOT work
        
        let index = cardsInHand.indexOf( cardNumber, 0);
        cardsInHand.splice( index, 1 );    
        landsInPlay.push(cardNumber);

        document.cookie = `cardsinhand=${cardsInHand}`;     
        document.cookie = `landsinplay=${landsInPlay}`;

        const currentID = currentSelectedCard.id;
        landsArea.appendChild(currentSelectedCard);
        // @TODO: split into cardPlayed and cardMoved
        clientSocket.emit("cardMoved", { ourDraftID: myDraftID, ourMatchID: myMatchID, srcArea: "hand", destArea: "lands", cardNum: cardNumber, cardID: currentID });       // enable for live testing
        
        // numCardsInPlay++;
        landsArea.style = "border: 2px solid yellowgreen";
    }
});
                                        // @TODO: ACCOUNT for cards PLAYED and HAND array!
// Non-Land Area event listeners
nonLandsArea.addEventListener( 'dragover', (event) => {
    event.preventDefault();
    nonLandsArea.style = "background: #444;";
});

nonLandsArea.addEventListener( 'dragleave', (event) => {
    nonLandsArea.style = "background: #1e1e1e;";
});

nonLandsArea.addEventListener( 'drop', event => {
    if(currentSelectedCard.parentElement != nonLandsArea && currentSelectedCard.parentElement != landsArea) {     // no effect for drop in place
        
        const cardNumber = Number(currentSelectedCard.getAttribute('src').slice(7,10) );
        console.log("card # of card dropped into non-Lands area is: " + cardNumber);

        let index = cardsInHand.indexOf( cardNumber, 0);
        cardsInHand.splice( index, 1 );
        nonLandsInPlay.push(cardNumber);

        document.cookie = `cardsinhand=${cardsInHand}`;     
        document.cookie = `nonlandsinplay=${nonLandsInPlay}`;

        const currentID = currentSelectedCard.id;   
        nonLandsArea.appendChild(currentSelectedCard);
        clientSocket.emit("cardMoved", { ourDraftID: myDraftID, ourMatchID: myMatchID, srcArea: "hand", destArea: "nonlands", cardNum: cardNumber, cardID: currentID });        // enable for live testing
        
        // numCardsInPlay++;
        nonLandsArea.style = "border: 2px solid yellowgreen";
    }
});


// Graveyard event listeners
graveyard.addEventListener( 'dragover', (event) => {
    event.preventDefault();
    graveyard.setAttribute('style', "background: #444");
});

graveyard.addEventListener( 'dragleave', (event) => {
    graveyard.setAttribute('style', "background: #1e1e1e"); 
});

graveyard.addEventListener( 'drop', event => {
    currentSelectedCard.draggable = false;
    
    const cardNumber = Number(currentSelectedCard.getAttribute('src').slice(7,10) );
    // let index = -1;
    console.log("card # of card dropped into GY area is: " + cardNumber);
    currentSelectedCard.classList.remove('tapped');     // prevent card being in GY tapped

    if(currentSelectedCard.parentElement == hand) {
        console.log("hand array has length " + cardsInHand.length);
        // index = cardsInHand.indexOf( cardNumber, 0);   
        cardsInHand.splice( cardsInHand.indexOf( cardNumber, 0), 1 );
        // console.log("index of card removed from hand: " + index);

        document.cookie = `cardsinhand=${cardsInHand}`;
        const currentID = currentSelectedCard.id;
        clientSocket.emit("cardMoved", { ourDraftID: myDraftID, ourMatchID: myMatchID, srcArea: "hand", destArea: "graveyard", cardNum: cardNumber, cardID: currentID });      // enable for live testing       
             
    } else if(currentSelectedCard.parentElement == nonLandsArea) {
        console.log("nonlands array has length " + nonLandsInPlay.length);
        // index = nonLandsInPlay.indexOf( cardNumber, 0);
        nonLandsInPlay.splice( nonLandsInPlay.indexOf( cardNumber, 0), 1 ); 
        // console.log("index of card removed from nonlands: " + index);
        
        document.cookie = `nonlands=${nonLandsInPlay}`;
       
        const currentID = currentSelectedCard.id;
        clientSocket.emit("cardMoved", { ourDraftID: myDraftID, ourMatchID: myMatchID, srcArea: "nonlands", destArea: "graveyard", cardNum: cardNumber, cardID: currentID });  // enable for live testing
        // numCardsInPlay--;
    }
    else { // lands --> graveyard
        console.log("lands array has length " + landsInPlay.length); 
        // index = landsInPlay.indexOf( cardNumber, 0);
        landsInPlay.splice( landsInPlay.indexOf( cardNumber, 0), 1 );
        // console.log("index of card removed from lands: " + index);

        document.cookie = `lands=${landsInPlay}`;
        const currentID = currentSelectedCard.id;
        clientSocket.emit("cardMoved", { ourDraftID: myDraftID, ourMatchID: myMatchID, srcArea: "lands", destArea: "graveyard", cardNum: cardNumber, cardID: currentID });  // enable for live testing
        // numCardsInPlay--;
    }
    graveyard.appendChild(currentSelectedCard);
    cardsInGY.push(cardNumber);
    // numCardsInGY++;
    document.cookie = `cardsinyard=${cardsInGY}`;   // @TODO: update cardsInGY et al.
});

// Exile zone event listeners
exileZone.addEventListener( 'dragover', (event) => {
    event.preventDefault();
    exileZone.setAttribute('style', "background-color: #444");
});

exileZone.addEventListener( 'dragleave', (event) => {
    exileZone.setAttribute('style', "background-color: #1e1e1e");
});

exileZone.addEventListener( 'drop', event => {
    currentSelectedCard.draggable = false;
    // currentSelectedCard.classList.remove('scale-in-hand', 'scale-on-battlefield');
    const cardNumber = Number(currentSelectedCard.getAttribute('src').slice(7,10) );
    let index = nonLandsInPlay.indexOf( cardNumber, 0);
    nonLandsInPlay.splice( index, 1 );                  // assume for now that target card is/was a non-land perm on the battlefield
    document.cookie = `cardsinexile=${cardsInExile}`;
    exileZone.appendChild(currentSelectedCard);
    cardsInExile.push(cardNumber);

    const currentID = currentSelectedCard.id;
    clientSocket.emit("cardMoved", { ourDraftID: myDraftID, ourMatchID: myMatchID, srcArea: "nonlands", destArea: "exile", cardNum: cardNumber, cardID: currentID });      // enable for live testing
    numCardsInPlay--;           
    // numCardsInExile++;
    
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

function clog(msg) {
    //const nameElem = document.createElement('span');
    const msgElem = document.createElement('span');       
    // nameElem.classList.add('my-chat-name');                
    // nameElem.textContent = `${myName}:`;        // OR...  = "username:"  for local testing        
    msgElem.innerText =  `*** ${msg} ***\n`;            // @TODO: just append string instead of any HTML element?
    //chatLog.appendChild(nameElem);
    chatLog.appendChild(msgElem);
    chatLog.scrollTo(0,100000);
}

// CHAT FORM/LOG
chatForm.addEventListener('submit', (evt) => {     
    evt.preventDefault();
    if(chatInput.value) {
        const nameElem = document.createElement('span');
        const msgElem = document.createElement('span');       // Yessss! 2 Spans solves the issue!

        nameElem.classList.add('my-chat-name');                // styling for username

        nameElem.textContent = `${myName}:`;   // USE: nameElem.textContent = `${myName}:`;   // OR...  = "username:"  for local testing        
        msgElem.innerText =  ` ${chatInput.value}\n`;           // must use .innerText to get \n characters

        clientSocket.emit("privateMsg", { ourDraftID: myDraftID, ourMatchID: myMatchID, msg: chatInput.value } );    // enable for live testing

        chatLog.appendChild(nameElem);
        chatLog.appendChild(msgElem);

        chatLog.scrollTo(0,100000);
        chatInput.value = "";
    }
});

function notifyOpponent( myMessage ) {
    clientSocket.emit("privateMsg", { ourDraftID: myDraftID, ourMatchID: myMatchID, msg: myMessage } );    // enable for live testing
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

// MULLIGAN                             @TODO:  make "mulliganed" event so we can update opp's # cards in hand
function mulligan(numCardsHad) {
    // let imgNum;
    for(let c = 0; c < numCardsHad; c++) {
        // imgNum =  Number( hand.lastChild.getAttribute('src').slice(7,10) ) ;
        hand.removeChild(hand.lastChild);                       
                // @TODO:  what about event listeners??
        cardsInLibrary.push( cardsInHand.pop() );
    }
    console.log("hand div: " + hand);
    allMyCardsInView.length = 0;
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
    clientSocket.emit("justUntapped", { ourDraftID: myDraftID, ourMatchID: myMatchID } );        // enable for live testing
};

// Phase update helper function
function updatePhase(newValue) {            // proceeds to the next phase of the turn
    progBar.style.marginLeft = `${newValue}%`;
    let index = (newValue / 12.5);
    let newPhase = phaseNames[index];
    turnPhase.textContent = newPhase;
    document.cookie = `turnphase=${newPhase}`;

    if(myTurn) {
        if(newPhase == "Untap") handleUntapping();
        else if(newPhase == "Draw") handleDraw();
        emptyManaPool();
    }
    // let red = randomInt(155) + 100; let green = randomInt(155) + 100; let blue = randomInt(155) + 100;
    // turnPhase.style.color = `rgb(${red}, ${green}, ${blue})`;
    // console.log(`rgb(${red}, ${green}, ${blue})`);
    progBar.style.backgroundColor = phaseColors[index];
    turnPhase.style.color = phaseColors[index];
}

        // let myName = "my name"; let myOppName = "opp's name";        // local testing only
// HANDLER function for phase update click/event
function handlePhaseUpdate() {  // handle phases of "my turn"
    if( barPosAsPerc < 87.5 ) {
        barPosAsPerc += 12.5;
        updatePhase(barPosAsPerc);
        // send event entering/leaving phase
        clientSocket.emit("phaseUpdate", { ourDraftID: myDraftID, ourMatchID: myMatchID, phaseValue: barPosAsPerc } );    // enable for live testing
    } 
    else {     // if value > .75 or equals .875 then turn is over - proceed to opponent's turn 
        nextPhaseBtn.setAttribute('disabled', true);        
        barPosAsPerc = 0.0;
        updatePhase(0);
        clientSocket.emit("phaseUpdate", { ourDraftID: myDraftID, ourMatchID: myMatchID, phaseValue: 0 } );      // enable for live testing
        clientSocket.emit("yourTurn", { ourDraftID: myDraftID, ourMatchID: myMatchID } );                        // enable for live testing
                                                                   
        // @TODO: disable buttons like Search Library for opponent's turn
        myTurn = false;
        document.cookie = "myturn=false";  
        activePlayerName.textContent = "THEIR";     // @TODO: toggle?                   // enable for live testing
        //alert("It's now opponent's turn");      // it will now be their turn
        // then if opponent went first increment turn #
        if(!iPlayFirst) {
            turnNum.textContent++;    // works! instead of Number(string)++     
            document.cookie = `turn=${turnNum.textContent}`;                // SAVE GAME STATE
            clog(`It is now TURN ${turnNum.textContent}`);
        } 
    }
}

// HANDLER function to draw for turn
const handleDraw = () => {
    if (cardsInLibrary.length == 0) {
        clog("0 cards left to draw — game lost");
        clientSocket.emit("gameDone", { draftID: myDraftID, playerID: myPlayerID, oppID: myOpponentID, gameResult: "resigns"} );     // enable for live testing
        return;
    }
    if (cardsInHand.length > 7) {
        clog("8 cards in hand is the max for now");
        return;
    }
    addCardToHand( cardsInLibrary.pop() );
    notifyOpponent("draws for the turn");
    clientSocket.emit("cardDrawn", { ourDraftID: myDraftID, ourMatchID: myMatchID } );        // enable for live testing
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
                notifyOpponent("...and gets a card; shuffles deck");
                clientSocket.emit("cardDrawn", { ourDraftID: myDraftID, ourMatchID: myMatchID } );           // enable for live testing
                addCardToHand( cardToGet );                                        // and add it to hand
                setTimeout( () => {  tutorModal.close();  }, 1300);
                // @TODO:  Test...  cImg.removeEventListener(this);
            })
            rowX.appendChild(cImg);
        }
        myLibrary.appendChild(rowX);                    // render row of cards
        if(noneleft) break;                             // (if no more then stop)
    }  
    shuffleDeck();                                      // auto shuffle "when done"
};



// HANDLER function for "View Top 3" button click
const handleViewTop3 = (oppTopCards) => {
    threeCardDiv.innerHTML = "";
    let selectedCard;

    if(oppTopCards.length > 0) {
        for( let c = 0; c < oppTopCards.length; c++) {
            let nextImg = new Image();                                 // quicker than document.createElement('img') ?
            nextImg.src = `images/${oppTopCards[c]}.jpeg`;   //.setAttribute('src', `images/${oppTopCards[c]}.jpeg`); not working?
            nextImg.classList.add('rounded');
            nextImg.setAttribute('draggable', true);
            nextImg.addEventListener( 'dragstart', (evt) => {
                selectedCard = evt.currentTarget;                           
                // allow them to drag to reorder
                
            });
            threeCardDiv.appendChild(nextImg);
        }
    } else {    // my top cards
        for(let i = cardsInLibrary.length-3; i<cardsInLibrary.length; i++) {
            if(i < 0) continue;                                             // if undefined, go to next index
            let nextImg = new Image();                                 // quicker than document.createElement('img') ?
            nextImg.setAttribute('src', `images/${cardsInLibrary[i]}.jpeg`);
            nextImg.classList.add('rounded');
            nextImg.setAttribute('draggable', true);                           // does this work?
            nextImg.addEventListener( 'dragstart', (evt) => {
                selectedCard = evt.currentTarget;                           // @TODO: instead try setData()
                // allow them to drag to reorder
                                                                                    // and getData
            });
            threeCardDiv.appendChild(nextImg);
        }
    }
    view3Modal.showModal();     // SHOW the cards

    // Helper for drag & drop
    const handleDrop = (card) => {
        // threeCardDiv.appendChild(card);                                         
        // console.log("threeCardDiv: " + threeCardDiv.childElementCount);     // this count is increasing
        // notifyOpponent("reorders top cards");
    }
    const handleDragOver = (evt) => {
        evt.preventDefault();
    }

    threeCardDiv.addEventListener('dragover', handleDragOver );
    threeCardDiv.addEventListener('drop', handleDrop(selectedCard) );

    view3Modal.onclose = () => {
        // remove dragstart event listener too
        threeCardDiv.removeEventListener('drop', handleDrop);
        threeCardDiv.removeEventListener('dragover', handleDragOver);   // not able to reference the function
    }

    // SHUFFLE button click
    shuffle2.addEventListener('click', shuffleDeck);

    // REORDER button click
    reorderBtn.addEventListener('click', () => {
        // submit new arrangement from drag & drop
        // if my top 3, recorder my cards
        // if opp's top 3, send new order
    });
};

const fadeOutPlay = () => {
    document.getElementById('black-curtain').style.zIndex = 20;
    document.getElementById('black-curtain').style.opacity = "1";
}

////////////////////// BUTTON CLICK LISTENERS ///////////////////////

// SHUFFLE deck
shuffleBtn.addEventListener('click', () => {
    shuffleDeck();
    notifyOpponent("shuffles deck");
});

// ROLL 2 6-sided dice
rollBtn.addEventListener('click', () => {
    let die1 = randomInt(6) + 1;
    let die2 = randomInt(6) + 1;
    myRollValue = die1 + die2;
    notifyOpponent(`rolled ${die1} + ${die2} = ${die1 + die2}`);  
    clientSocket.emit("diceRolled", { ourDraftID: myDraftID, ourMatchID: myMatchID, rollValue: (die1 + die2) } );        // enable for live testing
    clog(`You rolled a ${die1} + ${die2}  =  ${die1 + die2}`);      // clog() appends to my chat log
});

// DRAW 7 button click
draw7Btn.addEventListener( 'click', () => {
    if ( cardsInLibrary.length >= 7 && cardsInHand.length == 0) {
        for(let c = 0; c < 7; c++ ) addCardToHand( cardsInLibrary.pop() );
        notifyOpponent("draws 7 cards");
        clientSocket.emit("cardsDrawn", { ourDraftID: myDraftID, ourMatchID: myMatchID, numDrawn: 7 } ); // enable for live testing
        hand.setAttribute('disabled', true); // @TODO: disable hand until "keep"
    } 
});

// MULLIGAN button click
mullBtn.addEventListener('click', () => {
    if(cardsInHand.length > 0) {
        mulligan(cardsInHand.length); 
        notifyOpponent(`mulligans to ${cardsInHand.length}` );  
        clientSocket.emit("mulligans", { ourDraftID: myDraftID, ourMatchID: myMatchID } );
    }                           
});

keepBtn.onclick = () => {       // after deciding to keep...
    notifyOpponent("keeps their hand");
    shuffleBtn.hidden = true;
    mullBtn.hidden = true;      // no more mulligans until maybe next game
    keepBtn.hidden = true;      // hide keep button too
    hand.setAttribute('disabled', false); // @TODO: un-disable hand after keep
};

// SCRY button click (shows top card)
scryBtn.addEventListener('click', () => {
    notifyOpponent("looks at their top card");
    scryImg.src = "";
    const topCard = cardsInLibrary[cardsInLibrary.length-1];    // get the top card (last card in array)
    scryImg.src = `images/${topCard}.jpeg`;                     // show image of top card
    scryImg.classList.add('rounded');
    scryModal.showModal();
});
    // TO-BOTTOM button (move top card to bottom)
    toBottomBtn.addEventListener('click', () => {
        notifyOpponent("and bottoms it");
        cardsInLibrary.unshift( cardsInLibrary.pop() );         // Shift LEFT = move item at pos 0 to top;  
    });                                                         // Shift RIGHT (UNshift) = top to pos 0

// UNTAP ALL button click
untapBtn.addEventListener( 'click', handleUntapping);

// DRAW 1 button click
drawBtn.addEventListener( 'click', handleDraw);

// SELECT a color of mana to add
manaBtn.addEventListener('click', () => {
    colorPicker.showModal();
});
document.getElementById('choose-color-btn').addEventListener('click', () => {
    const colorPicked = document.querySelector('input[name="color"]:checked');
    if(colorPicked.value) {
        addOneMana(colorPicked.value);  // add the mana:  w, u, b, r, g
        colorPicked.removeAttribute('checked');     // This does not work.  @TODO:  how to reset checked?
    }
});

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
    clientSocket.emit("top3Revealed", { ourDraftID: myDraftID, ourMatchID: myMatchID, topThree: myTop3 } );       // enable for live testing
};

// "REVEAL HAND to opponent" button click
revealHandBtn.addEventListener('click', () => {
    clientSocket.emit("handRevealed", { ourDraftID: myDraftID, ourMatchID: myMatchID, hand: cardsInHand } );        // enable for live testing
});

// "PROCEED TO NEXT PHASE" button click
nextPhaseBtn.addEventListener('click', handlePhaseUpdate);

// Large Modal showing all cards in library with a click listener on each to select the desired card
tutorBtn.addEventListener( 'click', handleSearchLib );

// RESIGN/CONCEDE GAME button click
resignBtn.addEventListener('click', () => {
    const affirmative = confirm("Are you sure you want to resign?");  // @TODO: replace with custom modal to confirm
    if (affirmative) {
        fadeOut();
        // alert("Resigning this game...");
        window.setTimeout( () => {
            clientSocket.emit("gameDone", { ourDraftID: myDraftID, ourMatchID: myMatchID, playerID: myPlayerID, oppID: myOpponentID, gameResult: "resigns"} );      // enable for live testing
            fadeIn();
        }, 3000);
        // update client's game info, 
    }  
});

// Mana quantity adjustments
document.getElementById('c-symbol').addEventListener( 'click', (evt) => {
    // @TODO: Refactor idea for fewer IF statements overall:
    // if(altPressed == true) decrement quantity... else increment
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
    adjustQuantity(myLifePoints, null);                 // @TODO:  click to dec!   alt+click to inc
    clientSocket.emit("lifePoints", { ourDraftID: myDraftID, ourMatchID: myMatchID, lifeTotal: myLifePoints.textContent } );
});
oppLifePoints.addEventListener('click', () => {
    adjustQuantity(oppLifePoints, null);
});


// Alt key listening also in build script so redundant here in live app

// 1.
// Window listener for ALT key                           
// capture Alt key up & down events  (Alt key is #18)
window.addEventListener( 'keydown', keyEvent => {
    // if(keyEvent.key == "Alt") {
    //     altPressed = true;
    // }  
    if(altPressed && myTurn) {
        if(keyEvent.code == 'KeyA' || keyEvent.code == 'KeyP') handlePhaseUpdate();
    }
                                         
});

// 2.
// Adjust of quantity of MANA element passed in            // @TODO: Refactor this, see above
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
            document.getElementById(`${iconLetter}-symbol`).src = `mana/${iconLetter}.png`;
            textElem.style.color = "lightgray";
        }
        else if(currentQty > prevQty) {
            document.getElementById(`${iconLetter}-symbol`).src = `mana/${iconLetter}-active.png`;
            document.getElementById(`${iconLetter}-symbol`).classList.add('halo');
            textElem.style.color = getColor(iconLetter);
        }   
    }
}

function addOneMana( letter ) {
    switch(letter) {                        // can use ++ instead of = `${Number( white.textContent ) + 1}`
        case 'w':
            white.textContent++;                                        // increase white mana
            white.style.color = "yellow";
            sun.src = 'mana/w-active.png';
            sun.classList.add('halo');
            break;
        case 'u':
            blue.textContent++;                                         // increase blue mana
            blue.style.color = "rgb(0, 170, 255)";
            droplet.src = 'mana/u-active.png';
            droplet.classList.add('halo');
            break;
        case 'b':
            black.textContent++;                                        // increase black mana
            black.style.color = "purple";
            skull.src = 'mana/b-active.png';
            skull.classList.add('halo');
            break;
        case 'r':
            red.textContent++;                                          // increase red mana
            red.style.color = "red";
            flame.src = 'mana/r-active.png';
            flame.classList.add('halo');
            break;
        case 'g':
            green.textContent++;                                        // increase green mana
            green.style.color = "rgb(64, 255, 47)";
            tree.src = 'mana/g-active.png';
            tree.classList.add('halo');
    }
    clientSocket.emit("manaAdded", { ourDraftID: myDraftID, ourMatchID: myMatchID, color: letter } );
}

function addManaToPool( cardNumber ) {
    if( cardNumber > 896)       addOneMana('w');                                        // BASIC LANDS                
    else if( cardNumber > 893)  addOneMana('u');            
    else if( cardNumber > 890)  addOneMana('r');
    else if( cardNumber > 887)  addOneMana('g');                
    else if( cardNumber > 877)  colorPicker.showModal();                                // DUALS
    else if( cardNumber > 874)  addOneMana('b');                // && cardNumber < 878  // BASIC SWAMP
    else if( cardNumber < 638)  tapArtifactForMana(cardNumber);                         // ARTIFACT MANA 
}

function tapArtifactForMana( cardNumber ) {
    switch(cardNumber) {
        case 599:
        case 627:
            colorless.textContent++;  colorless.textContent++;  colorless.textContent++;   
            // Basalt Monolith or Mana Vault - increase colorless mana
            colorless.style.color = "white";
            square.src = 'mana/c-active.png';
            square.classList.add('halo');
            break;
        case 600:
            // lotus - ask player what color they want
            break;
        case 629:
            addOneMana('g');       // mox emerald - inc green mana
            break;
        case 630:
            addOneMana('b');         // jet - inc black mana
            break;
        case 631:
            addOneMana('w');        // pearl - inc white mana
            break;
        case 632:
            addOneMana('r');           // ruby - inc red mana
            break;
        case 633:
            addOneMana('u');          // sapphire - inc blue mana
            break;
        case 637:
            colorless.textContent++;  colorless.textContent++;      // Sol Ring
            colorless.style.color = "white";
            square.src = 'mana/c-active.png';
            square.classList.add('halo');
    }
}

function resetQuantity(numElem1, numElem2, iconLetter) {          // @TODO:  how to convince JS the params are the type claimed?
    numElem1.textContent = "0";
    numElem1.style.color = "lightgray";
    numElem2.textContent = "0";
    numElem2.style.color = "lightgray";
    document.getElementById(`${iconLetter}-symbol`).src = `mana/${iconLetter}.png`;
    document.getElementById(`${iconLetter}-symbol`).classList.remove('halo');   // doc.gebi() needed otherwise JS doesn't think it has a classList
    document.getElementById(`opp-${iconLetter}-symbol`).src = `mana/${iconLetter}.png`;
    document.getElementById(`opp-${iconLetter}-symbol`).classList.remove('halo');   // doc.gebi() needed otherwise JS doesn't think it has a classList

}

function emptyManaPool() {
    resetQuantity(white, oppWhite, 'w');      
    resetQuantity(blue, oppBlue, 'u');       
    resetQuantity(black, oppBlack, 'b');      
    resetQuantity(red, oppRed, 'r');        
    resetQuantity(green, oppGreen, 'g');      
    resetQuantity(colorless, oppColorless, 'c');  
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

//////////////////////// Socket Game Event Listeners //////////////////////////

clientSocket.on("privateMsg", (data) => {     // socket ID & name OR opp ID & name
    const nameElem = document.createElement('span');
    const msgElem = document.createElement('span');       // Yessss! 2 Spans solves the issue!

    nameElem.classList.add('opp-chat-name');

    nameElem.textContent = `${myOppName}:`;         // @TODO: change once to opponent's name each match
    msgElem.innerText =  ` ${data.msg}\n`;

    // post message to chat log
    chatLog.appendChild(nameElem);
    chatLog.appendChild(msgElem);
    
    chatLog.scrollTo(0,100000);
});

clientSocket.on("diceRolled", (data) => {       // opponent rolled the dice
    // record their value
    oppRollValue = data.rollValue
     
    if(myRollValue != 0) {                       // did I roll already? if so, 
        if( myRollValue > oppRollValue) {           //compare and decide who begins the game
            iPlayFirst = true;
            myTurn = true;
            rollBtn.hidden = true;      // no need to roll, unless for certain cards added later
            activePlayerName.textContent = "MY";                //`${myName}`;     
            nextPhaseBtn.setAttribute('disabled', false);
            clog("You won the die roll. You go first");            // I go first
            barPosAsPerc = 37.5;
        }
        else if(oppRollValue > myRollValue) {     
            iPlayFirst = false;  
            myTurn = false;
            rollBtn.hidden = true;      
            activePlayerName.textContent = "THEIR";              //`${myOppName}`;
            clientSocket.emit("youFirst", { ourDraftID: myDraftID, ourMatchID: myMatchID } );
            // nextPhaseBtn.setAttribute('disabled', true);  // begins disabled
            clog("Opponent won the die roll. They go first");      // They go first
        }
        else {                                                      // Tie. Roll again
            myRollValue = 0;                   // "zero" out previous roll
            clog("Tie - roll again");
            clientSocket.emit("rollAgain", { ourDraftID: myDraftID, ourMatchID: myMatchID } );       // enable for live testing
            // roll again
        }
    } else activePlayerName.textContent = "THEIR";
    // Else I didn't roll yet. But when I do, I prefer Dos Equis
    // I mean...But when I do, it will be sent to opponent
});

clientSocket.on("youFirst", () => {
    iPlayFirst = true;                          // @TODO:  DRY this out (same as above)
    myTurn = true;
    rollBtn.hidden = true;      // no need to roll, unless for certain cards added later
    activePlayerName.textContent = "MY";                        //`${myName}`;     
    nextPhaseBtn.setAttribute('disabled', false);
    clog("You won the die roll. You go first");
    barPosAsPerc = 37.5;
});

clientSocket.on("rollAgain", () => {
    myRollValue = 0;
    clog("Tie - roll again");
});

clientSocket.on("cardsDrawn", (data) => {
   oppNumCardsInHand += data.numDrawn;
   oppHandCount.textContent = oppNumCardsInHand;
});

clientSocket.on("mulligans", () => {
    oppNumCardsInHand--;
    oppHandCount.textContent = oppNumCardsInHand;
});

clientSocket.on("cardTapped", (data) => {  // area, cardNum, cardID 
    console.log("card tapped event received:  " + data.cardID + " in zone " + data.area);
    const oppCard = document.getElementById(`${data.cardID}`);
    oppCard.classList.add('opp-tapped');
    // if(data.area == "lands") {    }
    // else  {    }        // if (data.area == "nonlands")
});

clientSocket.on("phaseUpdate", (data) => {   // phaseValue
    updatePhase(data.phaseValue);                                 // @TODO: Use handleUpdatePhase instead
});                                              // OTHERWISE our prog bar will not move when opponent moves to next phase

clientSocket.on("lifePoints", (data) => {  //  lifeTotal 
    oppLifePoints.textContent = data.lifeTotal;
});

function newCardID( cardNumber ) {          // on MY SIDE
    let cardID = "";
    if(iPlayFirst) {            // I'm player A
        if( !allMyCardsInView.includes(`${cardNumber}`) )  cardID = `${cardNumber}`;
        else if( !allMyCardsInView.includes(`${cardNumber}b`) )  cardID = `${cardNumber}b`;
        else if( !allMyCardsInView.includes(`${cardNumber}c`) )  cardID = `${cardNumber}c`;
        else cardID = `${cardNumber}d`;                     // duplicates treated uniquely up to 4
        
    }
    else {                      // I'm player B
        if( !allMyCardsInView.includes(`${cardNumber}o`) )  cardID = `${cardNumber}o`;
        else if( !allMyCardsInView.includes(`${cardNumber}p`) )  cardID = `${cardNumber}p`;
        else if( !allMyCardsInView.includes(`${cardNumber}q`) )  cardID = `${cardNumber}q`;
        else cardID = `${cardNumber}r`;                     
    }
    allMyCardsInView.push(cardID);
    return cardID;
}

clientSocket.on("cardMoved", (data) => {       // Take area(s), card (#) and card ID and append new image to opp's battlefield
    if(data.srcArea == "hand") {
        
        const oppCard = document.createElement('img');
        oppCard.src = `images/${data.cardNum}.jpeg`;
        oppCard.id = data.cardID;

        if(data.destArea == "lands") {
            
            oppLandsInPlay.push(data.cardNum);           // push to array of lands (card #s)
            oppLands.appendChild(oppCard);          // add opponent's newly played card to our display
        } 
        else if(data.destArea == "nonlands") {
            
            oppNonLandsInPlay.push(data.cardNum);  
            oppNonLands.appendChild(oppCard);
        } 
        else if(data.destArea == "graveyard") {
            
            oppCardsInGY.push(data.cardNum);
            oppGraveyard.appendChild(oppCard);
        } 
        // else if(data.destArea == "exile") {
        //     oppCardsInExile.push(data.cardNum);
        //     oppExileZone.appendChild(oppCard);
        // }
        oppAllCardsInView.push(`${oppCard.id}`);
        oppNumCardsInHand--;
        oppHandCount.textContent = oppNumCardsInHand;
    } 
    else if(data.destArea == "graveyard") {
        const oppCard = document.getElementById(`${data.cardID}`);
        
        if(data.srcArea == "nonlands") {            // remove specified card from oppNonLandsInPlay
            oppNonLandsInPlay.splice( oppNonLandsInPlay.indexOf( data.cardNum, 0), 1);      // both model/data rep                                                                                 
        }
        else if(data.srcArea == "lands") {          // remove card from oppLandsInPlay
            oppLandsInPlay.splice( oppLandsInPlay.indexOf( data.cardNum, 0), 1 ); 
        }
        oppCardsInGY.push(data.cardNum);            // and add it to graveyard array
        oppCard.classList.remove('opp-tapped');                                             // and view/object
        oppGraveyard.appendChild(oppCard);          // move card to oppGraveyard
    } 
    // @TODO:  else if(data.destArea == exile) ...
});


clientSocket.on("yourTurn", () => {
    myTurn = true;
    document.cookie = "myturn=true";
    activePlayerName.innerText = "MY";              // `${myName}`;     
    if(iPlayFirst) {
        document.cookie = `turn=${++turnNum.textContent}`;      // inc turn # and save state
        clog(`It is now TURN ${turnNum.textContent}`);
    }
    nextPhaseBtn.setAttribute('disabled', false);
    clog("It's your turn");
});

clientSocket.on("justUntapped", () => {
    // untap opponent's permanents in my view
    let tappedCards = document.querySelectorAll('.opp-tapped'); 
    console.log("tapped cards: " + tappedCards);                                     
    for( card of tappedCards) {                             
        card.classList.remove('.opp-tapped');              
    }
});

clientSocket.on("cardDrawn", () => {
   oppNumCardsInHand++;
   oppHandCount.textContent = oppNumCardsInHand;        // or just textContent++
});

clientSocket.on("top3Revealed", (data) => { // topThree
    handleViewTop3(data.topThree);                         //and call up viewtop3 modal
});

clientSocket.on("handRevealed", (data) => {          // data.hand is their array of cards in hand
    console.log("Opponent's hand has cards " + data.hand);
    oppHand.innerHTML = "";
    for(let c = 0; c < data.hand.length; c++) {
        let cImg = document.createElement('img');
        cImg.setAttribute('src', `images/${data.hand[c]}.jpeg`);
        cImg.classList.add('rounded-sm');                           // @TODO: Move to STYLE SHEET
        oppHand.appendChild(cImg);
    }
    document.getElementById('reveal-modal').showModal();
});

clientSocket.on("nextGame", (data) => {      // whoPlaysFirst  (playerID or oppID)
    console.log("Moving on to next game");
    emptyZones();
    prepareNextGame(data.whoPlaysFirst);
    reloadDeck();
    // GL HF begin game
    // (timer still going)
});

clientSocket.on("matchDone", () => {     
    resetTable();
    // reloadDeck();
    // matchNumber++;
    // gameNumber = 1;
    console.log("leaving table...awaiting pairings for next round...");     
    clientSocket.emit("leavesMatch", { ourDraftID: myDraftID, ourMatchID: myMatchID } );    // enable for live testing
    // go to "waiting room" to see other results
});

// TEST DECK:
// const myDeck = [806, 672, 744, 657, 782, 751, 623, 780, 610, 792, 
//     794, 763, 752, 782, 629, 776, 878, 750, 684, 684,
//     765, 785, 754, 768, 804, 672, 613, 876, 876, 876, 
//     892, 892, 892, 892, 889, 889, 889, 889, 889, 889];