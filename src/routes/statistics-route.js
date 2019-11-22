let express = require('express');
let stats = require('../services/get-statistics')

let router = express.Router();

router.post('/keywordCounts', (req, res, next) => {
    let data = {}
    try {
        data = await stats.countKeywords(req.body.keywords);
    } catch (err) {
        console.log(`${err}`);
        res.status(500).json(err);
    }
    res.status(200).json(data);

});

exports.router = router;