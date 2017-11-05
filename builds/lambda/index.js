'use strict';

var library = require('./recipe.js');
var hotels = require('./hotels.js');
var briefings = require('./briefing.json');
//var sessions = require('./session_json_data.json');
var sessions = require('./sessions.json');
var sessionsFound = 0; // this saves the number of sessions found in search
var sessionsKept = 0; // tells you how many we are going to tell you about

exports.handler = function(event,context) {

    try {
    var request  = event.request;
    var session = event.session;

    if(!event.session.attributes){
        event.session.attributes = {};
    }

    if(request.type === "LaunchRequest") {
        console.log('going to handle launch request');
        handleLaunchRequest(context);

    } else if(request.type === "IntentRequest") {
        
        if(request.intent.name == "RecipeIntent"){
                handleRequestIntent(request, context)

        } else if (request.intent.name === "HotelIntent"){
        
                let item = request.intent.slots.Hotels.value;
                let lowerItem = item.toLowerCase();
                findHotel(lowerItem, (response)=>{
                    handleHotelIntent(response, context);
                });

        } else if (request.intent.name === "BriefingIntent"){
                //let item = request.intent.slots.Briefing.value;
                //let lowerItem = item.toLowerCase();
                findBriefing((response)=>{
                    //console.log('headed to the handle briefing intent yo');
                    handleBriefingIntent(response, context);
                });


    } else if (request.intent.name === "SessionIntent"){
    
                let item = request.intent.slots.Session.value;
                item = item.toLowerCase();
                findSession(item, (searchResults)=>{
                    //console.log('i found '+searchResults.length+' sessions');
                    // IF searchResults.length > 0
                    // If not, create orderedResponse = [];
                    // make sure that handleSessionIntent handles a blank orderedResponse
                    sortResult(searchResults,(orderedResponse)=>{
                        handleSessionIntent(orderedResponse, context);
                    })
                   
                });

    } else if (request.intent.name === "SpeakerIntent"){
    
                let item = request.intent.slots.Speaker.value;
                item = item.toLowerCase();
                findSpeaker(item, (searchResults)=>{
                    sortResult(searchResults,(orderedResponse)=>{
                        handleSpeakerIntent(orderedResponse, context);
                    }) 
                });                
                
    } else if (request.intent.name === "NextIntent"){
        if(session.attributes){
        if(session.attributes.searchResults){
            let searchResults = session.attributes.searchResults;
            //console.log('first one: ', searchResults[0]);
            getNext(searchResults,(nextOne)=>{
            handleNextIntent(nextOne, context);
            })} else {
            // HANDLE SITUATION WHEN SESSION.ATTRIBUTES.SEARCHRESULTS DOESN'T EXIST
            }

        } else {
                handleNextIntent(nextOne, context);

        }

    } else if (request.intent.name === "AMAZON.StopIntent" || request.intent.name === "AMAZON.CancelIntent") {
            handleStopIntent(context);

        } 

    }
    else if (request.type === "SessionEndRequest") {


    } else {

        throw "Unknown Intent";
    }

} catch(e) {
    // context.fail("Exception: "+e);
    throw "Unknown Intent";
}
}

// *********************************************************************
function getNext(searchResults,callback){
    //console.log('search results length: ',searchResults.length);
   if(searchResults){
   
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
            //console.log(allData[i].sessionId+"-"+allData[i].sessionTitle);
            searchResults.push(sessions[i]);
        }

    i++;

}
//console.log('search results: ', searchResults);
callback(searchResults);

}

