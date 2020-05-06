const express = require('express');
const router = express.Router();

router.use('/users', require('./users'));
router.use('/skins', require('./skins'));
router.use('/shops', require('./shops'));
router.use('/inventory', require('./inventory'));
router.use('/icons', require('./icons'));
router.use('/launcher', require('./launcher'));
router.use('/rewards', require('./rewards'));
router.use('/bonuscodes', require('./bonuscodes'));
router.use('/news', require('./news'));

module.exports = router;