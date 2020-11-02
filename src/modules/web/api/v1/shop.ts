import express = require('express');
import { skins_remove, skins_set } from '../../../../queries_types';
import { Logger } from '../../../../utils';
import { database } from '../../../../utils/database/database';
import Utils from '../../utils';
import * as fs from 'fs';
import serverdata from '../../../serverdata/serverdata';

const router = express.Router();
const utils = new Utils(router);
const logger: Logger = new Logger('v1 shop');

export default router;