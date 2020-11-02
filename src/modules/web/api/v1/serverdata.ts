import express = require('express');
import { Logger } from '../../../../utils';
import Utils from '../../utils';
import serverdata from '../../../serverdata/serverdata';

const router = express.Router();
const utils = new Utils(router);
const logger: Logger = new Logger('v1 serverdata');

utils.get('/:p/:s/status', { projectCheck: true, serverCheck: true }, (req, res) => {
    const data = serverdata.data[req.params.p as string][req.params.s as string];
    delete data.offers;
    delete data.offers_error;
    delete data.pending;
    return res.json(data);
});

utils.get('/:p/:s/offers', { projectCheck: true, serverCheck: true }, (req, res) => {
    return res.json({
        offers: serverdata.data[req.params.p as string][req.params.s as string].offers,
        offers_error: serverdata.data[req.params.p as string][req.params.s as string].offers_error
    });
});

export default router;