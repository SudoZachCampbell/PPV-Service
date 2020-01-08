import geocoder from '../external/geocoder';
import crime from '../external/crime';

import _ from 'lodash';

export default {
  getCrimeData: async property => {
    console.log('Loading Crime Data');
    const latLng = await getLatLong(property.address, property.postcode);
    let crimeData = [];
    crimeData = await getCrimeData(latLng.lat, latLng.lng);
    console.log(`Lat: ${latLng.lat}, Lng: ${latLng.lng}`);
    crimeData.map(value => {
      value.distance = getRadius(
        latLng.lat,
        latLng.lng,
        Number(value.location.latitude),
        Number(value.location.longitude)
      );
      return value;
    });
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
