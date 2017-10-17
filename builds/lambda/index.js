'use strict';
var library = require('./recipe.js');
var hotels = require('./hotels.js');


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
                let item = request.intent.slots.Item.value;
                findHotel(item, (response)=>{
                    handleHotelIntent(response, context);
                });
                

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
function buildResponse(options) {
    var response = {
        version: "1.0",
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

function handleLaunchRequest(context) {
    let options = {};
        options.speechText = "Hi there. I\'m your ash Virtual Assistant, and I\'m here to help. You can ask a question like, when\'s the general session? ... Now, what can I help you with?";
        options.repromptText = "You can ask questions such as, when does the exhibit hall open, or, you can say exit...Now, what can I help you with?";
        options.endSession = false;
        context.succeed(buildResponse(options));
}



function handleStopIntent(context){
            let options = {};    
                options.speechText = "Goodbye";
                options.repromptText = "";
                options.endSession = true;
                //options.attributes = session;
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
    context.succeed(buildResponse(options));
            
}

// **********************************************************************

function findHotel(item, callback){
    //console.log('made it to find hotel', hotels.length);
    //console.log(item);
    var result = "I'm sorry, I couldn't find any results. Please ask your question again.";
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