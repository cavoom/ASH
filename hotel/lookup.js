var hotels = require('./hotels.js');
var i = 0;
var item = "Courtyard Atlanta Downtown";
var result = "I'm sorry. I couldn't find that hotel.";

findHotel(item, (response)=>{
console.log(response);
    
});

function findHotel(item, callback){
while (i<hotels.length){

    if (item == hotels[i].hotelName){
        result = hotels[i];
        break;
    } 
    i++;
}
callback (result);
}



