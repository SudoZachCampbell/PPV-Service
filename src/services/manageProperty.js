'use strict'
var propertyPal = require('../external/propertypal');
var _ = require('lodash');
var jsdom = require('jsdom');
const { JSDOM } = jsdom;

module.exports = {
    getProperty: async (area) => {
        var body = await propertyPal.getPropertySearchByArea(area, 1)
        var body = new JSDOM(body);
        var window = body.window;
        var page = window.document.querySelector('.paging-numbers .paging .paging-last a');
        if (page) {
            page = page.innerHTML
        }
        console.log(`Pages: ${page}`);
        var propertyList = [];
        for(var i = 0; i < page; i++) {
            console.log(`Iterating Page Number: ${i+1}`);
            body = await propertyPal.getPropertySearchByArea(area, i+1)
            body = new JSDOM(body);
            window = body.window;
            let propertyListArray = _.values(window.document.getElementById('body').querySelector('.sr .maxwidth .sr-body .sr-widecol .boxlist').getElementsByTagName('li'));
            propertyListArray.reduce((accum, prop) => {
                if (!prop.classList.contains('boxlist-strech') && !prop.querySelector('div').classList.contains('propbox-premium-advert')) {
                    accum.push(prop.querySelectorAll('div a')[1].getAttribute('href'));
                }
                return accum;
            }, propertyList);
        }
        var propertyPromiseArray = propertyList.reduce((accum, url) => {
            accum.push(propertyPal.getPropertyByUrl(url));
            return accum;
        }, []);
        var propertyReturns = await Promise.all(propertyPromiseArray);
        return propertyList;
    }
}