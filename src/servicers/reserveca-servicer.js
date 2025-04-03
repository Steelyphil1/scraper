const utilities = require('../helpers/utilities'); 
const logging = require('../helpers/logging');
const selenium = require('../helpers/selenium');
const constants = require('../helpers/constants');
const data = require('../helpers/data');
const NAMESPACE = 'servicers/reserveca-servicer';
//let hasScrolled = false;

/**
 * Function that finds the FNext Week button on ReserveCa and presses it
 */
const reserveCaNextWeek = async () => {
    logging.info(NAMESPACE, 'reserveCaNextWeek: START ');
    const nextWeekButton = await selenium.driver.findElement(selenium.by.xpath('//button[@class="bg-transparent text-gray-04 font-light flex items-center md:justify-center justify-end py-3"]'));
    // console.log(await nextWeekButton.getRect());
    // let location = await nextWeekButton.getRect();
    // if(!hasScrolled){
    //     hasScrolled = true;
    //     await selenium.driver.actions().scroll(0, 10, 0, 200).perform();
    //     //await selenium.driver.actions().scroll(0, 0, 0, 0, nextWeekButton).perform();
    // }
    await selenium.driver.actions().move({ origin: nextWeekButton }).pause(1000).click().perform();
}



/**
 * Function that changes the tables dates to adjust the Month for ReserveCa
 */
const navigateToProperMonth = async () => {
    logging.info(NAMESPACE, 'navigateToProperMonth: START');
    await new Promise(r => setTimeout(r, 10000));
    const months = await getReserveCaMonths();
    if(months.includes(constants.months[data.monthMin].nameReserve) && months.includes(constants.months[data.monthMax].nameReserve)){
        logging.info(NAMESPACE, 'navigateToProperMonth: Navigated to the correct Months');
        data.currentMonths = months;
        return;
    } else {
        logging.info(NAMESPACE, "navigateToProperMonth: Not In the correct months, forwarding 7 days");
        await reserveCaNextWeek();
        await navigateToProperMonth();
    }
};

/**
 * Function that changes the tables dates to adjust the Month
 */
const navigateToProperDay = async (day) => {
    logging.info(NAMESPACE, 'navigateToProperDay: START: with ' + day);
    await new Promise(r => setTimeout(r, 10000));
    const dates = await getReserveCaDays();
    if(dates.includes(day)){
        // console.log("currentMonths: ", data.currentMonths);
        // if(data.currentMonths.length > 1){ 
        //     console.log('currentMonths greater than 1');
        //     if(day < 5){
        //         logging.info(NAMESPACE, "navigateToProperDay: Correct Dates not displayed, forwarding 7 days");
        //         await reserveCaNextWeek();
        //         await navigateToProperDay(day);
        //     } else {
        //         logging.info(NAMESPACE, 'navigateToProperDay: Navigated to the correct Dates');
        //         data.currentDates = dates;
        //         return;
        //     }
        // } else {
            logging.info(NAMESPACE, 'navigateToProperDay: Navigated to the correct Dates');
            console.log("Dates: " , dates, data);
            data.currentDates = dates;
            console.log("currentDates", data.currentDates);
            console.log("returning 0");
            return;
        //}
    } else {
        logging.info(NAMESPACE, "navigateToProperDay: Correct Dates not displayed, forwarding 7 days");
        await reserveCaNextWeek();
        await navigateToProperDay(day);
    }
}

/**
 * Function that retrieves the currently displayed Campsites Month(s)
 * @returns Map of the Current Months being displayed on on ReserveCa
 */
const getReserveCaMonths = async () => {
    logging.info(NAMESPACE, 'getReserveCaMonths: START');
    let months = [];
    const monthElement = await selenium.driver.findElement(selenium.by.xpath('//div[@class="col-span-2 w-full text-fs-18 text-black font-bold flex items-center justify-center text-center"]'));
    const month = await monthElement.getText();
    if(month){
        const tempArray = month.split(' - ');
        months = [...tempArray]
    }
    return months;
}

/**
 * Function that retrieves the currently displayed Campsites Dates
 * @returns Map of the Current Dates being displayed on on ReserveCa
 */
const getReserveCaDays = async () => {
    logging.info(NAMESPACE, 'getReserveCaDays: START');
    let dateElements = await selenium.driver.findElements(selenium.by.xpath('//tr[@class="lg:flex lg:flex-row bg-white lg:z-2 lg:justify-center xs:justify-between lg:border-b lg:border-gray-01 lg:pb-2"]//td//div'));
    if(dateElements !== undefined){
        const dates = [];
        for(let dateElement of dateElements){
            if(dateElement !== undefined){
                let date = await dateElement.getText();
                if(date.match(/^[0-9]+$/) != null){
                    dates.push(date);
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
 */
const findSiteReserveCa = async (day) => {
    logging.info(NAMESPACE, 'findSiteReserveCa: START: ' , "//button[contains(@class, ' available-unit') and contains(@title, '" + day + "')]");
    logging.info(NAMESPACE, 'findSiteReserveCa: ', data.currentDates, day.substring(3,5));
    if(data.currentDates.includes(day.substring(3,5))){
        logging.info(NAMESPACE, 'findSiteReserveCa: Day ' + day + ' is Among Dates: ' , data.currentDates);
    } else {
        await reserveCaNextWeek();
    }
    await new Promise(r => setTimeout(r, 10000));
    let siteElements = await selenium.driver.findElements(selenium.by.xpath("//button[contains(@class, ' available-unit') and contains(@title, '" + day + "')]"));
    if(siteElements && siteElements.length > 0){
        for(let siteElement of siteElements){
            let ariaLabel = await siteElement.getAttribute('aria-label');
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
        if(d1 < d2){
            d1.setDate(d1.getDate() + 1);
            logger.info(NAMESPACE, 'd1 is < d2 -- Recursively Calling findSiteReserveCa with: ' + d1.toLocaleDateString('en-us', {year: 'numeric', month: '2-digit', day: '2-digit'}));
            await findSiteReserveCa(d1.toLocaleDateString('en-us', {year: 'numeric', month: '2-digit', day: '2-digit'}));
        } else {
            logger.info(NAMESPACE, 'Base Case Reached. Ending findSiteRecreation');
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

const loginReserveCa = async () => {
    logging.info(NAMESPACE, 'loginRecreation: START');
}

module.exports = { findSiteReserveCa, loginReserveCa, navigateToProperMonth, navigateToProperDay };