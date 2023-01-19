const logging = require('../helpers/logging');
const recreationServicer = require('../servicers/recreation-servicer');
const reserveCAServicer = require('../servicers/reserveca-servicer');
const NAMESPACE = 'routers/campsite-router';

const handler = (event, context, callback) => {
    logging.info(NAMESPACE, 'START');
    switch (event.website){
        case "recreation.gov":
            recreationServicer.handler(event, context, callback);
            break;
        case "reserveca":
            reserveCAServicer.handler(event, context, callback);
            break;
        default:
            break;
    }
};

module.exports = { handler };