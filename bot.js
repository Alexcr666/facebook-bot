//
// This is main file containing code implementing the Express server and functionality for the Express echo bot.
//
"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const path = require("path");
var messengerButton =
  '<html><head><title>Facebook Messenger Bot</title></head><body><h1>Facebook Messenger Bot</h1>This is a bot based on Messenger Platform QuickStart. For more details, see their <a href="https://developers.facebook.com/docs/messenger-platform/guides/quick-start">docs</a>.<script src="https://button.glitch.me/button.js" data-style="glitch"></script><div class="glitchButton" style="position:fixed;top:20px;right:20px;"></div></body></html>';

// The rest of the code implements the routes for our Express server.
let app = express();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// Webhook validation
app.get("/webhook", function (req, res) {
  if (
    req.query["hub.mode"] === "subscribe" &&
    req.query["hub.verify_token"] === process.env.VERIFY_TOKEN
  ) {
    console.log("Validating webhook");
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});

// Display the web page
app.get("/", function (req, res) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(messengerButton);
  res.end();
});

// Message processing
app.post("/webhook", function (req, res) {
  console.log(req.body);
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === "page") {
    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function (entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function (event) {
        if (event.message) {
          receivedMessage(event);
        } else if (event.postback) {
          receivedPostback(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});
var messageReceip;
var userReceip;
var recipientData;

// Incoming events handling
function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  userReceip = senderID;
  recipientData = recipientID;

  console.log(
    "Received message for user %d and page %d at %d with message:",
    senderID,
    recipientID,
    timeOfMessage
  );
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  messageReceip = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {
    // If we receive a text message, check to see if it matches a keyword
    // and send back the template example. Otherwise, just echo the text we received.
    switch (messageText) {
      case "generic":
        sendGenericMessage(senderID);
        break;

      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback
  // button for Structured Messages.
  var payload = event.postback.payload;

  console.log(
    "Received postback for user %d and page %d with payload '%s' " + "at %d",
    senderID,
    recipientID,
    payload,
    timeOfPostback
  );

  // When a postback is called, we'll send a message back to the sender to
  // let them know it was successful
  sendTextMessage(senderID, "Postback called");
}

//////////////////////////
// Sending helpers
//////////////////////////
function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      text: messageText,
    },
  };

  callSendAPI(messageData);
}

function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "rift",
              subtitle: "Next-generation virtual reality",
              item_url: "https://www.oculus.com/en-us/rift/",
              image_url: "http://messengerdemo.parseapp.com/img/rift.png",
              buttons: [
                {
                  type: "web_url",
                  url: "https://www.oculus.com/en-us/rift/",
                  title: "Open Web URL",
                },
                {
                  type: "postback",
                  title: "Call Postback",
                  payload: "Payload for first bubble",
                },
              ],
            },
            {
              title: "touch",
              subtitle: "Your Hands, Now in VR",
              item_url: "https://www.oculus.com/en-us/touch/",
              image_url: "http://messengerdemo.parseapp.com/img/touch.png",
              buttons: [
                {
                  type: "web_url",
                  url: "https://www.oculus.com/en-us/touch/",
                  title: "Open Web URL",
                },
                {
                  type: "postback",
                  title: "Call Postback",
                  payload: "Payload for second bubble",
                },
              ],
            },
          ],
        },
      },
    },
  };

  callSendAPI(messageData);
}
function sendMsj(recipientId, messageText, route) {

  if(route != null){
  var messageData2 = {
    userId: userReceip,
    routeStep: route,
    text: messageReceip,
    receipt: recipientData,
  };

  request(
    {
      uri:
        "https://getdev-b2c0b.firebaseio.com/company/1/messageUsers/" +
        recipientData +
        ".json",
      // qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
      method: "POST",
      json: messageData2,
    },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        //  var recipientId = body.recipient_id;
        // var messageId = body.message_id;

        console.log("Successfully firebase");
      } else {
        console.error("Unable to send message.");
        console.error(response);
        console.error(error);
      }
    }
  );

  var messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      text: messageText,
    },
  };
  request(
    {
      uri: "https://graph.facebook.com/v2.6/me/messages",
      qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
      method: "POST",
      json: messageData,
    },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var recipientId = body.recipient_id;
        var messageId = body.message_id;

        console.log(
          "Successfully sent generic message with id %s to recipient %s",
          messageId,
          recipientId
        );
      } else {
        console.error("Unable to send message.");
        console.error(response);
        console.error(error);
      }
    }
  );
  }
}
/*
function callSendAPI(messageData) {

  
  
   request({
    uri: 'https://getdev-b2c0b.firebaseio.com/company/1/chatbotCreateMessage/-O6d8tHwE_wm3DGgI3hD/options/4963281a-fe77-4d89-a01f-5b23427e588b.json',
 
    method: 'GET',


  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
    //  var recipientId = body.recipient_id;
     // var messageId = body.message_id;
      
    
        var obj = JSON.parse(body);
        var title = obj["title"];
              var type = obj["type"];
      
       console.error("body: "+title);

      console.log("Successfully firebase"+body);
      if(type = "chat"){
        sendMsj("8370375226358762",title);
        
        
     }
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });
  
      
       var messageData2 = {
         
         userId : userReceip, text : messageReceip,receipt:recipientData
       };
      
      request({
    uri: 'https://getdev-b2c0b.firebaseio.com/company/1/messageUsers.json',
   // qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData2

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
    //  var recipientId = body.recipient_id;
     // var messageId = body.message_id;

      console.log("Successfully firebase");
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });
   
}*/
function validateFlow(body, id) {
  var obj = JSON.parse(body);
  var title = obj[id]["title"];

  var route = null;
  if (obj[id]["routeStep"] != null) {
    route = obj[id]["routeStep"];
  }
  var type = obj[id]["type"];

  console.error("body: " + title);

  console.log("Successfully firebase" + body);
  if (type == "chat") {
    sendMsj("8370375226358762", title, route);
    if (route != null) {
      if (type == "chat") {
        validateFlow(body, route);
      }
    }
  } else {
    if (type == "multiple") {
      var list = obj[id]["optionsMulti"];

      var listString = "";

      for (var i = 0; i < list.length; i++) {
        listString += list[i].capitalize() + "\n";
      }
      var message = title.capitalize() + ":" + " \n\n" + listString;

      setTimeout(function () {
        sendMsj("8370375226358762", message, route);
      }, 500);
    }
    //  sendMsj("8370375226358762",title);
  }
}

