'use strict';

var library = require('./recipe.js');
var hotels = require('./hotels.js');
var briefings = require('./briefing.json');
var speakers = require('./speakers.json');
var sessions = require('./sessions.json');
var sessionsFound = 0; // this saves the number of sessions found in search
var sessionsKept = 0; // tells you how many we are going to tell you about

var stringSimilarity = require('string-similarity');
const APP_ID = "amzn1.ask.skill.ae80c58c-95aa-4cd0-855e-6aa2b75ca800";

var helperPhrase = [
    "whens the general session",
    "when does doctor catherine smith speak",
    "whats going on today",
    "find the next session about bone marrow failure",
    "whats in the ash booth",
    "where is the poster hall",
    "where is the ash store",
    "where is the general session",
    "where do i find the shuttle busses",
    "what bus goes to the ellis hotel",
    "where are the taxis",
    "what is going on today",
    "what time does the poster hall open",
    "where can i get some exercise at ash"
];

var stuff = "nada";
var AWS = require("aws-sdk");
var saveIntent = "nada";
var saveItem = "nada";
var params = {};
var stationId = "";
var stuff = "nothing changed" // for test

AWS.config.update({
    region: "us-east-1",
    endpoint: "https://dynamodb.us-east-1.amazonaws.com"
    });

    var docClient = new AWS.DynamoDB.DocumentClient();



exports.handler = function(event,context) {

    try {
    var request  = event.request;
    var session = event.session;

    if(!event.session.attributes){
        event.session.attributes = {};
    }

    if(request.type === "LaunchRequest") {
        stationId = String(Math.floor((Math.random() * 999999999999)));
        saveIntent = "Launch Intent";
        saveItem = "ask ash";

        analytics(stationId, saveIntent, saveItem, (stuff)=>{
            //console.log('the data: ', stuff);
            handleLaunchRequest(context);
            });
            

    } else if(request.type === "IntentRequest") {
        
        if(request.intent.name == "RecipeIntent"){
                stationId = String(Math.floor((Math.random() * 999999999999)));
                saveIntent = "Recipe Intent";
            
                if(request.intent.slots.Item.value){
                    saveItem = request.intent.slots.Item.value; } else {
                        saveItem = "unknown";
                    }

            analytics(stationId, saveIntent, saveItem, (stuff)=>{
                handleRequestIntent(request, context);
            });

        } else if (request.intent.name === "HotelIntent"){
            
                let item = request.intent.slots.Hotels.value;
                let lowerItem = item.toLowerCase();
                saveItem = lowerItem;
                saveIntent = "Hotel Intent";
                stationId = String(Math.floor((Math.random() * 999999999999)));

            analytics(stationId, saveIntent, saveItem, (stuff)=>{
                //console.log('the data: ', stuff);

                findHotel(lowerItem, (response)=>{
                    handleHotelIntent(response, context);
                    });
                });

        } else if (request.intent.name === "BriefingIntent"){
            stationId = String(Math.floor((Math.random() * 999999999999)));
            saveIntent = "Briefing Intent";
            saveItem = "briefing";

            analytics(stationId, saveIntent, saveItem, (stuff)=>{

                findBriefing((response)=>{
                    //console.log('headed to the handle briefing intent yo');
                    handleBriefingIntent(response, context);
                });
            });

    } else if (request.intent.name === "SessionIntent"){
    
                let item = request.intent.slots.Session.value;
                item = item.toLowerCase();

                stationId = String(Math.floor((Math.random() * 999999999999)));
                saveIntent = "Session Intent";
                saveItem = item;

                analytics(stationId, saveIntent, saveItem, (stuff)=>{
            
                findSession(item, (searchResults)=>{
                    //console.log('i found '+searchResults.length+' sessions NOT sorted');
                    sortResult(searchResults,(orderedResponse)=>{
                        //console.log('i found '+orderedResponse.length+' sessions SORTED ');
                        removeOld(orderedResponse,(cleaned)=>{
                            //console.log('i found '+cleaned.length+' sessions CLEANED');
                            handleSessionIntent(cleaned, context);
                        })
                    })
                   
                });
            });

    } else if (request.intent.name === "SpeakerIntent"){
    
                let item = request.intent.slots.Speaker.value;
                item = item.toLowerCase();

                stationId = String(Math.floor((Math.random() * 999999999999)));
                saveIntent = "Speaker Intent";
                saveItem = item;

                analytics(stationId, saveIntent, saveItem, (stuff)=>{

                bestMatch(item,(theBestMatch)=>{
                    //onsole.log(theBestMatch);
                    findSpeaker(theBestMatch, (searchResults)=>{
                        sortResult(searchResults,(orderedResponse)=>{
                            handleSpeakerIntent(orderedResponse, context);
                        }) 
                    })
                });  

                });            
                
    } else if (request.intent.name === "NextIntent"){
        if(session.attributes){
        if(session.attributes.searchResults){
            let searchResults = session.attributes.searchResults;

                stationId = String(Math.floor((Math.random() * 999999999999)));
                saveIntent = "Next Intent";
                saveItem = "next";

                analytics(stationId, saveIntent, saveItem, (stuff)=>{
                    getNext(searchResults,(nextOne)=>{
                        handleNextIntent(nextOne, context);
                        });
                    });
            
        } else {
                // HANDLE SITUATION WHEN SESSION.ATTRIBUTES.SEARCHRESULTS DOESN'T EXIST
                }

        } else {
                handleNextIntent(nextOne, context);

        }

    } else if (request.intent.name === "AMAZON.StopIntent" || request.intent.name === "AMAZON.CancelIntent") {
            handleStopIntent(context);

        } 

    } // ENDS INTENT REQUEST
    
    else if (request.type === "SessionEndedRequest") {
        // added this to handle session end
        handleEndIntent(context);


    } else {
        // we are trying this out
        handleEndIntent(context);
        //handleUnknownIntent(context);
        throw "Unknown Intent";
    }

} catch(e) {
    //context.fail("Exception: "+e);
    context.fail("Sorry. I don't know the answer to that one.")
    //handleEndIntent(context);
    //throw "Unknown Intent";
}
}

