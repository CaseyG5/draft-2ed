
let bad = [598, 602, 605, 607, 609, 614, 615, 618, 619, 620, 624, 625, 628, 636, 638, 639, 640, 641, 643, 644, // A
           646, 650, 653, 654, 656, 662, 663, 666, 667, 674, 677, 686,                                  // B
           693, 702, 705, 706, 708, 713, 715, 716, 721, 723, 726, 727, 733, 734, 735,                   // U
           747, 748, 749, 757, 758, 759, 760, 762, 764, 771, 773, 774, 775, 778,                        // G
           783, 784, 787, 788, 796, 799, 803, 805, 807, 808, 810, 812, 816, 820, 821, 822, 823,         // R
           829, 833, 834, 836, 837, 838, 839, 840, 842, 843, 844, 845, 848, 849, 850, 852, 855, 860, 861, 873]; // W

// Decent?:  611, 731, 813, 831, 868, 871

let great = [600, 621, 623, 634, 637, 
             651, 665, 668, 672, 683, 684, 687, 688,
             692, 696, 699, 709, 717, 719, 720, 
             738, 741, 744, 750, 753, 765, 767,
             785, 791, 794, 806, 824, 828,
             867, 869, 874];

// Takes a bunch of cards and 
// our chosen colors so far
// as params, then
// Returns an object with card # and card color
function pickCard( pack, ourColors = '' ) {
    //let choices = [];
    let yeses = [];
    let maybes = [];
   
    // if 
    if( pack.length == 1 ) return { "cardNum": pack[0], "cardColor": 'X' };

    // for( let cardNum of pack ) {
    //     choices.push( 0 );
    // }

    // A Choice of No is -1, Maybe is 0, Yes is 1

    // for each card in the pack, rule it out or refine our selection
    for( let i = 0; i < pack.length; i++ ) {
        // if basic land
        if( pack[i] > 874 && pack[i] < 900) {   // won't take any duals this way  @TODO: update
            //choices[i] = -1;    // No
            continue;
        }
        // else if bad-listed
        else if( bad.includes( pack[i], 0 ) ) {
            //choices[i] = -1;    // No
            continue;
        }
        // else if would be 4th deck color
        else if( ourColors.length == 3  &&  !ourColors.includes( checkColor( pack[i] ), 0) ) {
            //choices[i] = -1;    // No
            continue;
        }
        // else if great-listed and one of our colors
        else if( great.includes( pack[i], 0) ) {
            //choices[i] = 1;     // Yes
            yeses.push( pack[i] );
        }
        else {
            // choices[i] = 0;    // Maybe
            maybes.push( pack[i] );
        }
    }

    let yesesAndMaybes = [ ...yeses, ...maybes ];

    // pick from Yeses AND Maybes
    for( let card of yesesAndMaybes) {
        let cardColor = checkColor( card );
        // if this card's color is the same as one of the colors we've chosen...
        if ( ourColors.length < 4  &&  ourColors.includes(  cardColor, 0)  ) 
            return {"cardNum": card, "cardColor": cardColor};           // then take it
    }

    // otherwise, take the first "maybe" if there are any
    if(maybes.length) return {"cardNum": maybes[0], "cardColor": 'X'};
    
    // otherwise pick a random card
    // @TOTO: or the card/creature with the lowest CMC
    // or the creature with CMC <= avg(power, toughness)
    let rand = Math.floor( Math.random() * pack.length );
    return {"cardNum": pack[rand], "cardColor": 'X'};
}



function checkColor( cardNum ) {
    if( cardNum > 645 &&  cardNum < 691) return 'B';
    else if( cardNum > 690 && cardNum < 737) return 'U';
    else if( cardNum > 736 && cardNum < 783) return 'G';
    else if( cardNum > 784 && cardNum < 829) return 'R';
    else if( cardNum > 829 && cardNum < 875) return 'W';
    else return 'A';   // cardNum > 597  &&  cardNum < 644
}