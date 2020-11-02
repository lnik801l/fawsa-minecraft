import express = require('express');
import auth from './auth';
import skins from './skins';
import shop from './shop';
import serverdata from './serverdata';

const router = express.Router();

//routes v1 api
router.use('/auth', auth);
router.use('/skins', skins);
router.use('/shop', shop);
router.use('/serverdata', serverdata);

export default router;