import web from '../web';
import router_V1 from './v1/routes';
import router_V2 from './v2/routes';
import express = require('express');

const router = express.Router();

if (web.config.params.enableV1) router.use('/v1', router_V1);
if (web.config.params.enableV2) router.use('/v2', router_V2);

export default router;