const utilities = require('../helpers/utilities'); 
const logging = require('../helpers/logging');
const constants = require('../helpers/constants');
const data = require('../helpers/data');
const selenium = require('../helpers/selenium');
const NAMESPACE = 'servicers/recreation-servicer';

const handler = (event, context, callback) => {
    logging.info(NAMESPACE, 'START');
    switch(event.type) {
        case "scrape":
            processScrape(event, context, callback);
            break;
        default:
            break;
    }
}

const processScrape = async (event, context, callback) => {
    logging.info(NAMESPACE, 'processScrape: START');
    utilities.digestEvent(event);
    utilities.validateEvent(event);
    utilities.buildSelenium();
    driver = selenium.driver;
    await driver.get(constants.campsites[data.website][data.campground].url);
    await utilities.navigateToProperDate(driver);
    if(event.campsite){
        await utilities.findSpecificSite(driver);
    } else {
        await utilities.findSite(driver);
    }
    if(data.found){
        await utilities.emailSites();
    }

    utilities.endSelenium();
}
console.log('Hello!');

module.exports = { handler };