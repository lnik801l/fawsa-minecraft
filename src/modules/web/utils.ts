import express = require('express');
import Captcha from '../../utils/Captcha';

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

    public post(path: string, params: { captcha: boolean, auth: boolean },
        callback: (req: express.Request, res: express.Response, data: object) => void) {
        this.router.post(path, async function (req, res) {
            if (params.captcha) {
                if (!req.body.captcha)
                    return res.status(400).send({ error: true, message: "captcha not provided!" });
                return Captcha.validate(req.body.captcha).then((data) => {
                    if (data.err) return res.send(data);
                    return callback(req, res, req.body);
                });
            }
            return callback(req, res, req.body);
        });
    }
}
export default utils;