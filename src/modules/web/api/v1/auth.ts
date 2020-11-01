import express = require('express');
import Utils from '../../utils';
import { auth_get, auth_register } from '../../../../queries_types';
import { Logger, database } from '../../../../utils';
import VK from '../../../vk/vk';

const router = express.Router();
const utils = new Utils(router);
const logger: Logger = new Logger('v1 auth');

utils.get('/refresh', { captcha: false, auth: true },
    async (_req, res) => {
        res.send({ message: 'test suka1' });
    }
);

utils.post<auth_get>('/login', { captcha: false, auth: false, interfaceName: 'auth_get' },
    async (res, data) => {
        const u = await database.getUser(data.username);
        if (!u || !u.validatePassword(data.password)) return res.json({ error: true, message: 'неверное имя пользователя или пароль' });
        return res.json(await u.toAuthJSON());

    }
);

utils.get('/current', { auth: true },
    async (_req, res, user) => {
        res.json(await user.toAuthJSON());
    }
);

utils.post<auth_register>('/register', { captcha: false, auth: false, interfaceName: 'auth_register' },
    async (res, data) => {
        try {
            res.json((await database.createUser(data.username, data.password, data.email, data.refer)).toAuthJSONreg());
        } catch (err) {
            res.json({ err: true, message: err });
        }
    }
);

utils.get('/:p/vk', { projectCheck: true }, (req, res) => VK.authUser(req, res));

export default router;