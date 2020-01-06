import geocoder from '../external/geocoder';
import crime from '../external/crime';

export default {
  getCrimeData: async property => {
    console.log('Loading Crime Data');
    const latLng = await getLatLong(property.address, property.postcode);
    console.log(`Lat: ${latLng.lat}, Lng: ${latLng.lng}`);
    const crimeData = await getCrimeData(latLng);
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
  return crime.getNeighbourhoodByLL(lat, lng);
};
