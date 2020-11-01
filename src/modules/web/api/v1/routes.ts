import express = require('express');
import utils from '../../utils';
import auth from './auth';
import skins from './skins';

const router = express.Router();

//routes v1 api
router.use('/auth', auth);
router.use('/skins', skins);

export default router;