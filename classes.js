import Timer from './timer';


// Card class
class Card {
    // name : string
    // castingCost: { colorless: number, 
                   // white: number, 
                   // blue: number, 
                   // black: number,
                   // red: number,
                   // green: number  }
    // type: string        // e.g. artifact, creature, enchantment, enchant T, instant, land, sorcery
    
    // rulesText: string
    // flavorText: string
    // owner: Player?
    // controller: Player?
    // set: string

    constructor(name, cost, type, rulesText, flavorText = "") {
        this.name = name;
        this.cost = cost;
        this.type = type;
        this.rulesText = rulesText;
        this.flavorText = flavorText;
        //console.log(`Card "${this.name}" created`);
    }

    constructor(cardData) {
        this.id = cardData["multiverseid"];
        this.name = cardData["name"];
        this.cost = cardData["manaCost"];
        this.rulesText = cardData["text"];
    }

    getCostAsString() {
        if(this.type == "Land") return "";
        if(this.type == "Artifact") return this.cost[0];

        let costAsString = "";

        if(this.cost[0] > 0) costAsString += this.cost[0];
        for(let w=0; w < this.cost[1]; w++) costAsString += "W";
        for(let u=0; u < this.cost[2]; u++) costAsString += "U";  
        for(let b=0; b < this.cost[3]; b++) costAsString += "B"; 
        for(let r=0; r < this.cost[4]; r++) costAsString += "R";
        for(let g=0; g < this.cost[5]; g++) costAsString += "G";

        return costAsString;
    }

    showInfo() {
        alert(`${this.name}             ${this.getCostAsString()}

${this.type}
        
${this.rulesText}
        
${this.flavorText}`);
    }
}

class Creature extends Card {
    // power: number
    // toughness: number
    constructor(name, cost, rulesText, power, toughness, creatureType, flavorText = "", type = "Creature") {
        super(name, cost, type, rulesText, flavorText);
        this.power = power;
        this.toughness = toughness;
        this.creatureType = creatureType;
    }

    showInfo() {
        alert(`${this.name}             ${this.getCostAsString()}

${this.type} — ${this.creatureType}
        
${this.rulesText}
        
${this.flavorText}

                                        ${this.power} / ${this.toughness}`);
    }

}

class Artifact extends Card {
    constructor(name, cost, rulesText, flavorText, type = "Artifact") {
        super(name, cost, type, rulesText, flavorText);
    }

    getCostAsString() {
        return this.cost[0];
    }
}

class Land extends Card {
    constructor(name, cost, rulesText, flavorText, type = "Land") {
        super(name, cost, type, rulesText, flavorText);
    }

    getCostAsString() {
        return "";
    }
}


// Deck class
// (Formal and not needed until later)

// class Deck {
        // deckName : String
//     // cards : array of Card
//     // owner?  : Player.name

//     constructor(name) {
//        this.deckName = name;
//        cardsInDeck = [];
//     }

//     addCard(nameOfCard) {
//        ensure there's not 4 of that card already
//        if( isCardInDeck(nameOfCard) == 4 ) {
//            return;
//        }
//        let cardData = this.getCardData(nameOfCard);
//        this.cards.push(new Card(cardData));
//     }

//     removeCard(nameOfCard) {
//        check to make sure there's at least 1 to remove
//        if( isCardInDeck(nameOfCard) == 0 ) return;

//        // proceed to removal  
//     }

//     shuffle() {

//     }

//     isCardInDeck(nameOfCard) {
           // return qty present
//     }
// }

class User {
    // userName
    // emailAddress
    // pwHash
    // ipAddress
    // sessionID
    // totalGWPerc
    // totalMWPerc

    // new user account
    constructor(userName, emailAddress, password, ipAddr, sessionID) {
        this.userName = userName;
        this.emailAddress = emailAddress;
        this.pwHash = pwHashFunc(password);
        this.ipAddress = ipAddr;
        this.sessionID = sessionID;
        this.totalGWPerc = 0;
        this.totalMWPerc = 0;
    }

    pwHashFunc(pw) {
        // return securePasswordHashFunction( pw );
    }

