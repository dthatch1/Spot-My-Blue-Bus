'use strict';

// Import the Dialogflow module from the Actions on Google client library.
const {dialogflow} = require('actions-on-google');

// Import the firebase-functions package for deployment.
const functions = require('firebase-functions');

const admin = require('firebase-admin');

// Instantiate the Dialogflow client.
const app = dialogflow({debug: true});

admin.initializeApp();

// Handle the Dialogflow intent named 'favorite color'.
// The intent collects a parameter named 'color'.
// This is for practice and tutorial. 
app.intent('favorite color', (conv, {color}) => {
    const luckyNumber = color.length;
    // Respond with the user's lucky number and end the conversation.
    conv.close('Your lucky number is ' + luckyNumber);
});


// Declare Database connection.
const db = admin.firestore();
const collectionRef = db.collection('timetable');

// This intent takes the bus route and place as input. eg: DCL Leroy, WS Mainst, DCL Murray.
// This intent is made as a POC to check the MODEL and response to the user.
app.intent('find bus', (conv, {places,busroutes}) => {

  var route = busroutes;
  /*if(busroute.includes("dcl")){
    route = 'DCL';
  }else if(busroute.includes("ws")){
    route = 'WS';
  }*/
  const collectionRef = db.collection(`${route}`);
  
  var usaTime = new Date().toLocaleString("en-US", {timeZone: "America/New_York"},{hour12: false});
  usaTime = new Date(usaTime);
  var h = usaTime.getHours();
  var day = usaTime.getDay();
  var week = "week";
  if(day ===0 || day === 6)
    week = "weekend";
  var termRef = collectionRef.doc(`${week}`);
	
  return termRef.get()
    .then((snapshot) => {
    	if(snapshot.data()){
      		const { inbound } = snapshot.data();
          	var cm = usaTime.getMinutes();
			var arrayLength = inbound.length;
          	var text  = " ";
          	var count = 0;
          var diff =0;
         	for (var i = 0; i < arrayLength; i++) {
              if(parseInt(inbound[i].substring(0,3)) >= h){
              	count++;
                  if(parseInt(inbound[i].substring(0,3)) === h){
                  diff = inbound[i].substring(3,5) - cm; 
                  if(parseInt(diff) > 0)
                    text = text+ diff+" and ";
                  }else{
                    diff = (60-cm)+parseInt(inbound[i].substring(3,5));
                    if(parseInt(diff) > 0)
                      text = text+ diff+" and ";
                  }
                   if(count ==3)
                     break;
            	}
            }
          text = text.trim().substring(0,(text.length - 5));
          conv.close(" Your next bus is in "+text+" minutes");
        }
    }).catch((e) => {
      console.log('error:', e);
      conv.close('Sorry, try again and tell me another street name.');
	});
 });

// start of route_direction_location
// This is a next version of the Intent. More modified query to have efficient calls to database.
app.intent('route_direction_location', (conv, {places,busroutes,directions}) => {
    var place = places;
    var busroute = busroutes;
    var direction = directions;
	
    // Calculate Current Time
  	var usaTime = new Date().toLocaleString("en-US", {timeZone: "America/New_York"},{hour12: false});
    usaTime = new Date(usaTime);
    var h = usaTime.getHours()+''+usaTime.getMinutes()+'';
    var day = usaTime.getDay();
	
    // Calculate week or weekend
    var week = "week";
    if(day ===0 || day === 6)
        week = "weekend";
 
 // Create colleciton string
    var collection_string = '/'+busroute+'/'+week+'/'+direction;
    const collectionRef = db.collection(collection_string);
      return collectionRef.where('time','>',h)
      .limit(4)
      .get()
      .then((snapshot) => {
          var result = snapshot.docs.map((doc) => doc.get('time')).join(',');
          var minutes = result.split(',');
          var minute = ' ';
          for (var index = 0; index < minutes.length; ++index) {
            if(minutes[index].substring(0,2) == (usaTime.getHours()+1)){
              var a = parseInt(60-usaTime.getMinutes());
              var b = parseInt(minutes[index].substring(2,4));
              var c = a+b;
              minute = minute+ c;
              minute = minute+' ';
            }else if(minutes[index].substring(0,2) == usaTime.getHours()){
              minute = minute+ minutes[index].substring(2,4);
              minute = minute+' ';
            }
          }
          conv.close("you have bus starting from Union in "+minute);
        }).catch((e) => {
          console.log('error:', e);
          conv.close('Sorry, try again and tell me another street name.');
      });
    });
// end of route_direction_location

// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);