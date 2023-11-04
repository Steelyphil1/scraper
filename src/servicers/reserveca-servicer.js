const utilities = require('../helpers/utilities'); 
const logging = require('../helpers/logging');
const selenium = require('../helpers/selenium');
const constants = require('../helpers/constants');
const data = require('../helpers/data');
const NAMESPACE = 'servicers/reserveca-servicer';
//let hasScrolled = false;

/**
 * Function that finds the FNext Week button on ReserveCa and presses it
 * @param {Object} driver Selenium Driver Object
 */
const reserveCaNextWeek = async (driver) => {
    logging.info(NAMESPACE, 'reserveCaNextWeek: START ');
    const nextWeekButton = await driver.findElement(selenium.by.xpath('//button[@class="bg-transparent text-gray-04 font-light flex items-center md:justify-center justify-end py-3"]'));
    // console.log(await nextWeekButton.getRect());
    // let location = await nextWeekButton.getRect();
    // if(!hasScrolled){
    //     hasScrolled = true;
    //     await driver.actions().scroll(0, 10, 0, 200).perform();
    //     //await driver.actions().scroll(0, 0, 0, 0, nextWeekButton).perform();
    // }
    await driver.actions().move({ origin: nextWeekButton }).pause(1000).click().perform();
}



/**
 * Function that changes the tables dates to adjust the Month for ReserveCa
 * @param {Object} driver Main Selenium Driver Object
 */
const navigateToProperMonth = async (driver) => {
    logging.info(NAMESPACE, 'navigateToProperMonth: START');
    await new Promise(r => setTimeout(r, 10000));
    let months = await getReserveCaMonths(driver);
    if(constants.months[data.monthMin].nameReserve in months && constants.months[data.monthMax].nameReserve in months){
        logging.info(NAMESPACE, 'navigateToProperMonth: Navigated to the correct Months');
        data.currentMonths = months;
        return 0;
    } else {
        logging.info(NAMESPACE, "navigateToProperMonth: Not In the correct months, forwarding 5 days");
        await reserveCaNextWeek(driver);
        await navigateToProperMonth(driver);
    }
};

/**
 * Function that changes the tables dates to adjust the Month
 * @param {Object} driver Main Selenium Driver Object
 */
const navigateToProperDay = async (driver, day) => {
    logging.info(NAMESPACE, 'navigateToProperDay: START: with ' + day);
    await new Promise(r => setTimeout(r, 10000));
    let dates = await getReserveCaDays(driver);
    if(day in dates){
        if(Object.keys(data.months).length > 1){
            if(day < 5){
                logging.info(NAMESPACE, "navigateToProperDay: Correct Dates not displayed, forwarding 5 days");
                await reserveCaNextWeek(driver);
                await navigateToProperDay(driver, day);
            }
        } else {
            logging.info(NAMESPACE, 'navigateToProperDay: Navigated to the correct Dates');
            data.currentDates = dates;
            return 0;
        }
    } else {
        logging.info(NAMESPACE, "navigateToProperDay: Correct Dates not displayed, forwarding 5 days");
        await reserveCaNextWeek(driver);
        await navigateToProperDay(driver, day);
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
            if(dateElement !== undefined){
                let date = await dateElement.getText();
                if(date.match(/^[0-9]+$/) != null){
                    dates[date] = date;
                }
            }
        }
        return dates;
    } else {
        logging.error(NAMESPACE, 'getReserveCaDays: dateElements undefined');
    }
};

/**
 * Function that finds a Specific Site for a given Date/Date Range for ReserveCa
 * @param {Object} driver Main Selenium Driver Object
 */
const findSiteReserveCa = async (driver, day) => {
    logging.info(NAMESPACE, 'findSiteReserveCa: START: ' , "//button[contains(@class, ' available-unit') and contains(@title, '" + day + "')]");
    logging.info(NAMESPACE, 'findSiteReserveCa: ', data.currentDates, day.substring(3,5));
    if(day.substring(3,5) in data.currentDates){
        logging.info(NAMESPACE, 'findSiteReserveCa: Day ' + day + ' is Among Dates: ' , data.currentDates);
    } else {
        await reserveCaNextWeek(driver);
    }
    await new Promise(r => setTimeout(r, 10000));
    let siteElements = await driver.findElements(selenium.by.xpath("//button[contains(@class, ' available-unit') and contains(@title, '" + day + "')]"));
    if(siteElements && siteElements.length > 0){
        for(let siteElement of siteElements){
            let ariaLabel = await siteElement.getAttribute('aria-label'); //stopped here
            if(data.campsite && ariaLabel.includes(data.campsite)){
                logging.info(NAMESPACE, 'Found Campsite -- ' + ariaLabel);
                if(ariaLabel.includes(day)){
                    data.dateFoundMap[day] = true;
                    data.confirmedDates.push(ariaLabel);
                }
            } else {
                logging.info(NAMESPACE, 'Found Campsite -- ' + ariaLabel);
                if(ariaLabel.includes(day)){
                    data.dateFoundMap[day] = true;
                    data.confirmedDates.push(ariaLabel);
                }
            }
        }
        let d1 = new Date(day);
        let d2 = new Date(data.dateMax);
        console.log('d1: ' , d1 , 'd2: ' , d2);
        if(d1 < d2){
            d1.setDate(d1.getDate() + 1);
            console.log('d1 is < d2 -- Recursively Calling findSiteReserveCa with: ' + d1.toLocaleDateString('en-us', {year: 'numeric', month: '2-digit', day: '2-digit'}));
            await findSiteReserveCa(driver, d1.toLocaleDateString('en-us', {year: 'numeric', month: '2-digit', day: '2-digit'}));
        } else {
            console.log('Base Case Reached. Ending findSiteRecreation');
        }
    } else {
        logging.info(NAMESPACE, 'findSiteReserveCa: No Available Sites Found');
    }
    if(data.range){
        data.found = true;
        for(let foundVal of Object.values(data.dateFoundMap)){
            if(foundVal === false){
                data.found = false;
            }
        }
    } else {
        for(let foundVal of Object.values(data.dateFoundMap)){
            if(foundVal === true){
                data.found = true;
            }
        }
    }
}

module.exports = { findSiteReserveCa, navigateToProperMonth, navigateToProperDay };