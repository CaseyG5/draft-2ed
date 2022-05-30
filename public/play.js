
// let altPressed = false;          // redundant

let cardsInLibrary = [806, 672, 744, 657, 782, 751, 623, 780, 610, 792, 
                      794, 763, 752, 782, 629, 776, 878, 750, 684, 684,
                      765, 785, 754, 768, 804, 672, 613, 876, 876, 876, 
                      892, 892, 892, 892, 889, 889, 889, 889, 889, 889];

let numCardsInHand = 0;
let numCardsInPlay = 0;
let numCardsInGY = 0;
let numCardsInExile = 0;
let myGyShown = true;
let oppGyShown = true;

const hand = document.getElementById('hand');
const nonLandsIP = document.getElementById('non-lands-in-play');
const landsIP = document.getElementById('lands-in-play');
const graveyard = document.getElementById('my-graveyard');
const exileZone = document.getElementById('my-exiles');
const oppGraveyard = document.getElementById('opp-graveyard');
const oppExileZone = document.getElementById('opp-exiles');

const minInRound = document.getElementById('round-min');  // shows minutes remaining
const secInRound = document.getElementById('round-sec');  // shows seconds

const chatForm = document.getElementById('chat-box');
const chatLog = document.getElementById('chat-log');
const chatInput = document.getElementById('chat-input');

const untapBtn = document.getElementById('untap-btn');
const drawBtn = document.getElementById('draw-btn');
const tutorBtn = document.getElementById('tutor-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const mullBtn = document.getElementById('mull-btn');
const scryBtn = document.getElementById('scry-btn');
const view3Btn = document.getElementById('view3-btn');

// Modal dialog to Scry 1
const scryModal = document.getElementById('scry-modal');
const scryImg = document.getElementById('scryed-card');
const toBottomBtn = document.getElementById('unshift-btn');
const keepOnTopBtn = document.getElementById('ontop-btn');

// Modal dialog to View top 3 cards with option to reorder or shuffle
const view3Modal = document.getElementById('view3-modal');
const threeCards = document.getElementById('three-cards');
const shuffle2 = document.getElementById('shuffle-btn-2');
const reorderBtn = document.getElementById('reorder-btn');
const keepAsIsBtn = document.getElementById('asis-btn');

// Quantity <spans> for the 6 kinds of mana
const colorless = document.getElementById('colorless-qty');
const white = document.getElementById('white-qty');
const blue = document.getElementById('blue-qty');
const black = document.getElementById('black-qty');
const red = document.getElementById('red-qty');
const green = document.getElementById('green-qty');
// let colorlessQty = 0, whiteQty = 0, blueQty = 0, blackQty = 0, redQty = 0, greenQty = 0;

let currentSelectedCard;


shuffleDeck();  // auto shuffle first

// @TODO:  Fix this.  Behaves strangely for some reason.  Requires multiple clicks.  Why?
untapBtn.addEventListener( 'click', () => {
    let tappedCards = document.getElementsByClassName('tapped');
    for( card of tappedCards) {
        card.classList.remove('tapped');
    }
});

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

mullBtn.addEventListener('click', () => {
    mulligan(numCardsInHand);
});

scryBtn.addEventListener('click', () => {
    const topCard = cardsInLibrary[cardsInLibrary.length-1];    // get the top card (last card in array)
    scryModal.showModal();
    scryImg.src = `images/${topCard}.jpeg`;             // show image of top card
});

toBottomBtn.addEventListener('click', () => {
    cardsInLibrary.unshift( cardsInLibrary.pop() );
});

view3Btn.addEventListener('click', () => {
    const numCards = cardsInLibrary.length;
    for(let i=0; i<3; i++) {
        let img1 = document.createElement('img');
        img1.setAttribute('src', `images/${cardsInLibrary[numCards-(3-i)]}.jpeg`);
        img1.setAttribute('draggable', true);
        threeCards.appendChild(img1);
    }
    view3Modal.showModal();
});
shuffle2.addEventListener('click', () => {
    clearModalImages();
    shuffleDeck();
});
reorderBtn.addEventListener('click', () => {
    clearModalImages();
    // grab value from input 
    const orderAsArray = document.getElementById('#spec-order').value.split(',');
    //and swap cards

});
keepAsIsBtn.addEventListener('click', () => {
    clearModalImages();
})

shuffleBtn.addEventListener('click', () => {
    shuffleDeck();
});

function clearModalImages() {
    while(threeCards.lastChild) threeCards.removeChild(threeCards.lastChild);
}


// To DRAW a card
function addCardToHand( card ) {
    numCardsInHand++;

    //let cardX = document.createElement('div');
    let cardImage = document.createElement('img');

    //cardX.classList.add('card');
    //cardX.style = "width: 126px; height: 175px; border: 0px; border-radius: 6px";
    //cardX.draggable = true;

    cardImage.src = `images/${card}.jpeg`;
    cardImage.classList.add('scale-in-hand');
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
            else {
                cardImage.classList.add('tapped');
                const cardID = Number(cardImage.getAttribute('src').slice(7,10));
                if( cardID > 896) {
                    white.innerText = `${Number( white.innerText ) + 1}`;        // increase white mana
                    document.getElementById('w-symbol').classList.add('halo');
                }                      
                else if( cardID > 893) {
                    blue.innerText = `${Number( blue.innerText ) + 1}`;          // increase blue mana
                    document.getElementById('u-symbol').classList.add('halo');
                }                 
                else if( cardID > 890) {
                    red.innerText = `${Number( red.innerText ) + 1}`;           // increase red mana
                    document.getElementById('r-symbol').classList.add('halo');
                }                 
                else if( cardID > 887) {
                    green.innerText = `${Number( green.innerText ) + 1}`;        // increase green mana
                    document.getElementById('g-symbol').classList.add('halo');
                }                 
                else if( cardID > 874 && cardID < 878) {
                    black.innerText = `${Number( black.innerText )+1}`;         // increase black mana
                    document.getElementById('b-symbol').classList.add('halo');
                } 
            }
                 

        }
    });

    // cardImage.addEventListener( 'mouseover', () => {
    //     // transform: scale to 130%
    // });

    hand.appendChild(cardImage);
}

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
    currentSelectedCard.classList.replace('scale-in-hand', 'scale-on-battlefield');
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
    currentSelectedCard.classList.replace('scale-in-hand', 'scale-on-manafield');
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


