import Tournament from './mclasses.mjs';
import createPack from './createpack.mjs';

// Global constants
const PORT = 29170;   // or port # 13207 for MTG  :)
const PLAYERS_PER_DRAFT = 2;

// Global variables
let cards;
let draftNumber = 0;        // @TODO: save next draft # to file in case server goes down
let currentNumUsers = 0;
let playersJoined = [];   // id, name, id, name, ... , id, name
let playersReady = 0;
let activeDrafts = [];      // @TODO: have a way to halt joining after current sign-up for server maint.

// server-app modules
import express from 'express';
const app = express();
import http from 'http';
const server = http.createServer(app);
import { Server } from 'socket.io';
let io = new Server(server);       // An Express HTTP server listening on port PORT ready for socket connections
import fs from 'fs';

// Not needed just yet
// try {
//     cards = JSON.parse( fs.readFileSync('2ED.json', 'utf-8', (err, data) => {
//         if(err) throw err;
//         console.log("data read");
//     }) )["cards"];  

// } catch (err) {
//     console.log(err);
// }

app.use( express.static('./public') );

// app.get('/cards', (req, resp) => {
//     console.log("path is: " + req.path);
//     resp.json( cards );                      // WORKED because resource was pre-loaded here
// });

app.all('*', (req, resp) => {
    resp.status(404).send('resource not found');
});

server.listen(PORT, () => console.log(`Express HTTP server listening on port ${PORT}`) );


