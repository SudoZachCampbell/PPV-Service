import geocoder from '../external/geocoder';

export default {
  getCrimeData: async (property) => {
    console.log('Loading Crime Data');
    const latLng = await getLatLong(property.address, property.postcode);
    console.log(`Lat: ${latLng.lat}, Lng: ${latLng.lng}`);
    return latLng;
  }
};

const getLatLong = async (address, postcode) => {
  return geocoder.getLLByAddress(
    address.replace(' ', '+'),
    postcode.replace(' ', '+')
  );
};
