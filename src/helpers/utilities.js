const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');
const selenium = require('./selenium');
const logging = require('./logging');
const constants = require('./constants');
const data = require('./data');
const NAMESPACE = 'utilities';
const aws = require('aws-sdk');

/**
 * Function to take the Event and validate the input
 * @param {Object} event Main Event Object 
 */
const validateEvent = (event) => {
    logging.info(NAMESPACE, 'validateEvent: START');
    if(!event.website || !event.campground || !event.type || !event.yearMin || !event.monthMin || !event.dayMin || !event.yearMax || !event.monthMax || !event.dayMax || event.range === undefined || event.range === null){
        throw 'Please input all required information';
    }
    if(!event.monthMin in constants.months || !event.monthMax in constants.months){
        throw 'Please input a valid month';
    }
    if((event.monthMin === 'Jan' && event.dayMin >= 32) || (event.monthMax === 'Jan' && event.dayMax >= 32)){
        throw 'Please input a valid month/day combination';
    }
    if((event.monthMin === 'Feb' && event.dayMin >= 30) || (event.monthMax === 'Feb' && event.dayMax >= 30)){
        throw 'Please input a valid month/day combination';
    }
    if((event.monthMin === 'Mar' && event.dayMin >= 32) || (event.monthMax === 'Mar' && event.dayMax >= 32)){
        throw 'Please input a valid month/day combination';
    }
    if((event.monthMin === 'Apr' && event.dayMin >= 31) || (event.monthMax === 'Apr' && event.dayMax >= 31)){
        throw 'Please input a valid month/day combination';
    }
    if((event.monthMin === 'May' && event.dayMin >= 32) || (event.monthMax === 'May' && event.dayMax >= 32)){
        throw 'Please input a valid month/day combination';
    }
    if((event.monthMin === 'Jun' && event.dayMin >= 31) || (event.monthMax === 'Jun' && event.dayMax >= 31)){
        throw 'Please input a valid month/day combination';
    }
    if((event.monthMin === 'Jul' && event.dayMin >= 32) || (event.monthMax === 'Jul' && event.dayMax >= 32)){
        throw 'Please input a valid month/day combination';
    }
    if((event.monthMin === 'Aug' && event.dayMin >= 32) || (event.monthMax === 'Aug' && event.dayMax >= 32)){
        throw 'Please input a valid month/day combination';
    }
    if((event.monthMin === 'Sep' && event.dayMin >= 31) || (event.monthMax === 'Sep' && event.dayMax >= 31)){
        throw 'Please input a valid month/day combination';
    }
    if((event.monthMin === 'Oct' && event.dayMin >= 32) || (event.monthMax === 'Oct' && event.dayMax >= 32)){
        throw 'Please input a valid month/day combination';
    }
    if((event.monthMin === 'Nov' && event.dayMin >= 31) || (event.monthMax === 'Nov' && event.dayMax >= 31)){
        throw 'Please input a valid month/day combination';
    }
    if((event.monthMin === 'Dec' && event.dayMin >= 32) || (event.monthMax === 'Dec' && event.dayMax >= 32)){
        throw 'Please input a valid month/day combination';
    }
    if(data.dates.length > 7){
        console.log('dates: ' , data.dates);
        throw 'Range cannot be over 7 days';
    }
    // if(((constants.months[event.monthMax] - constants.months[event.monthMin]) > 1) || ((constants.months[event.monthMax] - constants.months[event.monthMin]) < 0)){
    //     throw 'Months must be the same or the monthMax 1 month ahead';
    // }
}

/**
 * Function to take the Main Event Object and digest it into global variables
 * @param {Object} event Main Event Object 
 */
const digestEvent = (event) => {
    logging.info(NAMESPACE, 'digestEvent: START');
    data.website = event.website;
    data.campground = event.campground;
    data.campsite = event.campsite;
    data.type = event.type;
    data.yearMin = event.yearMin;
    data.monthMin = event.monthMin;
    data.dayMin = event.dayMin;
    data.yearMax = event.yearMax;
    data.monthMax = event.monthMax;
    data.dayMax = event.dayMax;
    data.range = event.range;
    data.dateMin = data.monthMin + ' ' + data.dayMin + ', ' + data.yearMin;
    data.dateMax = data.monthMax + ' ' + data.dayMax + ', ' + data.yearMax;
    data.sourceEmail = event.sourceEmail;
    data.targetEmails = event.targetEmails;
    compileDates();
}

/**
 * Function to compile the Dates structure
 */
const compileDates = () => {
    logging.info(NAMESPACE, 'compileDates: START');
    let dateMin = new Date(data.dateMin);
    let dateMax = new Date(data.dateMax);
    let timeDiff = dateMax.getTime() - dateMin.getTime();
    data.dateDiff = timeDiff / (1000 * 3600 * 24);
    console.log('dateMin: ' , dateMin.toLocaleDateString('en-us', {year:'numeric', month:'short', day:'numeric'}));
    console.log('dateMax: ' , dateMax.toLocaleDateString('en-us', {year:'numeric', month:'short', day:'numeric'}));
    console.log('dateDiff: ' , data.dateDiff);
    data.dates.push(dateMin.toLocaleDateString('en-us', {year:'numeric', month:'short', day:'numeric'}));
    for(let i = 1; i <= data.dateDiff; i++){
        let tempDate = dateMin;
        tempDate.setDate(tempDate.getDate() + 1);
        data.dates.push(tempDate.toLocaleDateString('en-us', {year:'numeric', month:'short', day:'numeric'}));
        data.dateFoundMap[tempDate.toLocaleDateString('en-us', {year: 'numeric', month: 'short', day: 'numeric'})] = false;
    }
    console.log('dates after: ' , data.dates);
}

