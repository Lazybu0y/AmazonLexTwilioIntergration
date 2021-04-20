var twilio = require('twilio');
var qs = require('qs');
var AWS = require('aws-sdk');

exports.handler = (event, context, callback) => {
	try {
		var twilioSMS = qs.parse(event["body-json"]);

		if(!twilioSMS.hasOwnProperty('Body')){
			var error = new Error("Cannot process message without a Body.");
			callback(error);
		} else {

				AWS.config.region = 'ap-southeast-1';
				var lexruntime = new AWS.LexRuntime();
				var userNumber = twilioSMS.From.replace('+', '');
				var params = {
				  botAlias: process.env.BOT_ALIAS,
				  botName: process.env.BOT_NAME,
				  inputText: twilioSMS.Body,
				  userId: userNumber,
				  sessionAttributes: {
				  }
				};
				lexruntime.postText(params, function(err, data) {
					var twimlResponse = new twilio.TwimlResponse();
				  if (err) {
						console.log(err, err.stack); // an error occurred
			      twimlResponse.message('Sorry, we ran into a problem at our end.');
			      callback(err, twimlResponse.toString());
					} else {	
						console.log(data);

						if (data.messageFormat == 'PlainText') {
							twimlResponse.message(data.message);
							callback(null, twimlResponse.toString());
						} else {

							let parsedJSON = JSON.parse(data.message);
							let newData = parsedJSON.messages;

							for (var i = 0; i < newData.length; i++) {
								twimlResponse.message(newData[i].value);
							}
							callback(null, twimlResponse.toString());

						}

						// twimlResponse.message(data.message);
					}
				});
		}
	} catch(e) {
		console.log(e);
		callback(e);
	}
};
