'use strict'
var propertyPal = require('../external/propertypal');
var Property = require('../models/Property').property;
var _ = require('lodash');
var jsdom = require('jsdom');
var uuid = require('uuid-by-string');
const { JSDOM } = jsdom;

module.exports = {
    getProperty: async (area) => {
        var pages = await getPage(area);
        console.log(`Pages: ${pages}`);
        var propertyUrls = await getPropertyUrls(area, pages);
        var propertyModels = await getPropertyModels(propertyUrls);
        return propertyModels;
    }
}

var getPage = async (area) => {
    var body = await propertyPal.getPropertySearchByArea(area, 1);
    body = new JSDOM(body).window.document;
    var page = body.querySelector('.paging-numbers .paging .paging-last a');
    if (page) {
        page = page.innerHTML
    }
    return page;
}

var getPropertyUrls = async (area, pages) => {
    var propertyList = [];
    for (var i = 0; i < pages; i++) {
        console.log(`Iterating Page Number: ${i + 1}`);
        let body = await propertyPal.getPropertySearchByArea(area, i + 1)
        body = new JSDOM(body).window.document;
        let propertyListArray = _.values(body.getElementById('body').querySelector('.sr .maxwidth .sr-body .sr-widecol .boxlist').getElementsByTagName('li'));
        propertyListArray.reduce((accum, prop) => {
            if (!prop.classList.contains('boxlist-strech') && !prop.querySelector('div').classList.contains('propbox-premium-advert')) {
                accum.push(prop.querySelectorAll('div a')[1].getAttribute('href'));
            }
            return accum;
        }, propertyList);
    }
    return propertyList;
}

var getPropertyModels = async (urls) => {
    let propertyPromiseArray = [];
    urls.reduce((accum, url) => {
        accum.push(propertyPal.getPropertyByUrl(url));
        return accum;
    }, propertyPromiseArray);
    let propertyModelHtmlArray = await Promise.all(propertyPromiseArray);
    let modelObject = {};
    propertyModelHtmlArray.reduce((accum, modelHtml) => {
        let [propId, propObj] = storePropertyModels(modelHtml);
        accum[propId] = propObj;
        return accum;
    }, modelObject);
    return modelObject;
}

var storePropertyModels = (model) => {
    model = new JSDOM(model);
    model = model.window.document;
    let keyProperties = _.values(model.getElementById('key-info-table').querySelectorAll('tr'));
    let keyPropsObj = keyProperties.reduce((accum, keyProp) => {
        return { ...accum, ...buildKeyProperties(keyProp.querySelector('th'), keyProp.querySelector('td')) }
    }, {});
    let address = model.querySelector('#body .prop-summary .prop-summary-row h1').innerHTML.split(',')[0].trim();
    let postcode = model.querySelector('#body .prop-summary .prop-summary-row .prop-summary-townPostcode .text-ib').innerHTML;
    let propId = uuid(address + postcode);
    let propObj = new Property({ id: propId, address: address, postcode: postcode, ...keyPropsObj });
    return [propId, propObj];
}

var buildKeyProperties = (keyPropHeader, keyPropValue) => {
    let propObj = {};
    switch (keyPropHeader.innerHTML.trim()) {
        case 'Rent':
            propObj['rent'] = parseInt(keyPropValue.querySelector('.price-text').innerHTML.replace('£', '').replace(',', ''));
            break;
        case 'Rates':
            propObj['rates'] = keyPropValue.innerHTML.trim();
            break;
        case 'Viewable From':
            propObj['viewableFrom'] = keyPropValue.innerHTML.trim();
            break;
        case 'Available From':
            propObj['availableFrom'] = keyPropValue.innerHTML.trim();
            break;
        case 'Lease':
            propObj['lease'] = keyPropValue.innerHTML.trim();
            break;
        case 'Heating':
            propObj['heating'] = keyPropValue.innerHTML.trim();
            break;
        case 'Furnished':
            propObj['furnished'] = keyPropValue.innerHTML.trim();
            break;
        case 'Style':
            propObj['style'] = keyPropValue.innerHTML.trim();
            break;
        case 'Bedrooms':
            propObj['bedrooms'] = parseInt(keyPropValue.innerHTML.trim());
            break;
        case 'Receptions':
            propObj['receptions'] = parseInt(keyPropValue.innerHTML.trim());
            break;
        case 'Bathrooms':
            propObj['bathrooms'] = parseInt(keyPropValue.innerHTML.trim());
            break;
        case 'EPC Rating':
            break;
        case 'Status':
            propObj['status'] = keyPropValue.innerHTML.trim();
            break;
        case 'Deposit':
            propObj['deposit'] = parseInt(keyPropValue.innerHTML.trim().replace('£','').replace(',',''));
            break;
        default:
            throw new Error(`Unhandled Key Property Type: ${keyPropHeader.innerHTML}`);
    }
    return propObj;
}