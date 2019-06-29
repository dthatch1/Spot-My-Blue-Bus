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
//const collectionRef = db.collection('timetable');
const usaTime = new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"},{hour12: false}));

// action for Spot
app.intent('spotbus', (conv, {busroutes,directions}) => {
    console.log("spotbus intent is invoked with " + busroutes + " and "+ directions);
  	
    var h = usaTime.getHours();
    var m = usaTime.getMinutes();
  	var hm = Number(h+""+m);
	if (m < 10) {
		hm = hm+'0';
	}
    var day = usaTime.getDay();
    var week = "Week";
    if(day ===0 || day === 6)
        week = "Weekend";
    console.log(" week is : " + week);
  	console.log("this is " +busroutes + " for the "+ week );
	console.log(" USA time h is "+h+" and min is :"+m +" hm :"+hm +" day is "+day);
  	var collection_string = '/DCLWeekendOutbound';
    console.log('Collection String : ' + collection_string);
    const collectionRef = db.collection(collection_string);
 	console.log('Collection Ref' + collectionRef);
      return collectionRef
	  .where('start','>',hm)
	  .limit(2)
	  .get()
	  .then((snapshot) => {
		// This is a qury snapshot : 
		// https://firebase.google.com/docs/reference/js/firebase.firestore.QuerySnapshot
		/*console.log( "snalshot docs: "+snapshot.docs );
		console.log( "snalshot empty: "+snapshot.empty );
		console.log( "snalshot metadata: "+snapshot.metadata );
		console.log( "snalshot query: "+snapshot.query );
		console.log( "snalshot size: "+snapshot.size );*/
        var temp = snapshot.docs.map((doc) => { if (doc.get('all') !== true) return doc.get('start'); }).join(",");
        console.log("temp: "+temp);
        var result = temp.split(",");
		var abc = '';
 		for(var i=0; i<result.length; i++){
          console.log(":"+result[i]+" Length:"+result[i].length);
		  if(result[i].length > 0){
			var temph, tempm;
			if(result[i] < 1000){
				// Time is AM. Hours is single digit.
				result[i] = result[i]+"";
				tempm  = parseInt(result[i].substring(1,3));
				if (tempm < 10 ){
					abc = abc+result[i].substring(0,1)+" O clock and "+result[i].substring(1,2)+" minutes. and ";
				}else{
					abc = abc+result[i].substring(0,1)+" O clock and "+result[i].substring(1,3)+" minutes. and ";
				}
			}else {
				console.log(result[i]);
				result[i] = result[i]+"";
				temph  = parseInt(result[i].substring(0,2));
				tempm  = parseInt(result[i].substring(2,4));
				console.log(temph+" "+tempm);
				if( temph > 12 )
					temph = temph - 12;
				temph = temph+"";
				abc = abc+temph+" O clock and "+tempm+" minutes. and ";

			}           
		  }
        }
		abc = abc.substring(0,(abc.length-4));
        console.log('your Next bus is at'+ abc+' .Do you want more options ?');
		conv.close( 'your Next bus is at'+ abc+' .Do you want more options ?' );
        });
	
    // Global exception.
    //console.log("I am  having some trouble. Please contact the developer Dhyanesh");
    //conv.close("I am  having some trouble. Please contact the developer Dhyanesh");
});
// End of Spot_bus
// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);

// https://www.youtube.com/watch?v=7IkUgCLr5oA