// *********************************************************************
function getNext(searchResults,callback){
    console.log('search results length at getNext: ',searchResults.length);
   if(searchResults != "none" && searchResults != "no more results to share"){
   
    if(searchResults.length > 0){
    searchResults.shift();
    }
    callback(searchResults);
} else {
    callback(searchResults);
}
}

// *********************************************************************
function findSpeaker(item, callback){
    //console.log('made it to find speaker. looking for: '+item);
    var i=0;
    var searchResults = [];
    var speaker = "";
    //console.log('sessions length is ', sessions.length);
    //var timeNow = new Date();
    while (i < sessions.length){
        speaker = sessions[i].combinedName;
        speaker = speaker.toLowerCase();
        //var startTime = sessions[i].sessionStartTime;
        //startTime = new Date(startTime);
        //var endTime = sessions[i].sessionEndTime;
        //endTime = new Date(endTime);

        // Get the all inclusive list
        if(speaker.includes(item)){
        //if(title.includes(item) && timeNow >= startTime && timeNow < endTime){
            //console.log(allData[i].sessionLocation+"-"+allData[i].sessionTitle);
            searchResults.push(sessions[i]);
        }

    i++;

}
// ********** STOPPED HERE
// Before you go to findSpeaker, do the bestMatch function and carry with you
// IF searchResults.length = 0
// use bestMatchResults
// Just parallel it here so that you have a bestMatchResults Array to use

callback(searchResults);

}


