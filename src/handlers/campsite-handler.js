const utilities = require('../helpers/utilities'); 
const logging = require('../helpers/logging');
const data = require('../helpers/data');
const selenium = require('../helpers/selenium');
const constants = require('../helpers/constants');

const NAMESPACE = 'campsite-handler';

const processScrape = async (event, context, callback) => {
    logging.info(NAMESPACE, 'processScrape: START');
    utilities.clearData();
    utilities.digestEvent(event);
    utilities.validateEvent(event);
    utilities.buildSelenium(true);
    driver = selenium.driver;
    await driver.get(constants.campsites[data.website][data.campground].url);
    await utilities.navigateToProperDate(driver);
    await utilities.findSite(driver);
    if(data.found){
        logging.info(NAMESPACE, 'processScrape: Campsite(s) Found -- Emailing');
        await utilities.emailSites();
    } else {
        logging.info(NAMESPACE, 'processScrape: No Sites Found -- Not Emailing');
    }
    utilities.endSelenium();
    if(event.environment === 'local'){
        await new Promise(r => setTimeout(r, 300000));
        processScrape(event);
    }
}

module.exports = { processScrape }