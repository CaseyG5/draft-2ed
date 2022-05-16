let altPressed = false;

/*
    my picks:    [744,780,683,751,750,  853,770,771,683,716,  787,717,719,715,674] */
let deck =  [804,730,768,847,832,  782,814,598,817,680,  607,705,713,836,693,
             743,802,673,763,851,  746,746,850,636,679,  890,849,702,896,877,
             859,658,782,675,673,  769,795,857,897,875,  670,651,894,891,893]


// let deck = [806, 672, 744, 657, 782,  751, 623, 780, 610, 755,  869, 804, 677, 606, 856,
//             792, 794, 651, 763, 678,  752, 782, 629, 774, 776,  878, 660, 829, 714, 722,
//             750, 684, 684, 765, 785,  754, 651, 768, 804, 660,  672, 778, 827, 797, 613];

let rejects = [];
// let deckString = [ ...localStorage.getItem("cards-drafted"), ...localStorage.getItem("pack2"), ...localStorage.getItem("pack3") ];
// let deck = deckString.split(',').map( item => Number(item) );


let myPicks = document.getElementById("card-pool");
let excluded = document.getElementById("excluded-count");

for ( let c = 0; c < 45; c++ ) {
    let cardFrame = document.createElement('div');
    let card = document.createElement('img');
    
    cardFrame.style = "width: 159px; height: 221px; background: black";            
    card.style = "width: 159px; height: 221px; opacity: 1";         // NOTE: width / height attributes for images do not work here!
    card.src = `images/${deck[c]}.jpeg`;
    card.id = `${deck[c]}`

    cardFrame.appendChild(card);
    myPicks.appendChild(cardFrame);

    card.addEventListener( 'click', () => {
        console.log(card.style.opacity);
        if(card.style.opacity == "1") {
            card.style.opacity = "0.3";
            console.log(card.id + " excluded");
            rejects.push( Number(card.id) );
        }
        else if(card.style.opacity == "0.3") {
            card.style.opacity = "1";
            // remove card from rejects?  or keep "touch move"
            rejects.splice( rejects.indexOf(card.id, 0), 1);
        }
        excluded.innerText = `${rejects.length}`;
       
    })
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

let plainsQty = document.getElementById('plains-qty');
let islandQty = document.getElementById('island-qty');
let swampQty = document.getElementById('swamp-qty');
let mountainQty = document.getElementById('mountain-qty');
let forestQty = document.getElementById('forest-qty');

let excludeBtn = document.getElementById('thin-deck');
let submitBtn = document.getElementById('submit-deck');

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

// capture 'click' event on a Plains, for example
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


excludeBtn.addEventListener( 'click', e => {
    // eliminate selected cards from pool
    rejects.forEach( cardNum => {
        let index = deck.indexOf(cardNum, 0);   // find its location
        deck.splice( index, 1);                 // then remove it
    });

    excludeBtn.hidden = true; // hide exclude button since it's no longer needed
    excluded.hidden = true;   // hide # of cards cut for the same reason;

    // redraw cards on grid (picks - cuts)
    myPicks.innerHTML = "";
    for( let c = 0; c < deck.length; c++ ) showCardOnGrid(c);
});

// Submit all selections and display deck
submitBtn.addEventListener( 'submit', e => {
    e.preventDefault();

    // add lands to deck and proceed to first round
    let p = Number( plainsQty.innerText );
    let i = Number( islandQty.innerText );
    let s = Number( swampQty.innerText );
    let m = Number( mountainQty.innerText );
    let f = Number( forestQty.innerText );
    let total = p + i + s + m + f;

    for( let k = 0; k < p; k++ ) deck.push(898);
    for( let k = 0; k < i; k++ ) deck.push(895);
    for( let k = 0; k < s; k++ ) deck.push(876);
    for( let k = 0; k < m; k++ ) deck.push(892);
    for( let k = 0; k < f; k++ ) deck.push(889);

    // show lands added
    for( let k = (deck.length - total); k < deck.length; k++ ) showCardOnGrid(k);
    // send deck submission event to server with decklist (array)
});



function showCardOnGrid( c ) {
    let cardFrame = document.createElement('div');   // @TODO -- probably don't need this
    let card = document.createElement('img');        // @TODO -- just add .card class to img element
    
    cardFrame.style = "width: 159px; height: 221px; background: black";            
    card.style = "width: 159px; height: 221px; opacity: 1";         // NOTE: width / height attributes for images do not work here!
    card.src = `images/${deck[c]}.jpeg`;
    card.id = `${deck[c]}`;

        console.log(card.id + ", ");

    cardFrame.appendChild(card);
    myPicks.appendChild(cardFrame);
}