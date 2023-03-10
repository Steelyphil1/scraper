const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');
const selenium = require('./selenium');
const logging = require('./logging');
const constants = require('./constants');
const data = require('./data');
const recreationServicer = require('../servicers/recreation-servicer');
const reservecaServicer = require('../servicers/reserveca-servicer');
const NAMESPACE = 'utilities';
const aws = require('aws-sdk');

/**
 * Overwrite to create a String format method
 * @returns new formatted String
 */
String.format = function() {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i += 1) {
        var reg = new RegExp('\\{' + i + '\\}', 'gm');
        s = s.replace(reg, arguments[i + 1]);
    }
    return s;
};

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
    data.firstName = event.firstName;
    data.lastName = event.lastName;
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
    if(data.website === 'recreation.gov'){
        data.dates.push(dateMin.toLocaleDateString('en-us', {year:'numeric', month:'short', day:'numeric'}));
        data.dateFoundMap[dateMin.toLocaleDateString('en-us', {year: 'numeric', month: 'short', day: 'numeric'})] = false;
        for(let i = 1; i <= data.dateDiff; i++){
            let tempDate = dateMin;
            tempDate.setDate(tempDate.getDate() + 1);
            data.dates.push(tempDate.toLocaleDateString('en-us', {year:'numeric', month:'short', day:'numeric'}));
            data.dateFoundMap[tempDate.toLocaleDateString('en-us', {year: 'numeric', month: 'short', day: 'numeric'})] = false;
        }
    } else if(data.website === 'reserveca') {
        data.dates.push(dateMin.toLocaleDateString('en-us', {year:'numeric', month:'2-digit', day:'2-digit'}));
        data.dateFoundMap[dateMin.toLocaleDateString('en-us', {year: 'numeric', month: '2-digit', day: '2-digit'})] = false;
        for(let i = 1; i <= data.dateDiff; i++){
            let tempDate = dateMin;
            tempDate.setDate(tempDate.getDate() + 1);
            data.dates.push(tempDate.toLocaleDateString('en-us', {year:'numeric', month:'2-digit', day:'2-digit'}));
            data.dateFoundMap[tempDate.toLocaleDateString('en-us', {year: 'numeric', month: '2-digit', day: '2-digit'})] = false;
        }
    }
    logging.info(NAMESPACE, 'compileDates: dateFoundMap after: ' , data.dateFoundMap);
}

/**
 * Functionn that builds the Selenium Driver and fills the objects in selenium.js
 * @param {Boolean} headless Boolean value for Headless or not
 */
const buildSelenium = async (headless) => {
    logging.info(NAMESPACE, 'buildSelenium: START');
    options = new chrome.Options();
    if(headless){
        options.addArguments('headless');
        options.addArguments('disable-gpu');
        options.addArguments('window-size=1920x1080');
    }
    selenium.driver = new webdriver.Builder().forBrowser('chrome').setChromeOptions(options).build();
    // await selenium.driver.manage().window().maximize();
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
    if(data.website === 'recreation.gov'){
        await recreationServicer.navigateToProperMonth(driver);
        await recreationServicer.navigateToProperDay(driver);
    } else if(data.website === 'reserveca'){
        await reservecaServicer.navigateToProperMonth(driver);
        await reservecaServicer.navigateToProperDay(driver, data.dayMin);
    }
}

/**
 * Function to route to the correct Service File for finding a Site
 * @param {Object} driver Main Selenium Driver Object 
 */
const findSite = async (driver) => {
    logging.info(NAMESPACE, 'findSite: START');
    if(data.website === 'recreation.gov'){
        await recreationServicer.findSiteRecreation(driver);
    } else if(data.website === 'reserveca'){
        let day = new Date(data.dateMin);
        await reservecaServicer.findSiteReserveCa(driver, day.toLocaleDateString('en-us', {year: 'numeric', month: '2-digit', day: '2-digit'}));
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
                Text: { Data: buildEmail(constants.emailString)},
                Html: { Data: buildEmail(constants.emailStringHTML)}
            },
            Subject: {
                Data: "Campsite(s) Have Been Found"
            }
        },
        Source: data.sourceEmail
    };

    return ses.sendEmail(params).promise();
}

/**
 * Function to build the email from the various strings
 * @returns Resulting Email Body String
 */
const buildEmail = (emailString) => {
    logging.info(NAMESPACE, 'buildEmail: ' , data.confirmedDates);
    return String.format(emailString, data.firstName, data.campground, constants.campsites[data.website][data.campground].url, convertListToString(data.confirmedDates));
}

/**
 * Method to convert list of strings into a formatted String for Email
 * @param {Array} campsites Array of Strings to convert to a String for Email
 * @returns Resulting String from conversion
 */
const convertListToString = (campsites) => {
    logging.info(NAMESPACE, 'convertListToString: START');
    let endString = '';
    if(campsites && campsites.length > 0){
        for (let site of campsites) {
            endString += site + '\n';
        }
        return endString;
    } else {
        return null;
    }
};

module.exports = { buildSelenium, convertListToString, digestEvent, emailSites, endSelenium, findSite, navigateToProperDate, validateEvent };