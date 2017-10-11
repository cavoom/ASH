var hotels = require('./convertcsv.js');
//var object = require('./hotelObject.js');

var i = 0;

var slot = "Ellis Hotel, The";

// APPROACH 1: We have an array to search

while (i<hotels.length){

    if (slot == hotels[i].hotelName){

        console.log(hotels[i].hotelName);
        break;
    } else {
        console.log('Not it');
    }
i++;
}

// APPROACH 2: We have an Object to find

// Super easy -- but Danny needs to lowercase all of this
// and we need to confirm it's not going to change

//console.log(object[slot]);



