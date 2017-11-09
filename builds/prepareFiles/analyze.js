// 1. this program determines if a keyword is in a string
//      also figures out how many records have keywords
//      and saves them to a file

// 2. create a doctors list

// 3. finds keywords

// 4. figures out how many records start at 00:00


var jsonfile = require('jsonfile'); // for saving to JSON
var sessionData = require('./sessions110717.json');
console.log('total records: '+ sessionData.length);

var a=0;
var wordCounter = 0;
var counter=0;
var theWords = "";
var testWord = "CML"
var item = testWord.toLowerCase();
var hasKeywords = [];
var speakers = [];
var theSpeaker = "";


// Find the word
// while(a<sessionData.length){
//     theWords = sessionData[a].keywords;
//     theWords = theWords.toLowerCase();
//     if(theWords.includes(item)){
//         wordCounter++;
//         console.log(theWords);
//     }
//     a++;
// }

//Find the results with keywords and save
// findEm((results)=>{
//     var file = './haveKeywords.json'
//     var obj = results;
//     jsonfile.writeFile(file, obj, {spaces: 2}, function (err) {
//     console.log(results.length+' have keywords');
//     });

// })

// badStartTime((results)=>{
//     var file = './hasBadStartTime.json'
//     var obj = results;
//     jsonfile.writeFile(file, obj, {spaces: 2}, function (err) {
//     console.log(results.length+' have bad start times');
//     });

// })

    questionableStartTime((results)=>{
    var file = './questionableStartTime.json'
    var obj = results;
    jsonfile.writeFile(file, obj, {spaces: 2}, function (err) {
    console.log(results.length+' have questionable start times');
    });

})



// Find the doctor names and create a doctors item list
// findSpeakers((theSpeakers)=>{
//     var sorted = theSpeakers.sort();
//     removeDupes(sorted,(noDupes)=>{
//         //save it
//         var file = './speakers.json'; // this is the file to save
//         jsonfile.writeFile(file, noDupes, {spaces: 2}, function (err) {
//         console.log(noDupes.length+' speakers found');
//         });

//     })
    


// })

// ************************************************************

function removeDupes(sorted, callback){
    var uniques = [sorted[0]]; // first one is always unique, so just add manually
    var numberRecords = sorted.length;
    i=1;
    
    while (i < numberRecords){
        if(sorted[i] != sorted[i-1]){
            uniques.push(sorted[i]);
        }
            i++;
    }

    callback(uniques);
}

// ************************************************************
function findSpeakers(callback){
while(a<sessionData.length){
    theSpeaker = sessionData[a].combinedName;
    speakers.push(theSpeaker);
    a++;
    } 
    callback(speakers);
}


// ************************************************************
function findEm(callback){
while(a<sessionData.length){

    if(sessionData[a].keywords != "" ){
        hasKeywords.push({
            id: sessionData[a].sessionId,
            title: sessionData[a].sessionTitle,
            keywords: sessionData[a].keywords
            }
            );
    }
    a++;
    } 
callback(hasKeywords);
}

// ************************************************************
function badStartTime(callback){
while(a<sessionData.length){

    if(sessionData[a].startTime == "00:00:00" ){
        hasKeywords.push({
            id: sessionData[a].sessionId,
            title: sessionData[a].sessionTitle,
            sessionStartTime: sessionData[a].sessionStartTime,
            sessionEndTime: sessionData[a].sessionEndTime,
            startTime: sessionData[a].startTime,
            endTime: sessionData[a].endTime,
            sessionLocation: sessionData[a].sessionLocation,
            key: sessionData[a].key_AorB,
            property: sessionData[a].property,
            paperTitle: sessionData[a].papertitle,
            keywords: sessionData[a].keywords,
            
            }
            );
    }
    a++;
    } 
callback(hasKeywords);
}


// ************************************************************
function questionableStartTime(callback){
    var startTime = new Date();
    var sessionStartHour = 7;

while(a<sessionData.length){

    startTime = new Date(sessionData[a].sessionStartTime);
    startTime = startTime.getHours();

    if(startTime < sessionStartHour){
        hasKeywords.push({
            id: sessionData[a].sessionId,
            title: sessionData[a].sessionTitle,
            sessionStartTime: sessionData[a].sessionStartTime,
            sessionEndTime: sessionData[a].sessionEndTime,
            startTime: sessionData[a].startTime,
            endTime: sessionData[a].endTime,
            sessionLocation: sessionData[a].sessionLocation,
            key: sessionData[a].key_AorB,
            property: sessionData[a].property,
            paperTitle: sessionData[a].papertitle,
            keywords: sessionData[a].keywords,
            
            }
            );
    }
    a++;
    } 
callback(hasKeywords);
}
