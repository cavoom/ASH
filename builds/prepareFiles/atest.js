// this is a test saving file
// I was getting alexa failures when i would create a file
// move to desktop from Code editor
// and then move back into Code Editor
// Instead, we'll write all of the files here


var sessionsList = require('../lambda/session_json_data.json');
var jsonfile = require('jsonfile');

sessionsList[0].combinedName = "David P. Haas";
saveIt(sessionsList,(saved)=>{
    console.log(saved);
    
})

function saveIt(newData, callback){

    var file = '../lambda/sessions2.json';
    var obj = newData;
 
    jsonfile.writeFile(file, obj, {spaces: 2},function (err) {
        if(err){console.error(err)};
    });
    callback('I saved it');
}