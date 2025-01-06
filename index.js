//
// This is main file containing code implementing the Express server and functionality for the Express echo bot.
//

"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const path = require("path");
const axios = require("axios");
const { log } = require("console");

var messengerButton =
  '<html><head><title>Facebook Messenger Bot</title></head><body><h1>Facebook Messenger Bot</h1>This is a bot based on Messenger Platform QuickStart. For more details, see their <a href="https://developers.facebook.com/docs/messenger-platform/guides/quick-start">docs</a>.<script src="https://button.glitch.me/button.js" data-style="glitch"></script><div class="glitchButton" style="position:fixed;top:20px;right:20px;"></div></body></html>';

// The rest of the code implements the routes for our Express server.
let app = express();


var idChat = "";
var recipientId = "8370375226358762";
var opcionesMultiple  = [];



var repeatMessageOption = false;

function capitalize(str) {
  if (!str) return ""; // Maneja cadenas vacías
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function savedAlertAgentData() {
  var dataForm = {
    agent: true,
    idUser: recipientId,
  };
  axios
    .post(
      "https://getdev-b2c0b.firebaseio.com/company/sly/alertAgent/.json",
      dataForm
    )
    .then((response) => {
      if (response.status == 200) {}
    });
}

function savedAnswerData(value) {
  var dataForm = {
    value: value,
  };
  axios
    .post(
      "https://getdev-b2c0b.firebaseio.com/company/sly/answerValue/.json",
      dataForm
    )
    .then((response) => {
      if (response.status == 200) {}
    });
}

function savedForm(city, company, consult, email, name, phone) {
  var dataForm = {
    city: city,
    company: company,
    consult: consult,
    email: email,
    name: name,
    phone: phone,
  };
  axios
    .post(
      "https://getdev-b2c0b.firebaseio.com/company/sly/formContact/.json",
      dataForm
    )
    .then((response) => {
      if (response.status == 200) {}
    });
}

//nuevo

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
  res.writeHead(200, {
    "Content-Type": "text/html"
  });
  res.write(messengerButton);
  res.end();
});

