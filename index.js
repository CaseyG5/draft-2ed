import Tournament from './classes';
const { createPack } = require('./createpack');

//const { buildDeck } = require('./build');

// Global constants
const PORT = 29170;

// Global variables
let cards;
let draftNumber = 0;        // @TODO: save next draft # to file in case server goes down
let currentNumUsers = 0;
let playersJoined = [];   // id, name, id, name, ... , id, name
let playersReady = 0;
let activeDrafts = [];      // @TODO: have a way to halt joining after current sign-up for server maint.

// server-app modules
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
let io = new Server(server);       // An Express HTTP server listening on port PORT ready for socket connections
const fs = require('fs');


try {
    cards = JSON.parse( fs.readFileSync('2ED.json', 'utf-8', (err, data) => {
        if(err) throw err;
        console.log("data read");
    }) )["cards"];  

} catch (err) {
    console.log(err);
}


app.use( express.static('./public') );

// app.use( express.urlencoded({ extended: false }) );

// @TODO How to add specific file paths to resources with app.get or app.use ???
// ?  __dirname + '../node_modules/jquery/dist/jquery.js'  ?

// app.get('/', (req, resp) => {
//     resp.status(200).sendFile(__dirname + '/index.html');
// });

// app.get('/cards', (req, resp) => {
//     console.log("path is: " + req.path);
//     resp.json( cards );                      // WORKED because resource was pre-loaded here
// });

// app.post('/test.php', (req, resp) => {
//     // resp.json(`{\"userName\":\"${req.body.userName}\", \"computedString\":\"Hello, ${req.body.userName}\"}`);
//     resp.json( { userName: req.body.userName, computedString: `Hello, ${req.body.userName}, good day!`} );
// });

app.all('*', (req, resp) => {
    resp.status(404).send('resource not found');
});


server.listen(PORT, () => console.log(`Express HTTP server listening on port ${PORT}`) );


