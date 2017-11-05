// Create speakers list
// this routine gets the speaker names
// sorts them in alpha order
// removes dupes
// and saves to a file

// Using this site to convert it to a CSV file
// http://www.convertcsv.com/json-to-csv.htm

var jsonfile = require('jsonfile');
var sessions = require('../lambda/sessions.json');
console.log('Number of sessions: ', sessions.length);

var speakers = [];
var theSpeaker = "";
var replaced = "";

getSpeakers((speakerList)=>{
    //sort them
    console.log('Number of speakers: ',speakerList.length);
    sortEm(speakerList,(sorted)=>{
        console.log('Number of sorted: ',sorted.length);
        removem(sorted,(uniques)=>{
            // save them
            console.log('Number of uniques: ',uniques.length);
            replacem(uniques,(replaced)=>{
                console.log('Replaced: ', replaced.length);
                saveEm(replaced,(saved)=>{
                    console.log(saved);
            })
            })

        })

    })
    
});


// GET SPEAKERS
function getSpeakers(callback){
    var a = 0;
    while(a<sessions.length){
        theSpeaker = sessions[a].combinedName;
        theSpeaker = theSpeaker.trim(); // remove white space
        speakers.push(theSpeaker);
        a++;
}
callback(speakers);
}

// SORT: function to sort
function sortEm(result, callback){
    result.sort();
    callback(result)
}

// function save them
function saveEm(obj, callback){
    var file = './speakersList.json'
    //var obj = {name: "Dave"};
    jsonfile.writeFile(file, obj, {spaces: 2},function (err) {
        console.error(err)
    })
    callback('done');
}

// REMOVE FUNCTION
function removem(resultz, callback){
    var uniques = [resultz[0]]; // first one is always unique, so just add manually
    var numberRecords = resultz.length;
    var i=1;
    
    while (i < numberRecords){
        if(resultz[i] != resultz[i-1]){
            uniques.push(resultz[i]);
        }
            i++;
    }

    callback(uniques);
}

// REPLACE PERIODS
 function replacem(uniques, callback){
    var b=0;
    console.log('at replacem and uniques length is', uniques.length);
    while(b<uniques.length){
        replaced = uniques[b];
        if(replaced.includes("  ")){
        uniques[b] = replaced.replace("  "," ");
        //console.log(uniques[b]);
    }
    b++
    }
    callback(uniques);

 }