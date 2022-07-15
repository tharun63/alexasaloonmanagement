
const Alexa = require('ask-sdk-core');
const axios = require('axios');
const https = require('https');

// const StartedInProgressScheduleAppointmentIntentHandler = {
//   canHandle(handlerInput) {
//     const { request } = handlerInput.requestEnvelope;
//     return request.type === 'IntentRequest'
//       && request.intent.name === 'ScheduleAppointmentIntent'
//       && request.dialogState !== 'COMPLETED';

//   },}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome to saloon appointment scheduler,would you like to schedule an appointment ?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const reviewHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SaloonIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'may i know your preferred location';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};





const GetSaloonDataHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'locationIntent';
  },
  async handle(handlerInput) {
          
    var locate = handlerInput.requestEnvelope.request.intent.slots.location.value;
     const attributesManager = handlerInput.attributesManager;  
     console.log(locate);
    // const responseBuilder = handlerInput.responseBuilder;  
  
    const attributes = await attributesManager.getSessionAttributes() || {};  
    attributes.location = locate;  
    attributesManager.setSessionAttributes(attributes);  

    // const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    let outputSpeech = 'This is the default abc message.';

    await getRemoteData(`https://alexasaloondata.herokuapp.com/saloons?location=${locate}`)
      .then((response) => {
        const data = JSON.parse(response);
           
        // var locateone = JSON.stringify(locate)
        
        const data1 = []
     const data2 = data.map(saloon=>{
      let name1 = saloon.name;
      data1.push(name1)
     
  })
  outputSpeech = `There are currently ${data.length} saloons available in ${locate}. The names are ${data1}. what would you like to choose,`;

    // console.log(data1)

        
      })
      .catch((err) => {
        console.log(`ERROR: ${err.message}`);
        // set an optional error message here
        // outputSpeech = err.message;
      });

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt('add a reprompt if you want to keep the session open for the user to respond')
      .getResponse();
  },
};






const GetSaloonsDataHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SaloonNameIntent';
  },
  async handle(handlerInput) {
    let outputSpeech = 'This is the default message.';
    var saloons = handlerInput.requestEnvelope.request.intent.slots.saloonName.value;
     const attributesManager = handlerInput.attributesManager;  
     
    // const responseBuilder = handlerInput.responseBuilder;  
  
    const attributes = await attributesManager.getSessionAttributes() || {};  
    attributes.saloonName = saloons;  
    attributesManager.setSessionAttributes(attributes);  
    
    let saloonId= handlerInput.requestEnvelope.request.intent.slots.saloonName.slotValue.resolutions.resolutionsPerAuthority[0].values[0].value.id;
    const attributesManager1 = handlerInput.attributesManager;  
        const attribute = await attributesManager.getSessionAttributes() || {};  
            attribute.saloonId = saloonId;  
             attributesManager1.setSessionAttributes(attribute);  

    
    await getRemoteData(`https://alexasaloondata.herokuapp.com/saloons/${saloonId}/services`)
       .then((response) => {
        const data = JSON.parse(response);
        outputSpeech = `There are currently ${data.length} services available in the saloon. `;
        for (let i = 0; i < data.length; i += 1) {
          if (i === 0) {
            // first record
            outputSpeech = `${outputSpeech}The services are: ${data[i].speciality}, `;
          } else if (i === data.length - 1) {
            // last record
            outputSpeech = `${outputSpeech}and ${data[i].speciality} .what would you like to choose`;
          } else {
            // middle record(s)
            outputSpeech = `${outputSpeech + data[i].speciality}, `;
          }
        }
      })
      .catch((err) => {
        console.log(`ERROR: ${err.message}`);
        // set an optional error message here
        // outputSpeech = err.message;
      });

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt('add a reprompt if you want to keep the session open for the user to respond')
      .getResponse();
  },
};


const specialityHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'serviceIntent';
  },
  async handle(handlerInput) {
    var service = handlerInput.requestEnvelope.request.intent.slots.services.value;
     const attributesManager = handlerInput.attributesManager;  
    
  
    const attributes = await attributesManager.getSessionAttributes() || {};  
    attributes.serviceType = service;  
    attributesManager.setSessionAttributes(attributes);  
    
    
    let outputSpeech = 'okay, what day or date would you like to pick ?.';
      
    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt('add a reprompt if you want to keep the session open for the user to respond')
      .getResponse();
  },
};



const GetSlotDataHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'DaysIntent';
  },
  async handle(handlerInput) {
    let outputSpeech = 'This is the default message.';
    let week ;
    
     const attributesManager = handlerInput.attributesManager;
    const attributes  =await attributesManager.getSessionAttributes() || {};
    const saloonId = attributes.saloonId
    
    
     const attributesManagerOne = handlerInput.attributesManager;
    const attributesOne  =await attributesManagerOne.getSessionAttributes() || {};
    const saloonName = attributesOne.saloonName
    
     let day = handlerInput.requestEnvelope.request.intent.slots.day.value;
     const attributesManagerTwo = handlerInput.attributesManager;  
     
    // const responseBuilder = handlerInput.responseBuilder;  
    const attributesTwo = await attributesManagerTwo.getSessionAttributes() || {};  
    attributes.selectedDay = day;  
    attributesManager.setSessionAttributes(attributesTwo);  
   

    await getRemoteData(`https://alexasaloondata.herokuapp.com/saloons/${saloonId}/slots`)
      .then((response) => {
        const data = JSON.parse(response);
        
         week = handlerInput.requestEnvelope.request.intent.slots.day.value
        
        let week1 = week.toLowerCase()
        
        const data3 = data.slots
        const data1 = []
     const data2 = data3.map(saloon=>{
      if(saloon.day===week1 && saloon.isBooked===false){
       let name1 = saloon.slot;
       data1.push(name1)
     }
   })
   outputSpeech = `There are currently ${data1.length} slots available in ${saloonName} on ${week}. The slots are ${data1}.
   what would you like to pick`;

    // console.log(data1)

        
      })
      .catch((err) => {
        console.log(`ERROR: ${err.message}`);
        // set an optional error message here
        // outputSpeech = err.message;
      });

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt('add a reprompt if you want to keep the session open for the user to respond')
      .getResponse();
  },
};


const PutSlotDataHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'slotIntent';
  },
  async handle(handlerInput) {
    let outputSpeech = 'This is the default message.';
    let slotId;
    let date;
     const attributesManager = handlerInput.attributesManager;
    const attributes  =await attributesManager.getSessionAttributes() || {};
    let saloonId = attributes.saloonId
    let saloonName=attributes.saloonName;
    let day=attributes.selectedDay;
    let day1=day.toLowerCase();
    
   // const saloonName = attributes.saloonName
      let slot= handlerInput.requestEnvelope.request.intent.slots.slotz.slotValue.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    

    // const responseBuilder = handlerInput.responseBuilder;  
  
    attributes.slot = slot;  
    attributesManager.setSessionAttributes(attributes);  

    await getRemoteData(`https://alexasaloondata.herokuapp.com/saloons/${saloonId}/slots`)
      .then((response) => {
        const data = JSON.parse(response);
        
        
        
        const data3 = data.slots
       const data1 = []
     const data2 = data3.map(slote=>{
      if(slote.day===day1 && slote.slot===slot){
          date=slote.date;
         slotId = slote._id;
       data1.push(slotId)
       //axios.put(`https://alexasaloondata.herokuapp.com/saloons/${saloonId}/slots/${slotId}`,{"isBooked":true})
     }
   })
      attributes.date=date;
     attributesManager.setSessionAttributes(attributes);
     attributes.slotId= slotId;
     attributesManager.setSessionAttributes(attributes);
   outputSpeech = `would you like to confirm your booking request at ${saloonName} saloon on ${date} that is ${day1} for the slot ${slot}.If yes please reply with confirm`;

    // console.log(data1)

        
      })
      .catch((err) => {
        console.log(`ERROR: ${err.message}`);
        // set an optional error message here
        // outputSpeech = err.message;
      });

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt('add a reprompt if you want to keep the session open for the user to respond')
      .getResponse();
  },
};




const PostBookingDataHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'confirmIntent';
  },
  async handle(handlerInput) {
    let outputSpeech = 'This is the default message.';
     const attributesManager = handlerInput.attributesManager;
    const attributes  =await attributesManager.getSessionAttributes() || {};
    let saloonId = attributes.saloonId;
    let saloonname=attributes.saloonName;
    let day=attributes.selectedDay;
    let day1=day.toLowerCase();
    let slotId=attributes.slotId;
    let serviceType=attributes.serviceType;
    let slot=attributes.slot;
    let date1=attributes.date;
    let place=attributes.location;
    let book={
        "saloonName":saloonname,
        "saloon_id":saloonId,
        "slot_id":slotId,
        "day":day1,
        "date":date1,
        "speciality":serviceType,
        "location":place,
        "slot":slot
    }

    await axios.put(`https://alexasaloondata.herokuapp.com/saloons/${saloonId}/slots/${slotId}`,{"isBooked":true})

    axios.post('https://alexasaloondata.herokuapp.com/bookings',book);

    // const responseBuilder = handlerInput.responseBuilder;  
  
      outputSpeech = `Thank you for booking with Alexa saloon !,your booking has been confirmed  `;

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt('add a reprompt if you want to keep the session open for the user to respond')
      .getResponse();
  },
};

const ShowBookingsHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'bookingIntent';
  },
  async handle(handlerInput) {
    let outputSpeech = 'This is the default message.';
    let slotId;
    // let date;
     const attributesManager = handlerInput.attributesManager;
    const attributes  =await attributesManager.getSessionAttributes() || {};
    let saloonId = attributes.saloonId
    let saloonName=attributes.saloonName;
    let day=attributes.selectedDay;
    let day1=day.toLowerCase();
    let slot = attributes.slot

      let date = attributes.date;
     attributesManager.setSessionAttributes(attributes);
     attributes.slotId= slotId;
     attributesManager.setSessionAttributes(attributes);
   outputSpeech = ` you have a booking request at ${saloonName} saloon on ${date} that is ${day1} for the slot ${slot}.`;

    // console.log(data1)

        

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt('add a reprompt if you want to keep the session open for the user to respond')
      .getResponse();
  },
};




const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Hello World!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const getRemoteData = (url) => new Promise((resolve, reject) => {
  const client = url.startsWith('https') ? require('https') : require('http');
  const request = client.get(url, (response) => {
    if (response.statusCode < 200 || response.statusCode > 299) {
      reject(new Error(`Failed with status code: ${response.statusCode}`));
    }
    const body = [];
    response.on('data', (chunk) => body.push(chunk));
    response.on('end', () => resolve(body.join('')));
  });
  request.on('error', (err) => reject(err));
});

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
         LaunchRequestHandler,
        reviewHandler,
         GetSaloonDataHandler,
        GetSaloonsDataHandler,
        specialityHandler,
        GetSlotDataHandler,
        PutSlotDataHandler,
        PostBookingDataHandler,
        ShowBookingsHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();