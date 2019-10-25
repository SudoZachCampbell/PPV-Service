var request = require('request');

module.exports = {
    getPropertyByArea: (area) => {
        return new Promise((resolve, reject) => {
            request.get(`https://www.propertypal.com/property-to-rent/${area}`, (error, response, body) => {
                resolve(body);
            });
        });
    },
    getPropertyByUrl: (url) => {
        return new Promise((resolve, reject) => {
            request.get(`https://www.propertypal.com${url}`, (error, response, body) => {
                resolve(body);
            });
        });
    }
}