//const { pageRequest } = require('./ajax');

const timerDiv = $('#time-left');
const minElem = $('#minutes');
const secElem = $('#seconds');
let btnNext = document.getElementById("next-btn");
let imageOfCard = document.getElementById("top-card");
let cardsSeen = document.getElementById("cards-seen");
let passBtn = document.getElementById('pass-btn');

let indexOfTopCard = 14;
let imgNum;
let zIndex = 15;
let cardIsChosen = false;

function updateTime( min, sec ) {
    // update timer
    minElem.text(`${min}`);
    if(sec < 10) {
        if(min == 0) {
            timerDiv.removeClass('text-white');
            timerDiv.addClass('text-red');
        }
        secElem.text(`0${sec}`);
    }
    else secElem.text(`${sec}`);
}

function draftOnePack( pack, packNumber, draftID, playerID, clientSocket, addCardsFromPack) {
    
    //let pack = packOfCards;   // my pack
    let cardsThisPack = [];

    // Show 1st (TOP) card right away
    imgNum = pack[indexOfTopCard--];
    imageOfCard.src = `images/${imgNum}.jpeg`;

    btnNext.addEventListener( 'click', e => {
        displayCardBelow( imgNum, zIndex-- );
        // let backing = document.createElement('div');
        // let card = document.createElement('img');
        // card.id = `${imgNum}`;

        // backing.classList.add('backing');
        // backing.style = `position: relative; z-index: ${zIndex--}`;

        // card.classList.add('seen');
        // card.src = `images/${imgNum}.jpeg`;
        // card.style.opacity = "1";

        // backing.appendChild(card);
        // cardsSeen.appendChild(backing);

        // card.addEventListener( 'click', e => {  // allow selection of 1 card and
        //     if(cardIsChosen == false) {
        //         cardIsChosen = true;
        //         backing.style.zIndex = 16;
        //         card.style.opacity = "0.5";
        //         const chosenImgNum = Number( `${card.id}`);
        //         //console.log(`keeping card # ${chosenImgNum}`);
        //         cardsThisPack.push( chosenImgNum );
        //         pack.splice( pack.indexOf( chosenImgNum, 0 ), 1 );
        //     }
        // });
        
        imgNum = pack[indexOfTopCard--];
        imageOfCard.src = `images/${imgNum}.jpeg`;
        if( indexOfTopCard == -1) {                     // no more unseen cards in pack
            imageOfCard.src = "";
            displayCardBelow(imgNum, zIndex--);
            
            // show button to pass the rest
            // cardsSeen.style.pointer = "pointer";
            btnNext.hidden = true;
            passBtn.hidden = false;
            passBtn.addEventListener( 'click', e => {

                // offer up to the server remaining cards to be passed
                // along with draft ID and player ID
                clientSocket.emit('cardPicked', {draftNum: draftID, playerNum: playerID, theCards: pack} );
                
                clientSocket.on('rotatedCards', (data) => {
                    pack = data.cards;
                    cardsSeen.innerHTML = "";
                    cardIsChosen = false;
                    // display cards of pack received
                    for( let i = pack.length-1; i > -1; i-- ) {
                        displayCardBelow( pack[i], i );
                    }

                });
                
                if(pack.length == 0) {                                      // no cards left to pick/pass
                    passBtn.setAttribute('hidden', true);                   // hide Pass button
                    // DONT NEED: clientSocket.emit('packDone', {draftNum: draftID} );  
                    // because server already knows pack is done
                    addCardsFromPack(cardsThisPack);
                    
                    if (packNumber < 3) {
                        btnNext.setAttribute('hidden', false);  // show "Next card" button again
                        // Actualy show "Open pack" button
                    }
                    // otherwise, both buttons will be left hidden and screen will redirect to deck assembly

                    // else {
                    //     const proceedBtn = document.createElement('button');
                    //     proceedBtn.classList.add('gold-btn');
                    //     proceedBtn.innerText = "Build deck"
                    //     document.getElementById('btn-panel').appendChild(proceedBtn);
                    //     proceedBtn.addEventListener('click', () => {
                    //         pageRequest('build.html');                  // Take user to build screen
                    //     });
                    // }
                    
                }
            });
        }
    });

    function displayCardBelow( iNum, currentZ ) {
        let backing = document.createElement('div');
        let card = document.createElement('img');
        
        card.id = `${iNum}`;

        backing.classList.add('backing');
        backing.style = `position: relative; z-index: ${currentZ}`;

        card.classList.add('seen');
        card.src = `images/${iNum}.jpeg`;
        card.style.opacity = "1";

        backing.appendChild(card);
        cardsSeen.appendChild(backing);

        card.addEventListener( 'click', e => {
            if(cardIsChosen == false) {
                cardIsChosen = true;
                backing.style.zIndex = 16;
                card.style.opacity = "0.5";
                const chosenImgNum = Number( `${card.id}`);
                //console.log(`keeping card # ${chosenImgNum}`);
                cardsThisPack.push( chosenImgNum );
                pack.splice( pack.indexOf( chosenImgNum, 0 ), 1 );
            }
        });
    }
   
}


