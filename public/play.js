
let altPressed = false;

let cardsInLibrary = [806, 672, 744, 657, 782, 751, 623, 780, 610, 792, 
                      794, 763, 752, 782, 629, 776, 878, 750, 684, 684,
                      765, 785, 754, 768, 804, 672, 613, 876, 876, 876, 
                      892, 892, 892, 892, 889, 889, 889, 889, 889, 889];

let numCardsInHand = 0;
let numCardsInPlay = 0;
let numCardsInGY = 0;

const drawBtn = document.getElementById('draw-btn');
const tutorBtn = document.getElementById('tutor-btn');
let hand = document.getElementById('hand');
let nonLandsIP = document.getElementById('non-lands-in-play');
let landsIP = document.getElementById('lands-in-play');
let graveyard = document.getElementById('my-graveyard');
let exileZone = document.getElementById('my-exiles');
let gyShown = true;

let colorless = document.getElementById('colorless-qty');
let white = document.getElementById('white-qty');
let blue = document.getElementById('blue-qty');
let black = document.getElementById('black-qty');
let red = document.getElementById('red-qty');
let green = document.getElementById('green-qty');
let colorlessQty = 0, whiteQty = 0, blueQty = 0, blackQty = 0, redQty = 0, greenQty = 0;

let currentSelectedCard;

shuffleDeck();

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
});



// Non-Land Area event listeners
nonLandsIP.addEventListener( 'dragover', (event) => {
    event.preventDefault();
    nonLandsIP.style = "background: #555;";
});

nonLandsIP.addEventListener( 'dragleave', (event) => {
    nonLandsIP.style = "background: #1e1e1e;";
});

nonLandsIP.addEventListener( 'drop', event => {
    currentSelectedCard.draggable = false;
    //currentSelectedCard.style = "width: 90px; height: 125px;";
    // currentSelectedCard.innerText = "\ndropped into NL perm area";
    nonLandsIP.appendChild(currentSelectedCard);
    numCardsInHand--;
    numCardsInPlay++;
    nonLandsIP.style = "border: 1px solid hotpink";
});


// Land Area event listeners
landsIP.addEventListener( 'dragover', (event) => {
    event.preventDefault();
    landsIP.style = "background: #555;";
});

landsIP.addEventListener( 'dragleave', (event) => {
    landsIP.style = "background: #1e1e1e;";
});

landsIP.addEventListener( 'drop', event => {
    currentSelectedCard.draggable = false;
    //currentSelectedCard.style = "width: 72px; height: 100px;";
    
    // currentSelectedCard.innerText = "\ndropped into land area";
    landsIP.appendChild(currentSelectedCard);
    numCardsInHand--;
    numCardsInPlay++;
    landsIP.style = "border: 1px solid hotpink";
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
    graveyard.appendChild(currentSelectedCard);
    numCardsInHand--;
    numCardsInGY++;
    //graveyard.style = "";
});

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


// Mana quantity adjustments
document.getElementById('c-symbol').addEventListener( 'click', (evt) => {
    adjustQuantity(colorless);   // change qty of colorless mana
});

document.getElementById('w-symbol').addEventListener( 'click', (evt) => {
    adjustQuantity(white);      // change qty of white mana
});

document.getElementById('u-symbol').addEventListener( 'click', (evt) => {
    adjustQuantity(blue);       // change qty of blue mana
});

document.getElementById('b-symbol').addEventListener( 'click', (evt) => {
    adjustQuantity(black);      // change qty of black mana
});

document.getElementById('r-symbol').addEventListener( 'click', (evt) => {
    adjustQuantity(red);        // change qty of red mana
});

document.getElementById('g-symbol').addEventListener( 'click', (evt) => {
    adjustQuantity(green);      // change qty of green mana
});


// Buton to Toggle display of Graveyard and Exile zones
document.getElementById('toggle-gy-exile').addEventListener( 'click', (evt) => {
    if( gyShown ) {
        // hide GY
        graveyard.style.display = "none";
        // show Exiled cards
        exileZone.style.display = "flex";
        gyShown = false;
        evt.currentTarget.innerText = "Show Graveyard";
    } else {
        // hide Exiled cards
        exileZone.style.display = "none";
        // show GY
        graveyard.style.display = "flex";
        gyShown = true;
        evt.currentTarget.innerText = "Show Exiles";
    }
});


// Temporary Button to Search Library
tutorBtn.addEventListener( 'click', () => {
    let cardToGet = Number( prompt('Which card would you like to grab? (Enter a card #)') );
    if( cardsInLibrary.includes( cardToGet, 0 ) ) {
        cardsInLibrary.splice( cardsInLibrary.indexOf( cardToGet, 0 ), 1); 
        addCardToHand( cardToGet );
    } else alert("Card not found");
});




function shuffleDeck() {
    let pos1, pos2;
    for( let i = 0; i < 160; i++ ) {
        pos1 = Math.floor(Math.random() * 40);  // 0-39
        pos2 = Math.floor(Math.random() * 40);  // 0-39
        if( pos1 == pos2 ) pos2 = Math.floor(Math.random() * 40);

        let temp = cardsInLibrary[pos1];
        cardsInLibrary[pos1] = cardsInLibrary[pos2];
        cardsInLibrary[pos2] = temp;
    }
}

function addCardToHand( card ) {
    numCardsInHand++;

    //let cardX = document.createElement('div');
    let cardImage = document.createElement('img');

    //cardX.classList.add('card');
    //cardX.style = "width: 126px; height: 175px; border: 0px; border-radius: 6px";
    //cardX.draggable = true;

    cardImage.src = `images/${card}.jpeg`;
    //cardImage.style = "width: 126px; height: 175px; border: 0px; border-radius: 6px";
    cardImage.draggable = true;
    //cardX.appendChild(cardImage);

    // Event listeners for newly added/drawn card
    cardImage.addEventListener( 'dragstart', (e) => {   
        currentSelectedCard = e.currentTarget ;
            // ^ combine? v
        currentSelectedCard.style = "opacity: 0.3; cursor: grabbing";
        // if(currentSelectedCard.innerText == 'L')
        //     landsIP.style = "border: 5px dashed gray";
        // else if(currentSelectedCard.innerText == 'C' || currentSelectedCard == 'A')
        //     nonLandsIP.style = "border: 5px dashed gray"
    });

    cardImage.addEventListener( 'dragend', (e) => {
        e.currentTarget.style = "opacity: 1;"; // change cursor type?
        setTimeout( () => {
            nonLandsIP.style = "border: 0px";
            landsIP.style = "border: 0px";
        },200);
    });

    cardImage.addEventListener( 'dblclick', event => {
        // if parent element is nlip or lip...
        if( cardImage.parentElement == landsIP || cardImage.parentElement == nonLandsIP) {
            if( cardImage.classList.contains('tapped') )
                cardImage.classList.remove('tapped');
            else
                cardImage.classList.add('tapped'); 
        }
    });

    hand.appendChild(cardImage);
}


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