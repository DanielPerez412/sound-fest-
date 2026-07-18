const express = require('express');
const router = express.Router();
const etlDao = require('../dao/etl.dao');

router.post('/etl-process', etlDao.etlProcess);

module.exports = router;