io.on('connection', (socket) => {
    
    console.log("User connected and given ID " + socket.id);
    currentNumUsers++;
    io.emit('userCount', {numUsers: currentNumUsers} );
    socket.emit('listData', {players: playersJoined} );

    socket.on('playerJoinRequest', (data) => {
        if( playersJoined.length < 16) {
            playersJoined.push( socket.id );
            playersJoined.push( data.name );
            socket.join(`draft${draftNumber}`);
            socket.emit('playerJoinOK', {draftNum: draftNumber, playerNum: (playersJoined.length / 2) } );      
            socket.broadcast.emit('newPlayerJoined', {players: playersJoined} )
        }
        //console.log("\"playerJoined\" event captured. Player accepted into draft group");
        else if( playersJoined.length > 14) {
            // broadcast ''newDraftSignup' event for clients in current draft group to clear list
            io.to(`draft${draftNumber}`).emit('clearSignup');

            // start draft with the 8 players in draft N, using data in playersJoined array
            let names = [];
            for(let i = 1; i < 16; i=i+2) names.push( playersJoined[i] );

            // and new Tourament object
            activeDrafts.push( new Tournament(draftNumber, names) );  // Tournament includes iTimer pre-set to 30:00
                // broadcast to players in draft group N
                io.to(`draft${draftNumber}`).emit('prepareForDraft' );

                // they request a pack
                // their JS redirects to open pack / start draft screen
                
                // remember to switch direction of rotation for 2nd pack
            
        }
    });

    // server sends player a pack
    socket.on('packRequest', () => {
        socket.emit('firstPack', { pack: createPack() } );
    });

    socket.on('readyToDraft', () => {
        if(playersReady == 8) {
            let thisDraft = activeDrafts[draftNumber]
            // notify players to start their timers
            io.to(`draft${draftNumber}`).emit('startDraftTimer');

            // start draft timer 
            thisDraft.startDraft();  // starts the timer

            // necessary to send time update every 10 seconds ?
            // setInterval( () => {
            //     io.to(`draft${draftNumber}`).emit('timeRemaining', activeDrafts[draftNumber].getCurrentTime() );
            // }, 10000 );

            // reinitialize playersJoined array
            playersJoined.length = 0;

            // reset players ready
            playersReady = 0;

            io.to(`draft${draftNumber}`).emit('beginDrafting', {packNum: 1} );
            // inc draft #
            draftNumber++;
        }
        else playersReady++;
    });

    socket.on('cardPicked', (data) => {     // draft ID, player ID, cards being passed
        let thisDraft = activeDrafts[data.draftNum];

        if( data.theCards.length == 0 ) {   // if no cards left in pack to rotate
            // inc pack # (move on to the next pack)
            thisDraft.currentPack++;
            if( thisDraft.currentPack > 3) {
                // we are done drafting! time to build a deck!  =D
                io.to(`draft${draftNumber}`).emit('assembleDeck');
            }
            else {
                // prepare to issue a new pack to each player
                io.to(`draft${draftNumber}`).emit('nextPackReady');                
            }
        }  
        else {
            thisDraft.theirPacks[data.playerNum] = data.theCards;
            thisDraft.incNumPlayersReady();
            if( thisDraft.getNumPlayersReady() === 8 ) {
                
                // rotate cards/packs L or R depending on pack#
                thisDraft.rotatePacks();
                // and give each player their rotated cards
                io.to(`draft${draftNumber}`).emit('rotatedCardsReady');

                thisDraft.resetNumPlayersReady();
            }
        }
    });


    socket.on('rotatedCardsRequested', (data) => {  // data:  { draftNum, playerNum}
        let thisDraft = activeDrafts[data.draftNum];
        socket.emit('rotatedCards', { cards: thisDraft.theirPacks[data.playerNum] } );
    });

    socket.on('nextPackRequested', (data) => {
        socket.emit('nextPack', { pack: createPack(), packNum: activeDrafts[data.draftNum].currentPack } );
    }); 

    socket.on('deckAssembled', (data) => {

    });





    // when user requests info/image for a card
    socket.on('cardSearchRequest', (data) => {
        let myCard;
        let cardInfo;
        let cardData = {};
        
        myCard = cards.find( card => String(card.name).toLowerCase() == String(data.cardName).toLowerCase() );
            
        if (myCard) {
            // get card info based on search result
            cardInfo = `<strong>Name:</strong> ${myCard.name} <br>
            <strong>Cost:</strong> ${myCard.manaCost} <br>
            <strong>Type:</strong> ${myCard.type} <br>
            <strong>Text:</strong> ${myCard.text} <br>`;

            if(myCard.toughness) cardInfo += `<strong>P/T:</strong> ${myCard.power}/${myCard.toughness}`;    
            
            cardData = { id: myCard.multiverseid, info: cardInfo };
        }
        else cardData = '';

        // then pass back a string with card info           
        socket.emit( 'cardSearchReply', cardData );   
    });

    // when user disconnects
    socket.on('disconnecting', () => {
        console.log(`User with ID ${socket.id} disconnecting`);
        currentNumUsers--;
        // playersJoined.splice( playersJoined.indexOf( socket.id ), 2);
        socket.broadcast.emit('userCount', {numUsers: currentNumUsers} );
        // socket.broadcast.emit('listData', {players: playersJoined} );
    });
});


/* 

// server-side code specific to the game can be stored in, e.g., gameserver.js



io.sockets.on('connection', (theSocket) => {
    console.log("Client connected");
    draft2ed.initGame(io, theSocket); // initGame sets up the event listeners for Socket.IO to allow browser & server to communicate in real time
});                                                          // e.g. gameSocket.on('joinDraft', handleJoinDraft);
*/





/* 
        game.addPlayer( {id: player.id, name: player.name, life: INIT_LIFE_POINTS} );
*/


/* CLIENT-SIDE:

const INTERVAL = 400;

const update = () => {
    if(this.localPlayer != undefined) {
        this.sendData();
        this.localPlayer.doSomething();
    }
}

setInterval( update, INTERVAL);


*/