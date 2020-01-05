import express from 'express';
import getOpenData from '../services/get-open-data';

let router = express.Router();

router.post('/crime/:lat/:long', async (req, res) => {
    let data = {}
    try {
        data = await getOpenData.getCrimeData(req.body);
    } catch (err) {
        console.log(`${err}`);
        res.status(500).json(err);
    }
    res.status(200).json(data);
});

exports.router = router;