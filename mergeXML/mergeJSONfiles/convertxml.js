//xml2json

// var parser = require('xml2json');

// //var xml = require('')
// //var xml = "<foo attr=\"value\">bar</foo>";
// //console.log("input -> %s", xml)
// var xml = require('./test.xml');

// // xml to json 
// var json = parser.toJson(xml);
// //console.log("to json -> %s", json);
// console.log(json[12]);

// // json to xml 
// //var xml = parser.toXml(json);
// //console.log("back to xml -> %s", xml)

// Try it with xml2js

var fs = require('fs'),
    xml2js = require('xml2js');
 
var parser = new xml2js.Parser();
fs.readFile('./codebeauty.xml', function(err, data) {
    parser.parseString(data, function (err, result) {
        console.log(JSON.stringify(result,null,2));
        //console.log('Done');
    });
});