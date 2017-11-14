// This function combines first and last names, adds doctor
// and removes periods if there are any in the name
// changes all to lower case

// WE NEED to also add a routine that adds name without the middle initial
// THIS ROUTINE ALSO creates the correct START TIME and END TIMES

var jsonfile = require('jsonfile');
var originalData = require('./sessions111417.json');
var newData = originalData;



console.log(originalData.length,' records');

var i= 0;
var fullName = "";

combineEm((newData)=>{
    console.log(newData.length, ' records after combine');
    times(newData,(adjustedTimes)=>{
        console.log(adjustedTimes.length);
        fixLocation(adjustedTimes, (goodLocations)=>{
            saveIt(goodLocations, (savedData)=> {
            console.log(savedData);
            });

        })

     })
})

// ******************************************************************************
function fixLocation(adjustedTimes, callback){
    i=0;
    var newLocation = "";
    console.log('adjusted location: ',adjustedTimes[0].sessionLocation);
    while(i < adjustedTimes.length) {
        newLocation = adjustedTimes[i].sessionLocation;
        newLocation = newLocation.replace(/-/g, "\,");
        adjustedTimes[i].sessionLocation = newLocation;

    i++;

    }
    callback(adjustedTimes);
}

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

// ******************************************************************************
function times(newData, callback){

    i=0;
    var theDay = new Date();
    var theStartAmPm = "Nothing";
    var theEndAmPm = "Nothing";
    var theStartHour = 0;
    var theStartMinutes = 0;
    var theEndHour = 0;
    var theEndMinutes = 0;
    var theStartTime = "";
    var theEndTime = "";

    while(i < newData.length) {
        
        theDay = new Date(newData[i].sessionStartTime);
        theEndDay = new Date(newData[i].sessionEndTime);
        
        theStartHour = theDay.getHours();
        theStartMinutes = theDay.getMinutes();

        theEndHour = theEndDay.getHours();
        theEndMinutes = theEndDay.getMinutes();
        
        // Starting Time
        if(theStartHour > 11 && theStartHour != 12){
            theStartHour = theStartHour-12;
            theStartAmPm = "PM";
           // console.log(theHour,theAmPm);
        } 
            
            else if(theStartHour == 12){
            theStartAmPm = "PM";
            //console.log(theHour,theAmPm);
            } 
            
            else if(theStartHour <= 11) {
                theStartAmPm = "AM";
                //console.log(theHour,theAmPm);
            }
            if(theStartMinutes==0){
                theStartMinutes="00";
            }
            theStartTime = theStartHour+":"+theStartMinutes+" "+theStartAmPm;

        // Ending Time
        if(theEndHour > 11 && theEndHour != 12){
            theEndHour = theEndHour-12;
            theEndAmPm = "PM";
           // console.log(theHour,theAmPm);
        } 
            
            else if(theEndHour == 12){
            theEndAmPm = "PM";
            //console.log(theHour,theAmPm);
            } 
            
            else if(theEndHour <= 11) {
                theEndAmPm = "AM";
                //console.log(theHour,theAmPm);
            }  
            
            if(theEndMinutes==0){
            theEndMinutes="00";
            }
            theEndTime = theEndHour+":"+theEndMinutes+" "+theEndAmPm; 

            newData[i].startTime = theStartTime;
            newData[i].endTime = theEndTime;

        i++
    }
    
    callback(newData);
}