var idData;
var routeData;
     function json2array(json){
    var result = [];
    var keys = Object.keys(json);
    keys.forEach(function(key){
        result.push(json[key]);
    });
    return result;
}
function callSendAPI(messageData) {
  request(
    {
      uri: "https://getdev-b2c0b.firebaseio.com/company/1/messageUsers/"+recipientData+"/.json",

      method: "GET",
    },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        //  var recipientId = body.recipient_id;
        // var messageId = body.message_id;
           console.log("Successfully firebase4" + body);
        if(body == "null"){
             console.log("Successfully firebase5" + body);
          
        request(
          {
            uri: "https://getdev-b2c0b.firebaseio.com/company/1/chatbotCreateMessage/-O6gsjbjH8DhY7QXi5yT/options/.json",

            method: "GET",
          },
          function (error, response, body) {
            if (!error && response.statusCode == 200) {
              //  var recipientId = body.recipient_id;
              // var messageId = body.message_id;
              
                        
                var obj = JSON.parse(body);
          
      var listJson =     json2array(obj);
          console.error("lenghtoptions: "+json2array(obj).length+" : "+json2array(obj)[0]);
          
       var dataItemSelected ;  
for(var i = 0; i < json2array(obj).length;i++){
 var dataItem =  json2array(obj)[i];
  
  console.log("welcome: "+ dataItem["welcome"] );
  
  if(dataItem["welcome"] == true){
     dataItemSelected = dataItem;
  }

}
            
              console.log("Successfully firebase2: " + body + "  :  ");

   
              
       
          
     
          
      //var listJson =     json2array(obj);
        //  console.error("lenght: "+json2array(obj).length);
              
              
              
              
              var title = dataItemSelected["title"];
              var route = dataItemSelected["routeStep"];
              var type = dataItemSelected["type"];

              console.error("body: " + title);

              console.log("Successfully firebase" + body);
              if (type == "chat") {
                sendMsj("8370375226358762", title, route);

                setTimeout(function () {
                  validateFlow(body, route);
                }, 1000);
              }
            } else {
              console.error("Unable to send message.");
              console.error(response);
              console.error(error);
            }
          }
        );
          
        }else{

        console.log("Successfully firebase3" + body);
      //  idData = "-O6gAs7nZlg68hikKCiP";
        var obj = JSON.parse(body);
          //var lenght = obj.lenght;
          
     
          
      var listJson =     json2array(obj);
          console.error("lenght: "+json2array(obj).length);
          console.log("routestep: "+listJson[1]["routeStep"]);
          
        // var title = obj[id]["title"];
     
          var position = (json2array(obj).length - 2);
          console.log("position: "+position);
          
          
          
          if(listJson[position]["routeStep"] == null){
            
             console.log("dato14: "+listJson[position]["text"]);
           /* var keys = Object.keys(obj[position]["optionsStep"]);
    keys.forEach(function(key){
      console.log("datos: "+key);
      if(key.toLowerCase() ==   messageReceip.toLowerCase()){
        
        var value = obj[position]["optionsStep"][key];
 
          console.log("dato1: "+value);
        
        //sendMsj("8370375226358762", title, value);

                setTimeout(function () {
                  validateFlow(body, value);
                }, 1000);
       
         }
    });*/
            console.log("ruta1");
                  
                  
                
          }else{
              console.log("ruta2");
              routeData = listJson[position]["routeStep"];
          }
        //       var type = obj[id]["type"];

         console.error("bodyroute: "+routeData);

        console.log("Successfully firebase1: " + body);

        //   var id =

        request(
          {
            uri: "https://getdev-b2c0b.firebaseio.com/company/1/chatbotCreateMessage/-O6gsjbjH8DhY7QXi5yT/options/.json",

            method: "GET",
          },
          function (error, response, body) {
            if (!error && response.statusCode == 200) {
              //  var recipientId = body.recipient_id;
              // var messageId = body.message_id;
              var id = routeData;
              console.log("Successfully firebase2: " + body + "  :  " + id);

              var obj = JSON.parse(body);
              var title = obj[id]["title"];
              var route = obj[id]["routeStep"];
              var type = obj[id]["type"];

              console.error("body: " + title);
              
                console.log("ruta3");

              console.log("Successfully firebase" + body);
              if (type == "chat") {
                sendMsj("8370375226358762", title, route);

                setTimeout(function () {
                  validateFlow(body, route);
                }, 1000);
                  console.log("ruta4");
              }else{
                
                if(type == "multiple"){
                  
                    var list = obj[id]["optionsStep"];
                    console.log("ruta5");
              // var listOptions =    json2array(obj[id]["optionsStep"]);
               //   var result = [];
    var keys = Object.keys(obj[id]["optionsStep"]);
    keys.forEach(function(key){
      console.log("datos: "+key);
      if(key.toLowerCase() ==   messageReceip.toLowerCase()){
        
        var value = obj[id]["optionsStep"][key];
 
          console.log("dato1: "+value);
        
        //sendMsj("8370375226358762", title, value);

                setTimeout(function () {
                  validateFlow(body, value);
                }, 1000);
       
         }
    });
                  
                  
                }
                
              }
            } else {
              console.error("Unable to send message.");
              console.error(response);
              console.error(error);
            }
          }
        );
        }
      } else {
        console.error("Unable to send message.");
        console.error(response);
        console.error(error);
      }
      
    }
  );

  /*request({
    uri: 'https://getdev-b2c0b.firebaseio.com/company/1/chatbotCreateMessage/-O6fxO0RwankhfZhvnHq/options/.json',
 
    method: 'GET',


  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
    //  var recipientId = body.recipient_id;
     // var messageId = body.message_id;
      
     console.log("Successfully firebase"+body);
     var id = "7d15696d-95f8-4154-8e2b-e5dee1f8eafa";
        var obj = JSON.parse(body);
        var title = obj[id]["title"];
      var route =  obj[id]["routeStep"];
              var type = obj[id]["type"];
      
      
       console.error("body: "+title);

      console.log("Successfully firebase"+body);
      if(type == "chat"){
        sendMsj("8370375226358762",title,route);
        
        setTimeout(function(){ validateFlow(body,route); }, 1000);
        
        
        
     }
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });
  */

  /*  var messageData2 = {
         
         userId : userReceip, text : messageReceip,receipt:recipientData
       };
      
      request({
    uri: 'https://getdev-b2c0b.firebaseio.com/company/1/messageUsers.json',
   // qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData2

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
    //  var recipientId = body.recipient_id;
     // var messageId = body.message_id;

      console.log("Successfully firebase");
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });*/
}

// Set Express to listen out for HTTP requests
var server = app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port %s", server.address().port);
});

Object.defineProperty(String.prototype, "capitalize", {
  value: function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
  enumerable: false,
});
