const utilities = require('../helpers/utilities'); 
const logging = require('../helpers/logging');
const NAMESPACE = 'servicers/reserveca-servicer';

const handler = (event, context, callback) => {
    switch(event.type) {
        case "scrape":
            processScrape(event, context, callback);
            break;
        default:
            break;
    }
}

const processScrape = (event, context, callback) => {
    logging.info(NAMESPACE, 'processScrape: START');
}

module.exports = { handler };