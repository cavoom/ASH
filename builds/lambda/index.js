// Good practice to use strict mode
// let only works in strict mode
'use strict';

// this is for Quote API function
//var http = require('http');

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


        } else if (request.intent.name === "AMAZON.StopIntent" || request.intent.name === "AMAZON.CancelIntent") {
                options.speechText = "Goodbye";
                options.repromptText = "";
                options.endSession = true;
                //options.attributes = session;
                context.succeed(buildResponse(options));

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
                type: "PlainText",
                text: options.speechText
                },
        shouldEndSession: options.endSession
        }
    };

    if (options.repromptText) {
        response.response.reprompt = {
            outputSpeach: {
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


// **********************************************************************

function handleRequestIntent(request, context) {
            let options = {};
            
            let item = request.intent.slots.Item.value;
            
            // convert ITEM to lowercase?
            // if ITEM exists in ./recipe then ... 
            options.speechText = "Hello " +item+". ";
            //options.speechText +=getWish();
            // nothing left to do now, so end the session
            options.endSession = false;

            context.succeed(buildResponse(options));

            // if item does not exist ... 
            // options.speechText = "I don't know the answer to your question";
        

}