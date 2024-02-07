const utilities = require('../helpers/utilities'); 
const logging = require('../helpers/logging');
const data = require('../helpers/data');
const selenium = require('../helpers/selenium');
const constants = require('../helpers/constants');
const exec = require("child_process").exec;

const NAMESPACE = 'campsite-handler';

const processScrape = async (event, count, context, callback) => {
    logging.info(NAMESPACE, 'processScrape: START', event.campground);
    utilities.clearData();
    utilities.digestEvent(event);
    utilities.validateEvent(event);
    await utilities.buildSelenium(true);
    const driver = selenium.driver;
    console.log('driver: ' , driver);
    try {
        await driver.get(constants.campsites[data.website][data.campground].url);
    } catch (e) {
        console.log('error in .get: ' , e);
    }
    const navigateReturn = await utilities.navigateToProperDate(driver);
    if(navigateReturn === 0){
        await utilities.findSite(driver);
        if(data.found){
            logging.info(NAMESPACE, 'processScrape: Campsite(s) Found -- Emailing');
            await utilities.buildEmail();
        } else {
            logging.info(NAMESPACE, 'processScrape: No Sites Found -- Not Emailing');
        }
    } else {
        logging.info(NAMESPACE, 'processScrape: Error Occured -- Skipping Process');
    }
    utilities.endSelenium();
    if(event.environment === 'local' && event.camparea === 'yosemite'){
        await new Promise(r => setTimeout(r, 40000));
        if(count % 3 === 0){
            console.log('calling with upper-pines');
            const newEvent = {...event, campground: 'upper-pines'};
            processScrape(newEvent, count+1);
        } else if(count % 3 === 1){
            console.log('calling with lower-pines');
            const newEvent = {...event, campground: 'lower-pines'};
            processScrape(newEvent, count+1);
        } else {
            console.log('calling with north-pines');
            const newEvent = {...event, campground: 'north-pines'};
            processScrape(newEvent, count+1);
        }
    } else if(event.environment === 'local'){
        await new Promise(r => setTimeout(r, 40000));
        processScrape(event);
    }
}

module.exports = { processScrape }