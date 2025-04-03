const campsites = {
    "recreation.gov": {
        "upper-pines": {
            website: "recreation.gov",
            location: "yosemite",
            campground: "upper-pines",
            url: "https://www.recreation.gov/camping/campgrounds/232447"
        },
        "lower-pines": {
            website: "recreation.gov",
            location: "yosemite",
            campground: "lower-pines",
            url: "https://www.recreation.gov/camping/campgrounds/232450"
        },
        "north-pines": {
            website: "recreation.gov",
            location: "yosemite",
            campground: "north-pines",
            url: "https://www.recreation.gov/camping/campgrounds/232449"
        },
        "pinnacles": {
            website: "recreation.gov",
            location: "pinnacles",
            campground: "main",
            url: "https://www.recreation.gov/camping/campgrounds/234015"
        },
        "wolf-creek": {
            website: "recreation.gov",
            location: "union valley resevoir",
            campground: "wolf-creek",
            url: "https://www.recreation.gov/camping/campgrounds/232366"
        }
    },
    "reserveca":{
        "pfeiffer-main": {
            website: "reserveca",
            location: "big sur",
            campground: "pfeiffer-main",
            url: "https://www.reservecalifornia.com/Web/Default.aspx#!park/690/767"
        },
        "steep-ravine-cabins": {
            website: "reserveca",
            location: "steep ravine",
            campground: "cabins",
            url: "https://www.reservecalifornia.com/Web/Default.aspx#!park/682/766"
        },
        "samuel-p-taylor_creekside": {
            website: "reserveca",
            location: "samuel p",
            campground: "creekside",
            url: "https://www.reservecalifornia.com/Web/Default.aspx#!park/705/653"
        }
    }
};

const months = {
    "Jan": {
        number: 01,
        name: "JANUARY",
        nameRecShort: "JAN",
        nameReserve: "January"
    },
    "Feb": {
        number: 02,
        name: "FEBRUARY",
        nameRecShort: "FEB",
        nameReserve: "February"
    },
    "Mar": {
        number: 03,
        name: "MARCH",
        nameRecShort: "MAR",
        nameReserve: "March"
    },
    "Apr": {
        number: 04,
        name: "APRIL",
        nameRecShort: "APR",
        nameReserve: "April"
    },
    "May": {
        number: 05,
        name: "MAY",
        nameRecShort: "MAY",
        nameReserve: "May"
    },
    "Jun": {
        number: 06,
        name: "JUNE",
        nameRecShort: "JUN",
        nameReserve: "June"
    },
    "Jul": {
        number: 07,
        name: "JULY",
        nameRecShort: "JUL",
        nameReserve: "July"
    },
    "Aug": {
        number: 08,
        name: "AUGUST",
        nameRecShort: "AUG",
        nameReserve: "August"
    },
    "Sep": {
        number: 09,
        name: "SEPTEMBER",
        nameRecShort: "SEP",
        nameReserve: "September"
    },
    "Oct": {
        number: 10,
        name: "OCTOBER",
        nameRecShort: "OCT",
        nameReserve: "October"
    },
    "Nov": {
        number: 11,
        name: "NOVEMBER",
        nameRecShort: "NOV",
        nameReserve: "November"
    },
    "Dec": {
        number: 12,
        name: "DECEMBER",
        nameRecShort: "DEC",
        nameReserve: "December"
    }
};

const emailGreeting = 'Hey {0},\nThe following Campesite(s) have been found at <a href="{1}" target="_blank">{2}</a>\n';
const emailOutro = '\n\nThanks for using the California Campsite Scraper.\n\nPhillip Bay';
const emailStringHTML = '<html><head><style></style></head><body><p>Hey {0},</p><br><p>The following Campsite(s) have been found at <a target="_blank" href="{1}">{2}</a></p><br><p>{3}</p> <br><p>Login, book your sites, and let me know which you were able to reserve.</p><br><p>Thanks for using the California Campsite Scraper!</p><br><br><p>Phillip Bay</p><br><p>phillip.bay@gmail.com</p></body></html>';

module.exports = { campsites, months, emailGreeting, emailOutro, emailStringHTML };

//{3}\n{4}\n\n