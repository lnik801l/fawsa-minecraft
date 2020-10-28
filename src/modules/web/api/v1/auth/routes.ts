import express = require('express');
import Utils from '../../../utils';
import db from '../../../../../utils/database/database';
import Logger from '../../../../../utils/Logger';

const router = express.Router();
const utils = new Utils(router);
const logger: Logger = new Logger('v1 auth');

utils.get('/refresh', { captcha: false }, (_req, res) => {
    res.send({ message: 'test suka1' });
});

utils.post('/get', { captcha: false, auth: false }, (_req, res) => {
    res.send({ message: 'test suka2' });
});

utils.post('/register', { captcha: false, auth: false }, (_req, res, data) => {
    logger.log(data);
    res.send(data);
    //db.getUser();
});

export default router;