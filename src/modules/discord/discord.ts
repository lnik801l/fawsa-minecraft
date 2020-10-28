import * as disAPI from 'discord.js';
import { Attachment, ExternalAttachment, Responses } from 'vk-io';
import { Cfg } from '../../utils/Cfg';
import Logger from '../../utils/Logger';

class discord {

    private static logger: Logger = new Logger('discord');
    private static client: disAPI.Client = new disAPI.Client();
    private static config: Cfg = new Cfg('discord', {
        token: 'asdasdasd',
        admins: []
    });
    private static commands: Map<{
        cmd: string,
        admin: boolean,
        desc?: string
    },
        (msg: disAPI.Message, args: Array<string>, isAdmin: boolean) => void> = new Map();

    constructor() {
        this.init();
        this.registerCommands();
    }

    private async init() {
        try {
            await discord.client.login(discord.config.params.token);
            discord.logger.log('подключение к discord прошло успешно!');
        } catch (err) {
            discord.logger.err('произошла ошибка при подключении к discord! ' + err);
        }
        discord.client.on('message', async (msg) => {
            const args = msg.content.split(' ');
            if (args.length >= 2 && args[0] == '!up') {

                discord.commands.forEach((cb, params) => {
                    if (args[1] == params.cmd) {
                        args.shift();
                        args.shift();
                        const isAdmin = discord.config.params.admins.some((v) => { if (v == msg.author.id) return true; else return false; });
                        if (params.admin) {
                            if (isAdmin) {
                                return cb(msg, args, isAdmin);
                            } else {
                                return msg.reply('эта команда предназначена только для администрации.');
                            }
                        } else {
                            return cb(msg, args, isAdmin);
                        }
                    }
                })
            }
        });
    }

    private async registerCommands() {

        discord.addCommand('help', false, (msg, _args, isAdmin) => {
            const embed = new disAPI.MessageEmbed();
            embed.setColor('#18a5f5').setTitle('Список доступных команд');
            discord.commands.forEach((_v, data) => {
                if (isAdmin) embed.fields.push({
                    name: '!up ' + data.cmd + (data.admin == true ? ' (только для админов)' : ''),
                    value: 'описание: ' + (data.desc == null ? 'отсутствует.' : data.desc),
                    inline: false
                });
                else if (!data.admin) embed.fields.push({
                    name: '!up ' + data.cmd,
                    value: 'описание: ' + (data.desc == null ? 'отсутствует.' : data.desc),
                    inline: false
                });
            });
            msg.channel.send(embed);
        }, "вывод списка доступных команд");
        discord.addCommand('clear', true, async (msg, args) => {
            if (args.length == 1) {
                const num = Number.parseInt(args[0]) + 1;
                if (typeof num == "number") {
                    const msgs = await msg.channel.messages.fetch({ limit: 41 });
                    msgs.sort(function (x, y) {
                        return x.createdTimestamp - y.createdTimestamp;
                    });
                    for (let i = 0; i < num; i++) {
                        msg.channel.messages.delete(msgs.last(), 'админская команда удаления сообщений');
                        msgs.delete(msgs.lastKey());
                    }
                } else {
                    msg.reply('параметр ' + args[0] + ' должен быть числом!');
                }
            } else {
                msg.reply('команда должна иметь 1 аргумент!');
            }

        }, "удаление последних X сообщений в канале");
    }

    public static addCommand(cmd: string, admin: boolean, cb: (msg: disAPI.Message, args: Array<string>, isAdmin: boolean) => void, desc?: string) {
        discord.commands.set({ cmd, admin, desc }, cb);
    }

    public static async postVkToDiscord(channelID: string, p: {
        link: string,
        author: Responses.UsersGetResponse,
        text?: string,
        attachments?: (Attachment | ExternalAttachment)[]
    }) {
        const embed = new disAPI.MessageEmbed().setColor("#006182")
            .setTimestamp()
            .setAuthor(p.author[0].first_name + " " + p.author[0].last_name, p.author[0].photo_200)
            .setTitle("**Посмотреть пост в группе вк**")
            .setURL(p.link)
            .addField(`Содержание поста:`, `** ${p.text == null ? 'изображение' : p.text} **`)
            .setFooter("Данная новость была автоматически сгенерирована на основе поста с группы ВКонтакте. \n© uprojects.su");
        if (p.attachments != null && p.attachments.length > 0) {
            embed.setImage((p.attachments[0] as any).largeSizeUrl);
        }

        discord.sendMessage(channelID, embed);
    }

    public static async sendMessage(channelID: string, msg: disAPI.MessageEmbed | string) {
        const ch = await discord.client.channels.fetch(channelID);
        if (ch.type == 'text') {
            (ch as disAPI.TextChannel).send(msg);
        } else throw new Error(`канал с ID: ${channelID} не текстовый!`);
    }
}

export default discord;