// *********************************************************************
function sortResult(searchResults, callback){
        if(searchResults.length>0){
        searchResults.sort(function(a, b){
        var dateA=new Date(a.sessionStartTime), dateB=new Date(b.sessionStartTime);
        return dateA-dateB });
        //console.log('at sort and found ',searchResults.length);
        }
        callback(searchResults);
}
// *********************************************************************
function findSession(item, callback){
    //console.log('made it to find session');
    var i=0;
    var searchResults = [];
    var title = "nothingHere";
    var keywords = "nothingHere";

    while (i < sessions.length){
        title = "";
        keywords = "";
        title = sessions[i].sessionTitle;
        title = title.toLowerCase();
        if(sessions[i].keywords){
            keywords = sessions[i].keywords;
            keywords = keywords.toLowerCase();}

        // Get the all inclusive list
        if(title.includes(item) || keywords.includes(item)){
            searchResults.push(sessions[i]);
        }

    i++;

}
//console.log('made it thru');
callback(searchResults);

}
// *********************************************************************
function buildResponse(options) {
    // var size = [];
    // if(options.attributes){
    // size = options.attributes;
    // if(size.length>10){
    //     size.slice(0,2);
    //     console.log('build response is now: ', size.length);
    //     options.attributes = size;
    // }
    // }
    var response = {
        version: "1.0",
        sessionAttributes: {
            searchResults: options.attributes     
        },
        response: {
            outputSpeech: {
                type: "SSML",
                ssml: "<speak>"+options.speechText+"</speak>"
                },
        
        card: {
            type: "Simple",
            title: "ASH",
            content: options.speechText
        },
        shouldEndSession: options.endSession,
        }
    };

    if (options.repromptText) {
        response.response.reprompt = {
            outputSpeech: {
                type: "PlainText",
                text: options.repromptText
            }
        };
    }
    if(options.session && options.session.attributes){
        response.sessionAttributes = options.session.attributes;
    }
    return response;
}

// *********************************************************************

function handleNextIntent(response, context){
    let options = {};
    //console.log(response);
    // ******** check for no results
    if (response != "none" && response != "no more results to share"){
    if(response){
        if(response.length > 1){
            //console.log('response length greater than 1');
        var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday","Saturday"];
        var theDay = new Date(response[0].sessionStartTime);
        theDay = theDay.getDay();
        theDay = daysOfWeek[theDay];

        var theSessionTitle = "";

        if(response[0].papertitle !=""){
            theSessionTitle = response[0].papertitle;
            } else {
                theSessionTitle = response[0].sessionTitle;
                }

        options.speechText = "On " + theDay + " at " + response[0].startTime + " , " +response[0].combinedName+" is presenting "+ theSessionTitle + " at " + response[0].sessionLocation + ". Say next to hear another.";
        options.repromptText = "Just say next or ask me another question. You can exit by saying Stop.";
        options.endSession = false;
        options.attributes = response;
    } else if(response.length==1){
        var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday","Saturday"];
        var theDay = new Date(response[0].sessionStartTime);
        //console.log(theDay);
        theDay = theDay.getDay();
        //console.log(theDay);
        theDay = daysOfWeek[theDay];
        //console.log(theDay);
        options.speechText = "On " + theDay + " at " + response[0].startTime + " , " + response[0].combinedName + " is presenting "+ response[0].sessionTitle + " in " + response[0].sessionLocation;
        options.repromptText = "You can search for another session or ask me a different question.";
        options.endSession = false;
        options.attributes = response;
        //console.log('made it through equal1');
        
        } else {

        options.speechText = "There are no other sessions that match your search. You can ask me another question or just say stop.";
        options.repromptText = "You can search for another session or ask me a different question.";
        options.endSession = false;
        options.attributes = "no more results to share";

        }

        context.succeed(buildResponse(options));

    }else{
        options.speechText = "There are no other sessions that match your search. You can ask me another question or just say stop.";
        options.repromptText = "You can search for another session or ask me a different question.";
        options.endSession = false;
        options.attributes = "no more results to share";
        context.succeed(buildResponse(options));
    }
    // This handles situation when search results = "none"
    } else {
        options.speechText = "I didn't catch that. You can ask me another question or just say stop.";
        options.repromptText = "I didn't catch that. You can ask me another question or just say stop.";
        options.endSession = false;
        options.attributes = "no more results to share";
        context.succeed(buildResponse(options));  
    }
}
// *********************************************************************

