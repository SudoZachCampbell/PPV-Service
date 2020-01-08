import geocoder from '../external/geocoder';
import crime from '../external/crime';

export default {
  getCrimeData: async property => {
    console.log('Loading Crime Data');
    const latLng = await getLatLong(property.address, property.postcode);
    const crimeData = await getCrimeData(latLng.lat, latLng.lng);
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
