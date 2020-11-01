import express = require('express');
import { skins_remove, skins_set } from '../../../../queries_types';
import { Logger } from '../../../../utils';
import { database } from '../../../../utils/database/database';
import Utils from '../../utils';

const router = express.Router();
const utils = new Utils(router);
const logger: Logger = new Logger('v1 skins');

utils.get('/get/:uuid.png', {},
    async (req, res) => {
        const skin = await database.getSkin(req.params.uuid);
        if (skin && skin.getSkin() != undefined && skin.getSkin().length > 1) {

            const img = Buffer.from(skin.getSkin(), 'base64');
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': img.length
            });
            res.end(img);
        } else {
            res.sendFile(`${process.cwd()}/defaults/skin.png`);
        }
    }
);

utils.post<skins_remove>('/remove', { auth: true, interfaceName: 'skins_remove' },
    async (res, data, user) => {
        const skin = await database.getSkin(user.uuid);
        if (skin == null) return res.json({ error: false, message: "операция прошла успешно!" });
        if (data.type == 'skin') {
            skin.removeSkin();
            await skin.save();
            return res.json({ error: false, message: "операция прошла успешно!" });
        }
        if (data.type == 'cloak') {
            skin.removeSkin();
            await skin.save();
            return res.json({ error: false, message: "операция прошла успешно!" });
        }
        return res.json({ error: true, message: 'unsupported operation (skins)!' });
    }
);

utils.post<skins_set>('/set', { auth: true, interfaceName: 'skins_set' },
    async (res, data, user) => {
        const skin = await database.getSkin(user.uuid);
        if (skin == null) {
            try {
                const newskin = await database.createSkin(user);
                await newskin.setData(data);
                await newskin.save();
                return res.json({ error: false, message: "ok" });
            } catch (err) {
                return res.status(500).json({ error: true, message: "произошла ошибка при обработке скина!" });
            }
        } else {
            try {
                await skin.setData(data);
                await skin.save();
                return res.json({ error: false, message: "ok" });
            } catch (err) {
                return res.json({ error: true, message: err });
            }
        }
    }
);

export default router;