    logIn(password) {
        
        if( this.pwHashFunc(password) === this.pwHash) {
            // log them in
        }
        // else display error message
    }

    editProfile() {

    }
}

// Basic Player class
class BasicPlayer {
    constructor(name, id) {
        this.name = name;
        this.id = id;
        this.gamesWon = 0;
        this.gamesPlayed = 0;
    }

    addRoundScore(won, played) {
        this.gamesWon += won;
        this.gamesPlayed += played;
    }

    calcGWP() {
        if(this.gamesWon == 0 || this.gamesPlayed == 0) return 0;
        return this.gamesWon / this.gamesPlayed;
    }
}

// Player class
class Player {
    // playerName: string
    // ipAddress: string
    // cardsInDeck: array of Card

    // lifeTotal: number
    // cardsInLibrary: array of Card
    // cardsInHand: array of Card
    // cardsToResolve: array of Card
    // cardsInPlay: array of Card
    // cardsInGraveyard: array of Card
    // manaPool: array[6] of number

    // gamesWon
    // gamesLost
    // gamesDrawn
    // matchesWon
    // matchesLost
    // matchesDrawn
    // matchPointsThisTourney
    // currentStanding

    constructor(name, ipAddr) {
        this.name = name;
        this.ipAddr = ipAddr;
        this.lifeTotal = 20;
        this.cardsInDeck = [];
        this.cardsInLibrary = [];
        this.cardsInHand = [];
        this.cardsToResolve = [];
        this.cardsInPlay = [];
        this.cardsInGraveyard = [];
        this.manaPool = [0,0,0,0,0,0];
    }

    /* actions:
    add card to deck        !
    get player's name       !
    shuffle deck            !
    roll dice               !
    draw card               !
    play card to stack
    move card from stack to battlefield
    move card from stack/battlefield to graveyard
    look through library    !
    tap/untap card          !
    untap all
    inc/dec life total
    proceed to next phase   !
    attack
    discard (move card directly to GY)
    resign                  !
    */
}

// Pairing class for matches/rounds (2-3 games)
class Pairing {
    // players: array[2] of Player
    // whosTurn: Player.getName()
    // turnCount: number
    // stack: array of Card
    // chatLog: string
    // endOfRoundTurn: number
    // matchResult: array[2] of number, e.g. [1,0] for win or [0.5, 0.5] for draw
    constructor(player1, player2) {
       this.player1 = player1;
       this.player2 = player2;
       this.whosTurn = "";
       this.turnCount = 0;
       this.turnEOR = 0;  // if time's up
       this.stack = [];
       this.chatLog = "";
       this.matchResult = [];
    }
}

