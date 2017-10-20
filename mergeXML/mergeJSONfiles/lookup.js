// This script ADDS the PERSON ID to the SESSION Record
// and then ADDS the names to the record!

var sessions = require('./codebeautify_SESSIONS.js');
var roles = require('./codebeautify_ROLE.js');
var person = require('./codebeautify_PERSON.js');
var jsonfile = require('jsonfile'); // saves the object created
var masterFile = require('./data.json'); // this is the file that we created in step 1
var file = './data.json'; // this is where I'm saving to
// For each Person ID, assign a Session
attachPersonIdToSession((response)=>{
   
    attachNamesToMasterFile((response2)=>{
        // Save Routine
            jsonfile.writeFile(file, response2, function (err) {
            if(response){
                console.log('success');
            } else {
            console.error(err) }
        })
        
    });

});


// **********************************************************************************
function attachPersonIdToSession(callback){

var combinedObject = {};
var resultingArray = [];

roles.forEach(function(role){

    sessions.forEach(function(session) {

    if(session.Key_SessionID == role.Entryid){
        // Now save this as a JSON object array
        combinedObject = {
            "sessionId":session.Key_SessionID,
            "sessionTitle": session.SessionTitle,
            "sessionStartTime":session.StartTime,
            "sessionEndTime": session.EndTime,
            "sessionPerson": role.PersonID
        }
        resultingArray.push(combinedObject);
        //console.log(resultingArray.length);
        //console.log(combinedObject);
        
        
        }
    });
});

callback(resultingArray);

}

// **********************************************************************************
function attachNamesToMasterFile(callback){
    
    var combinedObject = {};
    var resultingArray = [];

    masterFile.forEach(function(master){

    person.forEach(function(peep) {

    if(master.sessionPerson == peep.Key_PersonID){
        // Now save this as a JSON object array
        master.firstName = peep.FirstName;
        master.lastName = peep.LastName;
        //console.log(resultingArray.length);
        //console.log(combinedObject);
        
        
        }
    });
});

callback(masterFile);

}


// *************************************************************************************

// I converted the above XMLs to JSON with this service
// https://codebeautify.org/xmltojson

//https://ash.confex.com/ash/2017/sync.cgi/Freeman_Session_Listing.xml
//https://ash.confex.com/ash/2017/sync.cgi/Freeman_Paper_Listing.xml
//https://ash.confex.com/ash/2017/sync.cgi/Freeman_Person.xml
//https://ash.confex.com/ash/2017/sync.cgi/Freeman_Role.xml
//https://ash.confex.com/ash/2017/sync.cgi/Freeman_RoleAddress.xml
//https://ash.confex.com/ash/2017/sync.cgi/Freeman_COI_PersonBased.xml