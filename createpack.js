// 113 rares, 95 uncommons, 75 commons, 15 basic lands
const rares = [692, 829, 598, 830, 737, 646, 878, 831, 879, 739, 600, 834, 835, 695, 784, 604, 742, 698, 
    845, 608, 654, 656, 609, 610, 701, 791, 744, 848, 745, 747, 611, 797, 748, 749, 612, 799, 
    800, 614, 615, 617, 854, 620, 622, 624, 757, 666, 760, 761, 762, 707, 667, 708, 709, 807, 
    710, 627, 808, 628, 668, 629, 630, 631, 632, 633, 765, 669, 634, 671, 858, 860, 715, 880, 
    812, 861, 813, 864, 865, 815, 816, 676, 881, 867, 882, 817, 819, 723, 820, 725, 639, 883, 
    640, 727, 772, 642, 728, 729, 884, 885, 824, 886, 775, 732, 870, 733, 887, 686, 781, 828, 
    688, 643, 689, 874, 690];   // excludes "Chaos Orb" and the 3 ante cards, 
                    // "Contract from Below", "Darkpact", and "Demonic Attourney"

const uncommons = [691, 693, 645, 599, 738, 647, 601, 833, 836, 648, 783, 740, 837, 602, 741, 696, 843, 
        605, 697, 844, 606, 699, 607, 650, 653, 657, 786, 787, 789, 660, 702, 793, 796, 613, 
        663, 798, 849, 753, 665, 754, 616, 755, 618, 619, 621, 623, 855, 805, 856, 758, 625, 
        759, 706, 626, 764, 670, 635, 810, 811, 712, 714, 719, 862, 767, 863, 636, 677, 679, 
        680, 868, 681, 722, 637, 638, 726, 821, 869, 771, 641, 774, 823, 825, 734, 685, 776, 
        826, 777, 827, 871, 735, 779, 736, 872, 873, 644];

const commons = [832, 694, 838, 839, 840, 841, 842, 743, 700, 651, 846, 847, 785, 658, 659, 788, 790, 
    792, 661, 794, 795, 703, 746, 662, 750, 751, 801, 752, 850, 851, 802, 852, 853, 664, 803,
    704, 804, 756, 705, 806, 763, 711, 857, 809, 672, 859, 673, 713, 674, 716, 717, 718, 720, 
    675, 814, 766, 866, 678, 768, 721, 769, 818, 682, 724, 822, 770, 683, 773, 730, 684, 731, 
    778, 780, 687, 782];

const basics = [890, 889, 888, 896, 894, 895, 893, 892, 891, 897, 898, 899, 877, 876, 875];

function createPack() {
let cardArray = [];      // the pack to be made
let random;         // random card from pools of R, U, C, B

// Get random slot #s for the 2 basic lands != 5 to prevent consecutive lands
const landPos = Math.floor(Math.random() * 5) ;    // Commons 0 - 4
const landPos2 = Math.floor(Math.random() * 5) + 6;   // Commons 6 - 10

// Push 9 Commons + 2 basic lands to pack
for( let i=0; i < 11; i++) {
// if this current index is a basic land slot, push a land there
if( i == landPos || i == landPos2 ) {
    cardArray.push( basics[ Math.floor(Math.random() * 15) ] );
    continue;
}
                                        //@TODO: SPLIT THIS UP?
// protect against duplicate commons!
random = Math.floor(Math.random() * 75);
// if that common is already present, get another one
while( cardArray.includes( commons[random], 0) ) {
    random = Math.floor(Math.random() * 75);
}
cardArray.push( commons[random] );
}

// Push 1 Rare to pack
random = Math.floor(Math.random() * 113);
cardArray.push( rares[random] );  

// Push 3 Uncommons to pack
for( let i=0; i < 3; i++) {
random = Math.floor(Math.random() * 95);
cardArray.push( uncommons[random] );
}

return cardArray;
}

//////////////////////////////////////////////////////////////////////////