function handleSessionIntent(response, context){
    //console.log('there are this many: '+ response.length);
    let options = {};
    let number = response.length;
    var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday","Saturday"];
    var theDayValue = "";
    if(response.length != 0){

    var theDay = new Date(response[0].sessionStartTime);
    theDayValue = theDay.getDay();
    theDayValue = daysOfWeek[theDayValue];
    
    var theSessionTitle = "";

        if(response[0].papertitle !=""){
            theSessionTitle = response[0].papertitle;
            } else {
                theSessionTitle = response[0].sessionTitle;
                }


            if(response.length>10){
                sessionsFound = response.length; // this is saved for the response feedback
                var sliced = response.slice(0,10);
                sessionsKept = sliced.length;
                options.speechText = "I found " + number + " sessions that matched your search. Here are the " + sessionsKept+ " sessions coming up next. On "+ theDayValue + " at "+response[0].startTime + " , " + response[0].combinedName + " is presenting "+ theSessionTitle + " in " + response[0].sessionLocation + ". Say next to hear another.";
                options.repromptText = "Just say next or ask me another question. You can exit by saying Stop.";
                options.endSession = false;
                options.attributes = sliced;
                context.succeed(buildResponse(options));
                // Else if response.length = 1
                // do stuff

            // More than 1 session but less than 10    
            } else if(response.length <= 10 && response.length > 1){
                options.speechText = "I found " + number + " sessions that matched your search. Here are the " + response.length+" sessions coming up next. On "+ theDayValue + " at "+response[0].startTime + " , " + response[0].combinedName + " is presenting " + theSessionTitle + " in " + response[0].sessionLocation + ". Say next to hear another.";
                options.repromptText = "Just say next or ask me another question. You can exit by saying Stop.";
                options.endSession = false;
                options.attributes = response;
                context.succeed(buildResponse(options)); 
            }

            else if(response.length == 1){
                options.speechText = "I found 1 session that matched your search. On "+ theDayValue + " at " + response[0].startTime + " , " + response[0].combinedName + " is presenting " + theSessionTitle + " in " + response[0].sessionLocation;
                options.repromptText = "Ask me another question or exit by saying stop.";
                options.endSession = false;
                options.attributes = response;
                context.succeed(buildResponse(options)); 

            }

            } else {
            options.speechText = "I found no results that matched your search. Ask me another question or exit by saying Stop.";
            options.repromptText = "Just say next or ask me another question. You can exit by saying Stop.";
            options.endSession = false;
            options.attributes = response;
            context.succeed(buildResponse(options));
    }

}
// *********************************************************************
function sliceIt(response, callback){
    var sliced = response.slice(0,2);
    console.log('in the sliceit function: '+sliced.length);
    callback(sliced);
}
// *********************************************************************
//"I found " + number + " sessions where " + response[0].combinedName + " is speaking. On "+ theDay + " at "+response[0].startTime + " , " + response[0].sessionTitle + " is going on at " + response[0].sessionLocation + ". say next to hear another.";
function handleSpeakerIntent(response, context){
    let options = {};
    let number = response.length;
    var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday","Saturday"];

    if(response.length != 0){

    var theDay = new Date(response[0].sessionStartTime);
    theDay = theDay.getDay();
    theDay = daysOfWeek[theDay];

            if(response.length>10){
                sessionsFound = response.length; // this is saved for the response feedback
                var sliced = response.slice(0,10);
                sessionsKept = sliced.length;
                options.speechText = "I found " + number + " sessions where " + response[0].combinedName + " is speaking. On "+ theDay + " at "+response[0].startTime + " , " + response[0].sessionTitle + " is going on at " + response[0].sessionLocation + ". say next to hear another.";
                options.repromptText = "Just say next or ask me another question. You can exit by saying Stop.";
                options.endSession = false;
                options.attributes = sliced;
                context.succeed(buildResponse(options));
            } else if(response.length==1){
                options.speechText = "I found " + number + " session where " + response[0].combinedName + " is speaking. On "+ theDay + " at "+response[0].startTime + " , " + response[0].sessionTitle + " is going on in " + response[0].sessionLocation + ". ";
                options.repromptText = "You can ask me another question or exit by saying Stop.";
                options.endSession = false;
                options.attributes = response;
                context.succeed(buildResponse(options)); 
            } else if(response.length<=10 && response.length>1){
                options.speechText = "I found " + number + " sessions where " + response[0].combinedName + " is speaking. On "+ theDay + " at "+response[0].startTime + " , " + response[0].sessionTitle + " is going on in " + response[0].sessionLocation + ". say next to hear another.";
                options.repromptText = "You can ask me another question or exit by saying Stop.";
                options.endSession = false;
                options.attributes = response;
                context.succeed(buildResponse(options)); 

            }

    } else {
        options.speechText = "I found no results that matched your search. How else may I help you?";
        options.repromptText = "Ask me another question or say stop to end this session.";
        options.endSession = false;
        options.attributes = response;
        context.succeed(buildResponse(options));
    }

}

