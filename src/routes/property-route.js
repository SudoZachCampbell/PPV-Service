import express from 'express';
import manageProperty from '../services/get-properties';

let router = express.Router();

router.get('/:propertyArea', async (req, res, next) => {
  let data = {};
  try {
    data = await manageProperty.getPropertyLinks(req.params.propertyArea);
  } catch (err) {
    console.log(`${err}`);
    res.status(500).json(err);
  }
  res.status(200).json(data);
});

router.post('/', async (req, res, next) => {
  let data = {};
  try {
    data = await manageProperty.getPropertySearch(
      req.body.searchId,
      req.body.propertyUrl,
      req.body.keywords
    );
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

router.post('/filtered/:performance?', async (req, res, next) => {
  let data = {};
  try {
    if (req.params.performance) {
      data = await manageProperty.getPropertyPerformance(
        req.body.term,
        req.body
      );
    } else {
      data = await manageProperty.getPropertyLinks(req.body.term, req.body);
    }
  } catch (err) {
    console.log(`${err}`);
    res.status(500).json(err);
  }
  res.status(200).json(data);
});

router.post('/count', async (req, res, next) => {
  let data = {};
  try {
    data = await manageProperty.getPropertyCount(
      req.body.term,
      req.body
    );
  } catch (err) {
    console.log(`${err}`);
    res.status(500).json(err);
  }
  res.status(200).json(data);
});

router.get('/term/:area', async (req, res, next) => {
  let data = {};
  try {
    data = await manageProperty.getAreaTerm(req.params.area);
  } catch (err) {
    console.log(`${err}`);
    res.status(500).json(err);
  }
  res.status(200).json(data);
});

exports.router = router;
