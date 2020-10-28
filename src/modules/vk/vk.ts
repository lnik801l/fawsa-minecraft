import { VK as vkAPI, API, Responses } from 'vk-io';
import { Cfg } from '../../utils/Cfg';
import Logger from '../../utils/Logger';
import discord from '../discord/discord';

interface cfg_schema {
    news_discord_channel_id: string,
    group_url: string,
    token: string,
    group_id: number,
    news_to_discord: boolean,
    bot: boolean
}

class VK {
    private static logger: Logger = new Logger('vk');
    private static config: Cfg = new Cfg('vk', {
        groups: [
            {
                token: 'example',
                group_id: 0,
                group_url: 'https://vk.com/example',
                news_to_discord: false,
                bot: false,
                news_discord_channel_id: 'example'
            }
        ]
    })

    private static groups: Map<number, vkAPI> = new Map();
    constructor() {
        const data = VK.config.params.groups as Array<cfg_schema>;
        data.forEach((v) => {
            if (v.token != 'example') {
                const vk = new vkAPI({
                    token: v.token,
                    pollingGroupId: Math.abs(v.group_id),
                    apiMode: 'parallel_selected'
                });
                VK.initFeatures(vk, v);
                VK.groups.set(v.group_id, vk);
                vk.updates.startPolling()
                    .then(() => VK.logger.log(`опрос группы ${v.group_id} запущен`))
                    .catch((err) => VK.logger.err(`запуск опроса группы ${v.group_id} завершился с ошибкой: ${err}`));
            }
        });
    }

    private static initFeatures(instance: vkAPI, cfg: cfg_schema) {
        if (cfg.news_to_discord)
            VK.newsToDiscord(instance, cfg);
        if (cfg.bot)
            //TODO: make it functional
            return;
    }

    private static newsToDiscord(i: vkAPI, cfg: cfg_schema) {
        i.updates.on('wall_post_new', async (next) => {

            const author = await i.api.users.get({
                user_ids: next.wall.createdUserId.toString(),
                fields: ["photo_200"]
            });

            const link = cfg.group_url + "?w=wall" + next.wall.authorId + "_" + next.wall.id;

            discord.postVkToDiscord(cfg.news_discord_channel_id, { link, author, text: next.wall.text, attachments: next.wall.attachments });

        });
    }

}
export default VK;