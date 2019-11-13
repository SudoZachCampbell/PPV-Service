var request = require('request');

module.exports = {

    /**
     * Gets a Standard Property Search
     * 
     * @param {string} queryString - The area to search in
     * @param {int} page - The requested page number
     * @returns {Promise<object>} The webpage body 
     */
    getPropertySearchByArea: (area, page) => {
        return new Promise((resolve, reject) => {

            // Checks the page value, and gets the appropriate URL
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

    /**
     * Gets a Filtered Property Search
     * 
     * @param {string} queryString - The list of filters
     * @param {int} page - The requested page number
     * @returns {Promise<object>} The webpage body 
     */
    getFilteredPropertySearch: (queryString, page) => {
        return new Promise((resolve, reject) => {
            if (page === 0) {
                request.get(`https://www.propertypal.com/search?${queryString}`, (error, response, body) => {
                    resolve(body);
                });
            } else {
                request.get(`https://www.propertypal.com/search?${queryString}&page=${page}`, (error, response, body) => {
                    resolve(body);
                });
            }
        });
    },

    /**
     * Gets a Property by URL
     * 
     * @param {string} url - The exact property to be returned
     * @returns {Promise<object>} The webpage body
     */
    getPropertyByUrl: (url) => {
        return new Promise((resolve, reject) => {
            console.log(`Getting Property: ${url}`);
            request.get(`https://www.propertypal.com${url}`, (error, response, body) => {
                resolve(body);
            });
        });
    }
}