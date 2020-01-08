import geocoder from '../external/geocoder';
import crime from '../external/crime';

import _ from 'lodash';

export default {
  getCrimeData: async property => {
    console.log('Loading Crime Data');
    const latLng = await getLatLong(property.address, property.postcode);
    let crimeData = {};
    crimeData.fullData = await getCrimeData(latLng.lat, latLng.lng);
    let boundaries = {};
    console.log(`Lat: ${latLng.lat}, Lng: ${latLng.lng}`);
    crimeData.fullData = crimeData.fullData.filter(value => {
      checkRadius(
        boundaries,
        latLng.lat,
        latLng.lng,
        Number(value.location.latitude),
        Number(value.location.longitude)
      );
    });
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

const checkRadius = (
  boundaries,
  controlLat,
  controlLng,
  crimeLat,
  crimeLng
) => {
  if (Object.keys(boundaries).length === 2) {
    if (
      Math.abs(controlLat - crimeLat) <=
        Math.abs(controlLat - boundaries.valid.crimeLat) &&
      Math.abs(controlLng - crimeLng) <=
        Math.abs(controlLng - boundaries.valid.crimeLng)
    ) {
      console.log(`${crimeLat},${crimeLng} valid`);
    } else if (
      Math.abs(controlLat - crimeLat) >
        Math.abs(controlLat - boundaries.invalid.crimeLat) &&
      Math.abs(controlLng - crimeLng) >
        Math.abs(controlLng - boundaries.invalid.crimeLng)
    ) {
      console.log(`${crimeLat},${crimeLng} invalid`);
    }
  } else {
    const d =
      Math.acos(
        Math.sin(toRadians(crimeLat)) * Math.sin(toRadians(controlLat)) +
          Math.cos(toRadians(crimeLat)) *
            Math.cos(toRadians(controlLat)) *
            Math.cos(toRadians(crimeLng) - toRadians(controlLng))
      ) * 6371;
    if (d <= 1) {
      boundaries.valid = {
        crimeLat,
        crimeLng
      };
      console.log(
        `Valid at : ${d}km, crimeLat: ${crimeLat}, crimeLng: ${crimeLng}`,
        boundaries
      );
      return true;
    } else {
      boundaries.invalid = {
        crimeLat,
        crimeLng
      };
      console.log(
        `Invalid at : ${d}km, crimeLat: ${crimeLat}, crimeLng: ${crimeLng}`,
        boundaries
      );
      return false;
    }
  }
};

const toRadians = degrees => {
  return degrees * (Math.PI / 180);
};
