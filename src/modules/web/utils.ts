import express = require('express');
import { CastError, safeCast } from 'safe-cast';
import { Captcha, Auth } from '../../utils';
import { database } from '../../utils/database/database';
import User from '../../utils/database/models/Users';
import Web from './web';
import { projects } from '../../main';
import { cfg_projects_schema } from '../../utils/cfg_projects_types';

class utils {
    private router: express.Router;

    private static cors: Array<string>;

    constructor(router: express.Router) {
        if (utils.cors == undefined) {
            utils.cors = Web.config.params.allowed_cors as Array<string>;
        }
        this.router = router;
    }

    private static checkProject(p: string): boolean {
        const pr = projects.params as cfg_projects_schema;

        for (const param in pr)
            if (param != 'example' && param == p)
                return true;

        return false;
    }

    private static checkServer(p: string, srv: string): boolean {
        const pr = projects.params as cfg_projects_schema;
        for (const s in pr[p].servers)
            if (s == srv) return true;
        return false;
    }

    private static async auth(req: express.Request, res: express.Response): Promise<User | null> {
        const token = req.headers.token;
        if (!token) {
            res.status(401).json({ error: true, message: 'токен не может быть пустым!' });
            return null;
        }
        try {
            return await database.getUserAuth(await Auth.validateToken(token as string));
        } catch (err) {
            res.status(401).json({ error: true, message: 'токен недействителен.' });
            return null;
        }
    };

    public get(path: string, params: { captcha?: boolean, auth?: boolean, projectCheck?: boolean, serverCheck?: boolean }, callback: (req: express.Request, res: express.Response, user: User) => void) {
        this.router.get(path, async function (req, res) {

            let user: User = null;

            const origin = req.headers.origin as string;
            if (utils.cors.indexOf(origin) > -1) {
                res.setHeader('Access-Control-Allow-Origin', origin);
            }

            if (params.projectCheck && params.projectCheck == true) {
                if (!utils.checkProject(req.params.p as string))
                    return res.status(400).json({ error: true, message: 'проект не существует!' });
            }

            if (params.serverCheck && params.serverCheck == true) {
                if (!utils.checkServer(req.params.p as string, req.params.s as string))
                    return res.status(400).json({ error: true, message: 'сервер не существует!' });
            }

            if (params.auth && params.auth == true) {
                const a = await utils.auth(req, res);
                if (a == null) return;
                else user = a;
            }

            if (params.captcha && params.captcha == true) {
                if (!req.body.captcha) return res.status(400).send({ error: true, message: "captcha not provided!" });
                return Captcha.validate(req.body.captcha).then((data) => {
                    if (data.err) return res.send(data);
                    return callback(req, res, user);
                });
            }
            callback(req, res, user);
        });
    }

    public post<T>(path: string, params: { captcha?: boolean, auth?: boolean, interfaceName: string, projectCheck?: boolean, serverCheck?: boolean },
        callback: (res: express.Response, data: T, user?: User) => void) {

        this.router.post(path, async function (req, res) {

            const test = safeCast<T>(params.interfaceName, ['./src/queries_types.ts'], req.body);
            let user: User = null;

            const origin = req.headers.origin as string;
            if (utils.cors.indexOf(origin) > -1) {
                res.setHeader('Access-Control-Allow-Origin', origin);
            }

            if (test instanceof CastError)
                return res.status(400).json({ error: true, message: 'невалидные входящие данные!' });

            if (params.projectCheck && params.projectCheck == true) {
                if (this.projects.find((v) => { return v == req.params.p }) == undefined)
                    return res.status(400).json({ error: true, message: 'проект не существует!' });
            }

            if (params.serverCheck && params.serverCheck == true) {
                if (utils.checkServer(req.params.p as string, req.params.s as string))
                    return res.status(400).json({ error: true, message: 'сервер не существует!' });
            }

            if (params.auth && params.auth == true) {
                const a = await utils.auth(req, res);
                if (a == null) return;
                else user = a;
            }

            if (params.captcha && params.captcha == true) {
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