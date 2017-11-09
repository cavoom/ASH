// This function combines first and last names, adds doctor
// and removes periods if there are any in the name
// changes all to lower case

// WE NEED to also add a routine that adds name without the middle initial

var jsonfile = require('jsonfile');
var originalData = require('./sessions110717.json');
var newData = originalData;

var i= 0;
var fullName = "";

combineEm((newData)=>{
    //console.log(newData[0]);
    saveIt(newData,(savedData)=>{
        console.log(savedData);

    });
      
});

// ******************************************************************************
function combineEm(callback){
    while(i < newData.length) {
        var theFirstName = newData[i].firstName;
        if(theFirstName.includes('.')){
            theFirstName = theFirstName.replace(/\./g, " "); // removes periods globally
            newData[i].firstName = theFirstName;
            }
        fullName = "doctor " + newData[i].firstName + " " + newData[i].lastName;
        fullName = fullName.replace("  ", " "); // removes the double spaces
        newData[i].combinedName = fullName.toLowerCase(); // makes it lower case

    i++;

    }
    callback(newData);
}

// ******************************************************************************
function saveIt(newData, callback){

    var file = '../lambda/sessions.json'
    var obj = newData;
 
    jsonfile.writeFile(file, obj, {spaces: 2},function (err) {
        if(err){console.error(err)};
    });
    callback('I saved it');
}