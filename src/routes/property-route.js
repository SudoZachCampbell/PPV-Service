let express = require('express');
let manageProperty = require('../services/get-properties');

let router = express.Router();

router.get('/:propertyArea', async (req, res, next) => {
    let data = {};
    try {
        data = await manageProperty.getPropertyLinks(req.params.propertyArea);
    } catch (err) {
        console.log(`${err}`);
        res.status(500).json(err);
    };
    res.status(200).json(data);
});

router.post('/', async (req, res, next) => {
    let data = {}
    try {
        data = await manageProperty.getPropertySearch(req.body.searchId, req.body.propertyUrl, req.body.keywords);
    } catch (err) {
        console.log(`${err}`);
        res.status(500).json(err);
    }
    res.status(200).json(data);

});

router.get('/keywordStats/:searchId', async (req, res, next) => {
    let data = {};
    try {
        data = await manageProperty.getKeywordStatistics(req.params.searchId);
    } catch (err) {
        console.log(`${err}`);
        res.status(500).json(err);
    }
    res.status(200).json(data);
});

router.post('/:propertyArea', async (req, res, next) => {
    let data = {};
    try {
        data = await manageProperty.getPropertyLinks(req.params.propertyArea, req.body);
    } catch (err) {
        console.log(`${err}`);
        res.status(500).json(err);
    }
    res.status(200).json(data);
});

exports.router = router;