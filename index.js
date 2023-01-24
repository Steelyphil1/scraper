const logging = require('./src/helpers/logging');
const campsiteHandler = require('./src/handlers/campsite-handler');
const dotenv = require('dotenv');
dotenv.config();
const NAMESPACE = 'Main Handler';

exports.handler = (event, context, callback) => {
    logging.info(NAMESPACE, 'START: with', event);
    executeRequest(event, context, callback);
}

const executeRequest = (event, context, callback) => {
    if(event !== undefined){
        campsiteHandler.processScrape(event, context, callback);
    } else {
        logging.error(NAMESPACE, 'executeRequest: Event Undefined');
    }
}

/*
//ReserveCa
this.handler({ 
    website: 'reserveca', 
    campground: 'pfeiffer-main', 
    campsite: null, 
    type: 'scrape', 
    yearMin: '2023', 
    monthMin: 'Feb', 
    dayMin: '05', 
    yearMax: '2023', 
    monthMax: 'Feb', 
    dayMax: '07', 
    range: false,
    sourceEmail: 'yosemitescraper420@gmail.com',
    targetEmails: ['phillip.bay@gmail.com']
});
*/

/*
//Recreation.Gov
this.handler({ 
    firstName: 'Phillip',                           //String
    lastName: 'Bay',                                //String
    website: 'recreation.gov',                      //String
    campground: 'upper-pines',                      //String
    campsite: 33,                                   //Number
    type: 'scrape',                                 //String
    yearMin: '2023',                                //String
    monthMin: 'Feb',                                //String
    dayMin: '6',                                    //String
    yearMax: '2023',                                //String
    monthMax: 'Feb',                                //String
    dayMax: '7',                                    //String
    range: true,                                    //String
    sourceEmail: 'yosemitescraper420@gmail.com',    //String
    targetEmails: ['phillip.bay@gmail.com']         //String
});
*/

//ReserveCa Days: '01'-'31'
//Recreation Days: '1'-'31'
//Recreation campsite: 33
