import geocoder from '../external/geocoder';
import crime from '../external/crime';

import _ from 'lodash';

export default {
  getCrimeData: async property => {
    console.log('Loading Crime Data');
    const latLng = await getLatLong(property.address, property.postcode);
    let crimeData = {};
    crimeData.fullData = await getCrimeData(latLng.lat, latLng.lng);
    crimeData.categoryCounts = countCategories(crimeData.fullData);
    return crimeData;
  }
};

const getLatLong = async (address, postcode) => {
  return geocoder.getLLByAddress(
    address.replace(' ', '+'),
    postcode.replace(' ', '+')
  );
};

const getCrimeData = async (lat, lng) => {
  return crime.getCrimesByLL(lat, lng);
};

const countCategories = crimeData => {
  console.log(typeof crimeData);
  return _.reduce(crimeData, (accum, value, key) => {
    if(value.category in accum) {
      accum[value.category] += 1;
    } else {
      accum[value.category] = 1;
    } return accum
  }, {})
}
