
var clientSocket = io();
let myDraftID = 0;
let myPlayerID = 0;
let myMatchID = 0;
// myOpponentID = 0;
let myTimer;
let myPack = [];
let allCardsKept = [];
let myOpponentID = 0;

import("./timer.mjs").then( result => {
    myTimer = new result.default(30,0);
}).then(
    () => {
    myTimer.setDisplayFunc( updateTime );
});

// Dynamic HTML elements for sign-up page
const userCount = document.getElementById('users-connected');   // <span>
const usersNeeded = document.getElementById('users-needed');    // <span>

const nameField = document.getElementById('player-name');       // <input>
const joinBtn = document.getElementById('join-btn');            // <button>
const playerList = document.getElementById('player-list');      // <ol>

const cardInput = document.getElementById('card-num');          // <input>
const searchBtn = document.getElementById('search-btn');        // <button>
const cardFrame = document.getElementById('card-frame');        // <div> holding <img>
const cardInfo = document.getElementById('card-info');          // <div>

// HTML elements for timer
const timerDiv = $('#time-left');
const minElem = $('#minutes');
const secElem = $('#seconds');

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
    myTimer.start();        // updates time on page thanks to updateTime() callback fn passed to Timer object
    clientSocket.emit('timerStarted');
});

// Will be needed later to resync timer
clientSocket.on('timeRemaining', (data) => {
    myTimer.stop();
    myTimer.reset( data.min, data.sec );
    myTimer.start();
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

// ...

// Signal to reset timer for Round 1/2/3
clientSocket.on('resetTimer', () => {
    myTimer.stop();
    myTimer.reset(50,0);
});

// Server has the pairing info ready
clientSocket.on('pairingInfoReady', () => {
    clientSocket.emit('pairingRequest', { draftNum: myDraftID, playerNum: myPlayerID } );   // <-- fill in with data obj
});

// Server has sent us our pairing info
clientSocket.on('pairingInfo', (data) => {      // { match, opponentNum }
    // Okay, match is...
    myMatchID = data.match;                     // e.g. 5v7
    // so I'm playing against who?
    myOpponentID = data.opponentNum;

    clientSocket.emit('readyToPlay', { draftNum: myDraftID, playerNum: myPlayerID });     // <-- fill in with data obj
    clientSocket.to(`draft${myDraftID}-match${myMatchID}`).emit('readyFreddie', { message: "you ready?"});
})

// Signal to begin the match
clientSocket.on('beginMatch', () => {
    // prepare game play screen
    $.getScript('play.js');
    $('#build').attr('hidden', true);
    $('#play').attr('hidden', false);

    // communication occurs via match "room" ID, e.g. draft0-match5v7
    // or clientSocket.broadcast?  check documentation
    clientSocket.to(`draft${myDraftID}-match${matchID}`).emit('chatMsg', { message: "info" } );
    ///////// GAME EVENTS:
    // chat message send/receive
    // shuffle deck
    // roll dice
    // player begins turn, untaps all
    // player upkeep
    // player draws card (I/send and opp/receive)
    // player main phase: plays land 
    // player taps land/artifact/creature for mana  -  mana counts update
    // player casts creature, artifact, sorcery or ench.
    // spell is put in graveyard or creature dies and goes to GY
    // player attacks/blocks with creature(s)
    // deal/receive damage
    // proceed to next phase
    // look through library
    // take card from lib/GY
    // player clean-up phase, end-of-turn, discard, pass
    // resign

    // advanced/extra:
    // players spell goes on stack
    // players spell resolves

    // and start clock
    //myTimer.setDisplayFunc( newUpdateTimeFunc );  @TODO!
    myTimer.start(); 
});


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

function addToCardsKept( newCards ) {
    console.log("inside call to addToCardsKept()");
    allCardsKept = allCardsKept.concat(newCards);
    //allCardsKept = [...allCardsKept, ...newCards];     // compiler might complain it's not "iterable"
    console.log("allCardsKept: " + allCardsKept);
}