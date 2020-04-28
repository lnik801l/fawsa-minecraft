const express = require('express');
const router = express.Router();

router.use('/users', require('./users'));
router.use('/skins', require('./skins'));
router.use('/shops', require('./shops'));
router.use('/inventory', require('./inventory'));
router.use('/icons', require('./icons'));
router.use('/launcher', require('./launcher'));

module.exports = router;