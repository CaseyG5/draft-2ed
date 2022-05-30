let myPicks = document.getElementById("card-pool");
let excluded = document.getElementById("excluded-count");
let excludeBtn = document.getElementById('thin-deck');

let plainsQty = document.getElementById('plains-qty');
let islandQty = document.getElementById('island-qty');
let swampQty = document.getElementById('swamp-qty');
let mountainQty = document.getElementById('mountain-qty');
let forestQty = document.getElementById('forest-qty');

let submitBtn = document.getElementById('submit-deck');

// @TODO: Display timer (time remaining) on build.html page

let cards = allCardsKept;       // ref to variable in app.mjs
let rejects = [];
let clickable = true;
let altPressed = false;


// Begin by showing all 45 cards drafted
for ( let c = 0; c < 45; c++ ) {
    showCardOnGrid( c );
}

// Exclude all cards that have been clicked (discarded)
// and re-render cards on 8x6 grid that were kept
excludeBtn.addEventListener( 'click', e => {
    // eliminate selected cards from pool
    rejects.forEach( cardNum => {
        let index = cards.indexOf(cardNum, 0);   // find its location
        cards.splice( index, 1);                 // then remove it
    });

    excludeBtn.hidden = true; // hide exclude button since it's no longer needed
    excluded.hidden = true;   // hide # of cards cut for the same reason

    clickable = false;        // cards (re)shown will no longer be clickable

    // redraw cards on grid (picks - cuts)
    myPicks.innerHTML = "";
    for( let c = 0; c < cards.length; c++ ) showCardOnGrid(c);
});


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

// Submit all basic land selections and display them
submitBtn.addEventListener( 'submit', e => {
    e.preventDefault();

    // add lands to deck and proceed to first round
    const p = Number( plainsQty.innerText );
    const i = Number( islandQty.innerText );
    const s = Number( swampQty.innerText );
    const m = Number( mountainQty.innerText );
    const f = Number( forestQty.innerText );
    const totalLands = p + i + s + m + f;

    // @TODO: allow for land card choices 1-3
    for( let k = 0; k < p; k++ ) cards.push(898);
    for( let k = 0; k < i; k++ ) cards.push(895);
    for( let k = 0; k < s; k++ ) cards.push(876);
    for( let k = 0; k < m; k++ ) cards.push(892);
    for( let k = 0; k < f; k++ ) cards.push(889);

    // show lands added
    for( let k = (cards.length - totalLands); k < cards.length; k++ ) showCardOnGrid(k);

    // send deck submission event to server with decklist (array)
    clientSocket.emit('deckAssembled', { draftNum: myDraftID, playerNum: myPlayerID, theDeck: cards } );
});

// Displays 1 card on the 8x6 grid
function showCardOnGrid( c ) {
    let cardFrame = document.createElement('div');   // @TODO -- probably don't need this
    let card = document.createElement('img');        // @TODO -- just add .card class to img element
    
    cardFrame.setAttribute('style', "width: 159px; height: 221px; background: black");            
    card.setAttribute('style', "width: 159px; height: 221px; opacity: 1");   
    card.src = `images/${cards[c]}.jpeg`;
    card.id = `${cards[c]}`;
        //console.log(card.id + ", ");
    cardFrame.appendChild(card);
    myPicks.appendChild(cardFrame);

    if(clickable) {
        card.addEventListener( 'click', () => {
            console.log(card.style.opacity);
            if(card.style.opacity == "1") {             // EXCLUDE a card
                card.style.opacity = "0.3";
                console.log(card.id + " excluded");
                rejects.push( Number(card.id) );
            }
            else if(card.style.opacity == "0.3") {      // UNDO   @TODO: TEST this
                card.style.opacity = "1";
                // remove card from rejects...  or we could keep it "touch move"
                rejects.splice( rejects.indexOf(card.id, 0), 1);
            }
            excluded.innerText = `${rejects.length}`;
        });
    }
}
// For previous testing:
// let deck =  [804,730,768,847,832,  782,814,598,817,680,  607,705,713,836,693,
//              743,802,673,763,851,  746,746,850,636,679,  890,849,702,896,877,
//              859,658,782,675,673,  769,795,857,897,875,  670,651,894,891,893]
// OR
// let deckString = [ ...localStorage.getItem("cards-drafted"), ...localStorage.getItem("pack2"), ...localStorage.getItem("pack3") ];
// let deck = deckString.split(',').map( item => Number(item) );   // map/convert string to number