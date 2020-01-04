import express from 'express';

let router = express.Router();

router.get('/crime/:lat/:long', (req, res) => {
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