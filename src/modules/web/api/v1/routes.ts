import express = require('express');
import auth from './auth/routes'

const router = express.Router();
//routes v1 api
router.use('/auth', auth);

export default router;