/**
 * Functionn that builds the Selenium Driver and fills the objects in selenium.js
 * @param {Boolean} headless Boolean value for Headless or not
 */
const buildSelenium = (headless) => {
    logging.info(NAMESPACE, 'buildSelenium: START');
    selenium.driver = new webdriver.Builder().forBrowser('chrome').build();
    selenium.by = webdriver.By;
    selenium.until = webdriver.until;
};

/**
 * Function that ends the Selenium Driver
 */
const endSelenium = () => {
    logging.info(NAMESPACE, 'endSelenium: START');
    selenium.driver.quit();
}

/**
 * Main Function for Navigating Recreation.Gov to the proper table dates
 * @param {Object} driver Main Selenium Driver Object
 */
const navigateToProperDate = async (driver) => {
    logging.info(NAMESPACE, 'navigateToProperDate: START');
    await navigateToProperMonth(driver);
    await navigateToProperDay(driver);
}

/**
 * Function that changes the tables dates to adjust the Month
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
 * Function that finds a Specific Site for a given Date/Date Range
 * @param {Object} driver Main Selenium Driver Object
 */
const findSpecificSite = async (driver) => {
    logging.info(NAMESPACE, 'findSpecificSite: START');
    let siteElements = await driver.findElements(selenium.by.xpath("//button[text()[contains(., 'A')]]"));
    if(siteElements && siteElements.length > 0){
        for(let siteElement of siteElements){
            let ariaLabel = await siteElement.getAttribute('aria-label');
            if(data.dates.some(date => ariaLabel.includes(date))){
                if(ariaLabel.includes(data.campsite)){
                    logging.info(NAMESPACE, 'Found Campsite -- ' + ariaLabel.substring(0, 23));
                    //console.log(ariaLabel.substring(0,12));
                    if(data.range){
                        for(let date of Object.keys(data.dateFoundMap)){
                            if(ariaLabel.includes(date)){
                                data.dateFoundMap[date] = true;
                            }
                        }
                    } else {
                        data.found = true;
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
        if(data.found){
            logging.info(NAMESPACE, 'findSpecificSite: Conditions Met -- Emailing');
        } else {
            logging.info(NAMESPACE, 'findSpecificSite: Conditions Not Met -- Not Emailing');
        }
    } else {
        logging.info(NAMESPACE, 'findSite: No Available Sites Found');
    }
}

/**
 * Function that finds any Site for a given Date/Date Range
 * @param {Object} driver Main Selenium Driver Object
 */
const findSite = async (driver) => {
    logging.info(NAMESPACE, 'findSite: START');
    let siteElements = await driver.findElements(selenium.by.xpath("//button[text()[contains(., 'A')]]"));
    if(siteElements && siteElements.length > 0){
        for(let siteElement of siteElements){
            let ariaLabel = await siteElement.getAttribute('aria-label');
            if(data.dates.some(date => ariaLabel.includes(date))){
                logging.info(NAMESPACE, 'Found Campsite -- ' + ariaLabel.substring(0, 23));
                if(data.range){
                    for(let date of Object.keys(data.dateFoundMap)){
                        if(ariaLabel.includes(date)){
                            data.dateFoundMap[date] = true;
                        }
                    }
                } else {
                    data.found = true;
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
        if(data.found){
            logging.info(NAMESPACE, 'findSpecificSite: Conditions Met -- Emailing');
        } else {
            logging.info(NAMESPACE, 'findSpecificSite: Conditions Not Met -- Not Emailing');
        }
    } else {
        logging.info(NAMESPACE, 'findSite: No Available Sites Found');
    }
}

/**
 * Function that emails the addresses in the targetEmails Array
 * @returns A Promise from the Email sent
 */
const emailSites = async () => {
    logging.info(NAMESPACE, 'emailSites: START');
    aws.config.update({ accessKeyId: process.env.AWS_ACCESS_KEY, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, region: process.env.AWS_REGION });
    const ses = new aws.SES({ region: process.env.AWS_REGION });
    let params = {
        Destination: {
            ToAddresses: data.targetEmails
        },
        Message: {
            Body: {
                Text: { Data: "This is only a test"}
            },
            Subject: {
                Data: "Campsite(s) Have Been Found"
            }
        },
        Source: data.sourceEmail
    };

    return ses.sendEmail(params).promise();
}

module.exports = { buildSelenium, digestEvent, emailSites, endSelenium, findSite, findSpecificSite, navigateToProperDate, getRecreationGovMonths, getRecreationGovDays, validateEvent };