// Draft Tournament
class Tournament {
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
        for(let p=0; p < players.length; p++ ) {      // translate each name into a BasicPlayer object which contains the name
            this.players.push( new BasicPlayer(players[i], i) );
        }
        this.currentPack = 1;
        this.theirPacks = [];
        this.playersReadyToPass = 0;
        this.pairings = [];
        // this.pairingsRound2 = [];
        // this.pairingsRound3 = [];
        this.timer = new Timer(30,0);   // set for 30 min?  (10 min / pack)
        this.startTime;     // Date
        this.round = 1;
        this.endTime;       // Date
    }

    startDraft() {
        // record start time
        this.startTime = Date.now();
        // start timer 
        this.timer.start();
    }

    getCurrentTime() {
        return this.timer.getTime();
    }

    getNumPlayersReady() {
        return this.playersReadyToPass;
    }

    incNumPlayersReady() {
        this.playersReadyToPass++;
    }

    resetNumPlayersReady() {
        this.playersReadyToPass = 0;
    }

    // @TODO:  Use 2 for loops instead, if that's more efficient
    rotatePacks() {    // 'left' for clock-wise; 'right' for CCW            8  1
        let temp = this.theirPacks[0];                              //    7      2
                                                                    //    6      3
        if(this.currentPack === 2) {    // Rotate R (CCW)                   5  4
            this.theirPacks[0] = this.theirPacks[1];
            this.theirPacks[1] = this.theirPacks[2];
            this.theirPacks[2] = this.theirPacks[3];
            this.theirPacks[3] = this.theirPacks[4];
            this.theirPacks[4] = this.theirPacks[5];
            this.theirPacks[5] = this.theirPacks[6];
            this.theirPacks[6] = this.theirPacks[7];
            this.theirPacks[7] = temp;
        } else {                        // currentPack is 1 or 3.  Rotate L (CW)
            this.theirPacks[0] = this.theirPacks[7];
            this.theirPacks[7] = this.theirPacks[6];
            this.theirPacks[6] = this.theirPacks[5];
            this.theirPacks[5] = this.theirPacks[4];
            this.theirPacks[4] = this.theirPacks[3];
            this.theirPacks[3] = this.theirPacks[2];
            this.theirPacks[2] = this.theirPacks[1];
            this.theirPacks[1] = temp;
        }
    }

    // Methods for 3-round tournament, round-robin
    randomizePlayers() {
        let random1;
        let random2;
        let temp = 0;

        for(let i = 0; i < 16; i++) {
            random1 = Math.floor(Math.random() * 8);
            random2 = Math.floor(Math.random() * 8);

            // random swap
            temp = players[random1];
            players[random1] = players[random2];
            players[random2] = temp;
        }
    }

    calcPairings() {
        if(this.round = 1) this.randomizePlayers();                     
        else this.players.sort( (a, b) =>  a.calcGWP() > b.calcGWP() );  // sort by GWP in descending order
        pairings.push( new Pairing(players[0], players[1]) );           // players 1 & 2,
        pairings.push( new Pairing(players[2], players[3]) );           // players 3 & 4, 
        pairings.push( new Pairing(players[4], players[5]) );           // etc.
        pairings.push( new Pairing(players[6], players[7]) );
    }

    startTournament() {
        
        // handle pairings for 1st round
        this.pairingsRound1 = randomizePlayers();

        // (players get situated lol)
        // i.e. play screen loads with data

        this.startRound();
    }

    startRound() {
        // reset timer for 1st round
        this.timer.reset(50, 0);
        // send timer reset to clients in draft group

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
            
            this.pairings.length = 0;   //clear pairings
            calcPairings()
    }



    // for when round = 3 and the final match has ended
    endTournament() {
        this.endTime = Date.now();
        // @TODO: what else?
    }

    showStandings() {
        // sort this.players by points and stats which determine place
    }
}




// EARLY TESTING of CARD class

// let timeWalk = new Card("Time Walk", [1,0,1,0,0,0], "Sorcery",
//                         "Take an extra turn after this one.");
// let ugSea = new Land("Underground Sea", [0,0,0,0,0,0], 
//                      "Tap to add either 1 Blue or 1 Black mana to your mana pool.");
// let moxSapph = new Artifact("Mox Sapphire", [0,0,0,0,0,0,], 
//                             "Tap to add 1 Blue mana to your mana pool.\nTapping this artifact can be played as an interrupt.");
// let ancestralRecall = new Card("Ancestral Recall", [0,0,1,0,0,0], 
//                                 "Instant", "Target player draws 3 cards.");
// let counterSpell = new Card("Counterspell", [0,0,2,0,0,0], 
//                                 "Instant", "Counter target spell.");
// let birds = new Creature("Birds of Paradise", [0,0,0,0,0,1],
//                             "Tap to add one mana of any color to your mana pool.", 0, 1, "Birds");
// let swampKing = new Creature("Sol'Kanar, The Swamp King", [2,0,1,1,1,0],
//                         "Swampwalk\nWhenever a player casts a black spell, you gain 1 life.", 5, 5, "Demon", "", "Legendary Creature");                

// ugSea.showInfo();
// moxSapph.showInfo();
// ancestralRecall.showInfo();
// counterSpell.showInfo();
// birds.showInfo();
// timeWalk.showInfo();
// swampKing.showInfo();



// One idea for card data organization

// let unlSetfromJSON = { cardName: {cardData}, cardName2: {cardData2} }
// read array of objects "cards", for each object, grab name and data and add the name/data as
// another key/value pair like above