/*TEST RUN
    my picks:    [744,780,683,751,750,  853,770,771,683,716,  787,717,719,715,674]
    bot 2 took:  [804,730,768,847,832,  782,814,598,817,680,  607,705,713,836,693]
    bot 3 took:  [743,802,673,763,851,  746,746,850,636,679,  890,849,702,896,877]
    bot 4 took:  [859,658,782,675,673,  769,795,857,897,875,  670,651,894,891,893]
*/



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

/*  
variables:
    // let pack2 = createPack();   // their packs
    // let pack3 = createPack();   
    // let pack4 = createPack();

    // let bot2Picks = [];
    // let bot3Picks = [];
    // let bot4Picks = [];
    // let bot2Colors = '', bot3Colors = '', bot4Colors = '';


previously in passBtn event listener:
                // Have the AI remove a card from pack2...

                let pickObj = pickCard( pack2, bot2Colors);  // choose a card
                let thisCard = pickObj["cardNum"];          // store the card #
                let thisColor = pickObj["cardColor"];       // store the color of that card

                if( thisColor != 'X'  &&  thisColor != 'A'  &&  !bot2Colors.includes( thisColor,0 ) )
                    bot2Colors += thisColor;  

                bot2Picks.push( thisCard );                         // keep the card
                pack2.splice( pack2.indexOf( thisCard, 0 ), 1);     // (remove it from the pack)

                // repeat with pack 3 for bot3
                pickObj = pickCard( pack3, bot3Colors);
                thisCard = pickObj["cardNum"];
                thisColor = pickObj["cardColor"];

                if( thisColor != 'X'  &&  thisColor != 'A'  &&  !bot3Colors.includes( thisColor,0 ) )
                    bot3Colors += thisColor;

                bot3Picks.push( thisCard );
                pack3.splice( pack3.indexOf( thisCard, 0 ), 1);

                // and with pack 4 for bot4
                pickObj = pickCard( pack4, bot4Colors);
                thisCard = pickObj["cardNum"];
                thisColor = pickObj["cardColor"];

                if( thisColor != 'X'  &&  thisColor != 'A'  &&  !bot4Colors.includes( thisColor,0 ) )
                    bot4Colors += thisColor;

                bot4Picks.push( thisCard );
                pack4.splice( pack4.indexOf( thisCard, 0 ), 1);
                
                // rotate packs with 1 less card, e.g. clockwise
                const temp = pack;
                pack = pack4;
                pack4 = pack3;
                pack3 = pack2;
                pack2 = temp;

                if(pack.length == 0) {
                    ...
                    //localStorage.setItem("test3-mine", cardsThisPack);      //check "test2-draft" for pack 1
                    

                    // localStorage.setItem("test3-bot2", bot2Picks);
                    // localStorage.setItem("test3-bot3", bot3Picks);
                    // localStorage.setItem("test3-bot4", bot4Picks);
                }
                */


// WORKED!  BUT ONLY NEEDED ONCE!  DON'T USE AGAIN!
// var fs = require('fs');
// const https = require("https");

// for( let id of idNums ) {
//     const file = fs.createWriteStream(`images/${id}.jpeg`);

//     https.get(`https://gatherer.wizards.com/Handlers/Image.ashx?type=card&multiverseid=${id}`, response => {
//         response.pipe( file );
//     });
// }



