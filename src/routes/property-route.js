var express = require('express');
var manageProperty = require('../services/get-properties');

var router = express.Router();

router.get('/:propertyArea', async (req, res, next) => {
    try {
        var data = await manageProperty.getProperty(req.params.propertyArea);
    } catch (err) {
        console.log(`${err}`);
        res.status(500).json(err);
    };
    res.status(200).json(data);
});

router.post('/:propertyArea', async (req, res, next) => {
    try {
        var data = await manageProperty.getProperty(req.params.propertyArea, req.body);
    } catch (err) {
        console.log(`${err}`);
        res.status(500).json(err);
    }
    res.status(200).json(data);
});
exports.router = router;