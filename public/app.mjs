var clientSocket = io();
let myName = "";
let myUUID = "";
let myPlayerID = 0;
let myDraftID = 0;
let myDeck = [];
let myMatchID = "";
let myOpponentID = 0;
let myOppName = "";
let myTimer;
let myPack = [];
let allCardsKept = [];          

// Dynamic HTML elements for sign-up page
const userCount = document.getElementById('connected');         // <span>
const usersNeeded = document.getElementById('needed');          // <span>

const nameField = document.getElementById('player-name');       // <input>
const joinBtn = document.getElementById('join-btn');            // <button>
const playerList = document.getElementById('player-list');      // <ol>

const exampleCard = document.getElementById('example-card');
const cardInput = document.getElementById('card-num');          // <input>
const searchBtn = document.getElementById('search-btn');        // <button>
// const cardFrame = document.getElementById('card-frame');        // <div> holding <img>
const cardInfo = document.getElementById('card-info');          // <div>
const blackCurtain = document.getElementById('black-curtain');

// HTML elements for timer
const draftTimerDiv = $('#time-left');
const draftMin = $('#minutes');
const draftSec = $('#seconds');

exampleCard.style.borderRadius = "10px";
document.getElementById('surprise-btn').addEventListener('click', () => {
    rand = Math.floor(Math.random() * 302) + 598;   // random # betw 0 and 301, then add 598
    exampleCard.src = `images/${rand}.jpeg`;        // to get a # between 598 and 899 (incl)
    clientSocket.emit( 'cardSearchRequest', {cardNum: `${rand}` } );
});

// Public import
import("./timer.mjs").then( result => {
    myTimer = new result.default(30,0);
}).then(
    () => {
    myTimer.setDisplayFunc( pickTimer(draftTimerDiv, draftMin, draftSec) );
});

// Import via server request
// import("./js.cookie.mjs").then( result => {
//     console.log("JS-Cookie module loaded");
// });

joinBtn.addEventListener('click', () => {
    if(nameField.value) clientSocket.emit('playerJoinRequest', {name: nameField.value} );
});

searchBtn.addEventListener('click', () => {
    if( cardInput.value ) {
        clientSocket.emit( 'cardSearchRequest', {cardName: `${cardInput.value}` } );
    }
});

        // @TODO: fix bug with name on sign-up sheet after user reconnected
        // and then can enter in ANOTHER name for the SAME person (check cookies for values of "joined" and "name")
        // if values are present then disable join button?  or...
// CLIENT-side socket event listeners                                            
// Server has added the requesting player to the "sign-up sheet"
clientSocket.on('playerJoinOK', (data) => {                     // { draftNum, playerNum }
    joinBtn.hidden = true;

    myName = nameField.value;
    myUUID = data.uuid;
    myDraftID = data.draftNum;      // @TODO: reset these after tournament is over
    myPlayerID = data.playerNum;    

    // Cookies.set('loaded', true);
    document.cookie = `joined=true`;                // initial cookie values
    document.cookie = `name=${myName}`;
    document.cookie = `uuid=${myUUID}`;
    document.cookie = `playerid=${myPlayerID}`;
    document.cookie = `draftid=${myDraftID}`;
    // `dark_mode=true; Secure; HttpOnly; SameSite=Strict; max-age=14400; name=${myName}; socketid=12345678; draftid=${myDraftID}; playerid=${myPlayerID}; page=join`;  
    // expires after 4 hours; to delete a cookie, use max-age=-1 (expires 1 sec ago)

    let item = document.createElement('li');
    item.textContent = nameField.value;             
    playerList.appendChild(item);
    nameField.value = '';                   // clear input field
});

// Another player has been added
clientSocket.on('newPlayerJoined', (data) => {
    populateList( data.players );
});

