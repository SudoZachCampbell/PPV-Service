'use strict';
import propertyPal from '../external/propertypal';
import Property from '../models/Property';
import _ from 'lodash';
import jsdom from 'jsdom';
import uuid from 'uuid-by-string';
import uuidv1 from 'uuid/v1';
import db from '../external/db';

const { JSDOM } = jsdom;

export default {
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

  getPropertyCount: async (area, params) => {
    try {
      console.log(`Counting for Area ${area}`);
      const propertyCount = await countProperties(area, params);
      return { propertyCount };
    } catch (err) {
      throw err;
    }
  },

  getPropertySearch: async (searchId, propertyUrl, keywords) => {
    console.log('New Search');
    let [propId, propObj] = await getPropertyModel(propertyUrl, searchId);
    if (keywords) {
      propObj.searchKeywords(keywords);
    }
    // await db.saveProperty(searchId, search);
    return propObj;
  },

  getKeywordStatistics: async searchId => {
    let searchResult = await db.getSearch(searchId);
    searchResult = searchResult.Items;
    return _.reduce(
      searchResult,
      (accum, value) => {
        if (value.keywords.length !== 0) {
          value.keywords.forEach(value => {
            if (accum[value]) {
              accum[value] += 1;
            } else {
              accum[value] = 1;
            }
          });
        }
        return accum;
      },
      {}
    );
  },

  getPropertyPerformance: async (area, params = '') => {
    try {
      const propertyUrls = await iteratePropertyPages(area, params);
      let search = await getPropertyModels(propertyUrls);
      search.count = propertyUrls.length;
      let trackKeywords = {};
      if (params.keywords) {
        _.forEach(search.searchResult, (value, key) => {
          trackKeywords = value.searchKeywordsTrack(
            params.keywords,
            trackKeywords
          );
        });
      }
      // for (let [key, value] of Object.entries(search.searchResult)) {
      //     await db.saveProperty(key, value);
      // }
      search.keywords = trackKeywords;
      search.priceCounts = buildPriceCount(search);
      return search;
    } catch (err) {
      throw err;
    }
  },

  getAreaTerm: async area => {
    return await propertyPal.getAddressId(area);
  }
};

const countProperties = async (area, params) => {
  let body;
  let queryString = '';
  if (!params) {
    body = await propertyPal.getPropertySearchByArea(area, 1);
  } else {
    queryString = buildFilteredQueryString(params);
    body = await propertyPal.getFilteredPropertySearch(queryString, 0);
  }
  return getCountElement(body);
};

const getCountElement = body => {
  body = new JSDOM(body).window.document;
  let count = body.querySelector('.pgheader-currentpage em');
  return count ? count.innerHTML : {};
};

