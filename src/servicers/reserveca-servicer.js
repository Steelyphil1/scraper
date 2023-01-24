const utilities = require('../helpers/utilities'); 
const logging = require('../helpers/logging');
const selenium = require('../helpers/selenium');
const constants = require('../helpers/constants');
const data = require('../helpers/data');
const NAMESPACE = 'servicers/reserveca-servicer';

/**
 * Function that finds the FNext Week button on ReserveCa and presses it
 * @param {Object} driver Selenium Driver Object
 */
const reserveCaNextWeek = async (driver) => {
    logging.info(NAMESPACE, 'reserveCaNextWeek: START');
    await driver.findElement(selenium.by.xpath('//button[@class="bg-transparent text-gray-04 font-light flex items-center md:justify-center justify-end py-3"]')).click();
}

/**
 * Function that changes the tables dates to adjust the Month for ReserveCa
 * @param {Object} driver Main Selenium Driver Object
 */
const navigateToProperMonth = async (driver) => {
    logging.info(NAMESPACE, 'navigateToProperMonth: START');
    // await driver.wait(() => documentInitialised(), 10000);
    await driver.manage().setTimeouts( { implicit: 10000 } );
    let months = await getReserveCaMonths(driver);
    console.log('months: ' , months);
    console.log('monthMin: ', constants.months[data.monthMin].nameReserve);
    console.log('monthMax: ', constants.months[data.monthMax].nameReserve);
    if(constants.months[data.monthMin].nameReserve in months && constants.months[data.monthMax].nameReserve in months){
        logging.info(NAMESPACE, 'Navigated to the correct Months');
    } else {
        logging.info(NAMESPACE, "Not In the correct months, forwarding 5 days");
        await reserveCaNextWeek(driver);
        await navigateToProperMonth(driver);
    }
};

/**
 * Function that changes the tables dates to adjust the Month
 * @param {Object} driver Main Selenium Driver Object
 */
const navigateToProperDay = async (driver) => {
    logging.info(NAMESPACE, 'navigateToProperDay: START');
    let dates = await getReserveCaDays(driver);
    if(data.dayMin in dates && data.dayMax in dates){
        logging.info(NAMESPACE, 'Navigated to the correct Dates');
    } else {
        logging.info(NAMESPACE, "Correct Dates not displayed, forwarding 5 days");
        await reserveCaNextWeek(driver);
        await navigateToProperDay(driver);
    }
}

/**
 * Function that retrieves the currently displayed Campsites Month(s)
 * @param {Object} driver Selenium Driver Object
 * @returns Map of the Current Months being displayed on on ReserveCa
 */
const getReserveCaMonths = async (driver) => {
    logging.info(NAMESPACE, 'getReserveCaMonths: START');
    const months = {};
    console.log('Timeout B4');
    setTimeout(() => {console.log('Timeout')},10000);
    // let ele = await driver.wait(selenium.until.elementLocated(selenium.by.xpath('//div[@class="col-span-2 w-full text-fs-18 text-black font-bold flex items-center justify-center text-center"]')),10000);
    let monthElement = await driver.findElement(selenium.by.xpath('//div[@class="col-span-2 w-full text-fs-18 text-black font-bold flex items-center justify-center text-center"]'));
    let month = await monthElement.getText();
    if(month){
        let tempArray = month.split(' - ');
        for(let mon of tempArray){
            months[mon] = mon;
        }
    }
    return months;
}

/**
 * Function that retrieves the currently displayed Campsites Dates
 * @param {Object} driver Selenium Driver Object
 * @returns Map of the Current Dates being displayed on on ReserveCa
 */
const getReserveCaDays = async (driver) => {
    logging.info(NAMESPACE, 'getReserveCaDays: START');
    let dateElements = await driver.findElements(selenium.by.xpath('//tr[@class="lg:flex lg:flex-row bg-white lg:z-2 lg:justify-center xs:justify-between lg:border-b lg:border-gray-01 lg:pb-2"]//td//div'));
    if(dateElements !== undefined){
        const dates = {};
        for(let dateElement of dateElements){
            console.log('dates: ' , dates);
            if(dateElement !== undefined){
                let date = await dateElement.getText();
                console.log('date: ' , date);
                if(date.match(/^[0-9]+$/) != null){
                    dates[date] = date;
                } else {
                    console.log('div does not contain a number');
                }
            }
        }
        return dates;
    } else {
        logging.error(NAMESPACE, 'dateElements undefined');
    }
};

/**
 * Function that finds a Specific Site for a given Date/Date Range for ReserveCa
 * @param {Object} driver Main Selenium Driver Object
 */
const findSiteReserveCa = async (driver) => {
    logging.info(NAMESPACE, 'findSiteReserveCa: START');
    let siteElements = await driver.findElements(selenium.by.xpath("//button[contains(@class, ' available-unit')]"));
    if(siteElements && siteElements.length > 0){
        for(let siteElement of siteElements){
            let ariaLabel = await siteElement.getAttribute('aria-label'); //stopped here
            if(data.dates.some(date => ariaLabel.includes(date))){
                if(data.campsite && ariaLabel.includes(data.campsite)){
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
                } else {
                    logging.info(NAMESPACE, 'Found Campsite -- ' + ariaLabel.substring(9, ariaLabel.length-1));
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
    } else {
        logging.info(NAMESPACE, 'findSiteReserveCa: No Available Sites Found');
    }
}

module.exports = { findSiteReserveCa, navigateToProperMonth, navigateToProperDay };