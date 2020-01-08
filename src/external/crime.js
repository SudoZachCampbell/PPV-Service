import request from 'request'
import moment from 'moment';

export default {
    getNeighbourhoodByLL: (lat, lng) => {
        return new Promise((resolve, reject) => {
            request.get(`https://data.police.uk/api/locate-neighbourhood?q=${lat},${lng}`, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(body);
                }
            });
        });
    },
    getCrimesByLL: (lat, lng) => {
        return new Promise((resolve, reject) => {
            console.log(`Lat: ${lat}, Lng: ${lng}`);
            request.get(`https://data.police.uk/api/crimes-street/all-crime?lat=${lat}&lng=${lng}`, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(body);
                }
            });
        });
    }
}