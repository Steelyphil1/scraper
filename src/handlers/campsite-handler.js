const utilities = require('../helpers/utilities'); 
const logging = require('../helpers/logging');
const data = require('../helpers/data');
const selenium = require('../helpers/selenium');
const constants = require('../helpers/constants');

const NAMESPACE = 'campsite-handler';

const processScrape = async (event, count) => {
    logging.info(NAMESPACE, 'processScrape: START', event.campground);
    
    //Clear Data from previous iteration if applicable
    if(count > 0){
        utilities.clearData();
    }

    //Run validations over event information
    utilities.validateEvent(event);

    //Pull Event info into data
    utilities.digestEvent(event);

    //Configure the driver/selenium
    await utilities.buildSelenium(true);

    //Open the website to be scraped
    await selenium.driver.get(constants.campsites[data.website][data.campground].url);

    //Login if desired
    if(data.login) {
        await utilities.login();
    }

    //Regardless of Website, Navigate to the correct Dates
    await utilities.navigateToProperDate();
    if(data.navigationComplete){
        //Once we are at the correct Dates, determine if a campsite is available
        await utilities.findSite();
        if(data.found){
            logging.info(NAMESPACE, 'processScrape: Campsite(s) Found -- Emailing');
            await utilities.buildEmail();
        } else {
            logging.info(NAMESPACE, 'processScrape: No Sites Found -- Not Emailing');
        }
    } else {
        //An Error Occured during Navigation: TODO: Better Error Handling
        logging.info(NAMESPACE, 'processScrape: Error Occured -- Skipping Process');
    }

    // Selenium Must Be Ended Regardless
    utilities.endSelenium();

    // Rerun based on configuration
    handleRecursion(event, count);

    logging.info(NAMESPACE, 'processScrape: END');
}

/**
 * Function to recursively rerun the scraper based on the event config
 * @param {Object} event Main lambda event object
 * @param {number} count How many iterations have happened thus far
 */
const handleRecursion = async (event, count) => {
    logging.info(NAMESPACE, 'handleRecursion: START');

    if(data.environment === 'local' && data.camparea === 'yosemite'){
        await new Promise(r => setTimeout(r, data.timeout * 1000));
        if(count % 3 === 0){
            processScrape({...event, campground: 'upper-pines'}, count+1);
        } else if(count % 3 === 1){
            processScrape({...event, campground: 'lower-pines'}, count+1);
        } else {
            processScrape({...event, campground: 'north-pines'}, count+1);
        }
    } else if(data.environment === 'local'){
        await new Promise(r => setTimeout(r, data.timeout * 1000));
        processScrape(event, count+1);
    } else {
        logging.info("Non-local execution -- ending process");
    }
}

module.exports = { processScrape }