// Temporary Button to Search Library
tutorBtn.addEventListener( 'click', () => {
    let cardToGet = Number( prompt('Which card would you like to grab? (Enter a card #)') );
    if( cardsInLibrary.includes( cardToGet, 0 ) ) {
        cardsInLibrary.splice( cardsInLibrary.indexOf( cardToGet, 0 ), 1); 
        addCardToHand( cardToGet );
    } else alert("Card not found");
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
});

// Button to Toggle display of OPPONENT'S Graveyard and Exile zones
document.getElementById('toggle-opp-gy-exile').addEventListener( 'click', (evt) => {
    if( oppGyShown ) {
        // hide GY
        oppGraveyard.style.display = "none";
        // show Exiled cards
        oppExileZone.style.display = "flex";
        oppGyShown = false;
        evt.currentTarget.innerText = "Show Graveyard";
    } else {
        // hide Exiled cards
        oppExileZone.style.display = "none";
        // show GY
        oppGraveyard.style.display = "flex";
        oppGyShown = true;
        evt.currentTarget.innerText = "Show Exiles";
    }
});

// CHAT FORM/LOG
chatForm.addEventListener('submit', (evt) => {
    evt.preventDefault();
    if(chatInput.value) {
        chatLog.innerText +=  `\nusername: ${chatInput.value}`;
        
        chatInput.value = "";
    }
})

// SHUFFLE
function shuffleDeck() {
    let pos1, pos2;
    for( let i = 0; i < 4*cardsInLibrary.length; i++ ) {
        pos1 = Math.floor(Math.random() * cardsInLibrary.length);  // 0-39
        pos2 = Math.floor(Math.random() * cardsInLibrary.length);  // 0-39
        if( pos1 == pos2 ) pos2 = Math.floor(Math.random() * cardsInLibrary.length);

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
        console.log(imgNum);
        hand.removeChild(hand.lastChild);
        numCardsInHand--;
        cardsInLibrary.push(imgNum);
    }
    shuffleDeck();
    for(let i = 0; i < numCardsHad - 1; i++) addCardToHand( cardsInLibrary.pop() );
}

// Mana quantity adjustments
document.getElementById('c-symbol').addEventListener( 'click', (evt) => {
    adjustQuantity(colorless);   // change qty of colorless mana
});

document.getElementById('w-symbol').addEventListener( 'click', (evt) => {
    let prevQty = white.innerText;
    adjustQuantity(white);      // change qty of white mana
    if(white.innerText == "0") document.getElementById('w-symbol').classList.remove('halo');
    else if(white.innerText > prevQty) document.getElementById('w-symbol').classList.add('halo');
});

document.getElementById('u-symbol').addEventListener( 'click', (evt) => {
    let prevQty = blue.innerText;
    adjustQuantity(blue);       // change qty of blue mana
    if(blue.innerText == "0") document.getElementById('u-symbol').classList.remove('halo');
    else if(blue.innerText > prevQty) document.getElementById('u-symbol').classList.add('halo');
});

document.getElementById('b-symbol').addEventListener( 'click', (evt) => {
    let prevQty = black.innerText;
    adjustQuantity(black);      // change qty of black mana
    if(black.innerText == "0") document.getElementById('b-symbol').classList.remove('halo');
    else if(black.innerText > prevQty) document.getElementById('b-symbol').classList.add('halo');
});

document.getElementById('r-symbol').addEventListener( 'click', (evt) => {
    let prevQty = red.innerText;
    adjustQuantity(red);        // change qty of red mana
    if(red.innerText == "0") document.getElementById('r-symbol').classList.remove('halo');
    else if(red.innerText > prevQty) document.getElementById('r-symbol').classList.add('halo');
});

document.getElementById('g-symbol').addEventListener( 'click', (evt) => {
    let prevQty = green.innerText;
    adjustQuantity(green);      // change qty of green mana
    if(green.innerText == "0") document.getElementById('g-symbol').classList.remove('halo');
    else if(green.innerText > prevQty) document.getElementById('g-symbol').classList.add('halo');
});

//      ONLY used for testing SOLO

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