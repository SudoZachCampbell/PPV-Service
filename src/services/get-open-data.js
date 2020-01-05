import geocoder from '../external/geocoder';

export default {
  getCrimeData: async property => {
      const latLng = getLatLong(property.address, property.postcode);
      return latLng;
  }
};

const getLatLong = async (address, postcode) => {
  return await geocoder.getLLByAddress(
    property.address.replace(' ', '+'),
    property.postcode.replace(' ', '+')
  );
};
