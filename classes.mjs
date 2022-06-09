import Timer from './server-timer.mjs';

// Basic Player class
class BasicPlayer {
    constructor(name, id) {
        this.name = name;
        this.id = id;
        this.gamesWonThisRound = 0;
        this.gamesPlayedThisRound = 0;
        this.matchPoints = 0;
        this.gamesWonTotal = 0;
        this.gamesPlayedTotal = 0;
    }

    rollDice() {
        let die1 = this.randomInt(6) + 1;
        let die2 = this.randomInt(6) + 1;
        console.log(`Player ${this.name} rolls a ${die1} and a ${die2} = ${die1 + die2}`);
        return die1 + die2;
    }

    addGameResult( gamePoint ) {  // 0, 0.5, or 1  
        this.gamesWonThisRound += gamePoint;  // @TODO: what about draws!
        this.gamesPlayedThisRound++;
        let wantAnotherGame = false;
                                            
        if(this.gamesWonThisRound == 2) 
            this.matchPoints += 3;               // match over, this player wins their match

        else if(this.gamesWonThisRound == 1.5 && this.gamesPlayedThisRound == 3) 
            this.matchPoints += 1;               // match over, draw

        else if( (this.gamesWonThisRound >= 0.5 && this.gamesPlayedThisRound < 3) || 
                 (this.gamesWonThisRound == 0   && this.gamesPlayedThisRound == 1) )  
            wantAnotherGame = true;         // "play another game"
        
        // else 1 or 2 games could have been played but we only have 0.5 point or 1 point
        // else 1 game played but we lost (0 - 1)
        // else 0-2, loss, match over     
        
        // @TODO:  idea to refactor logic using fractions, e.g. for games played 1, 2, or 3, check ratio
        // like 1/2 or 1.5/2 needs a third game... but 2/3 or 2/2 has won... likewise 1/3 or 0/2 has lost
        
        return wantAnotherGame;                      
    }

    addRoundScore() {
        this.gamesWonTotal += this.gamesWonThisRound;
        this.gamesPlayedTotal += this.gamesPlayedThisRound;
        this.gamesWonThisRound = 0;                     // reset for next round
        this.gamesPlayedThisRound = 0;
    }

    forfeitMatch() {
        let result = this.addGameResult(0);                    // add game losses
        while(result) {  result = this.addGameResult(0);  }    // until match is lost
    }

    autoWinMatch() {
        let result = this.addGameResult(1);                    // add game wins
        while(result) {  result = this.addGameResult(1);  }    // until match is won
    }

    calcGWP() {
        if(this.gamesWonTotal == 0) return 0;
        return this.gamesWonTotal / this.gamesPlayedTotal;    
    }
    
    showInfo( lineNum ) {
        console.log(`${lineNum}) ${this.id}  - ${this.name} - ${this.matchPoints}      - ${this.calcGWP().toFixed(2)}`);
    }

    randomInt( max ) {
        return Math.floor(Math.random() * max);  // returns an integer from 0 to max-1
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
        this.playersReady = 0;
        this.pairings = [0,0,0,0,0,0,0,0];    // e.g. [4, 6, 3, 2, 0, 7, 1, 5]  after pairings
        //this.results = [0,0,0,0,0,0,0,0]        // index is: player's ID, and value is: games won this match
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

    getNumPlayersReady() {  return this.playersReady;  }

    incNumPlayersReady() {  this.playersReady++;  }

    resetNumPlayersReady() {  this.playersReady = 0;  }

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
        if( !this.timer.timeLeft() ) {
            // @TODO: if there's NO time left (round timer has ended)...
        
            // Are any matches still in progress?
            // then server will handle this with:  if( thisDraft.getNumPlayersReady() < PLAYERS_PER_DRAFT )
            // @TODO:  current turn = Turn 0  for those still playing
            // Result of that game determines match result and
            // @TODO:  NO more games can be requested
        }

         // (all matches have finished)
        else this.timer.stop();     // stop timer

        this.timer.reset(50,0);

        this.round++;               // inc round# and proceed to next round         
    }

    // for when round = 3 and the final match has ended
    endTournament() {
        this.endTime = Date.now();
        // @TODO: what else?
        this.players.sort( (a, b) =>  a.calcGWP() > b.calcGWP() );
        this.showStandings();
    }

    showStandings() {
        // sort this.players by points and stats which determine place
        console.log(`   id - name     - points - GW % `);
        for(let p = 0; p < players.length; p++ ) { 
            players[p].showInfo(p);    
        }
    }
}