// *********************************************************************
function handleLaunchRequest(context) {
    let options = {};
    var theRandom = Math.floor((Math.random() * 14));
        options.speechText = "Hi there. I\'m your ash Virtual Assistant, and I\'m here to help. You can ask a question like, " + helperPhrase[theRandom] + " ... Now, what can I help you with?";
        options.repromptText = "You can ask questions such as, when does the exhibit hall open, or, you can say exit...Now, what can I help you with?";
        options.endSession = false;
        options.attributes = "none";
        context.succeed(buildResponse(options));
}


// *********************************************************************
function handleStopIntent(context){
            let options = {};    
                options.speechText = "Goodbye";
                options.repromptText = "";
                options.endSession = true;
                options.attributes = "none";
                context.succeed(buildResponse(options));
}

// *********************************************************************
function handleEndIntent(context){
            let options = {};    
                options.speechText = "Catch you later";
                options.repromptText = "";
                options.endSession = true;
                options.attributes = "";
                context.succeed(buildResponse(options));
}


// **********************************************************************

function handleRequestIntent(request, context) {
            //console.log('i am at handle request intent');
            let options = {};
            
            // we found a scenario where .value doesn't exist ... 
            // so we need to test for it first
            if(request.intent.slots.Item.value){
            var item = request.intent.slots.Item.value;
            item = item.toLowerCase();
            console.log(library[item]);
            
            if(library[item]){
                options.speechText = library[item];
                options.repromptText = "Ask me another question or say stop to end this session.";
                options.endSession = false;
                context.succeed(buildResponse(options));
        
        } else {
            
            options.speechText = "Sorry. I couldn't find "+item+ " in our library. Ask me something else.";
            options.repromptText = "Ask me another question or say stop to end this session.";
            //options.speechText +=getWish();
            // nothing left to do now, so end the session
            options.endSession = false;
            options.attributes = "none";
            context.succeed(buildResponse(options));


            }
        } else {

            options.speechText = "Sorry. I couldn't find the answer to that question. Ask me something else.";
            options.repromptText = "Ask me another question or say stop to end this session.";
            //options.speechText +=getWish();
            // nothing left to do now, so end the session
            options.endSession = false;
            options.attributes = "none";
            context.succeed(buildResponse(options));
        }

}

// **********************************************************************

function handleHotelIntent(hotelInfo, context) {
    let options = {};    
    options.speechText = hotelInfo;
    options.repromptText = "Ask me another question or say stop to end this session.";
    options.endSession = false;
    options.attributes = "none";
    context.succeed(buildResponse(options));
            
}

