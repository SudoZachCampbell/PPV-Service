import geocoder from '../external/geocoder';
import crime from '../external/crime';

import _ from 'lodash';

export default {
  getCrimeData: async property => {
    console.log('Loading Crime Data');
    const latLng = await getLatLong(property.address, property.postcode);
    let crimeData = {};
    crimeData.fullData = await getCrimeData(latLng.lat, latLng.lng);
    console.log(`Lat: ${latLng.lat}, Lng: ${latLng.lng}`);
    crimeData.fullData.map(value => {
      value.distance = getRadius(
        latLng.lat,
        latLng.lng,
        Number(value.location.latitude),
        Number(value.location.longitude)
      );
      return value;
    }
    );
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
  return _.reduce(
    crimeData,
    (accum, value, key) => {
      if (value.category in accum) {
        accum[value.category] += 1;
      } else {
        accum[value.category] = 1;
      }
      return accum;
    },
    {}
  );
};

const getRadius = (controlLat, controlLng, crimeLat, crimeLng) => {
  return (
    Math.acos(
      Math.sin(toRadians(crimeLat)) * Math.sin(toRadians(controlLat)) +
        Math.cos(toRadians(crimeLat)) *
          Math.cos(toRadians(controlLat)) *
          Math.cos(toRadians(crimeLng) - toRadians(controlLng))
    ) * 6371
  );
};

const toRadians = degrees => {
  return degrees * (Math.PI / 180);
};
