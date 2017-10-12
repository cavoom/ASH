// Good practice to use strict mode
// let only works in strict mode
'use strict';

// This is for saving to mLab database on Heroku
var mLab = require('mongolab-data-api')('qdtTESFkkedHx_HfzvNPn8_zFWUd1Y-v');

// this is for Quote API function
var http = require('http');

// At the time you create a Lambda function you specify a handler, 
// a function in your code, that AWS Lambda can invoke when the service executes 
// your code
// The lambda service calls your handler function.
// We set one up here and make it an export.
// event - AWS lambda uses this paramter to pass in event data to the handler.
// context - AWS Lambda uses this parameter to provide your handler the runtime information
// of the Lambda function that is executing

exports.handler = function(event,context) {

    try {
    var request  = event.request;

    /*
    3 types of requests
    i)   LaunchRequest       Ex: "Open greeter"
    ii)  IntentRequest       Ex: "Say hello to John" or "ask greeter to say hello to John"
    iii) SessionEndedRequest Ex: "exit" or error or timeout 
    */

    if(request.type === "LaunchRequest") {
        let options = {};
        options.speechText = "Welcome to the greetings skill. Using our skill, you can greet your guests. Just say the name of your guest.";
        options.repromptText = "Are you there? You can say, hello to John.";
        options.endSession = false;
        // context.succeed is a function that was passed to us from Alexa
        // we pass the result of buildResponse(options) to Alexa through this function
        context.succeed(buildResponse(options));

    } else if(request.type === "IntentRequest") {
        let options = {};
        // In this one, we have only one Intent, "HelloIntent", but could have more so check it

        if (request.intent.name == "HelloIntent") {
            
            let name = request.intent.slots.FirstName.value;
            let theId = event.session.user.userId;

            // *********** MLABS INSERT CODE

            var amazonStuff = {
            database: 'heroku_zrc9shfc',
            collectionName: 'virtualma',
            documents: {
                name: name,
                theAmId: theId
            }
            };
            
            mLab.insertDocuments(amazonStuff, function (err, data) {
            console.log(data); //=> [ { _id: 1234, ...  } ] 
        });
        
        // ************** END OF MLABS ROUTINE
            

            options.speechText = "Hello " +name+". ";
            options.speechText +=getWish();
            // nothing left to do now, so end the session
            options.endSession = true;
            // now hand off back to the lambda function with context.succeed
            // I think this is the old school version versus using a callback fn or promise
            context.succeed(buildResponse(options));
        }



    } else if (request.type === "SessionEndRequest") {



    } else {
        // communicate failure back to lambda function
        // context.fail("Unknown intent type");
        throw "Unknown Intent";
    }

} catch(e) {
    // context.fail("Exception: "+e);
    throw "Unknown Intent";
}
}

function getQuote(callback) {
    var url = "http://api.forismatic.com/api/1.0/json?method=getQuote&lang=en&format=json";
    // http.get will call a callback function when it is done getting the quote
    // So we pass the callback function with the result
    var req = http.get(url, function(res){
        var body = "";

        res.on('data', function(chunk) {
            body += chunk;
        });

        res.on('end', function() {

            var quote = JSON.parse(body);
            callback(quote.quoteText);
        });
    });
    req.on('error', function(err){
        callback('',err);
    });
}
function getWish(){
    var myDate = new Date();
    var hours = myDate.getUTCHours() - 4; // since we are in ET
    if (hours < 0) {
        hours = hours + 24;
    }
    if (hours < 12) {
        return " Good morning.";
    } else if (hours < 18) {
        return " Good afternoon, home boy.";
    } else {
        return " Good evening.";
    }
}

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
    return response;
}
//console.log("all done");

