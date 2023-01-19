const logging = require('./src/helpers/logging');
const campsiteRouter = require('./src/routers/campsite-router');
const dotenv = require('dotenv');
dotenv.config();
const NAMESPACE = 'Main Handler';

exports.handler = (event, context, callback) => {
    logging.info(NAMESPACE, 'START: with', event);
    executeRequest(event, context, callback);
}

const executeRequest = (event, context, callback) => {
    if(event !== undefined){
        campsiteRouter.handler(event, context, callback);
    } else {
        logging.error(NAMESPACE, 'executeRequest: Event Undefined');
    }
}

this.handler({ 
    website: 'recreation.gov', 
    campground: 'upper-pines', 
    campsite: null, 
    type: 'scrape', 
    yearMin: '2023', 
    monthMin: 'Jan', 
    dayMin: '30', 
    yearMax: '2023', 
    monthMax: 'Feb', 
    dayMax: '2', 
    range: false,
    sourceEmail: 'yosemitescraper420@gmail.com',
    targetEmails: ['phillip.bay@gmail.com']
});