// *********************************************************************
function sortResult(searchResults, callback){
        if(searchResults.length>0){
        searchResults.sort(function(a, b){
        var dateA=new Date(a.sessionStartTime), dateB=new Date(b.sessionStartTime);
        return dateA-dateB });
        //console.log('made it through sort results');
        }
        callback(searchResults);
}
// *********************************************************************
function findSession(item, callback){
    //console.log('made it to find session');
    var i=0;
    var searchResults = [];
    //console.log('sessions length is ', sessions.length);
    //var timeNow = new Date();
    while (i < sessions.length){
        var title = sessions[i].sessionTitle;
        title = title.toLowerCase();
        //var startTime = sessions[i].sessionStartTime;
        //startTime = new Date(startTime);
        //var endTime = sessions[i].sessionEndTime;
        //endTime = new Date(endTime);

        // Get the all inclusive list
        if(title.includes(item)){
        //if(title.includes(item) && timeNow >= startTime && timeNow < endTime){
            //console.log(allData[i].sessionId+"-"+allData[i].sessionTitle);
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
    if(response){
        if(response.length > 0){
        var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday","Saturday"];
        var theDay = new Date(response[0].sessionStartTime);
        theDay = theDay.getDay();
        theDay = daysOfWeek[theDay];
        options.speechText = "On " + theDay + " at " + response[0].startTime + " , " + response[0].sessionTitle + " is going on in room number " + response[0].sessionId + ". say next to hear another.";
        options.repromptText = "Just say next or ask me another question. You can exit by saying Stop.";
        options.endSession = false;
        options.attributes = response;
    
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
}
// *********************************************************************

function handleSessionIntent(response, context){
    //console.log('here is my response to handle '+ response);
    let options = {};
    let number = response.length;
    var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday","Saturday"];

    if(response.length != 0){

    var theDay = new Date(response[0].sessionStartTime);
    theDay = theDay.getDay();
    theDay = daysOfWeek[theDay];

            if(response.length>11){
                sessionsFound = response.length; // this is saved for the response feedback
                var sliced = response.slice(0,10);
                sessionsKept = sliced.length;
                options.speechText = "I found " + number + " sessions that matched your search. Here are the "+sessionsKept+" sessions coming up next. On "+ theDay + " at "+response[0].startTime + " , " + response[0].sessionTitle + " is going on in room number " + response[0].sessionId + ". say next to hear another.";
                options.repromptText = "Just say next or ask me another question. You can exit by saying Stop.";
                options.endSession = false;
                options.attributes = sliced;
                context.succeed(buildResponse(options));
            } else {
                options.speechText = "I found " + number + " sessions that matched your search. Here are the sessions coming up next. On "+ theDay + " at "+response[0].startTime + " , " + response[0].sessionTitle + " is going on in room number " + response[0].sessionId + ". say next to hear another.";
                options.repromptText = "Just say next or ask me another question. You can exit by saying Stop.";
                options.endSession = false;
                options.attributes = response;
                context.succeed(buildResponse(options)); 
            }

    } else {
        options.speechText = "I found no results that matched your search.";
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
//"I found " + number + " sessions where " + response[0].combinedName + " is speaking. On "+ theDay + " at "+response[0].startTime + " , " + response[0].sessionTitle + " is going on in room number " + response[0].sessionId + ". say next to hear another.";
function handleSpeakerIntent(response, context){
    let options = {};
    let number = response.length;
    var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday","Saturday"];

    if(response.length != 0){

    var theDay = new Date(response[0].sessionStartTime);
    theDay = theDay.getDay();
    theDay = daysOfWeek[theDay];

            if(response.length>11){
                sessionsFound = response.length; // this is saved for the response feedback
                var sliced = response.slice(0,10);
                sessionsKept = sliced.length;
                options.speechText = "I found " + number + " sessions where " + response[0].combinedName + " is speaking. On "+ theDay + " at "+response[0].startTime + " , " + response[0].sessionTitle + " is going on in room number " + response[0].sessionId + ". say next to hear another.";
                options.repromptText = "Just say next or ask me another question. You can exit by saying Stop.";
                options.endSession = false;
                options.attributes = sliced;
                context.succeed(buildResponse(options));
            } else {
                options.speechText = "I found " + number + " sessions where " + response[0].combinedName + " is speaking. Here are the sessions coming up next. On "+ theDay + " at "+response[0].startTime + " , " + response[0].sessionTitle + " is going on in room number " + response[0].sessionId + ". say next to hear another.";
                options.repromptText = "Just say next or ask me another question. You can exit by saying Stop.";
                options.endSession = false;
                options.attributes = response;
                context.succeed(buildResponse(options)); 
            }

    } else {
        options.speechText = "I found no results that matched your search.";
        options.repromptText = "Just say next or ask me another question. You can exit by saying Stop.";
        options.endSession = false;
        options.attributes = response;
        context.succeed(buildResponse(options));
    }

}

// *********************************************************************
function handleLaunchRequest(context) {
    let options = {};
        options.speechText = "Hi there. I\'m your ash Virtual Assistant, and I\'m here to help. You can ask a question like, when\'s the general session? ... Now, what can I help you with?";
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


// **********************************************************************

function handleRequestIntent(request, context) {
            console.log('i am at handle request intent');
            let options = {};
            var item = request.intent.slots.Item.value;
            item = item.toLowerCase();
            console.log(library[item]);
            
            // convert ITEM to lowercase?
            // if ITEM exists in ./recipe then ... 
            if(library[item]){
            options.speechText = library[item];
            //options.speechText +=getWish();
            // nothing left to do now, so end the session
            options.endSession = false;

            context.succeed(buildResponse(options));
        } else {
            
            options.speechText = "Sorry. I couldn't find "+item+ " in our list of questions.";
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
    options.repromptText = "Are you still there? Ask me a question or say, Stop, to end this session.";
    options.endSession = false;
    options.attributes = "none";
    context.succeed(buildResponse(options));
            
}

// **********************************************************************

function handleBriefingIntent(briefingInfo, context) {
    let options = {};    
    //console.log('handle briefing intent', briefingInfo);
    options.speechText = briefingInfo;
    options.repromptText = "Are you still there? Ask me a question or say, Stop, to end this session.";
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
//console.log(result);
callback (result);
}

// **********************************************************************

function findBriefing(callback){
    //console.log('made it to find hotel', hotels.length);
    //console.log(item);
    var result = "There are no briefings available right now.";
    let nowTime = new Date();
    //console.log(nowTime);
    var i = 0;

while (i<briefings.length){
    var sessionStart = briefings[i].startTime;
    sessionStart = new Date(sessionStart);
    var sessionEnd = briefings[i].endTime;
    sessionEnd = new Date(sessionEnd);

    if(nowTime >= sessionStart && nowTime <= sessionEnd) {
    result = briefings[i].greeting+briefings[i].story3+
    briefings[i].story2+briefings[i].story4+briefings[i].story5
    +briefings[i].story6;
    //console.log('found one');
    break;
    } else {
        //console.log('not it')
    }
    i++;
}
//console.log(result);
callback (result);
}