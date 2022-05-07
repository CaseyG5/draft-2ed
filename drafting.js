
//var fs = require('fs');

// 113 rares, 95 uncommons, 75 commons, 15 basic lands

let rares = [692, 829, 598, 830, 737, 646, 878, 831, 879, 739, 600, 834, 835, 695, 784, 604, 742, 698, 
            845, 608, 654, 656, 609, 610, 701, 791, 744, 848, 745, 747, 611, 797, 748, 749, 612, 799, 
            800, 614, 615, 617, 854, 620, 622, 624, 757, 666, 760, 761, 762, 707, 667, 708, 709, 807, 
            710, 627, 808, 628, 668, 629, 630, 631, 632, 633, 765, 669, 634, 671, 858, 860, 715, 880, 
            812, 861, 813, 864, 865, 815, 816, 676, 881, 867, 882, 817, 819, 723, 820, 725, 639, 883, 
            640, 727, 772, 642, 728, 729, 884, 885, 824, 886, 775, 732, 870, 733, 887, 686, 781, 828, 
            688, 643, 689, 874, 690];

let uncommons = [691, 693, 645, 599, 738, 647, 601, 833, 836, 648, 783, 740, 837, 602, 741, 696, 843, 
                605, 697, 844, 606, 699, 607, 650, 653, 657, 786, 787, 789, 660, 702, 793, 796, 613, 
                663, 798, 849, 753, 665, 754, 616, 755, 618, 619, 621, 623, 855, 805, 856, 758, 625, 
                759, 706, 626, 764, 670, 635, 810, 811, 712, 714, 719, 862, 767, 863, 636, 677, 679, 
                680, 868, 681, 722, 637, 638, 726, 821, 869, 771, 641, 774, 823, 825, 734, 685, 776, 
                826, 777, 827, 871, 735, 779, 736, 872, 873, 644];

let commons = [832, 694, 838, 839, 840, 841, 842, 743, 700, 651, 846, 847, 785, 658, 659, 788, 790, 
            792, 661, 794, 795, 703, 746, 662, 750, 751, 801, 752, 850, 851, 802, 852, 853, 664, 803,
            704, 804, 756, 705, 806, 763, 711, 857, 809, 672, 859, 673, 713, 674, 716, 717, 718, 720, 
            675, 814, 766, 866, 678, 768, 721, 769, 818, 682, 724, 822, 770, 683, 773, 730, 684, 731, 
            778, 780, 687, 782];

let basics = [890, 889, 888, 896, 894, 895, 893, 892, 891, 897, 898, 899, 877, 876, 875];

let pack1 = [];
let random;

// let cardsJSON = JSON.parse( fs.readFileSync('2ED.json', {encoding:'utf-8', flag:'r'}) );
// let cardsInSet = cardsJSON["cards"];

// console.log( cardsInSet[1]["multiverseid"]);
// console.log( cardsInSet[1]["rarity"] );

// for( let card of cardsInSet ) {
//     const id = card["multiverseid"];
//     if( card["rarity"] == "Basic Land" ) {
//             console.log(`${id}, `);
//             rares.push(card);
//     }
// }

let landPos = Math.floor(Math.random() * 4) + 1;    // Commons 1 - 4
let landPos2 = Math.floor(Math.random() * 5) + 6;   // Commons 6 - 10

let btnNext = document.getElementById("next-card");
let imgNum;
let image = document.getElementById("top-card");
let cardsSeen = document.getElementById("cards-seen");

// Push 3 Uncommons to pack
for( let i=0; i < 3; i++) {
    random = Math.floor(Math.random() * 95);
    pack1.push( uncommons[random] );
}
// Push 1 Rare to pack
random = Math.floor(Math.random() * 113);
pack1.push( rares[random] );  

// Push 1 Common that's not a land
random = Math.floor(Math.random() * 75);
pack1.push( commons[random] );

// Push 8 Commons and 2 basics to pack
for( let i=1; i < 11; i++) {
    if( i == landPos || i == landPos2 ) {
        pack1.push( basics[ Math.floor(Math.random() * 15) ] );
        continue;
    } 
    // protect against duplicates!
    random = Math.floor(Math.random() * 75);
    while( pack1.includes( commons[random], 4) ) {
        random = Math.floor(Math.random() * 75);
    }
    pack1.push( commons[random] );
}

// Show 1st card right away
imgNum = pack1.pop();
image.src = `images/${imgNum}.jpeg`;

btnNext.addEventListener( 'click', e => {
    let backing = document.createElement('div');
    let seen = document.createElement('img');
    backing.classList.add('backing');
    seen.classList.add('seen');
    seen.src = `images/${imgNum}.jpeg`;
    seen.style.opacity = "1";
    backing.appendChild(seen);
    cardsSeen.appendChild(backing);
    seen.addEventListener( 'click', e => {
        if(seen.style.opacity == "1") seen.style.opacity = "0.3";
        else seen.style.opacity = "1";
    });
    
    imgNum = pack1.pop();
    image.src = `images/${imgNum}.jpeg`;
    if( pack1.length == 0) {
        btnNext.disabled = true;
        btnNext.innerText = ":-)"
        // allow selection of 1 card and
        // show button to pass the rest
    }
});






//fs.writeFileSync('commons.txt', )








// WORKED!  BUT ONLY NEEDED ONCE!  DON'T USE AGAIN!
// const https = require("https");

// for( let id of idNums ) {
//     const file = fs.createWriteStream(`images/${id}.jpeg`);

//     https.get(`https://gatherer.wizards.com/Handlers/Image.ashx?type=card&multiverseid=${id}`, response => {
//         response.pipe( file );
//     });
// }