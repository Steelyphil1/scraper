const utilities = require('../helpers/utilities'); 
const logging = require('../helpers/logging');
const data = require('../helpers/data');
const selenium = require('../helpers/selenium');
const constants = require('../helpers/constants');
const exec = require("child_process").exec;

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
    const navigateReturn = await utilities.navigateToProperDate();
    if(navigateReturn === 0){
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
    utilities.handleRecursion(event);

    logging.info(NAMESPACE, 'processScrape: END');
}

module.exports = { processScrape }