io.on('connection', (socket) => {
    
    console.log("User connected and given ID " + socket.id);
    currentNumUsers++;
    io.emit('userCount', {numUsers: currentNumUsers} );     // Give new user count to EVERYONE
    socket.emit('listData', {players: playersJoined} );     // Give the current list to user/client (socket) just joining

    // Client has requested to join the next draft
    socket.on('playerJoinRequest', (data) => {
        // First make sure username is unique, at least within the draft group
        if( playersJoined.includes(data.name) ) {
            return;                             // @TODO: send back join failed event/message and popup tip
        }            
        // sign up the requesting client
        playersJoined.push( socket.id );        // unique 20-digit ID
        playersJoined.push( data.name );        // name entered by user
        socket.join(`draft${draftNumber}`);     // group (or "room") ID

        socket.emit('playerJoinOK', {draftNum: draftNumber, playerNum: (playersJoined.length / 2 - 1) } );      
        socket.broadcast.emit('newPlayerJoined', {players: playersJoined} );
 
        console.log(`${playersJoined.length / 2} players have joined`)
        
        // if we DO have 8 players signed up...
        if( playersJoined.length == 2 * PLAYERS_PER_DRAFT) {    
            // broadcast notification for clients in current draft group to clear list
            io.to(`draft${draftNumber}`).emit('clearSignup');

            // start draft with the P players in draft N, using data in playersJoined array...
            let names = [];
            for(let i = 1; i < (2*PLAYERS_PER_DRAFT); i=i+2) names.push( playersJoined[i] );

            // ...and a new Tourament object
            activeDrafts.push( new Tournament(draftNumber, names) );  // Tournament includes iTimer pre-set to 30:00
            
            // notify players in draft group N to prepare to draft the first pack
            io.to(`draft${draftNumber}`).emit('prepareForDraft' ); 
        }
    });

    //////////////////// DRAFT EVENTS (no pun intended) ////////////////////

    // Client has requested the 1st pack to open/draft
    socket.on('packRequest', () => {
        socket.emit('firstPack', { pack: createPack() } );  // server sends player a pack
    });

    // Client is now ready to begin drafting
    socket.on('readyToDraft', () => {
        playersReady++;
        // all 8 players ready?
        if(playersReady === PLAYERS_PER_DRAFT) {
            let thisDraft = activeDrafts[draftNumber]
            // notify players to start their timers
            io.to(`draft${draftNumber}`).emit('startDraftTimer');

            // thisDraft.setupDisplay( (m,s) => console.log(m + ":" + s) );   // No longer needed with separate "server-timer.mjs" file

            // @TODO: Send time update every 30 seconds ?
            // setInterval( () => {
            //     io.to(`draft${draftNumber}`).emit('timeRemaining', thisDraft.getCurrentTime() );
            // }, 30000 );

            // reinitialize playersJoined array for the next draft group
            playersJoined.length = 0;

            // reset players ready
            playersReady = 0;

            thisDraft.startDraft();     // start server's draft timer 

            // inc draft #
            draftNumber++;   // @TODO: IMPORTANT - move this up earlier in case players are wanting to join the next draft
        }
    });

    socket.on('timerStarted', () => {
        socket.emit('beginDrafting', {packNum: 1} );   
        // @TODO:  Switch to notifying all to begin:  io.to(`draft${draftNumber}`).emit('beginDrafting'} );
    });

    // Client has picked a card from their cards and can rotate the rest,
    // or request another pack if no cards are left,
    // or begin assembling their deck if no packs are left to draft
    socket.on('cardPicked', (data) => {     // { draftNum, playerNum, theCards }

        let thisDraft = activeDrafts[data.draftNum];
        console.log("received cardPicked event from player " + data.playerNum + " in draft " + data.draftNum +
                " passing " + data.theCards.length + " cards");
                
        thisDraft.setPlayersPack(data.playerNum, data.theCards);
        thisDraft.incNumPlayersReady();
        console.log(thisDraft.getNumPlayersReady() + " players ready to pass thier cards");
        if( thisDraft.getNumPlayersReady() === PLAYERS_PER_DRAFT ) {

                console.log("rotating cards");
            // rotate cards/packs L or R depending on pack#
            thisDraft.rotatePacks();
            
            // and notify each player their rotated cards are ready
            io.to(`draft${data.draftNum}`).emit('rotatedCardsReady');
            thisDraft.resetNumPlayersReady();

            // After rotating, if just 1 card had been rotated (last card rotated in is kept)
            if( data.theCards.length == 1 ) {   
                
                console.log("players just rotated and got back 1 card which is kept")
    
                // so inc pack # (move on to the next pack)
                thisDraft.incPackNumber();
                if( thisDraft.getPackNumber() > 3) {
                    // we are done drafting! time to build a deck!  =D
                    console.log("Finished with last pack. Time to build!" );
                } 
            }  
        }
        
    });

    // Client relies on the server with the current setup (subject to change) to
    // get their cards passed from the adjacent player
    socket.on('rotatedCardsRequested', (data) => {  // data:  { draftNum, playerNum}
        let thisDraft = activeDrafts[data.draftNum];
        socket.emit('rotatedCards', { cards: thisDraft.getPlayersPack(data.playerNum) } );
    });

    // Client has requested the next pack to open and draft
    socket.on('nextPackRequested', (data) => {      // { draftNum, playerNum }
        socket.emit('nextPack', { pack: createPack(), packNum: activeDrafts[data.draftNum].getPackNumber() } );
    }); 

    //////////////////// BUILD EVENTS ////////////////////

    // Client has assembled their deck and can get pairing info
    socket.on('deckAssembled', (data) => {      // { draftNum, playerNum, theDeck }
        let thisDraft = activeDrafts[data.draftNum];
        // save their decks?
        console.log("received deckAssembled event from player " + data.playerNum + " in draft " + data.draftNum );     
        //thisDraft.setPlayersDeck(data.playerNum, data.theDeck);

        thisDraft.incNumPlayersReady();
        console.log(thisDraft.getNumPlayersReady() + " players ready to start playing");

        // then if allAssembled, or numReady == 8
        if( thisDraft.getNumPlayersReady() === PLAYERS_PER_DRAFT ) {

            thisDraft.stopDraft();      // reset timers to 50:00
            io.to(`draft${data.draftNum}`).emit('resetTimer');

            thisDraft.calcPairings();   // calculate pairings

            thisDraft.resetNumPlayersReady();

            // tell all players to request pairing info
            io.to(`draft${data.draftNum}`).emit('pairingInfoReady');
        }
    });

    //////////////////// TOURNAMENT EVENTS (no pun intended) ////////////////////

    // Client has requested their pairing info for Round 1, or for the first/next round
    socket.on('pairingRequest', (data) => {    // { draftNum, playerNum }
        // look up pairing info
        const thisDraft = activeDrafts[data.draftNum];
        const oppNum = thisDraft.getPairingInfo()[data.playerNum];
        const oppName = thisDraft.getPlayerName(oppNum);

        let matchID;   
        if( data.playerNum > oppNum ) matchID = `${oppNum}v${data.playerNum}`;   // e.g. 5v7 not 7v5
        else matchID = `${data.playerNum}v${oppNum}`;                           // could use ? operator here
        
        // create match "room", e.g. draft0-match5v7
        socket.join(`draft${data.draftNum}-match${matchID}`);         // IS THIS CORRECT?   

        // @TODO: then UN-join for next round after match is over?

        // send back pairing info      e.g. 5v7,                   5 (or 7),            lizardman
        socket.emit('pairingInfo', { match: matchID, opponentNum:  oppNum, opponentName: oppName } );
    })

    // Client has recevied their pairing info and is ready to begin the tournament
    socket.on('readyToPlay', (data) => {              // { draftNum, playerNum }
        let thisDraft = activeDrafts[data.draftNum];

        // another player ready
        thisDraft.incNumPlayersReady();
        if(thisDraft.getNumPlayersReady() == PLAYERS_PER_DRAFT) {
            io.to(`draft${data.draftNum}`).emit('beginMatch');
            
            // start round
            thisDraft.startRound();

            // they begin playing

            // reset players ready?
            thisDraft.resetNumPlayersReady();
        }
    })

    socket.on("privateMsg", (data) => {
        console.log("private message received: " + data.msg);
        console.log("passing along to your opponent in match " + data.ourMatchID);
        //socket.to(`${data.theID}`).emit("privateMsg", { theID: socket.id, msg: data.msg} );
        // socket.to("match0v1").emit("privateMsg", {msg: data.msg} );
        socket.to(`draft${data.ourDraftID}-match${data.ourMatchID}`).emit("privateMsg", {msg: data.msg} );
    });   // e.g. "draft2-match5v7"

    

    socket.on("nextPhase", (data) => {    // ourDraftID, ourMatchID       ...phase, e.g. "draw" or "main1" or "combat"
        socket.to(`draft${data.ourDraftID}-match${data.ourMatchID}`).emit("nextPhase");
    });

    socket.on("handRevealed", (data) => {
        socket.to(`draft${data.ourDraftID}-match${data.ourMatchID}`).emit("handRevealed", {theirHand: data.hand} );
    });

    socket.on("resigns", (data) => {    // draftID, playerID, oppID
        // I resign, my opponent wins this game

        let thisDraft = activeDrafts[data.draftID];

        // Record the game result for both players, perhaps match result too if 0-2
        let result = thisDraft.players[oppID].addGameResult( 1 );
        thisDraft.players[playerID].addGameResult( 0 );

        socket.emit("youResigned");
        
        if(result == 0)  // play another 
            socket.to(`draft${data.ourDraftID}-match${data.ourMatchID}`).emit("nextGame");
        else 
            socket.to(`draft${data.ourDraftID}-match${data.ourMatchID}`).emit("matchDone");
    });

    socket.on("draw", (data) => {                       // @TODO:  DRY this out!
        let thisDraft = activeDrafts[data.draftID];

        // Record the game result for both players
        let result = thisDraft.players[oppID].addGameResult( 0.5 );
        thisDraft.players[playerID].addGameResult( 0.5 );

        if(result == 0)
            socket.to(`draft${data.ourDraftID}-match${data.ourMatchID}`).emit("nextGame");
        else 
            socket.to(`draft${data.ourDraftID}-match${data.ourMatchID}`).emit("matchDone"); 
        
    })

    socket.on("leavesMatch", (data) => {
        socket.leave(`draft${data.ourDraftID}-match${data.ourMatchID}`);
    });



    //////////////////// OTHER EVENTS ////////////////////

    // when user requests info/image for a card
    socket.on('cardSearchRequest', (data) => {
        let myCard;
        let cardInfo;                               // @TODO:  FIX "UNDEFINED" COST for LANDS
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
        // playersJoined.splice( playersJoined.indexOf( socket.id ), 2);    // Probably not necessary unless user changes mind right away
        socket.broadcast.emit('userCount', {numUsers: currentNumUsers} );  // Give updated count to everyone ELSE
        // socket.broadcast.emit('listData', {players: playersJoined} );
    });
});


// Notes:
//  const userId = await fetchUserId(socket);       userId the same for all devices/tabs ??
//  socket.join(userId);

//  // and then later
//  io.to(userId).emit("hi");

// io.to("match0v4").to("match1v3").to("match2v6").emit('timeUpdate');  // for notifying multiple matches but not all
// socket.to("match5v7").emit('eventForPlayersOpponent');    // notifies all in room EXCEPT the sender (this socket)
// socket.leave("match5v7");

// socket.rooms will/should contain all rooms joined 