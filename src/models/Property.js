'use strict'

var property = class Property {
    constructor({id, rent, furnished, availableFrom, style, receptions, status, epcRating, heating, lease, rates, viewableFrom, deposit, bedrooms, bathrooms, address, postcode}={}) {
        this.id = id;
        this.rent = rent;
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
}

exports.property = property;