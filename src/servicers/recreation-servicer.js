const utilities = require('../helpers/utilities'); 
const logging = require('../helpers/logging');
const constants = require('../helpers/constants');
const data = require('../helpers/data');
const selenium = require('../helpers/selenium');
const NAMESPACE = 'servicers/recreation-servicer';

/**
 * Function that changes the tables dates to adjust the Month for Recreation.Gov
 */
const navigateToProperMonth = async () => {
    logging.info(NAMESPACE, 'navigateToProperMonth: START');
    const months = await getRecreationGovMonths();
    if(months){
        if(constants.months[data.monthMin].name in months && constants.months[data.monthMax].name in months){
            logging.info(NAMESPACE, 'Navigated to the correct Months');
            return 0;
        } else {
            logging.info(NAMESPACE, "Not In the correct months, forwarding 5 days");
            await recGovFiveDays();
            return await navigateToProperMonth();
        }
    } else {
        logging.info(NAMESPACE, "MONTHS FALSEY, RETURNING: ", months)
        return 1;
    }
};

/**
 * Function that changes the tables dates to adjust the Month
 */
const navigateToProperDay = async () => {
    logging.info(NAMESPACE, 'navigateToProperDay: START');
    let dates = await getRecreationGovDays();
    if(data.dayMin in dates && data.dayMax in dates){
        logging.info(NAMESPACE, 'Navigated to the correct Dates');
        return 0;
    } else {
        logging.info(NAMESPACE, "Correct Dates not displayed, forwarding 5 days");
        await recGovFiveDays();
        return await navigateToProperDay();
    }
}

/**
 * Function that finds the Forward 5 Days button on Recreation.Gov and presses it
 
 */
const recGovFiveDays = async () => {
    logging.info(NAMESPACE, 'recGovFiveDays: START');
    await selenium.driver.findElement(selenium.by.xpath('//button[@aria-label="Go Forward 5 Days"]')).click();
}

/**
 * Function that retrieves the currently displayed Campsites Month(s)
 * @returns Map of the Current Months being displayed on on Recreation.gov
 */
const getRecreationGovMonths = async () => {
    logging.info(NAMESPACE, 'getRecreationGovMonths: START');
    let monthElements = await selenium.driver.findElements(selenium.by.xpath('//tr[@class="rec-table-months-row"]//th//div//span'));
    if(monthElements !== undefined && monthElements.length > 0){
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
 * @returns Map of the Current Dates being displayed on on Recreation.gov
 */
const getRecreationGovDays = async () => {
    logging.info(NAMESPACE, 'getRecreationGovDays: START');
    let dateElements = await selenium.driver.findElements(selenium.by.xpath('//span[@class="date"]'));
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
 */
const findSiteRecreation = async () => {
    logging.info(NAMESPACE, 'findSiteRecreation: START');
    let siteElements = await selenium.driver.findElements(selenium.by.xpath("//button[text()[contains(., 'A')]]"));
    if(siteElements && siteElements.length > 0){
        let siteElementToClick;
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
                    const siteNumber = ariaLabel.match(/\b\d{3}\b/)[0];
                    if(data.range){
                        for(let date of Object.keys(data.dateFoundMap)){
                            if(ariaLabel.includes(date)){
                                siteElementToClick = siteElement;
                                data.dateFoundMap[date] = true;
                                data.confirmedDates.push(ariaLabel + "&" + await getSiteUrl(selenium.driver, siteNumber));
                            }
                        }
                    } else {
                        siteElementToClick = siteElement;
                        data.found = true;
                        data.confirmedDates.push(ariaLabel + "&" + await getSiteUrl(selenium.driver, siteNumber));
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
        if(data.login && siteElementToClick) {
            await selenium.driver.executeScript('arguments[0].scrollIntoView(true);', siteElementToClick);
            await selenium.driver.sleep(500);
            await selenium.driver.wait(selenium.until.elementIsEnabled(siteElementToClick));
            await selenium.driver.executeScript('arguments[0].click();', siteElementToClick);
            await selenium.driver.findElement(selenium.by.xpath(`//button[contains(., 'Add to Cart')]`)).click();
            let proceed;
            try {
                proceed = await selenium.driver.findElement(selenium.by.xpath(`//button[contains(., 'Proceed with Reservation')]`));
            } catch (error) {
                console.log("Button not found");
                return; // Exit the function if the button is not found
            }
            await proceed.click();
            await selenium.driver.sleep(5000);
        }
    } else {
        logging.info(NAMESPACE, 'findSiteRecreation: No Available Sites Found');
    }
}

/**
 * Function to get the URL of an available campsite
 * @param {string} siteNumber Number of the site for which to get the URL to the reserve page
 * @returns 
 */
const getSiteUrl = async (siteNumber) => {
    logging.info(NAMESPACE, 'getSiteUrl: START');

    let siteLink = await selenium.driver.findElements(selenium.by.xpath(`//a[contains(.,'${siteNumber}')]`));
    if(siteLink !== undefined && siteLink.length > 0){
        const link = siteLink[0];
        return await link.getAttribute("href");
    } else {
        console.log('No SiteLink Found');
        return "";
    }
}

/**
 * Function to login to the Recreation.Gov website from any campsite page
 */
const loginRecreation = async () => {
    logging.info(NAMESPACE, 'loginRecreation: START');

    const signInButton = await selenium.driver.findElement(selenium.by.xpath(`//button[@aria-label="Sign Up or Log In"]`));
    if(signInButton) {
        await signInButton.click();
        const emailField = await selenium.driver.findElement(selenium.by.xpath(`//input[@name="email"]`));
        if(emailField){
            await emailField.sendKeys(process.env.EMAIL);
        }
        const passField = await selenium.driver.findElement(selenium.by.xpath(`//input[@type="password"]`));
        if(passField){
            await passField.sendKeys(process.env.PASSWORD);
        }
        const loginButton = await selenium.driver.findElement(selenium.by.xpath(`//button[@type="submit"]`));
        await loginButton.click();
    }
}

module.exports = { findSiteRecreation, loginRecreation, navigateToProperDay, navigateToProperMonth };