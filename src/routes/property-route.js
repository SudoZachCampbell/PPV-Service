var express = require('express');
var manageProperty = require('../services/manageProperty');

var router = express.Router();

router.get('/:propertyArea', async (req, res, next) => {
    var data = await manageProperty.getProperty(req.params.propertyArea);
    res.send(data);
});

exports.router = router;