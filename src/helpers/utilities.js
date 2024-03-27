const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
//const chromeaws = require('chrome-aws-lambda');
const { exec } = require('child_process');
const selenium = require('./selenium');
const logging = require('./logging');
const constants = require('./constants');
const data = require('./data');
const recreationServicer = require('../servicers/recreation-servicer');
const reservecaServicer = require('../servicers/reserveca-servicer');
const NAMESPACE = 'utilities';
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const chromedriverPath = '/opt/chromedriver/chromedriver';

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
    data.environment = event.environment;
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
    console.log('test');
    const options = new chrome.Options();
    if(headless){
        options.addArguments('headless');
        options.addArguments('disable-gpu');
        options.addArguments('window-size=1920x1080');
    } else {
        await selenium.driver.manage().window().maximize();
    }

    console.log('lambda?' , data.environment === 'lambda');
    if(data.environment === 'lambda'){
        options.addArguments('--headless');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        //promisify exec
        // try{
        //     // const res = await promisfyExec('ls -R ~/opt');
        //     const res = await promisfyExec('chmod +x /opt/chromedriver/chromedriver');
        //     console.log('res: ' , res);
        // } catch (err) {
        //     console.log('errrrrrr: ' , err);
        // }
       
        // const res = await execShellCommand('ls -R var/task');
        // console.log('res: ' , res);
        // const resOpt = await execShellCommand('ls -R /opt');
        // console.log('resOpt: ', resOpt);

        // browser = await chromeaws.puppeteer.launch({
        //     args: chromium.args,
        //     defaultViewport: chromium.defaultViewport,
        //     executablePath: await chromium.executablePath,
        //     headless: chromium.headless
        //   });
        console.log('here1');
        selenium.driver = new webdriver.Builder().forBrowser('chrome').setChromeOptions(options).setChromeOptions(new chrome.ServiceBuilder(chromedriverPath)).build();
        selenium.by = webdriver.By;
        selenium.until = webdriver.until;
        //options.setChromeBinaryPath(chromedriverPath); //Newest Comment
        
        // process.env.CHROME_PATH = '/opt/chromedriver/chromedriver';
        //chrome.setDefaultService(new chrome.ServiceBuilder(chrome.BinaryPath.getChromeDriverExecutablePath()).build());
        //selenium.driver = await new webdriver.Builder().forBrowser('chrome').setChromeOptions(new chromeaws.Options()).build();
    }
    // console.log('here2');
    // selenium.driver = new webdriver.Builder().forBrowser('chrome').setChromeOptions(options).build();
    // console.log('here3');

    // selenium.by = webdriver.By;
    // selenium.until = webdriver.until;
};

const promisfyExec = async (cmd) => {
    return new Promise((resolve, reject) => {
        console.log('here with ' , cmd);
        exec(cmd, (err, stdout, stderr) => {
            if(err){
                console.log('err: ', err);
                reject(err);
            }
            if(stderr){
                console.log('stderr: ' , stderr);
                reject(err);
            }
            if(stdout){
                console.log('stdout: ' , stdout);
                resolve(stdout);
            }
            console.log('here with nothing I guess');
        });
    })
}

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
        const monthReturn = await recreationServicer.navigateToProperMonth(driver);
        logging.info(NAMESPACE, "month returned with: ", monthReturn);
        if(monthReturn === 0) {
            return await recreationServicer.navigateToProperDay(driver);
        } else {
            return monthReturn;
        }
    } else if(data.website === 'reserveca'){
        const monthReturn = await reservecaServicer.navigateToProperMonth(driver);
        if(monthReturn === 0){
            return await reservecaServicer.navigateToProperDay(driver, data.dayMin);
        } else {
            return monthReturn;
        }
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
const buildEmail = async () => {
    logging.info(NAMESPACE, 'buildEmail: START');
    
    const params = {
        Destination: {
            ToAddresses: data.targetEmails
        },
        Message: {
            Body: {
                Text: { Data: createSiteEmail("string")},
                Html: { Data: createSiteEmail("html")}
            },
            Subject: {
                Data: "Campsite(s) Have Been Found"
            }
        },
        Source: data.sourceEmail
    };

    return await sendEmail(params);
}

/**
 * Function to execute the sending of an email given parameters
 * @param {Object} params Email Parameters
 * @returns 
 */
const sendEmail = async (params) => {
    const client = new SESClient({
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY, 
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, 
            region: process.env.AWS_REGION
        }
    });

    const command = new SendEmailCommand(params);
    return await client.send(command);
}

/**
 * Function to build the email body from the various inputs
 * @param {String} type What type of email are we building -- string or html
 * @returns 
 */
const createSiteEmail = (type) => {
    logging.info(NAMESPACE, 'createSiteEmail: ' , data.confirmedDates , type);
    const confirmedDatesString = data.confirmedDates.reduce((acc, currentDate)=> {
        acc += currentDate + "<br>";
        return acc;
    }, "");
    return type === 'html' ? String.format(constants.emailStringHTML, data.firstName, constants.campsites[data.website][data.campground].url, data.campground, confirmedDatesString) : String.format(constants.emailGreeting, data.firstName, constants.campsites[data.website][data.campground].url, data.campground) + confirmedDatesString + constants.emailOutro;
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

const clearData = () => {
    data.dates = [];
    data.dateFoundMap = {};
    data.found = false;
    data.targetEmails = [];
    data.confirmedDates = [];
    data.currentDates = {};
    data.currentMonths = {};
}

module.exports = { buildSelenium, clearData, convertListToString, digestEvent, buildEmail, endSelenium, findSite, navigateToProperDate, validateEvent };