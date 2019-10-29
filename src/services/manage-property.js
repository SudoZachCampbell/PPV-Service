'use strict'
var propertyPal = require('../external/propertypal');
var Property = require('../models/Property').property;
var _ = require('lodash');
var jsdom = require('jsdom');
var uuid = require('uuid-by-string');
var db = require('../external/db');

const { JSDOM } = jsdom;

module.exports = {
    getProperty: async (area) => {
        var propertyUrls = await iteratePropertyPages(area);
        var propertyModels = await getPropertyModels(propertyUrls);
        return propertyModels;
    }
}

var getPages = (body) => {
    body = new JSDOM(body).window.document;
    var pages = body.querySelector('.paging-numbers .paging .paging-last a');
    if (pages) {
        pages = pages.innerHTML
    }
    return pages;
}

var iteratePropertyPages = async (area) => {
    var body = await propertyPal.getPropertySearchByArea(area, 1);
    let pages = getPages(body)
    let propertyList = []
    for (var i = 0; i < pages; i++) {
        console.log(`Iterating Page Number: ${i + 1}`);
        let body = await propertyPal.getPropertySearchByArea(area, i + 1)
        propertyList.push(...getPropertyUrls(body));
    }
    return propertyList;
}

var getPropertyUrls = (body) => {
    let propertyList = [];
    body = new JSDOM(body).window.document;
    let propertyListArray = _.values(body.getElementById('body').querySelector('.sr .maxwidth .sr-body .sr-widecol .boxlist').getElementsByTagName('li'));
    propertyListArray.reduce((accum, prop) => {
        if (!prop.classList.contains('boxlist-strech') && !prop.querySelector('div').classList.contains('propbox-premium-advert')) {
            accum.push(prop.querySelectorAll('div a')[1].getAttribute('href'));
        }
        return accum;
    }, propertyList);
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
    // for(let [key, value] of Object.entries(modelObject)) {
    //     await db.saveProperty(key, value);
    // }
    return modelObject;
}

var storePropertyModels = (property) => {
    try {
        property = new JSDOM(property);
        property = property.window.document;
        let keyProperties = _.values(property.getElementById('key-info-table').querySelectorAll('tr'));
        let keyPropsObj = keyProperties.reduce((accum, keyProp) => {
            return { ...accum, ...buildKeyProperties(keyProp.querySelector('th'), keyProp.querySelector('td')) }
        }, {});
        let propDescription = buildDescription(property.getElementById('additional-info'));
        if(propDescription) {
            keyPropsObj['description'] = propDescription;
        }
        let address = property.querySelector('#body .prop-summary .prop-summary-row h1').innerHTML.split(',')[0].trim();
        let postcode = property.querySelector('#body .prop-summary .prop-summary-row .prop-summary-townPostcode .text-ib').innerHTML;
        let propId = uuid(address + postcode);
        let propObj = new Property({ id: propId, address: address, postcode: postcode, ...keyPropsObj });
        return [propId, propObj];
    } catch (err) {
        throw new Error(err);
    }
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
            propObj['deposit'] = parseInt(keyPropValue.innerHTML.trim().replace('£', '').replace(',', ''));
            break;
        default:
            throw new Error(`Unhandled Key Property Type: ${keyPropHeader.innerHTML}`);
    }
    return propObj;
}

var buildDescription = (descBody) => {
    let paragraphs = _.values(descBody.querySelectorAll('.prop-descr-left .prop-descr-text p'));
    paragraphs = paragraphs.map(p => p.textContent).join();
    return paragraphs;
}