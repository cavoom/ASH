'use strict';

var library = require('./recipe.js');
var hotels = require('./hotels.js');
var briefings = require('./briefing.json');
var sessions = require('./ashData.json');

exports.handler = function(event,context) {

    try {
    var request  = event.request;
    var session = event.session;

    if(!event.session.attributes){
        event.session.attributes = {};
    }

    if(request.type === "LaunchRequest") {
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
                    sortResult(searchResults,(orderedResponse)=>{
                        handleSessionIntent(orderedResponse, context);
                    })
                   
                });
                
    } else if (request.intent.name === "NextIntent"){
        //console.log('at get next intent');

        // HERE ****
        //let searchResults = session.attributes;
        let searchResults = session.attributes.searchResults;
        console.log('first one: ', searchResults[0]);
        getNext(searchResults,(nextOne)=>{
            handleNextIntent(nextOne, context);
        })


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
    if(searchResults.length > 0){
    searchResults.shift();
    //console.log('search results length: ',searchResults.length);

} else {
        // we have a zero length array, do nothing
    }
    //console.log('shifted: ', searchResults[0]);
    callback(searchResults);
}

// *********************************************************************
function sortResult(searchResults, callback){

        searchResults.sort(function(a, b){
        var dateA=new Date(a.sessionStartTime), dateB=new Date(b.sessionStartTime);
        return dateA-dateB });
        callback(searchResults);
}
// *********************************************************************
function findSession(item, callback){
    //console.log('made it to find session');
    var i=0;
    var searchResults = [];
    //console.log('sessions length is ', sessions.length);
    var timeNow = new Date();
    while (i < sessions.length){
        var title = sessions[i].sessionTitle;
        title = title.toLowerCase();
        var startTime = sessions[i].sessionStartTime;
        startTime = new Date(startTime);
        var endTime = sessions[i].sessionEndTime;
        endTime = new Date(endTime);

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
    var response = {
        version: "1.0",
        sessionAttributes: {
            //sessionId:sessionId,
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
        if(response.length > 0){
        options.speechText = "At " + response[0].startTime + " " + response[0].sessionTitle + " is going on in room number " + response[0].sessionId + ". Say continue to hear another.";
        options.repromptText = "Just say continue or ask me another quesiton. You can exit by saying Stop.";
        options.endSession = false;
        options.attributes = response;
    
        } else {

        options.speechText = "There are no other sessions that match your search.";
        options.repromptText = "You can search for another session or ask me a different question.";
        options.endSession = false;
        options.attributes = "no more results to share";

        }

        context.succeed(buildResponse(options));

}
// *********************************************************************

function handleSessionIntent(response, context){
    let options = {};
    let number = response.length;
        options.speechText = "I found " + number + " sessions that matched your search. Here are the sessions coming up next. At " + response[0].startTime + " " + response[0].sessionTitle + " is going on in room number " + response[0].sessionId + ". Say continue to hear another.";
        options.repromptText = "Just say continue or ask me another quesiton. You can exit by saying Stop.";
        options.endSession = false;
        options.attributes = response;
        // STOPPED HERE -- SAVE THE ORDERED RESPONSE INTO SESSION.ATTRIBUTS
        context.succeed(buildResponse(options));

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
            let options = {};
            
            let item = request.intent.slots.Item.value;

            //console.log(library[item]);
            
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

            // if item does not exist ... 
            // options.speechText = "I don't know the answer to your question";
        

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
    //STOPPED HERE


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