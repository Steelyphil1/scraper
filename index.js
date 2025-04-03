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
        campsiteHandler.processScrape(event, 0);
    } else {
        logging.error(NAMESPACE, "executeRequest: Event Undefined");
    }
};

//ReserveCa
// this.handler({
//     firstName: 'Phillip',
//     lastName: 'Bay',
//     website: 'reserveca',
//     camparea: null,
//     campground: 'samuel-p-taylor_creekside',
//     campsite: null,
//     type: 'scrape',
//     yearMin: '2025',                                //String    2025
//     monthMin: 'Apr',                                //String    May or Apr
//     dayMin: '09',                                   //String    09 or 21
//     yearMax: '2025',                                //String    2025
//     monthMax: 'Apr',                                //String    May or Apr
//     dayMax: '10',                                   //String    09 or 21
//     range: false,
//     sourceEmail: 'yosemitescraper420@gmail.com',
//     targetEmails: ['phillip.bay@gmail.com'],
//     environment: "local",
//     login: false,
//     headless: false,
//     timeout: 3 * 60 
// });

//Recreation.Gov
// this.handler({
//     firstName: "Phillip",                       //String    
//     lastName: "Bay",                            //String    
//     website: "recreation.gov",                  //String    "recreation.gov" or "reserveca"
//     camparea: null,                             //String    "yosemite" or null
//     campground: "wolf-creek",                  //String    "upper-pines"
//     campsite: null,                             //Number    42
//     type: "scrape",                             //String    "scrape"
//     yearMin: "2025",                            //String    "2023"
//     monthMin: "Jul",                            //String    "Oct"
//     dayMin: "3",                               //String    "6" or "24"
//     yearMax: "2025",                            //String    "2023"
//     monthMax: "Jul",                            //String    "Oct"
//     dayMax: "5",                               //String    "7" or "14"
//     range: false,                               //Boolean   Enforce a specific range
//     sourceEmail: "yosemitescraper420@gmail.com",//String
//     targetEmails: ["phillip.bay@gmail.com"],   //Array of String Emails
//     environment: "local",                       //String 'local or lambda'
//     login: false,                               //Not working yet
//     headless: true,
//     timeout: 3 * 60                                 //int Sleep between cycles in seconds
// });

//ReserveCa Days: '01'-'31'
//Recreation Days: '1'-'31'
//Recreation campsite: 33
//Months "Feb"
//Year "2023"