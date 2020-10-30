import express = require('express');
import { CastError, safeCast } from 'safe-cast';
import { Captcha, Auth } from '../../utils';
import { token_data } from '../../utils/Auth';
import { database } from '../../utils/database/database';
import { User } from '../../utils/database/schemas/Users';

class utils {
    private router: express.Router;

    constructor(router: express.Router) {
        this.router = router;
    }

    public get(path: string, params: { captcha: boolean }, callback: (req: express.Request, res: express.Response) => void) {
        this.router.get(path, async function (req, res) {
            if (params.captcha) {
                if (!req.body.captcha) return res.status(400).send({ error: true, message: "captcha not provided!" });
                return Captcha.validate(req.body.captcha).then((data) => {
                    if (data.err) return res.send(data);
                    return callback(req, res);
                });
            }
            callback(req, res);
        });
    }

    public post<T>(path: string, params: { captcha: boolean, auth: boolean, interfaceName: string },
        callback: (res: express.Response, data: T, user?: User) => void) {

        this.router.post(path, async function (req, res) {

            const test = safeCast<T>(params.interfaceName, ['./src/queries_types.ts'], req.body);
            let user: User = null;

            if (test instanceof CastError)
                return res.status(400).json({ error: true, message: 'невалидные входящие данные!' });

            if (params.auth) {
                const token = req.headers.token;
                if (!token) return res.status(401).json({ error: true, message: 'токен не может быть пустым!' });
                try {
                    user = await database.getUserAuth(await Auth.validateToken(token as string));
                } catch (err) {
                    return res.status(401).json({ error: true, message: err });
                }
            }

            if (params.captcha) {
                if (!req.body.captcha)
                    return res.status(400).send({ error: true, message: "captcha not provided!" });
                return Captcha.validate(req.body.captcha).then((data) => {
                    if (data.err) return res.send(data);
                    return callback(res, test, user);
                });
            }
            return callback(res, test, user);
        });
    }
}
export default utils;