// **********************************************************************

function handleBriefingIntent(briefingInfo, context) {
    let options = {};    
    //console.log('handle briefing intent', briefingInfo);
    options.speechText = briefingInfo;
    options.repromptText = "Ask me another question or say stop to end this session.";
    options.endSession = false;
    options.attributes = "none";
    context.succeed(buildResponse(options));
            
}

// **********************************************************************

function findHotel(item, callback){
    //console.log('made it to find hotel', hotels.length);
    //console.log(item);
    var result = "No hotels match your search.";
    var i = 0;

while (i<hotels.length){
        
    if (item == hotels[i].hotelName){
        result = "The "+item+" is on bus route # "+hotels[i].routeNumber+". Your boarding location is "+hotels[i].boardingLocation;;
        if(hotels[i].routeNumber == "No Shuttle"){
            result = "This hotel is in walking distance. There is no need to grab a shuttle. Enjoy the short walk!"
            }
        break;
    } 
    i++;
}
//else { find closest match to ask // sessions, speakers, hotels }
callback (result);
}

// **********************************************************************

function findBriefing(callback){
    //console.log('made it to find hotel', hotels.length);
    //console.log(item);
    var result = "There are no briefings available right now.";
    let nowTime = new Date();
    console.log('NOW time ', nowTime);
    var i = 0;

while (i<briefings.length){
    var sessionStart = briefings[i].startTime;
    sessionStart = new Date(sessionStart);
    //console.log('START time ', sessionStart);
    var sessionEnd = briefings[i].endTime;
    sessionEnd = new Date(sessionEnd);
     //console.log('END time ', sessionEnd);

    if(nowTime >= sessionStart && nowTime <= sessionEnd) {
    result = briefings[i].greeting+briefings[i].weather+
    briefings[i].story1+briefings[i].story2+briefings[i].story3
    +briefings[i].story4+briefings[i].story5+briefings[i].story6
    +briefings[i].story7+briefings[i].story8+briefings[i].story9;
    console.log('found one', briefings[i].date);
    break;
    } else {
        //console.log('not it')
    }
    i++;
}
//console.log(result);
callback (result);
}

// **********************************************************************
function removeOld(orderedResponse, callback){
    var i=0;
    var currentTime = new Date();
    var theEndTime = new Date();
    var cleaned = [];
    //console.log('the current time: ', currentTime);
    //console.log('the length of orderedResponse is ', orderedResponse.length);
    //console.log('the first record is ', orderedResponse[0]);
    while(i<orderedResponse.length){
        theEndTime = new Date(orderedResponse[i].sessionEndTime);
        //console.log(theStartTime.getUTCDate());
        if(theEndTime > currentTime){
            //console.log('yes');
            cleaned.push(orderedResponse[i]);
            }
            i++;
        }
        callback(cleaned);
    }

// *********************************************************************
// Using this function for speakers to find matches when people don't use
// "doctor" or "middle name"
function bestMatch(toMatch, callback){
    var matches = stringSimilarity.findBestMatch(toMatch, speakers);
    var theBestMatch = toMatch; // just leave it as-is if we don't find anything
    if(matches.bestMatch.rating >= .8){
        theBestMatch = matches.bestMatch.target
    } 
    console.log('the best match is ',theBestMatch);
    callback(theBestMatch)
}

// *********************************************************************
function analytics(stationId, saveIntent, saveItem, callback){
    //console.log(stationId, saveIntent, saveItem);
    var theDate = new Date();
    theDate = theDate.toString();
    params = {
        TableName:"ash",
        Item:{
            "stationId": stationId,
            "intent": saveIntent,
            "item": saveItem,
            "timeStamp": theDate
        }
    };

    docClient.put(params, function(err, data) {
        if (err) {
            callback(err);
            //console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
                callback(data);
                //console.log("Added item:", JSON.stringify(data, null, 2));
            }
        });

}