var express = require('express');
var manageProperty = require('../services/manageProperty');

var router = express.Router();

router.get('/:propertyArea', async (req, res, next) => {
    try {
        var data = await manageProperty.getProperty(req.params.propertyArea);
    } catch(err) {
        res.status(500).json(err);
    };
    res.status(200).json(data);
});

exports.router = router;