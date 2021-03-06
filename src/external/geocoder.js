import request from 'request'

export default {
    getLLByAddress: (address, postcode) => {
        return new Promise((resolve, reject) => {
            request.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address},${postcode}&key=AIzaSyCQLI34B1kJnIeAFKrcbzzJfqhwcfLBCK8`, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(JSON.parse(body).results[0].geometry.location);
                }
            });
        });
    }
}