// Message processing
app.post("/webhook", async function (req, res) {
  console.log(req.body);
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === "page") {
    // createInfoChat();

    // Muestra los datos obtenidos



   


    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function (entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function (event) {

        if (event.message) {
          receivedMessage(event);
        } else if (event.postback) {

          
          const payload = event.postback.payload;
          
       messageGlobal =    payload;


       console.log("mensaje34: "+messageGlobal);
  
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
var messageGlobal;
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
  messageGlobal = messageReceip;
  var messageAttachments = message.attachments;

  console.log("message45: " + messageText);

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
          elements: [{
              title: "rift",
              subtitle: "Next-generation virtual reality",
              item_url: "https://www.oculus.com/en-us/rift/",
              image_url: "http://messengerdemo.parseapp.com/img/rift.png",
              buttons: [{
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
              buttons: [{
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


async function sendMedia(title, media, url3) {

  var url = `https://graph.facebook.com/v18.0/me/messages`;

  var payload = {
    recipient: {
      id: recipientId,
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: media,
          is_reusable: true, // Reutilizable para que Facebook guarde la imagen
        },
      },
    },
  };

  try {
    var response = await axios.post(url, payload, {
      params: {
        access_token: process.env.PAGE_ACCESS_TOKEN
      },
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Imagen enviada exitosamente:", response.data);
  } catch (error) {
    console.error("Error al enviar la imagen:", error.response?.data || error.message);
  }
}





async function sendLink(urlData) {
  var url = `https://graph.facebook.com/v18.0/me/messages`;

  var payload = {
    recipient: {
      id: recipientId,

    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "¡Haz clic en el siguiente enlace!",
          buttons: [{
            type: "web_url",
            url: urlData,
            title: "Visitar enlace",
          }, ],
        },
      },
    },
  };

  try {
    var response = await axios.post(url, payload, {
      params: {
        access_token: process.env.PAGE_ACCESS_TOKEN
      },
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Enlace enviado exitosamente:", response.data);
  } catch (error) {
    console.error("Error al enviar el enlace:", error.response?.data || error.message);
  }
}

function sendEventAnalitics() {

}


async function sendMediaVideo(title, urlData, data) {
  const url = `https://graph.facebook.com/v18.0/me/messages`;

  const payload = {
    recipient: {
      id: recipientId,
    },
    message: {
      attachment: {
        type: "video",
        payload: {
          url: urlData,
          is_reusable: true, // Guardar el video como reutilizable
        },
      },
    },
  };

  try {
    const response = await axios.post(url, payload, {


      params: {
        access_token: process.env.PAGE_ACCESS_TOKEN
      },
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Video enviado exitosamente:", response.data);
  } catch (error) {
    console.error("Error al enviar el video:", error.response?.data || error.message);
  }
}

async function sendMultipleButtonTemplates() {
 // const opciones = ["Opción 1", "Opción 2", "Opción 3", "Opción 4", "Opción 5", "Opción 6"];
  const url = `https://graph.facebook.com/v18.0/me/messages`;

  // Dividir las opciones en grupos de 3 botones
  const grupos = [];
  for (let i = 0; i < opcionesMultiple.length; i += 3) {
    grupos.push(opcionesMultiple.slice(i, i + 3));
  }

  for (const grupo of grupos) {
    const buttons = grupo.map(opcion => ({
      type: "postback",
      title: opcion,
      payload: opcion,
     // payload: `PAYLOAD_${opcion.replace(/\s+/g, "_").toUpperCase()}`
    }));

    const payload = {
      recipient: { id: recipientId },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text: "Selecciona una opción:",
            buttons: buttons
          }
        }
      }
    };

    try {
      const response = await axios.post(url, payload, {
        params: { access_token:process.env.PAGE_ACCESS_TOKEN },
        headers: { "Content-Type": "application/json" }
      });
      console.log("Botones enviados exitosamente:", response.data);
      opcionesMultiple = [];
    } catch (error) {
      console.error("Error al enviar botones:", error.response?.data || error.message);
    }
  }
}





function validationMsj(value) {
  //VALIDA QUE LA RUTA NO SEA VACIA


  setTimeout(() => {
   

  console.log("VALIDANDO CREATE4" + value + " " + "https://getdev-b2c0b.firebaseio.com/company/sly/chatbotCreateMessage/" +
    idChat +
    "/options/" +
    value +
    "/.json");
  if (value != null) {
    axios
      .get(
        "https://getdev-b2c0b.firebaseio.com/company/sly/chatbotCreateMessage/" +
        idChat +
        "/options/" +
        value +
        "/.json"
      )
      .then((response) => {
        if (response.status == 200) {
          var jsonData = JSON.stringify(response.data, null, 2);

          var dataItemSelected = JSON.parse(jsonData);

          var type = dataItemSelected["type"];
          var route = dataItemSelected["routeStep"];

          var title = dataItemSelected["title"];

          if (type == "chat" || type == "text") {
            repeatMessageOption = false;
            sendMsj(title, route, type, false);
          
            console.error("ENVIADA EL CHAT: " + route);

         
              validationMsj(route);
          
          }
          if (type == "multiple") {
          //  sendMultipleButtonTemplates();
            if (repeatMessageOption == true) {
              repeatMessageOption = false;
              var keys = Object.keys(dataItemSelected["optionsStep"]);
              var position = 0;
              var success = false;

              keys.forEach(function (key) {
                console.log("datos: " + key);

                position += 1;
                console.log("global: " + messageGlobal.toLowerCase());

                if (key.toLowerCase() == messageGlobal.toLowerCase()) {
                  success = true;
                  var list2 = dataItemSelected["optionsStep"];

                  var listProm = json2array(list2);
                  console.error("RESULTADO DE MULTIPLE: " + listProm);

                  var positionFinal = position - 1;
                  console.error("SELECCIONADO DE MULTIPLE: " + positionFinal);
                  var routeMultiple = listProm[positionFinal];
                  console.error("RUTA SELECCIONADA MULTIPLE: " + routeMultiple);
                  var newData = {
                    routeStep: routeMultiple,

                  };

                  console.log("VALIDANDO CREATE1-");
                 /* axios
                    .patch(
                      "https://getdev-b2c0b.firebaseio.com/company/sly/chatbotCreateMessage/" +
                      idChat +
                      "/options/" +
                      value +
                      "/.json", newData
                    )
                    .then((response) => {
                      console.log('Datos actualizados23:', response.data);

                    });*/

                  validationMsj(routeMultiple);
                }
              });

              if (success == false) {
                sendMsj(
                  "No reconocemos esta opción",
                  route,
                  type,
                  true
                );

              }
            } else {
              console.error("DATOS SELECTED1------: " + route);

              var list2 = dataItemSelected["optionsMulti"];

              var list = json2array(list2);

              console.log("longitud: " + list[0]);

              var listString = "";
              opcionesMultiple = list;
        

              for (var i = 0; i < list.length; i++) {
                console.log("longitud2: " + list[i]);
                listString += i + 1 + ". " + capitalize(list[i]) + "\n";
              }
              var message = title + ":" + " \n\n" + listString;

              console.log("mensajeopcionmultiple: " + message);

              //  setTimeout(function () {
              //   sendMsj(receiver, message, route);
              //hola
              //firme
              //poder

              repeatMessageOption = true;
   sendMsj(message, "route", "multiple", false);
             /* if (route == undefined) {
            
                   sendMsj(message, "route", "multiple", false);
               



              } else {
                repeatMessageOption = true;
                sendMsj(message, route, type, false);
              }*/
            }
          }

          if (type == "terms") {
            //VALIDA POLICIAS
            console.error("VALIDA POLITICAS");
            var listString =
              "Aceptar los terminos y condiciones" +
              "\n" +
              "1.Aceptar" +
              "\n" +
              "2.Rechazar";

              opcionesMultiple =  ["Aceptar","Rechazar"];
            if (repeatMessageOption == true) {

              console.error("VALIDA EL MENSAJE RESPUESTA POLITICAS: " + messageGlobal);
              if (messageGlobal == "Aceptar") {

                var list2 = dataItemSelected["optionsStep"];




                var listProm = json2array(list2);



                console.error("VALIDA EL CONTENIDO DE LA LISTA TEMS: " + listProm);




                var position = 0;

                var keys = Object.keys(dataItemSelected["optionsStep"]);
                keys.forEach(function (key) {

                  position += 1;


                  if (key.toLowerCase() == "si") {

                    var positionFinal = position - 1;
                    route = listProm[positionFinal];
                    console.log("VALIDANDO CREATE2");

                  }
                });

                console.error("RUTA SELECCIONADA TERMS" + route);
                repeatMessageOption = false;
                opcionesMultiple = [];
                validationMsj(route);
              } else {
                sendMsj(
                  "Para continuar debes aceptar los terminos y condiciones",
                  route,
                  type,
                  true
                );
              }
            } else {
              repeatMessageOption = true;
              console.error("ENVIA MENSAJE POLITICAS");
              sendMsj(listString, "route", type, false);
            }
          }

          if (type == "answer") {
            var title = dataItemSelected["title"];

            if (repeatMessageOption == true) {
              repeatMessageOption = false;
              savedAnswerData(messageGlobal);

              validationMsj(route);
              sendMsj(listString, route, type, false);
            } else {
              sendMsj(title, "route", type, true);
            }
          }

          if (type == "email") {

            sendMsj("Enviado email", route, type, true);


            validationMsj(route);




          }

          if (type == "form") {
            var listString =
              "Formulario de contacto" +
              "\n" +
              "1.Nombre" +
              "\n" +
              "2.Empresa" +
              "\n" +
              "3.Correo electronico" +
              "\n" +
              "4.Ciudad" +
              "\n" +
              "5.Consulta";

            if (repeatMessageOption == true) {
              repeatMessageOption = false;




              console.error("GUARDANDO FORMULARIO");
              let lista = messageGlobal.split(", ");

              if (lista.length == 4) {
                validationMsj(route);

                var city = lista[0];
                var company = lista[1];
                var consult = lista[2];
                var email = lista[3];
                var name = lista[4];
                var phone = lista[5];


                savedForm(city, company, consult, email, name, phone);
              } else {

                sendMsj("Faltan campos por llenar", route, type, true);
              }

              //  sendMsj("Gracias por compartir", route, type, true);
            } else {
              repeatMessageOption =true;
              sendMsj(listString, "route", type, false);
            }
          }

          if (type == "agent") {
            savedAlertAgentData();
            sendMsj("Buscando agentes disponibles", route, type, true);
            validationMsj(route);
          }

          if (type == "end") {
            if (repeatMessageOption == true) {
              console.log("VALIDAR FINALIZACIÓN CHAT");
              opcionesMultiple = [];
              if (messageGlobal == "Si") {
                
                repeatMessageOption = false;
                sendMsj("Gracias por comunicarte", route, type, true);
                setTimeout(function () {
                  repeatChat();
                
                }, 3000);
              
             
              } else {

                if (messageGlobal == "Ir al inicio") {
                  repeatMessageOption = false;
                  repeatChat();
                } else {
                  if (messageGlobal == "Contactar a un acesor") {
                    repeatMessageOption = false;
                    savedAlertAgentData();
                    sendMsj("Buscando agentes disponibles", route, type, true);
                  } else {
                    sendMsj("Elige alguna opción", route, type, true);
                  }

                }
              }

            } else {
              var listString =
                "Deseas terminar la converzación" +
                "\n" +
                "1.Si" +
                "\n" +
                "2.Ir al inicio" +
                "\n" +
                "3.Contactar a un acesor";

                opcionesMultiple = ["Si","Ir al inicio","Contactar a un acesor"]
                repeatMessageOption = true;

            // sendMsj(listString, route, type, true);
            sendMsj(listString, "route", type, true);
            }
          }
          if (type == "media") {

            console.error("ENVIA MENSAJE MEDIA");
            var url = dataItemSelected["link"];
            var title = dataItemSelected["subtitle"];

            var type = dataItemSelected["typeUrl"];

            if (type == "Imagen") {
              sendMedia(title, url, 'image');
            } else {
              sendMediaVideo(title, url, 'video');
            }

            validationMsj(route);

            sendMsj(message, route, type, false);
          }
          if (type == "pause") {
            // var valuePause = dataItemSelected["value"];

            setTimeout(function () {
              sendMsj(message, route, type, false);
              validationMsj(route);
            
            }, 6000);
          }

          if (type == "analitic") {
            sendEventAnalitics();

            validationMsj(route);

            sendMsj(message, route, type, false);
          }

          if (type == "product") {
            var value = dataItemSelected["link"];

            sendLink(value);

            validationMsj(route);

            sendMsj(message, route, type, false);
          }

          if (type == "link") {
            var link = dataItemSelected["link"];

            sendLink(link);

            sendMsj(message, route, type, false);

            validationMsj(route);
            // sendMsj(receiver, title, route);
          }
        }

        // }
      })
      .catch((error) => {
        console.log("errorfirebasE: " + error); // Manejo de errores
      });
  } else {
    console.log("------CHAT FINALIZADO------");
  }
}, 500);
}




async function sendMsj(
  messageText,
  route,
  type,
  /* information,*/
  notification
) {
  //if(route != null){
  console.log("-----sendmsj---: " + route);

  console.log("routestep1: " + messageText);
  var messageData2 = {
    routeStep: route,
    type: type,

    information: notification,
    text: messageText,
    receipt: recipientId,
  };

  axios
    .post(
      "https://getdev-b2c0b.firebaseio.com/company/sly/messageUsers/" +
      recipientId +
      ".json",
      messageData2
    )
    .then((response) => {
      if (response.status == 200) {
        //validationMsj(response);

        /* setTimeout(function () {
                 validationMsjRepeat(route);
                }, 700);*/

        //  var recipientId = body.recipient_id;
        // var messageId = body.message_id;
        //  var obj = JSON.parse(body);

        console.log("Successfully firebase id ");
      } else {
        console.error("Unable to send message.");
        console.error(response);
      }
    });

  // if (notification == true) {
  console.error("----MENSAJE ENVIADO---" + messageText);

if(opcionesMultiple.length == 0){
  var messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      text: messageText,
    },
  };
  request({
      uri: "https://graph.facebook.com/v2.6/me/messages",
      qs: {
        access_token: process.env.PAGE_ACCESS_TOKEN
      },
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
}else{
  sendMultipleButtonTemplates();
}
  // mark incoming message as read
  /* await axios({
      method: "POST",
      url: `https://graph.facebook.com/v18.0/${recipientId}/messages`,
      headers: {
        Authorization: `Bearer ${GRAPH_API_TOKEN}`,
      },
      data: {
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageFinal.id,
      },
    });*/

  /* axios
      .post("https://graph.facebook.com/v18.0/" + recipientId + "/messages", {
        headers: {
          Authorization: `Bearer ${GRAPH_API_TOKEN}`,
     
          "Content-Type": "application/json",
          
          
        },
        params: {
          messaging_product: "whatsapp",
          to: to,
          text: { body: messageText },
          context: {
            message_id: messageText, // shows the message as a reply to the original user message
          },
        },
      })
      .then((response) => {
      
        console.error("mensaje enviado--" );
    }).catch((error) => {
        console.error("errorfirebassend: " + error); // Manejo de errores
      });;*/
  //}

  /*
  axios
    .get(
      "https://getdev-b2c0b.firebaseio.com/company/sly/chatbotCreateMessage/" +
        idChat +
        "/options/" +
        route +
        "/.json"
    )
    .then((response) => {
      if (response.status == 200) {
        
         console.log("sendmsj---1: " + route);
        
          const jsonData = JSON.stringify(response.data, null, 2);
        
        
       var title = jsonData["title"];
        
        var business_phone_number_id = "545034448685967"; 
        var to = "573013928129";
       
        
        axios
    .post(
     `https://graph.facebook.com/v18.0/545034448685967/messages`,
    {
        messaging_product: "whatsapp",
        to: to,
        text: { body: "title" },
       
      },
    )
    .then((response) => { 
        });
        
        
      }});*/

  console.log("routeSend: " + route);
  //if(route != null){

  // }
}



async function sendMsjNoNotification(
  messageText,
  route,
  type,
  /* information,*/
  notification
) {
  //if(route != null){
  console.log("-----sendmsj---: " + route);

  console.log("routestep1: " + messageText);
  var messageData2 = {
    routeStep: route,
    type: type,

    information: notification,
    text: messageText,
    receipt: recipientId,
  };

  axios
    .post(
      "https://getdev-b2c0b.firebaseio.com/company/sly/messageUsers/" +
      recipientId +
      ".json",
      messageData2
    )
    .then((response) => {
      if (response.status == 200) {
       

        console.log("Successfully firebase id ");
      } else {
        console.error("Unable to send message.");
        console.error(response);
      }
    });

}

// }
//}
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

var idData;
var routeData;

function json2array(json) {
  var result = [];
  var keys = Object.keys(json);
  keys.forEach(function (key) {
    result.push(json[key]);
  });
  return result;
}

const closeTriggers = [];
const openProductTriggers = [];

function initTimeFun(description){

}

function  sendMsjAdmin(context, description){

  opcionesMultiple = [];
  sendMsj(description, "route", "chat", false);

}

async function triggersFun(){

  

  try {
    // Hacer la solicitud GET a Firebase
    const response = await axios.get( 
      "https://getdev-b2c0b.firebaseio.com/company/sly/triggers"+ 
    
      "/.json"
    );

    // Verificar si hay datos disponibles
    if (response.data) {
      const dataTriggersChat = response.data;
      console.log("consumir triggers: "+dataTriggersChat);
      // Iterar sobre los hijos del nodo "triggers"
      Object.keys(dataTriggersChat).forEach((key) => {
        const dataEvent = dataTriggersChat[key];
        const description = dataEvent.description;

        console.log("triggers1: "+dataEvent.event);
        

        

        if (dataEvent.event == "Inactivo por 30 segundos") {
          initTimeFun(description);
        }

        if (dataEvent.event == "Abrir chat") {

          console.log("triggers2: "+dataEvent.event+" "+description);
          sendMsjAdmin(context, description);
        }

        if (dataEvent.event == "Cerrar chat") {
          closeTriggers.push(description);
        }

        if (dataEvent.event == "Abrir un producto") {
          openProductTriggers.push(description);
        }
      });
    } else {
      console.log("No data available in triggers");
    }
  } catch (error) {
    console.error("Error fetching triggers:", error);
  }

}


function createInfoChat() {
  // var recipientId = "hola";
  var messageData2 = {
    apertura: 0,
    typeOpen: "facebook",
    contactAdd: "nuevo",
    date: "2025-01-01 08:15",
    departamentTitle: "Nuevo23",
    getHelp: 1,
    idAgent: "d1",

    idChat: "/company/sly/chatbotCreateMessage/" + idChat,

    idEtiqueta: "d1",
    idMessage: "/company/sly/messageUsers/" + recipientId,
    idTrigger: "d1",
    ip: "1.0.1",
    levelService: 5,
    location: "http://localhost:55927/#/chatbot",
    mediaPlayer: 7,
    mediaResp: 4,
    mediaSesion: 5,
    messageUser: recipientId,
    name: "Segurex",
    open: "visitante",
    rating: 4,
    titleAgent: "Joser",
    titleEtiqueta: "Compras",
    titleTrigger: "Nuevo",
    totalHour: 4,
    type: "1",
  };

  //CREA LA INFORMACIÓN DE LA CONVERZACIÓN

  axios
    .post(
      "https://getdev-b2c0b.firebaseio.com/company/sly/infoChat/.json",
      messageData2
    )
    .then((response) => {

      
      repeatChat();
      //repeatChat();
      //INICIA EL CHAT
    });
}


function repeatChat() {
  console.log("VALIDANDO CREATE3");
  axios
    .get(
      "https://getdev-b2c0b.firebaseio.com/company/sly/chatbotCreateMessage/" +
      idChat +
      "/options/.json"
    )
    .then((response) => {
      var jsonData = JSON.stringify(response.data, null, 2); // Convierte a JSON legible
      console.log("Datos en formato JSON:", jsonData);

      //   var recipientId = body.recipient_id;
      // var messageId = body.message_id;

      var obj = JSON.parse(jsonData);

      var listJson = json2array(obj);
      console.log(
        "lenghtoptionsinit : " +
        json2array(obj).length +
        " : " +
        json2array(obj)[0]
      );

      var dataItemSelected;
      for (var i = 0; i < json2array(obj).length; i++) {
        var dataItem = json2array(obj)[i];

        console.log("welcome: " + dataItem["welcome"]);

        if (dataItem["welcome"] == true) {
          dataItemSelected = dataItem;
        }
      }

      console.log("Successfully firebase2: " + response.data + "  :  ");

    //  var title = dataItemSelected["title"];
    //  console.log("Successfully firebase566" + dataItemSelected.key);
      var route = dataItemSelected["id"];
   //   var type = dataItemSelected["type"];

    //  console.error("body2: " + title);

    
    //  sendMsj(title, route, type, false);
   

      validationMsj(route);
    });
}

async function callSendAPI(messageData) {

  console.log("message" + messageData);

  console.log("createinfochat");




  function executeInit() {

    axios
      .get(
        "https://getdev-b2c0b.firebaseio.com/company/sly/messageUsers/" +
        recipientId +
        "/.json"
      )
      .then((response) => {
        //CONSULTA LOS MENSAJES DEL USUARIO

        if (response.data == null) {

          console.log("CREATE INFO CHAT");


          //CREA LA INFORMACIÓN DE LA CONVERZACIÓN

          createInfoChat();
        } else {

          console.log("CREATE INFO CHAT2");
          var jsonData = JSON.stringify(response.data, null, 2); // Convierte a JSON legible

          //  var recipientId = body.recipient_id;
          // var messageId = body.message_id;

          var obj = JSON.parse(jsonData);

          var listJson = json2array(obj);

          let dataItemSelected = [];

          //VALIDA LOS MENSAJES INFORMATIVOS
          for (var i = 0; i < json2array(obj).length; i++) {
            var dataItem = json2array(obj)[i];

            if (dataItem["information"] != true) {
              dataItemSelected.push(dataItem);
            }
          }

          // GENERA LA POSICION DE LAS 2 ULTIMAS
          var position = dataItemSelected.length - 2; //changed1

          var route = dataItemSelected[position]["routeStep"];
          console.error("LA RUTA EN EL INICIO DE LA APP1: " + route);
          if (route == "route") {

            route = dataItemSelected[dataItemSelected.length - 1]["routeStep"];

          }

          console.error("LA RUTA EN EL INICIO DE LA APP2: " + route);
          var type = dataItemSelected[dataItemSelected.length - 1]["type"];

          console.error("EL TIPO DE MENSAJE EN EL INICIO DE LA APP: " + type);

          if(route != undefined){

          

          if (
            type == "multiple" ||
            type == "answer" ||
            type == "form" ||
            type == "end" ||
            type == "terms"
          ) {
            repeatMessageOption = true;
          }

          validationMsj(route);
        }else{
          repeatMessageOption = false;
          sendMsj("No hay mas opciones", "route", type, false);
          sendMsj("Iniciando chat", "route", type, false);

       
      
          setTimeout(function () {
            repeatChat();
          
          }, 1500);
        }
        }
      })
      .catch((error) => {
        console.log(error); // Manejo de errores
      });

  }
  try {
    var response = await axios.get("https://getdev-b2c0b.firebaseio.com/company/sly/chatMessage/whatsapp/.json");
    console.log(response.data); // Muestra los datos obtenidos

    var jsonData = JSON.stringify(response.data, null, 2); // Convierte a JSON legible
    console.log("Datos en formato JSONprincipal:", jsonData);
    //  console.log("Datos en formato JSONprincipal:", response.data);
    idChat = jsonData.replace('"', '').replace('"', '');
    sendMsjNoNotification(messageGlobal, "information", "chat", true);
    executeInit();
    triggersFun();

    console.log("Datos en formato JSONprincipal68: " + idChat);
  } catch (error) {
    console.error('Error al obtener datos:', error.message);
  }





  // send a reply message as per the docs here https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages

  // mark incoming message as read
  /* await axios({
    method: "POST",
    url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
    headers: {
      Authorization: `Bearer ${GRAPH_API_TOKEN}`,
    },
    data: {
      messaging_product: "whatsapp",
      status: "read",
      message_id: message.id,
    },
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