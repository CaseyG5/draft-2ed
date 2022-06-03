import Timer from './public/timer.js';

// Basic Player class
class BasicPlayer {
    constructor(name, id) {
        this.name = name;
        this.id = id;
        this.gamesWon = 0;
        this.gamesPlayed = 0;
    }

    rollDice() {
        let die1 = Math.floor(Math.random() * 6) + 1;
        let die2 = Math.floor(Math.random() * 6) + 1;
        console.log(`Player ${this.name} rolls a ${die1} and a ${die2} = ${die1 + die2}`);
        return die1 + die2;
    }

    addRoundScore(won, played) {
        this.gamesWon += won;
        this.gamesPlayed += played;
    }

    calcGWP() {
        if(this.gamesWon == 0 || this.gamesPlayed == 0) return 0;
        return this.gamesWon / this.gamesPlayed;    // @TODO: format to 2 or 3 decimal points
    }
}

// Pairing class for matches/rounds (2-3 games)
class Pairing {
    // players: array[2] of Player
    // whosTurn: Player.getName()
    // turnCount: number
    // stack: array of Card
    // chatLog: string
    // endOfRoundTurn: number
    // matchResult: array[2] of number
    constructor(player1, player2) {
       this.player1 = player1;
       this.player2 = player2;
       this.whosTurn = "";      // @TODO: start with highest dice roll and then "toggle"
       this.turnCount = 0;
       this.turnEOR = 0;  // if time's up
       //this.stack = [];         // for spells on the stack
       this.chatLog = "";
       this.matchResult = [];  // e.g. [1,0] for win or [0.5, 0.5] for draw
    }
}

// Draft Tournament
export default class Tournament {
    // tournamentID : number
    // allPlayers: array[8] of Player or username     // can use array[2] for testing
    // pairingsRound1: array[4] of Pairing (players randomized)
    // pairingsRound2: array[4] of Pairing (players sorted by GW%)
    // pairingsRound3: array[4] of Pairing (players sorted)
    // startTime
    // countDownTimer
    // roundNumber
    // endTime
    constructor( id, players ) {  // players here is an array of player names
        this.id = id;
        this.players = [];
        for(let p = 0; p < players.length; p++ ) {      // translate each name into a BasicPlayer object 
            this.players.push( new BasicPlayer(players[p], p) );    // which contains the player's name and their ID
        }
        this.timer = new Timer(30,0);   // set for 30 min?  (10 min / pack)
        this.currentPack = 1;
        this.theirPacks = [ [], [] ];
        this.playersReadyToPass = 0;
        this.pairings = [0,0,0,0,0,0,0,0];    // e.g. [4, 6, 3, 2, 0, 7, 1, 5]  after pairings
        this.results = [0,0,0,0,0,0,0,0]        // index is: player's ID, and value is: games won this match
        this.startTime;     // Date
        this.round = 1;
        this.endTime;       // Date
    }

    setupDisplay( displayFunc ) {  this.timer.setDisplayFunc( displayFunc );  }

    startDraft() {
        // record start time
        this.startTime = Date.now();
        // start timer 
        this.timer.start();
    }

    stopDraft() {
        this.timer.stop();
        this.timer.reset(50, 0);
    }

    getCurrentTime() {  return this.timer.getTime();  }

    getNumPlayersReady() {  return this.playersReadyToPass;  }

    incNumPlayersReady() {  this.playersReadyToPass++;  }

    resetNumPlayersReady() {  this.playersReadyToPass = 0;  }

    // @TODO:  Use 2 for loops instead, if that's more efficient
    rotatePacks() {    // 'left' for clock-wise; 'right' for CCW            
        let p = 0;                                                  //      8  1
        let temp = this.theirPacks[0];                              //    7      2
                                                                    //    6      3
        if(this.currentPack === 2) {    // Rotate R (CCW)                   5  4
            for( ; p < this.players.length - 1; p++ ) {
                this.theirPacks[p] = this.theirPacks[p+1];
            }
            this.theirPacks[p] = temp;

        } else {                        // currentPack is 1 or 3.  Rotate L (CW)
            let q = this.players.length - 1
            
            for( let i=0; i<this.players.length - 1; i++ ) {
                this.theirPacks[p] = this.theirPacks[q];
                p = q;
                q--;
            }
            this.theirPacks[p] = temp;
        }
    }

    getPlayersPack( playerId ) {  return this.theirPacks[playerId];  }  // return array of card #s
    
    setPlayersPack( playerId, pack ) {  this.theirPacks[playerId] = pack;  }

    incPackNumber() {  this.currentPack++;  }

    getPackNumber() {  return this.currentPack;  }

    // Methods for 3-round tournament, round-robin
    randomizePlayers() {
        if(this.players.length < 3) return;   // if only 2 players, no randomizing needed

        let random1;
        let random2;
        let temp = 0;
                                        // @TODO: needs testing
        for(let i = 0; i < 2*this.players.length; i++) {
            random1 = Math.floor(Math.random() * this.players.length);
            random2 = Math.floor(Math.random() * this.players.length);

            // random swap
            temp = this.players[random1];
            this.players[random1] = this.players[random2];
            this.players[random2] = temp;
        }
    }

    calcPairings() {
        if(this.round = 1) this.randomizePlayers();                      // shuffle player order...OR
        else this.players.sort( (a, b) =>  a.calcGWP() > b.calcGWP() );  // sort by GWP in descending order

        for(let i = 0; i < this.players.length; i += 2 ) {
            this.pairings[ this.players[i].id ] = this.players[i+1].id ;    // e.g. pairings[7] = 5
            this.pairings[ this.players[i+1].id ] = this.players[i].id ;    // and  pairings[5] = 7
        }
        // Then we end up with an array "pairings" whose index is player id and value is opponent's id

        //      For more complex Pairing object later
        // pairings.push( new Pairing(players[0], players[1]) );           // pairing 0: players 0 & 1,
        // pairings.push( new Pairing(players[2], players[3]) );           // pairing 1: players 2 & 3, 
        // pairings.push( new Pairing(players[4], players[5]) );           // etc.
        // pairings.push( new Pairing(players[6], players[7]) );
    }

    getPairingInfo() {  return this.pairings;  }

    getPlayerName(theirID) {  return this.players[theirID].name;  }

    startRound() {
        // after players get situated lol
        // and play screen loads with data
        // and server signals to begin match too
  
        // start timer
        this.timer.start();     
        
        // @TODO: Send timer data periodically
    }

    completeRound() {
        // if round timer has ended...
        
            // Are any matches still in progress?
            // If yes, current turn = Turn 0  for those pairings
            // Wait for those matches to finish

         // (all matches have finished)
        if( this.timer.timeLeft() )  this.timer.stop();     // stop timer
        
        // inc round#
        this.round++;
        //proceed to next round
        // if round > 3  then end tournament and calc results table, showStandings()
        // else calc pairings and proceed to next round
            
            // clear pairings not needed, they'll be overwritten
            this.calcPairings();
    }

    // for when round = 3 and the final match has ended
    endTournament() {
        this.timer.stop();
        this.endTime = Date.now();
        // @TODO: what else?
    }

    showStandings() {
        // sort this.players by points and stats which determine place
    }
}