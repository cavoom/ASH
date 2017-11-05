var sessionsList = require('./session_json_data.json');
var jsonfile = require('jsonfile');
//console.log(sessionsList.length);
// var jsonfile = require('jsonFile'); // jsonFile save routine is not working when I load into Alexa
// works on the sim just fine


saveIt(sessionsList,(saved)=>{
    console.log(saved);
})

function saveIt(newData, callback){

    var file = './sessions.json'
    var obj = newData;
 
    jsonfile.writeFile(file, obj, {spaces: 2},function (err) {
        if(err){console.error(err)};
    });
    callback('I saved it');
}