const iteratePropertyPages = async (area, params) => {
  let body;
  let queryString = '';
  if (!params) {
    body = await propertyPal.getPropertySearchByArea(area, 1);
  } else {
    queryString = buildFilteredQueryString(params);
    console.log(`Full URL: ${queryString}`);
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
};

const getPages = body => {
  body = new JSDOM(body).window.document;
  let pages = body.querySelector('.paging-numbers .paging .paging-last a');
  if (pages) {
    pages = pages.innerHTML;
  } else {
    pages = 1;
  }
  return pages;
};

const buildFilteredQueryString = params => {
  let queryValues = _.reduce(
    _.omit(params, ['keywords']),
    (accum, value, key) => {
      if (typeof value === 'object') {
        value = value.map(x => `${key}=${x}`);
        accum.push(...value);
      } else {
        accum.push(`${key}=${value}`);
      }
      return accum;
    },
    []
  );
  return queryValues
    .join('&')
    .replace(':', '=')
    .replace('"', '');
};

const getPropertyUrls = body => {
  let propertyList = [];
  body = new JSDOM(body).window.document;
  let propertyListArray = _.values(
    body
      .getElementById('body')
      .querySelector('.sr .sr-bg .sr-body .sr-widecol .boxlist')
      .getElementsByTagName('li')
  );
  propertyListArray.reduce((accum, prop) => {
    if (
      !prop.classList.contains('boxlist-strech') &&
      !prop.querySelector('div').classList.contains('propbox-premium-advert')
    ) {
      accum.push(prop.querySelectorAll('div a')[1].getAttribute('href'));
    }
    return accum;
  }, propertyList);
  return propertyList;
};

let getPropertyModels = async urls => {
  let searchId = uuidv1();
  let propertyPromiseArray = [];
  urls.reduce((accum, url) => {
    accum.push(propertyPal.getPropertyByUrl(url));
    return accum;
  }, propertyPromiseArray);
  let propertyModelHtmlArray = await Promise.all(propertyPromiseArray);
  let modelObject = {};
  propertyModelHtmlArray.reduce((accum, modelHtml) => {
    let [propId, propObj] = storePropertyModels(modelHtml, searchId);
    accum[propId] = propObj;
    return accum;
  }, modelObject);
  return { searchId: searchId, searchResult: modelObject };
};

const getPropertyModel = async (url, searchId) => {
  let propertyPage = await propertyPal.getPropertyByUrl(url);
  let [propId, propObj] = storePropertyModels(propertyPage, searchId);
  return [propId, propObj];
};

const storePropertyModels = (property, searchId) => {
  try {
    const propertyPage = new JSDOM(property);
    const document = propertyPage.window.document;
    let keyProperties = _.values(
      document.getElementById('key-info-table').querySelectorAll('tr')
    );
    let keyPropsObj = keyProperties.reduce((accum, keyProp) => {
      return {
        ...accum,
        ...buildKeyProperties(
          keyProp.querySelector('th'),
          keyProp.querySelector('td')
        )
      };
    }, {});
    let propDescription = buildDescription(
      document.getElementById('additional-info')
    );
    if (propDescription) {
      keyPropsObj['description'] = propDescription;
    }
    let propImages = getPropertyImages(document);
    if (propImages) {
      keyPropsObj['images'] = propImages;
    }
    let address = document
      .querySelector('#body .prop-summary .prop-summary-row h1')
      .innerHTML.split(',')[0]
      .trim();
    let postcode = document.querySelector(
      '#body .prop-summary .prop-summary-row .prop-summary-townPostcode .text-ib'
    ).innerHTML;
    let propId = uuid(address + postcode);
    let propObj = new Property({
      search_id: searchId,
      id: propId,
      address: address,
      postcode: postcode,
      ...keyPropsObj
    });
    return [propId, propObj];
  } catch (err) {
    throw err;
  }
};

const buildKeyProperties = (keyPropHeader, keyPropValue) => {
  let propObj = {};
  switch (keyPropHeader.innerHTML.trim()) {
    case 'Rent':
      propObj['rent'] = parseInt(
        keyPropValue
          .querySelector('.price-text')
          .innerHTML.replace('£', '')
          .replace(',', '')
      );
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
      propObj['deposit'] = parseInt(
        keyPropValue.innerHTML
          .trim()
          .replace('£', '')
          .replace(',', '')
      );
      break;
    default:
      throw new Error(
        `Unhandled Key Property Type: ${keyPropHeader.innerHTML}`
      );
  }
  return propObj;
};

const buildDescription = descBody => {
  let paragraphs;
  if (descBody) {
    paragraphs = _.values(
      descBody.querySelectorAll('.prop-descr-left .prop-descr-text p')
    );
    paragraphs = paragraphs.map(p => p.textContent).join();
  }
  return paragraphs;
};

const getPropertyImages = document => {
  const imageElements = _.values(
    document.querySelectorAll(
      '#body .prop .prop-top .Mediabox .Mediabox-panels .Mediabox-panel .Slideshow .Slideshow-thumbs a'
    )
  );
  const imageUrls = imageElements.map(x => x.href);
  return imageUrls;
};

const buildPriceCount = search => {
  return _.countBy(search, value => {
    if (value.searchResult.rent) {
      return value.searchResult.rent;
    }
  });
};
