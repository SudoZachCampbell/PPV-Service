'use strict'
let propertyPal = require('../external/propertypal');
let Property = require('../models/Property').property;
let _ = require('lodash');
let jsdom = require('jsdom');
let uuid = require('uuid-by-string');
let uuidv1 = require('uuid/v1')
let db = require('../external/db');

const { JSDOM } = jsdom;

module.exports = {

    /**
     * Gets a Property based on input params
     *      
     * @async
     * @param {string} area - The area to search in
     * @param {object} [params=''] - An optional list of params for filtering
     * @returns {<object>} A list of found properties
     */
    getPropertyLinks: async (area, params = '') => {
        try {
            const propertyUrls = await iteratePropertyPages(area, params);
            let searchId = uuidv1();
            return { searchId: searchId, propertyUrls: propertyUrls };
        } catch (err) {
            throw err;
        }
    },

    getPropertySearch: async (searchId, propertyUrl, keywords) => {
        console.log("New Search");
        let search = await getPropertyModel(propertyUrl, searchId);
        if (keywords) {
            search.searchKeywords(keywords);
        }
        // await db.saveProperty(searchId, search);
        return search;
    },

    getKeywordStatistics: async (searchId) => {
        let searchResult = await db.getSearch(searchId);
        searchResult = searchResult.Items;
        return _.reduce(searchResult, (accum, value) => {
            if (value.keywords.length !== 0) {
                value.keywords.forEach(value => {
                    if (accum[value]) {
                        accum[value] += 1
                    } else {
                        accum[value] = 1
                    }
                });
            }
            return accum;
        }, {})
    }
}

let iteratePropertyPages = async (area, params) => {
    let body;
    let queryString = '';
    if (!params) {
        body = await propertyPal.getPropertySearchByArea(area, 1);
    } else {
        queryString = buildFilteredQueryString(params);
        body = await propertyPal.getFilteredPropertySearch(queryString, 0);
    }
    let propertyList = [];
    let pages = getPages(body);
    for (let i = 0; i < pages; i++) {
        console.log(`Iterating Page Number: ${i + 1}`);
        if (!params) {
            body = await propertyPal.getPropertySearchByArea(area, i + 1);
        } else {
            body = await propertyPal.getFilteredPropertySearch(queryString, i);
        }
        propertyList.push(...getPropertyUrls(body));
    }
    return propertyList;
}

let getPages = (body) => {
    body = new JSDOM(body).window.document;
    let pages = body.querySelector('.paging-numbers .paging .paging-last a');
    if (pages) {
        pages = pages.innerHTML
    }
    return pages;
}

let buildFilteredQueryString = (params) => {
    let queryValues = _.reduce(_.omit(params, ['keywords']), (accum, value, key) => {
        if (typeof value === 'Array') {
            value = value.map(x => `${key}=${x}`);
            accum.push(...value);
        } else {
            accum.push(`${key}=${value}`);
        }
        return accum;
    }, [])
    return queryValues.join('&').replace(':', '=').replace('"', '');
}

let getPropertyUrls = (body) => {
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

let getPropertyModel = async (url, searchId) => {
    let propertyPage = await propertyPal.getPropertyByUrl(url);
    let propObj = storePropertyModels(propertyPage, searchId);
    return propObj;
}

let storePropertyModels = (property, searchId) => {
    try {
        property = new JSDOM(property);
        property = property.window.document;
        let keyProperties = _.values(property.getElementById('key-info-table').querySelectorAll('tr'));
        let keyPropsObj = keyProperties.reduce((accum, keyProp) => {
            return { ...accum, ...buildKeyProperties(keyProp.querySelector('th'), keyProp.querySelector('td')) }
        }, {});
        let propDescription = buildDescription(property.getElementById('additional-info'));
        if (propDescription) {
            keyPropsObj['description'] = propDescription;
        }
        let address = property.querySelector('#body .prop-summary .prop-summary-row h1').innerHTML.split(',')[0].trim();
        let postcode = property.querySelector('#body .prop-summary .prop-summary-row .prop-summary-townPostcode .text-ib').innerHTML;
        let propId = uuid(address + postcode);
        let propObj = new Property({ search_id: searchId, id: propId, address: address, postcode: postcode, ...keyPropsObj });
        return propObj;
    } catch (err) {
        throw err;
    }
}

let buildKeyProperties = (keyPropHeader, keyPropValue) => {
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

let buildDescription = (descBody) => {
    let paragraphs;
    if (descBody) {
        paragraphs = _.values(descBody.querySelectorAll('.prop-descr-left .prop-descr-text p'));
        paragraphs = paragraphs.map(p => p.textContent).join();
    }
    return paragraphs;
}