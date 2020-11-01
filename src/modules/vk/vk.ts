import { VK as vkAPI } from 'vk-io';
import { projects } from '../../main';
import { database, Logger } from '../../utils';
import { Cfg } from '../../utils/Cfg';
import discord from '../discord/discord';
import * as express from 'express';
import { request } from 'request';
import { vk_cfg_schema } from '../../utils/cfg_projects_types';

interface local_cfg {
    app_id: string,
    app_key: string,
    max_messages_per_second: number
}

class VK {
    private static logger: Logger = new Logger('vk');
    private static config: Cfg = new Cfg('vk', {
        app_id: 'asd',
        app_key: 'asd1',
        max_messages_per_second: 5
    })

    private static groups: Map<number, vkAPI> = new Map();
    private static pendingMessages: Map<number, Array<() => void>> = new Map();
    private static ticker = setInterval(() => VK.tick(), 1000);

    constructor() {
        const data: Array<vk_cfg_schema> = new Array();
        for (const p in projects.params) {
            if (p != 'example') {
                data.push(projects.params[p].vk as vk_cfg_schema);
            }
        }
        data.forEach((v) => {
            const vk = new vkAPI({
                token: v.group_key,
                pollingGroupId: Math.abs(v.group_id),
                apiMode: 'parallel_selected'
            });
            VK.initFeatures(vk, v);
            VK.groups.set(v.group_id, vk);
            VK.pendingMessages.set(v.group_id, new Array());
            vk.updates.startPolling()
                .then(() => VK.logger.log(`опрос группы ${v.group_id} запущен`))
                .catch((err) => VK.logger.err(`запуск опроса группы ${v.group_id} завершился с ошибкой: ${err}`));
        });
    }

    private static tick() {
        VK.pendingMessages.forEach(async (arr, key) => {
            if (VK.groups.get(key).updates.isStarted)
                for (let i = 0; i < VK.config.params.max_messages_per_second; i++) {
                    try {
                        if (arr.length > 0) await arr[0]();
                    } catch (err) {
                        this.logger.err(err.stack);
                    } finally {
                        arr.shift();
                    }
                }
        })
    }

    public static sendMessage(p: { groupID: number, target: number, message: string, keyboard?: string }, cb?: (ok: boolean, status: number) => void) {
        VK.pendingMessages.get(p.groupID).push(async () => {
            const params = p;

            const rnd = Math.floor(Math.random() * Math.floor(999999));
            const res = await VK.groups.get(params.groupID).api.messages.send({
                peer_id: params.target,
                message: params.message,
                keyboard: params.keyboard,
                random_id: rnd
            });
            if (cb) cb(res != null, res);

        })
    }

    private static initFeatures(instance: vkAPI, cfg: vk_cfg_schema) {
        if (cfg.news_to_discord)
            VK.newsToDiscord(instance, cfg);
        if (cfg.bot)
            VK.bot(instance, cfg);
    }

    private static newsToDiscord(i: vkAPI, cfg: vk_cfg_schema) {
        i.updates.on('wall_post_new', async (next) => {

            const author = await i.api.users.get({
                user_ids: next.wall.createdUserId.toString(),
                fields: ["photo_200"]
            });

            const link = cfg.url + "?w=wall" + next.wall.authorId + "_" + next.wall.id;

            discord.postVkToDiscord(cfg.news_discord_channel_id, { link, author, text: next.wall.text, attachments: next.wall.attachments });

        });
    }

    private static bot(_i: vkAPI, _cfg: vk_cfg_schema) {
    }

    public static authUser(req: express.Request, res: express.Response): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const cfg: local_cfg = this.config.params as local_cfg;

            if (!req.query.code) {
                res.json({
                    error: true,
                    message: "no code"
                });
                resolve();
            }
            request({
                method: 'GET',
                url: 'https://oauth.vk.com/access_token?client_id=' + cfg.app_id + '&client_secret=' + cfg.app_key + '&redirect_uri=' + (projects[req.query.p as string].vk as vk_cfg_schema).login_redirect_uri + '&code=' + req.query.code,
            }, async function (error, response, body) {
                if (error) {
                    res.json({
                        error: true,
                        message: error
                    });
                    resolve();
                }
                if (!error && response.statusCode == 200) {

                    var parsed = JSON.parse(body);

                    const user = await database.getUser_vk(parsed.user_id);

                    if (!user) {
                        res.json({
                            error: true,
                            message: "user with that vk user not found!"
                        })
                        resolve();
                    }


                    if (user) {
                        if (user.status != 'activated') {
                            res.json({ error: true, message: "account is not activated!" });
                            resolve();
                        } else res.json({ error: false, user: await user.toAuthJSON() });
                        resolve();
                    }

                } else {
                    reject(new Logger('vk auth').err(response.body));
                }
            });
        });
    }

}
export default VK;