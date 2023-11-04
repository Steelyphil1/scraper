const logging = require("./src/helpers/logging");
const campsiteHandler = require("./src/handlers/campsite-handler");
const dotenv = require("dotenv");
dotenv.config();
const NAMESPACE = "Main Handler";

exports.handler = (event, context, callback) => {
    logging.info(NAMESPACE, "START: with", event);
    executeRequest(event, context, callback);
};

const executeRequest = (event, context, callback) => {
    if (event !== undefined) {
        campsiteHandler.processScrape(event, 0, context, callback);
    } else {
        logging.error(NAMESPACE, "executeRequest: Event Undefined");
    }
};

//ReserveCa
// this.handler({
//     firstName: 'Phillip',
//     lastName: 'Bay',
//     website: 'reserveca',
//     campground: 'pfeiffer-main',
//     campsite: null,
//     type: 'scrape',
//     yearMin: '2023',
//     monthMin: 'Jun',
//     dayMin: '12',
//     yearMax: '2023',
//     monthMax: 'Jun',
//     dayMax: '15',
//     range: false,
//     sourceEmail: 'yosemitescraper420@gmail.com',
//     targetEmails: ['phillip.bay@gmail.com']
// });

//Recreation.Gov
this.handler({
    firstName: "Phillip",                       //String    
    lastName: "Bay",                            //String    
    website: "recreation.gov",                  //String    "recreation.gov" or "reserveca"
    camparea: null,                             //String    "yosemite" or null
    campground: "upper-pines",                  //String    "upper-pines"
    campsite: null,                             //Number    42
    type: "scrape",                             //String    "scrape"
    yearMin: "2023",                            //String    "2023"
    monthMin: "Nov",                            //String    "Oct"
    dayMin: "10",                                //String    "6" or "24"
    yearMax: "2023",                            //String    "2023"
    monthMax: "Nov",                            //String    "Oct"
    dayMax: "12",                                //String    "7" or "14"
    range: false,                               //Boolean   Enforce a specific range
    sourceEmail: "yosemitescraper420@gmail.com",//String
    targetEmails: ["phillip.bay@gmail.com"],    //Array of String Emails
    environment: "local",                       //String 'local or lambda'
});

//ReserveCa Days: '01'-'31'
//Recreation Days: '1'-'31'
//Recreation campsite: 33
//Months "Feb"
//Year "2023"
