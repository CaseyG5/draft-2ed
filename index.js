import Tournament from './classes';
const { createPack } = require('./createpack');

// Global constants
const PORT = 29170;

// Global variables
let cards;
let draftNumber = 0;        // @TODO: save next draft # to file in case server goes down
let activeDrafts = [];      // @TODO: have a way to halt joining after current sign-up for server maint.
let currentNumUsers = 0;
let playersJoined = [];   // id, name, id, name, ... , id, name


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
            socket.emit('playerJoinOK', {draftNum: draftNumber} );      
            socket.broadcast.emit('newPlayerJoined', {players: playersJoined} )
        }

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
        playersJoined.splice( playersJoined.indexOf( socket.id ), 2);
        socket.broadcast.emit('userCount', {numUsers: currentNumUsers} );
        socket.broadcast.emit('listData', {players: playersJoined} );
    });
});


