var propertyPal = require('../external/propertypal');
var _ = require('lodash');
var jsdom = require('jsdom');
const { JSDOM } = jsdom;

module.exports = {
    getProperty: async (area) => {
        var body = await propertyPal.getPropertyByArea(area)
        var body = new JSDOM(body);
        var window = body.window;
        var propertyList = _.values(window.document.getElementById('body').querySelector('.sr .maxwidth .sr-body .sr-widecol .boxlist').getElementsByTagName('li'));
        propertyList = propertyList.reduce((accum, prop) => {
            if (!prop.classList.contains('boxlist-strech')) {
                accum.push(prop.querySelectorAll('div a')[1].getAttribute('href'));
            }
            return accum;
        }, []);
        var propertyPromiseArray = propertyList.reduce((accum, url) => {
            accum.push(propertyPal.getPropertyByUrl(url));
            return accum;
        }, []);
        var propertyReturns = await Promise.all(propertyPromiseArray);
        return propertyReturns;
    }
}