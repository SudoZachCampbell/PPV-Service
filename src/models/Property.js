'use strict'

var property = class Property {
    keywords = []

    constructor({ id, rent, furnished, description, availableFrom, style, receptions, status, epcRating, heating, lease, rates, viewableFrom, deposit, bedrooms, bathrooms, address, postcode } = {}) {
        this.id = id;
        this.rent = rent;
        this.description = description;
        this.furnished = furnished;
        this.availableFrom = availableFrom;
        this.style = style;
        this.receptions = receptions;
        this.status = status;
        this.epcRating = epcRating;
        this.heating = heating;
        this.lease = lease;
        this.rates = rates;
        this.viewableFrom = viewableFrom;
        this.deposit = deposit;
        this.bedrooms = bedrooms;
        this.bathrooms = bathrooms;
        this.address = address;
        this.postcode = postcode;
    }

    searchKeywords = keywordsSearch => {
        if (this.description) {
            keywordsSearch.forEach(keyword => {
                if (this.description.includes(keyword)) this.keywords.push(keyword);
            });
        }
    };
}

exports.property = property;