// Signal to update # users connected
clientSocket.on('userCount', (data) => {
    userCount.textContent = `${data.numUsers}`;
    usersNeeded.textContent = `${ nltZero(8 - data.numUsers) }`;
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
    if(data.info) {
        exampleCard.src = `images/${data.id}.jpeg`;
        cardInfo.innerHTML = data.info;
        cardInput.value = '';
    }
    else {
        //exampleCard.src = "images/603.jpeg";
        cardInfo.innerHTML = "<em>Card not found</em>";
    }
});

// Signal to clear "sign-up sheet" for players who were on the list
clientSocket.on('clearSignup', () => {
    playerList.innerHTML = '';
});

// Signal to prepare for draft
clientSocket.on('prepareForDraft', () => {
    // request pack 1
    clientSocket.emit('packRequest');
    document.cookie = `page=draft`;        // SAVE GAME STATE
    fadeOut(); 
    fadeInDraft();  // update page to "open"/"draft" and fade back in
});

// Server has sent us our 1st pack
clientSocket.on('firstPack', (data) => {
    myPack = data.pack;  // array of #
    document.cookie = `pack=${myPack}`;
    document.cookie = "readytodraft=true";
    clientSocket.emit('readyToDraft');
});

// Signal to start our timer -- 30 min to draft 3 packs and build a deck
clientSocket.on('startDraftTimer', () => {
    myTimer.start();        // updates time on page thanks to updateDraftTime() callback fn passed to Timer object
    clientSocket.emit('timerStarted');
    document.cookie = "timerstarted=true";
});

