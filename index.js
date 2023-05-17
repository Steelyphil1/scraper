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
//     monthMin: 'Feb',
//     dayMin: '12',
//     yearMax: '2023',
//     monthMax: 'Feb',
//     dayMax: '15',
//     range: false,
//     sourceEmail: 'yosemitescraper420@gmail.com',
//     targetEmails: ['phillip.bay@gmail.com']
// });

//Recreation.Gov
this.handler({
    firstName: "Phillip", //String
    lastName: "Bay", //String
    website: "recreation.gov", //String
    camparea: "yosemite", //String
    campground: "north-pines", //String
    campsite: null, //Number
    type: "scrape", //String
    yearMin: "2023", //String
    monthMin: "May", //String
    dayMin: "18", //String
    yearMax: "2023", //String
    monthMax: "May", //String
    dayMax: "20", //String
    range: false, //String
    sourceEmail: "yosemitescraper420@gmail.com", //String
    targetEmails: ["phillip.bay@gmail.com"], //String
    environment: "local", //String 'local or lambda'
});

//ReserveCa Days: '01'-'31'
//Recreation Days: '1'-'31'
//Recreation campsite: 33
//Months "Feb"
//Year "2023"
