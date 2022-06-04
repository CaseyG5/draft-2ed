const buildMin = $('#build-min');  // shows minutes remaining
const buildSec = $('#build-sec');  // shows seconds
const buildTimerDiv = $('#build-timer');    // holds them both

let myPicks = document.getElementById("card-pool");
let excludedCount = document.getElementById("excluded-count");
let excludeBtn = document.getElementById('thin-deck');

let plainsQty = document.getElementById('plains-qty');
let islandQty = document.getElementById('island-qty');
let swampQty = document.getElementById('swamp-qty');
let mountainQty = document.getElementById('mountain-qty');
let forestQty = document.getElementById('forest-qty');

let submitBtn = document.getElementById('add-submit');   

let cards = allCardsKept;       // ref to variable in app.mjs
let rejects = [];
let numCuts = 0;    
let clickable = true;
let ready = false;
let altPressed = false;

submitBtn.hidden = true;

// @TODO: Display timer (time remaining) on build.html page
//        necessary to stop, switch, then start?
myTimer.setDisplayFunc( pickTimer(buildTimerDiv, buildMin, buildSec) );   // set timer to display on build page

console.log("Cards should be the same as allCards. Is it? -->" + cards);
// Begin by showing all 45 cards drafted

for ( let c = 0; c < 45; c++ ) {                // show all 45 cards drafted
    showCardOnGrid( c );
}

// Exclude all cards that have been clicked (discarded)
// and re-render cards on 8x6 grid that were kept
excludeBtn.addEventListener( 'click', e => {
    // eliminate selected cards from pool
    console.log("removing: " + rejects);

    let cardsToRemove = rejects.length;
    for(let x = 0; x < cardsToRemove; x++) {
        cards.splice(  cards.indexOf( rejects.pop(), 0 ), 1  );
    }

    console.log("cards are now: " + cards);

    document.cookie = `deck=${cards}`;                                              // SAVE GAME STATE  
    document.cookie = `landsadded=false`;

    // redraw cards on grid (picks - cuts)
    excludedCount.innerText = `${rejects.length}`;
    myPicks.innerHTML = "";                             //  wipe slate clean
 
    numCuts++;
    if(numCuts == 1) {
        submitBtn.hidden = false;       // Show button to "Add lands"       @TODO: better to show regardless up to 2X?
    }                                                                           // if yes, move to last line after loop to show cards;
    else if(numCuts == 2) {
        clickable = false;              // cards re-shown will no longer be clickable
        excludeBtn.hidden = true;       // hide exclude button since it's no longer needed
        excludedCount.hidden = true;    // hide # of cards cut for the same reason     
        document.cookie = `cutsdone=true`;                                          // SAVE GAME STATE
    }
                                                                   // although...
    for( let c = 0; c < cards.length; c++ ) showCardOnGrid(c);      // @TODO: better to avoid redrawing ALL cards??
    
});

// Submit all basic land selections and display them
submitBtn.addEventListener( 'click', (e) => {
    // e.preventDefault();

    if(ready) {
        //submitBtn.setAttribute('disabled', true);       // does this work?  if not hide it

        // display "LOADING MATCH..." for a few seconds
        console.log("sending deck submission to server...")

        // send deck submission event to server with decklist (array)
        clientSocket.emit('deckAssembled', { draftNum: myDraftID, playerNum: myPlayerID, theDeck: cards } );
    }
    else {
        document.cookie = `cutsdone=true`;                                          // SAVE GAME STATE      

        clickable = false;

        // add lands to deck and proceed to first round
        const p = Number( plainsQty.innerText );
        const i = Number( islandQty.innerText );
        const s = Number( swampQty.innerText );
        const m = Number( mountainQty.innerText );
        const f = Number( forestQty.innerText );
        const totalLands = p + i + s + m + f;

        plainsQty.innerText = "0";  islandQty.innerText = "0";  swampQty.innerText = "0";
        mountainQty.innerText = "0";  forestQty.innerText = "0";    // reset quantities after values retrieved

// @TODO: allow for land art choices 1-3
        for( let k = 0; k < p; k++ ) cards.push(899);       // plains
        for( let k = 0; k < i; k++ ) cards.push(895);       // islands
        for( let k = 0; k < s; k++ ) cards.push(876);       // swamps
        for( let k = 0; k < m; k++ ) cards.push(892);       // mountains
        for( let k = 0; k < f; k++ ) cards.push(888);       // forests

        console.log("Adding " + totalLands + " lands");
        // show lands added
        for( let k = (cards.length - totalLands); k < cards.length; k++ ) showCardOnGrid(k);

        document.cookie = `deck=${cards}`;                                          // SAVE GAME STATE 
        document.cookie = `landsadded=true`;

        submitBtn.innerText = "Submit deck";
        ready = true;
    }
});

