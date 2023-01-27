const utilities = require('../helpers/utilities'); 
const logging = require('../helpers/logging');
const constants = require('../helpers/constants');
const data = require('../helpers/data');
const selenium = require('../helpers/selenium');
const NAMESPACE = 'servicers/recreation-servicer';

/**
 * Function that changes the tables dates to adjust the Month for Recreation.Gov
 * @param {Object} driver Main Selenium Driver Object
 */
const navigateToProperMonth = async (driver) => {
    logging.info(NAMESPACE, 'navigateToProperMonth: START');
    let months = await getRecreationGovMonths(driver);
    if(constants.months[data.monthMin].name in months && constants.months[data.monthMax].name in months){
        logging.info(NAMESPACE, 'Navigated to the correct Months');
    } else {
        logging.info(NAMESPACE, "Not In the correct months, forwarding 5 days");
        await recGovFiveDays(driver);
        await navigateToProperMonth(driver);
    }
};

/**
 * Function that changes the tables dates to adjust the Month
 * @param {Object} driver Main Selenium Driver Object
 */
const navigateToProperDay = async (driver) => {
    logging.info(NAMESPACE, 'navigateToProperDay: START');
    let dates = await getRecreationGovDays(driver);
    if(data.dayMin in dates && data.dayMax in dates){
        logging.info(NAMESPACE, 'Navigated to the correct Dates');
    } else {
        logging.info(NAMESPACE, "Correct Dates not displayed, forwarding 5 days");
        await recGovFiveDays(driver);
        await navigateToProperDay(driver);
    }
}

/**
 * Function that finds the Forward 5 Days button on Recreation.Gov and presses it
 * @param {Object} driver Selenium Driver Object
 */
const recGovFiveDays = async (driver) => {
    logging.info(NAMESPACE, 'recGovFiveDays: START');
    await driver.findElement(selenium.by.xpath('//button[@aria-label="Go Forward 5 Days"]')).click();
}

/**
 * Function that retrieves the currently displayed Campsites Month(s)
 * @param {Object} driver Selenium Driver Object
 * @returns Map of the Current Months being displayed on on Recreation.gov
 */
const getRecreationGovMonths = async (driver) => {
    logging.info(NAMESPACE, 'getRecreationGovMonths: START');
    let monthElements = await driver.findElements(selenium.by.xpath('//tr[@class="rec-table-months-row"]//th//div//span'));
    if(monthElements !== undefined){
        const months = {};
        for(let monthElement of monthElements){
            if(monthElement !== undefined){
                let month = await monthElement.getText();
                months[month] = month;
            }
        }
        return months;
    } else {
        logging.error(NAMESPACE, 'monthElements undefined');
    }
}

/**
 * Function that retrieves the currently displayed Campsites Dates
 * @param {Object} driver Selenium Driver Object
 * @returns Map of the Current Dates being displayed on on Recreation.gov
 */
const getRecreationGovDays = async (driver) => {
    logging.info(NAMESPACE, 'getRecreationGovDays: START');
    let dateElements = await driver.findElements(selenium.by.xpath('//span[@class="date"]'));
    if(dateElements !== undefined){
        const dates = {};
        for(let dateElement of dateElements){
            if(dateElement !== undefined){
                let date = await dateElement.getText();
                dates[date] = date;
            }
        }
        return dates;
    } else {
        logging.error(NAMESPACE, 'dateElements undefined');
    }
};

/**
 * Function that finds a Specific Site for a given Date/Date Range for Recreation.Gov
 * @param {Object} driver Main Selenium Driver Object
 */
const findSiteRecreation = async (driver) => {
    logging.info(NAMESPACE, 'findSiteRecreation: START');
    let siteElements = await driver.findElements(selenium.by.xpath("//button[text()[contains(., 'A')]]"));
    if(siteElements && siteElements.length > 0){
        for(let siteElement of siteElements){
            let ariaLabel = await siteElement.getAttribute('aria-label');
            if(data.dates.some(date => ariaLabel.substring(0,12).includes(date))){
                if(data.campsite){
                    if(ariaLabel.substring(18, ariaLabel.length-1).includes(data.campsite)){
                        logging.info(NAMESPACE, 'Found Campsite -- ' + ariaLabel.substring(0, 23));
                        if(data.range){
                            for(let date of Object.keys(data.dateFoundMap)){
                                if(ariaLabel.includes(date)){
                                    data.dateFoundMap[date] = true;
                                    data.confirmedDates.push(ariaLabel);
                                }
                            }
                        } else {
                            data.found = true;
                            data.confirmedDates.push(ariaLabel);
                        }
                    } else {
                        console.log('Campsite Not in String');
                    }
                } else {
                    logging.info(NAMESPACE, 'Found Campsite -- ' + ariaLabel.substring(0, 23));
                    if(data.range){
                        for(let date of Object.keys(data.dateFoundMap)){
                            if(ariaLabel.includes(date)){
                                data.dateFoundMap[date] = true;
                                data.confirmedDates.push(ariaLabel);
                            }
                        }
                    } else {
                        data.found = true;
                        data.confirmedDates.push(ariaLabel);
                    }
                }
            }
        }
        if(data.range){
            data.found = true;
            for(let foundVal of Object.values(data.dateFoundMap)){
                if(foundVal === false){
                    data.found = false;
                }
            }
        }
    } else {
        logging.info(NAMESPACE, 'findSiteRecreation: No Available Sites Found');
    }
}


module.exports = { findSiteRecreation, navigateToProperDay, navigateToProperMonth };