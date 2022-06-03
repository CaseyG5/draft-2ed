
var clientSocket = io();
let myName = "";
let myPlayerID = 0;
let myDraftID = 0;
let myMatchID = "";
let myOpponentID = 0;
let myOppName = "";
let myTimer;
let myPack = [];
let allCardsKept = [];

import("./timer.mjs").then( result => {
    myTimer = new result.default(30,0);
}).then(
    () => {
    myTimer.setDisplayFunc( updateDraftTime );
});

// Dynamic HTML elements for sign-up page
const userCount = document.getElementById('connected');   // <span>
const usersNeeded = document.getElementById('needed');    // <span>

const nameField = document.getElementById('player-name');       // <input>
const joinBtn = document.getElementById('join-btn');            // <button>
const playerList = document.getElementById('player-list');      // <ol>

const cardInput = document.getElementById('card-num');          // <input>
const searchBtn = document.getElementById('search-btn');        // <button>
const cardFrame = document.getElementById('card-frame');        // <div> holding <img>
const cardInfo = document.getElementById('card-info');          // <div>

// HTML elements for timer
const draftTimerDiv = $('#time-left');
const draftMin = $('#minutes');
const draftSec = $('#seconds');


joinBtn.addEventListener('click', () => {
    if(nameField.value) clientSocket.emit('playerJoinRequest', {name: nameField.value} );
});

searchBtn.addEventListener('click', () => {
    if( cardInput.value ) {
        clientSocket.emit( 'cardSearchRequest', {cardName: `${cardInput.value}` } );
    }
});

// CLIENT-side socket event listeners

// Server has added the requesting player to the "sign-up sheet"
clientSocket.on('playerJoinOK', (data) => {         // { draftNum, playerNum }
    joinBtn.hidden = true;
    myName = nameField.value;
    let item = document.createElement('li');
    item.textContent = nameField.value;
    nameField.value = '';
    playerList.appendChild(item);
    myDraftID = data.draftNum;      // @TODO: reset after tournament is over?
    myPlayerID = data.playerNum;
});

// Another player has been added
clientSocket.on('newPlayerJoined', (data) => {
    populateList( data.players );
});

// Signal to update # users connected
clientSocket.on('userCount', (data) => {
    userCount.innerText = `${data.numUsers}`;
    usersNeeded.innerText = `${ nltZero(8 - data.numUsers) }`;
});
    // @TODO:  ^  combine these?  v

// Server has sent updated "sign-up sheet" data
clientSocket.on('listData', (data) => {
    if(data.players) {
        populateList( data.players );       
    }
});

// Server has sent requested card data from search
clientSocket.on('cardSearchReply', data => {
    if(data) {
        cardFrame.innerHTML = '';
        let cardImg = document.createElement('img');
        cardImg.src = `images/${data.id}.jpeg`;
        cardFrame.appendChild(cardImg);
        cardInput.value = '';
        cardInfo.innerHTML = data.info;
    }
    else cardInfo.innerHTML = "<em>Card not found</em>";
});

// Signal to clear "sign-up sheet" for players who were on the list
clientSocket.on('clearSignup', () => {
    playerList.innerHTML = '';
});

// Signal to prepare for draft
clientSocket.on('prepareForDraft', () => {
    // request pack 1
    clientSocket.emit('packRequest');

    // update page to draft.html
    $('#join').attr('hidden', true);
    $('#open').attr('hidden', false);

    // @TODO: transition to black background, if possible, before showing "Open 1st pack" button
});

// Server has sent us our 1st pack
clientSocket.on('firstPack', (data) => {
    myPack = data.pack;  // array of #
    clientSocket.emit('readyToDraft');
});

// Signal to start our timer -- 30 min to draft 3 packs and build a deck
clientSocket.on('startDraftTimer', () => {
    myTimer.start();        // updates time on page thanks to updateDraftTime() callback fn passed to Timer object
    clientSocket.emit('timerStarted');
});

// Will be needed later to resync timer
clientSocket.on('timeRemaining', (data) => {
    //myTimer.stop();
    myTimer.reset( data.min, data.sec );  // @TODO: test with just reset()
    //myTimer.start();
});

// Signal to begin drafting a pack
clientSocket.on('beginDrafting', (data) => {    // { packNum }
    draftOnePack(data.packNum, myDraftID, myPlayerID, addToCardsKept);   
});

// For now, server handles rotating of players cards
// Signal that cards rotated-in are ready
clientSocket.on('rotatedCardsReady', () => {
    // so client requests them
    clientSocket.emit('rotatedCardsRequested', {draftNum: myDraftID, playerNum: myPlayerID} );    // { draftID, playerID }
});

// Server has sent us our NEXT pack (2 or 3)
clientSocket.on('nextPack', (data) => {    // { pack, packNum }
    console.log("my pack before next pack: " + myPack);
    myPack = data.pack;     // pack received
    console.log("new pack # " + data.packNum + " received: " + myPack);
    draftOnePack(data.packNum, myDraftID, myPlayerID, addToCardsKept);
});

// ... ALL PACKS have been DRAFTED and DECKS have been ASSEMBLED

// Signal to prepare to play
// clientSocket.on('prepareToPlay', () => {
    
// });