// Displays 1 card on the 8x6 grid
function showCardOnGrid( c ) {
    let cardFrame = document.createElement('div');   // @TODO -- probably don't need this
    let card = document.createElement('img');        // @TODO -- just add .card class to img element
    
    cardFrame.setAttribute('style', "width: 159px; height: 221px; background: black");     
    card.classList.add('seen');       
    card.style.opacity = '1';   
    card.src = `images/${cards[c]}.jpeg`;

    // should pass the duplicate test, JIC
    if( ! document.getElementById(`${cards[c]}`) ) {                    // if that id is not taken, e.g. 598
        console.log( "Ensuring card ID is NOT already in use." );       
        card.id = `${cards[c]}`;                                        // then take it.
    }                                                                                       // otherwise...
    else if( ! document.getElementById(`${cards[c]}a`) ) card.id = `${cards[c]}a`;          // use 598a
    else if( ! document.getElementById(`${cards[c]}b`) ) card.id = `${cards[c]}b`;          //  or 598b
    else card.id = `${cards[c]}c`;                                                          //  or 598c
                                                        // highly unlikely someone would draft 5 of anything!
    cardFrame.appendChild(card);
    myPicks.appendChild(cardFrame);

    if(clickable) {
        card.addEventListener( 'click', () => {
            let cNum = `${card.id}`.slice(0,3);
            
            if(card.style.opacity == "1") {             // EXCLUDE a card
                card.style.opacity = "0.3";
                console.log(cNum + " excluded");
                rejects.push( Number(cNum) );
            }
            else if(card.style.opacity == "0.3") {      // UNDO   @TODO: TEST this
                card.style.opacity = "1";
                // remove card from rejects...  or we could keep it "touch move"
                rejects.splice( rejects.indexOf(cNum, 0), 1);   
                console.log("changed mind. card " + cNum + " saved");
                // CHECK:  if multiples, does indexOf return 1st?
            }
            excludedCount.innerText = `${rejects.length}`;
        });
    }
}

// capture Alt key up & down events  (Alt key is #18)
window.addEventListener( 'keydown', keyEvent => {
    if(keyEvent.key == "Alt") {
        altPressed = true;
    }
});
window.addEventListener( 'keyup', ke => {
    if(ke.key == "Alt") {
        altPressed = false;
    }
})

// Adjust and Show the quantity of a land type, depending on whether Alt key is pressed
function adjustQuantity(element) {
    // get current quantity
    let currentQty = Number( element.innerText );
       
    // if Alt key is down...
    if(altPressed) {
        if(currentQty > 0) currentQty--;    // if quantity > 0, decrement quantity
    }
    else {
        currentQty++;       // otherwise, increment quantity
    }
    // render updated value
    element.innerText = `${currentQty}`;
}

// capture 'click' event on Quantity of each land type
plainsQty.addEventListener( 'click', e => {
    adjustQuantity(plainsQty);
});
islandQty.addEventListener( 'click', e => {
    adjustQuantity(islandQty);
});
swampQty.addEventListener( 'click', e => {
    adjustQuantity(swampQty);
});
mountainQty.addEventListener( 'click', e => {
    adjustQuantity(mountainQty);
});
forestQty.addEventListener( 'click', e => {
    adjustQuantity(forestQty);
});