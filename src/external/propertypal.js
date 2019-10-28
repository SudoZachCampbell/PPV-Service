var request = require('request');

module.exports = {
    getPropertySearchByArea: (area, page) => {
        return new Promise((resolve, reject) => {
            if (page === 1) {
                request.get(`https://www.propertypal.com/property-to-rent/${area}`, (error, response, body) => {
                    resolve(body);
                });
            } else {
                request.get(`https://www.propertypal.com/property-to-rent/${area}/page-${page}`, (error, response, body) => {
                    resolve(body);
                });
            }
        });
    },
    getPropertyByUrl: (url) => {
        return new Promise((resolve, reject) => {
            console.log(`Getting Property: ${url}`);
            request.get(`https://www.propertypal.com${url}`, (error, response, body) => {
                resolve(body);
            });
        });
    }
}