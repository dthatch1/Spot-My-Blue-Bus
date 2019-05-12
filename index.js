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
app.intent('favorite color', (conv, {color}) => {
    const luckyNumber = color.length;
    // Respond with the user's lucky number and end the conversation.
    conv.close('Your lucky number is ' + luckyNumber);
});

const db = admin.firestore();
const collectionRef = db.collection('timetable');
const usaTime = new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"},{hour12: false}));
app.intent('find bus', (conv, {places,busroutes}) => {

  var route = busroutes;
  /*if(busroute.includes("dcl")){
    route = 'DCL';
  }else if(busroute.includes("ws")){
    route = 'WS';
  }*/
  const collectionRef = db.collection(`${route}`);
  
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
app.intent('route_direction_location', (conv, {places,busroutes,directions}) => {
    var place = places;
    var busroute = busroutes;
    var direction = directions;
    // Calculate Current Time
  	
    var h = usaTime.getHours()+''+usaTime.getMinutes()+'';
    var day = usaTime.getDay();
  	console.log("USA time is "+ usaTime);
  	console.log("USA time is hm "+ h);
    // Calculate week or weekend
    var week = "week";
    if(day ===0 || day === 6)
        week = "weekend";
    // Create colleciton string
    var collection_string = '/'+busroute+'/'+week+'/'+direction;
    console.log('Collection String : ' + collection_string);
    const collectionRef = db.collection(collection_string);
 	console.log('Collection Ref' + collectionRef);
      return collectionRef.where('time','>',h)
      .limit(4)
      .get()
      .then((snapshot) => {
          var result = snapshot.docs.map((doc) => doc.get('time')).join(',');
          console.log('Query Result :'+result);
          var minutes = result.split(',');
          var minute = ' ';
          for (var index = 0; index < minutes.length; ++index) {
            console.log('minutes[index] '+minutes[index]);
            console.log('minutes[index].substring(0,2) '+minutes[index].substring(0,2));
            console.log('usaTime.getHours() '+usaTime.getHours());
            if(minutes[index].substring(0,2) == (usaTime.getHours()+1)){
              console.log('next hour');
              var a = parseInt(60-usaTime.getMinutes());
              var b = parseInt(minutes[index].substring(2,4));
              var c = a+b;
              minute = minute+ c;
              console.log('minuin'+minute);
              minute = minute+' ';
            }else if(minutes[index].substring(0,2) == usaTime.getHours()){
              console.log('this hour '+minutes[index]);
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

// action for Spot
app.intent('spotbus', (conv, {busroutes,direction}) => {
    console.log("spotbus intent is invoked with " + busroutes + " and "+ direction);

  	
    var h = usaTime.getHours();
    var day = usaTime.getDay();
    var week = "week";
    if(day ===0 || day === 6)
        week = "weekend";
    console.log(" week " + week);
  	conv.close(" this is " +busroutes + " some "+ week );
  	var collection_string = '/'+busroutes+'/'+week+'/'+'outbound';
    console.log('Collection String : ' + collection_string);
    const collectionRef = db.collection(collection_string);
 	console.log('Collection Ref' + collectionRef);
      return collectionRef.where('time','>',h)
      .limit(4)
      .get()
      .then((snapshot) => {
    
        snapshot.forEach(function(data) {
    console.log("The " + data.key + " dinosaur's score is " + data.val());
  		});
          var result = snapshot.docs.map((doc) => doc.get('time')).join(',');
          console.log('Query Result :'+result);

//    db.collection(busroutes).doc(week).collection("outbound").doc(1915).get()//
 //       .then( snapshot =>{
            //var data = snapshot.data();
            //console.log("data returned from the database is " + data);
        	//console.log("snapshot" +snapshot);
        	//console.log("snapshot val" +snapshot.val());
        	//console.log("snapshot" +snapshot.key());
        	//console.log("snapshot json string" +JSON.stringify(snapshot));
        	//console.log("snapshot doc map" +snapshot.docs.map());
            conv.close("Success fully executed");

        });
	
    // Global exception.
    //console.log("I am  having some trouble. Please contact the developer Dhyanesh");
    //conv.close("I am  having some trouble. Please contact the developer Dhyanesh");
});
// End of Spot_bus
// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);

// https://www.youtube.com/watch?v=7IkUgCLr5oA
