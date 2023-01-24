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
            url: "https://www.recreation.gov/camping/campgrounds/23244"
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
        }
    }
};

const months = {
    "Jan": {
        number: 01,
        name: "JANUARY",
        nameReserve: "January"
    },
    "Feb": {
        number: 02,
        name: "FEBRUARY",
        nameReserve: "February"
    },
    "Mar": {
        number: 03,
        name: "MARCH",
        nameReserve: "March"
    },
    "Apr": {
        number: 04,
        name: "APRIL",
        nameReserve: "April"
    },
    "May": {
        number: 05,
        name: "MAY",
        nameReserve: "May"
    },
    "Jun": {
        number: 06,
        name: "JUNE",
        nameReserve: "June"
    },
    "Jul": {
        number: 07,
        name: "JULY",
        nameReserve: "July"
    },
    "Aug": {
        number: 08,
        name: "AUGUST",
        nameReserve: "August"
    },
    "Sep": {
        number: 09,
        name: "SEPTEMBER",
        nameReserve: "September"
    },
    "Oct": {
        number: 10,
        name: "OCTOBER",
        nameReserve: "October"
    },
    "Nov": {
        number: 11,
        name: "NOVEMBER",
        nameReserve: "November"
    },
    "Dec": {
        number: 12,
        name: "DECEMBER",
        nameReserve: "December"
    }
};

const emailString = "Hey {0},\nThe following Campesite(s) have been found at {1}:\n{2}\n\nThanks for using the California Campsite Scraper.\n\nPhillip Bay";

module.exports = { campsites, months, emailString };