// Will be needed later to resync timer
clientSocket.on('timeRemaining', (data) => {
    //myTimer.stop();
    myTimer.reset( data.min, data.sec );    // @TODO: test this -- just reset() without stop & start
    //myTimer.start();                      // @TODO:  if disconnected, send request for time upon reconnecting
    document.cookie = `minleft=${data.min}`;
    document.cookie = `secleft=${data.sec}`;
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

// clientSocket.on('rotatedCards', (data) => { ... } );   // not used here - located in "drafting.js"

// Server has sent us our NEXT pack (2 or 3)
clientSocket.on('nextPack', (data) => {    // { pack, packNum }
    // console.log("my pack before next pack: " + myPack);
    myPack = data.pack;     // pack received
    // console.log("new pack # " + data.packNum + " received: " + myPack);
    draftOnePack(data.packNum, myDraftID, myPlayerID, addToCardsKept);
});

// ... LATER, ALL PACKS have been DRAFTED and DECKS have been ASSEMBLED

// Signal to prepare to play
clientSocket.on('prepareToPlay', () => {        // This only occurs once after decks have been assembled
    //prepare game play screen
    fadeOut();
    fadeInPlay();
    document.cookie = "page=play";
});

// Signal to reset timer for Round 1/2/3
clientSocket.on('resetTimer', () => {
    myTimer.reset(50,0)
    // matchTimerDiv.removeClass('text-red');                                      // in case time was low/up
    document.cookie = `minleft=50`;
    document.cookie = `secleft=0`;
});

// Server has the pairing info ready
clientSocket.on('pairingInfoReady', () => {
    clientSocket.emit('pairingRequest', { draftNum: myDraftID, playerNum: myPlayerID } );
    document.cookie = "pairingrequested=true";                                              // GAME STATE
    document.cookie = "pairingreceived=false"
});

// Server has sent us our pairing info
clientSocket.on('pairingInfo', (data) => {      // { match, opponentNum, opponentName }
    // Okay, match is...
    myMatchID = data.match;                     // e.g. 5v7
    // so I'm playing against...
    myOpponentID = data.opponentNum;
    // whose name is... data.opponentName
    myOppName = data.opponentName;

    document.cookie = "pairingreceived=true"
    document.cookie = `matchid=${myMatchID}`;                                               // GAME STATE / info
    document.cookie = `oppid=${myOpponentID}`;
    document.cookie = `oppname=${myOppName}`;
    document.cookie = "pairingrequested=false";

    clientSocket.emit('readyToPlay', { draftNum: myDraftID, playerNum: myPlayerID });
    //clientSocket.to(`draft${myDraftID}-match${myMatchID}`).emit('readyFreddie', { message: "you ready?"});
})

// Signal to begin the match
clientSocket.on('beginMatch', (data) => {
    console.log("whoo hoo, beginning match " + data.roundNum );
    myTimer.start();                                // and start clock
    document.cookie = "playing=true";
    // communication occurs via match "room" ID, e.g. draft0-match5v7
    // or clientSocket.broadcast?  check documentation
    //clientSocket.emit... (`draft${myDraftID}-match${matchID}`).emit('chatMsg', { message: "info" } );

            // GAME EVENTS NEEDED:
    // player taps non-basic land/artifact/creature for mana //   @TODO: send event with mana update info
    // card enters opponents battlefield or GY/Exile zone   //  @TODO: IMPORTANT - upon cardMoved event, show opp's card
    // clean-up phase, end-of-turn, discard, pass           //  @TODO: anything special for these sub-phases?
    
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
    // proceed to next phase                                // Progress bar and phase both update (Alt + a or p proceeds to next phase)
    // players can click to adjust life totals              // (including Alt + click)
    // phase begins or next turn                            // Sends event when entering phase / next turn    
    
    
});

clientSocket.on('youResigned', (data) => {
    alert("You have resigned");
});


// @TODO: if out of time for current round, signal to any matches still ongoing: turn 0
// ... after 5 turns, collect and tally result(s)
// ... un-join players from match room

// @TODO: if time left in round, allow players finished to go from waiting room
//        to spectate (temporarily join match room) with option to leave before time in round


// Functions
function addToCardsKept( newCards ) {
    console.log("Adding pack picks to total picks");
    allCardsKept = allCardsKept.concat(newCards);
    document.cookie = `allpicks=${allCardsKept}`;
    //allCardsKept = [...allCardsKept, ...newCards];     // compiler might complain it's not "iterable"
    console.log("allCardsKept: " + allCardsKept);
}

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
    
function pickTimer( timerDiv, minSpan, secSpan ) {
    return function updateTime( min, sec ) {
        // update timer
        minSpan.text(`${min}`);
        if(sec < 10) {
            if(min == 0) {
                // matchTimerDiv.removeClass('text-white');         // !!!!!!!!!!!!!!!!!!
                timerDiv.addClass('text-red');       // @TODO: remember to remove later when restarting timer!
            }
            secSpan.text(`0${sec}`);
        }
        else secSpan.text(`${sec}`);
    }
}

const fadeOut = () => {
    blackCurtain.style.zIndex = 20;        // bring to front
        // NOTE: do not use setAttribute for style here, it will not work
    blackCurtain.style.opacity = "1";       // make fully opaque (no see through)
};
const fadeIn = () => {
    blackCurtain.style.opacity = "0";   // make fully transparent and
    blackCurtain.style.zIndex = -1;     // move behind everything else
};

// @TODO: DRY these out, using srcPage & destPage passed in and then $(`#${srcPage}`).attr('hidden', true);
const fadeInDraft = () => {
    window.setTimeout( () => {
        $('#join').attr('hidden', true);    // hide join screen
        $('#open').attr('hidden', false);   // show open screen
        fadeIn();
    }, 3000);
};
const fadeInBuild = () => {
    window.setTimeout( () => {
        $('#draft').attr('hidden', true);   // hide draft screen
        $('#build').attr('hidden', false);  // show build screen
        fadeIn();
    }, 3000);
};
const fadeInPlay = () => {
    window.setTimeout( () => {
        $('#build').attr('hidden', true);   // hide build screen
        $('#play').attr('hidden', false);   // show play screen
        blackCurtain.style.opacity = "0";   // make fully transparent
        blackCurtain.style.zIndex = -1;     // move behind everything else
    }, 3000);
}