// Signal to reset timer for Round 1/2/3
clientSocket.on('resetTimer', () => {
    // prepare game play screen
    $.getScript('play.js');
    $('#build').attr('hidden', true);
    $('#play').attr('hidden', false);
    myTimer.stop();
    myTimer.reset(50,0);
    
});

// Server has the pairing info ready
clientSocket.on('pairingInfoReady', () => {
    clientSocket.emit('pairingRequest', { draftNum: myDraftID, playerNum: myPlayerID } );
});

// Server has sent us our pairing info
clientSocket.on('pairingInfo', (data) => {      // { match, opponentNum }
    // Okay, match is...
    myMatchID = data.match;                     // e.g. 5v7
    // so I'm playing against...
    myOpponentID = data.opponentNum;
    // whose name is... data.opponentName
    myOppName = data.opponentName;

    clientSocket.emit('readyToPlay', { draftNum: myDraftID, playerNum: myPlayerID });
    //clientSocket.to(`draft${myDraftID}-match${myMatchID}`).emit('readyFreddie', { message: "you ready?"});
})

// Signal to begin the match
clientSocket.on('beginMatch', () => {
    console.log("whoo hoo, beginning a match!");
    myTimer.setDisplayFunc( updateMatchTime );      // switch to play clock
    myTimer.start();                                // and start clock

    // communication occurs via match "room" ID, e.g. draft0-match5v7
    // or clientSocket.broadcast?  check documentation
    //clientSocket.emit... (`draft${myDraftID}-match${matchID}`).emit('chatMsg', { message: "info" } );

            // GAME EVENTS NEEDED:
    // untap if tapped by mistake
    // phase begins                                         //   @TODO: send event entering/leaving main
    // clean-up phase, end-of-turn, discard, pass           //   @TODO update phase and progress bar
    // player taps non-basic land/artifact/creature for mana //   @TODO: send event with mana update info
    // player moves spell/perm from one zone to another     //   @TODO: send event with "area" and card #
    // deal/receive damage                                  //   @TODO: update my life total and send update event
    // player attacks/blocks with creature(s)               //   @TODO: yikes    
    // creature dies and goes to GY                         //   @TODO: hmmmm...
    // after game, refresh play screen                      //   @TODO: also, where to display score?

            // ADVANCED / OPTIONAL:
    // losing player automatically has control of turn first
    // player's spell goes on stack
    // player's spell resolves

            // COMPLETED:   
    // chat message send/receive                            // VERIFIED working
    // resign                                               // Button ADDED.  Event handled!
    // shuffle deck                                         // Button ADDED.  Sends notifcation as chat message
    // roll dice                                            // Button ADDED.  Sends notifcation as chat message
    // player begins turn, untaps all                       // Button ADDED.  Sends notification as chat message
    // player draws card (I/send and opp/receive)           // Button ADDED.  Sends notif. as chat msg
    // look through library and choose card                 // Upgraded method to modal. Sends notif. as chat msg when looking, and when done ("player stops looking")
    // proceed to next phase                                // Progress bar and phase both update
    // players can click to adjust life totals              // (including Alt + click)
    
});

clientSocket.on("updatePhase", (data) => {
    // take current phase from opponent via server and update progress bar and info in sidebar
});

clientSocket.on("cardToZone", (data) => {
    //   @TODO: send & receive event with "area" and card #
    // take "area" and card # and move card to its new zone
    // e.g. plays a land
    // casts creatr, artif, sorc, inst or ench.
    // or spell or perm. is put in graveyard
});

clientSocket.on('youResigned', (data) => {
    alert("You have resigned");
});


// ... game1 result --> game 2 --> game 2 result --> game 3 or match done
// ... un-join players from match room
// ... if time left in round, allow players finished to go from waiting room
// ... to spectate (temporarily join match room) with option to leave before time in round
// ... when last match ends, proceed to next round
// ... calc and issue pairings, start clock and repeat
// ... 


// Functions
function populateList( players ) {
    // empty contents of list first
    playerList.innerHTML = '';

    for(let i = 1; i < players.length; i+=2) {
        let item = document.createElement('li');
        item.textContent = players[i];
        playerList.appendChild(item);
    }
}

function nltZero( num ) {
    if (num < 0) return 0;
    return num;
}

function updateDraftTime( min, sec ) {
    // update timer
    draftMin.text(`${min}`);
    if(sec < 10) {
        if(min == 0) {
            // draftTimerDiv.removeClass('text-white');
            draftTimerDiv.addClass('text-red');
        }
        draftSec.text(`0${sec}`);
    }
    else draftSec.text(`${sec}`);
}
                                        // @TODO: ^ consolidate to stay dry v
function updateMatchTime( min, sec ) {
        // update timer
        matchMin.text(`${min}`);
        if(sec < 10) {
            if(min == 0) {
                // matchTimerDiv.removeClass('text-white');         // !!!!!!!!!!!!!!!!!!
                matchTimerDiv.addClass('text-red');       // @TODO: remember to remove later when restarting timer!
            }
            matchSec.text(`0${sec}`);
        }
        else matchSec.text(`${sec}`);
}

function addToCardsKept( newCards ) {
    console.log("inside call to addToCardsKept()");
    allCardsKept = allCardsKept.concat(newCards);
    //allCardsKept = [...allCardsKept, ...newCards];     // compiler might complain it's not "iterable"
    console.log("allCardsKept: " + allCardsKept);
}