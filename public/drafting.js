//const { pageRequest } = require('./ajax');

let btnNext = document.getElementById("next-btn");
let imageOfCard = document.getElementById("top-card");
let cardsSeen = document.getElementById("cards-seen");
let passBtn = document.getElementById('pass-btn');

let prevRotated = false;

function draftOnePack( packNumber, draftID, playerID, addCardsFromPack) {
    console.log("ENTERING draftOnePack()")
    // myPack     (use myPack variable from app.mjs)
    let indexOfTopCard = 14;
    let imgNum;
    let zIndex = 15;
    let cardObjects = []
    let cardIsChosen = false;
    let numOfCurrentPick = 1;
    let tempCard1;
    let cardsPickedThisPack = [];

    console.log("We're on pack # " + packNumber);
    console.log("Init vars - cardsPickedThisPack should be blank: " + cardsPickedThisPack);

    // Show 1st (TOP) card of new pack right away after "opening"
    imgNum = myPack[indexOfTopCard--];              // number of myPack[14] ... index = 13
    imageOfCard.src = `images/${imgNum}.jpeg`;

    // NEXT BUTTON
    btnNext.addEventListener( 'click', function nextBtnHandler() {      // with each 'click'
        displayCardBelow( imgNum, zIndex-- );    // move top card down below to reveal the next one
        
        imgNum = myPack[indexOfTopCard--];          // number of the new top card, myPack[13] and index = 12, then myPack[12] and index = 11, etc.
        imageOfCard.src = `images/${imgNum}.jpeg`;

        if( indexOfTopCard == -1) {                    // no more unseen cards in pack
            
            displayCardBelow(imgNum, zIndex--);         // display last card down below as well
            imageOfCard.src = "";

            // hide next button
            // @TODO: Change pointer style:  cardsSeen.style.pointer = "pointer";  ?
            btnNext.hidden = true;
            
            // PASS BUTTON
            passBtn.addEventListener( 'click', function passBtnHandler() {  
                passBtn.hidden = true;  
                while(cardObjects[0]) cardObjects.pop();    // remove all references to card objects
                                                            // so we can start fresh
                if(myPack.length == 0) {
                    passBtn.innerText = "Pass";
                    while(cardsSeen.lastChild) cardsSeen.lastChild.remove(); // cardsSeen.innerHTML = "";       // clear slate ... is this the wrong way to do this?
                    cardIsChosen = false;
                    
                    if (packNumber < 3) {           // if on 1st/2nd pack, request another
                        // Show "Open pack" screen again
                        $('#draft').attr('hidden', true);  // hide draft frame
                        $('#open').attr('hidden', false);    // show open frame
                        clientSocket.emit('nextPackRequested', {draftNum: myDraftID, playerNum: myPlayerID} );
                        btnNext.hidden = false;  // show "Next card" button again
                        
                        // @LOOK INTO: reset on('rotatedCards') ???
                    }
                    else if(packNumber == 3) {
                        //pageRequest('build.html');
                        $.getScript('build.js');
                        $('#draft').attr('hidden', true);
                        $('#build').attr('hidden', false);
                    }
                    passBtn.removeEventListener('click', passBtnHandler);
                    btnNext.removeEventListener('click', nextBtnHandler);
                }
                else {  // rotate a card (which could be last card)
                    // offer up to the server remaining cards to be passed, along with draft ID and player ID
                    clientSocket.emit('cardPicked', {draftNum: draftID, playerNum: playerID, theCards: myPack} );

                    if(!prevRotated) {   // only add event listener for rotated cards if we haven't already
                        clientSocket.on('rotatedCards', (data) => {
                            console.log("rotated cards received");
                            myPack = data.cards;                 // would it help to just use myPack in app.mjs??
                            console.log("myPack is now: " + myPack);
                            
                            while(cardsSeen.lastChild) cardsSeen.lastChild.remove(); //cardsSeen.innerHTML = "";
                            
                            cardIsChosen = false;
                            
                            console.log("displaying cards received");
                            // display cards of pack received
                            for( let i = myPack.length-1; i >= 0; i-- ) {
                                displayCardBelow( myPack[i], i );
                            }
                            prevRotated = true;
                            // // Alternative idea:
                            // if(myPack.length == 1) {
                            //     // automatically take last card (no choice)
                            //     cardsPickedThisPack.push( myPack[0] );
                            //     myPack.splice(0,1);   
                            // }
                        });
                    }
                }   
                
            });
        }
    });

    function displayCardBelow( iNum, currentZ ) {
        let backing = document.createElement('div');
        let card = document.createElement('img');
        
        if( !document.getElementById(`${iNum}`) )  {
            console.log( "Ensuring card ID is NOT already in use." );
            card.id = `${iNum}`;
        }
        else if( !document.getElementById(`${iNum}a`) ) card.id = `${iNum}a`;
        else card.id = `${iNum}b`;

        backing.classList.add('backing');
        // backing.style.zIndex = currentZ;            // not neeeded

        card.classList.add('seen');
        card.src = `images/${iNum}.jpeg`;
        card.style.opacity = "1";               // card.setAttribute('opacity', 1); does NOT work

        backing.appendChild(card);
        cardsSeen.appendChild(backing);

        card.addEventListener( 'click', function cardSelectHandler() {   // allow selection of 1 card and
            if(cardIsChosen == false) {
                cardIsChosen = true;
                
                backing.style.zIndex = 16;      // bring card to front
                card.style.opacity = "0.4";     // and darken it so we know it was selected
                const chosenCardNum = Number( `${card.id}`.slice(0,3) );  // @TODO: try let!

                console.log("keeping card # " + chosenCardNum + ", pick " + numOfCurrentPick);
                if(numOfCurrentPick == 1) tempCard1 = chosenCardNum;

                cardsPickedThisPack.push( chosenCardNum );

                console.log("cardsPicked now has: " + cardsPickedThisPack);
                myPack.splice( myPack.indexOf( chosenCardNum, 0 ), 1 );

                // UNCORRUPT DATA (programmatic duct tape)
                if(numOfCurrentPick == 16 || numOfCurrentPick == 30) { //wipe that shit clean!
                    console.log("Attempting to clean up this mess!")
                    let card2 = cardsPickedThisPack.pop();
                    while(cardsPickedThisPack[0]) cardsPickedThisPack.pop();
                    cardsPickedThisPack.push(tempCard1);
                    cardsPickedThisPack.push(card2);
                    console.log("cards 1 & 2: " + tempCard1 + " " + card2);
                }

                numOfCurrentPick++;

                console.log("myPack now has " + myPack.length + " cards left");
                passBtn.hidden = false;         // show Pass button 

                if(myPack.length == 0) {                                // no cards left to choose from
                    passBtn.innerText = "Next pack"                       // Change button text to "Take it"
                    console.log(cardsPickedThisPack)
                    addCardsFromPack(cardsPickedThisPack);
                    console.log("just saved " + cardsPickedThisPack.length + " cards total from pack # " + packNumber);
                }
                // remove all of these "click-on-card" listeners
                for( cardObj of cardObjects ) {
                    cardObj.removeEventListener('click', cardSelectHandler);
                }
            }
        });
        cardObjects.push(card);
    }
    console.log("EXITING draftOnePack()");
    return;
}

// let cardsJSON = JSON.parse( fs.readFileSync('2ED.json', {encoding:'utf-8', flag:'r'}) );
// let cardsInSet = cardsJSON["cards"];

// console.log( cardsInSet[1]["multiverseid"]);
// console.log( cardsInSet[1]["rarity"] );

// for( let card of cardsInSet ) {
//     const id = card["multiverseid"];
//     if( card["rarity"] == "Basic Land" ) {
//             console.log(`${id}, `);
//             rares.push(card);
//     }
// }