module.exports = {
    init: function (project) {
        if (project && project.settings.mail.vk_url && project.settings.vk_group_id && project.settings.mail.vk_group_key && project.settings.dc_guild_id && project.settings.dc_news_channel_id) {

            const cfg = require('../config/constants');
            const { Keyboard, VK, Request, collect } = require('vk-io');
            const fs = require("fs");
            const Discord = require('discord.js');

            var p_group_id = Math.abs(Number.parseInt(project.settings.vk_group_id));

            //var canvas = require("../canvas/canvas");

            const client = new Discord.Client();
            const vk = new VK({
                token: project.settings.mail.vk_group_key,
                pollingGroupId: p_group_id,
                apiMode: 'parallel_selected',
                webhookPath: '/webhook/secret-path'
            });
            const { updates, upload } = vk;


            function include(dir) {
                eval(fs.readFileSync(dir) + '');
            }

            /*
            setInterval(function () {
        
                if (isDebug) {
                    var date = new Date();
                    var time = date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
                    console.log("[" + time + "]" + "[vk][updatecover] = update");
                }
        
                canvas.init();
                upload.groupCover({ 
                    source: cfg.dir + '/modules/canvas/out.png',
                    group_id: 143258276,
                    crop_x: 0,
                    crop_x2:1590,
                    crop_y:0,
                    crop_y2:400
                }).catch(console.error);
        
            }, 60000
            );*/


            // Skip outbox message and handle errors
            updates.use(async (context, next) => {
                if (context.type === 'message' && context.isOutbox) {
                    return;
                }

                try {
                    await next();
                } catch (error) {
                    console.error('Error:', error);
                }
            });

            include(cfg.appDir + "/modules/vk/keyboard.js");

            updates.hear(['/time', '/date'], async (context) => {
                await context.send(String(new Date()));
            });

            updates.hear(/^\/reverse (.+)/i, async (context) => {
                const text = context.$match[1];

                const reversed = text.split('').reverse().join('');

                await context.send(reversed);
            });

            client.login(cfg.discord_bot_token);

            updates.on('new_wall_post', async (next) => {

                //console.log("текст поста: " + next.wall.text);
                //console.log('id автора поста:', next.wall.createdUserId);


                author = await vk.api.users.get({
                    user_ids: next.wall.createdUserId,
                    fields: "photo_200"
                });
                //console.log(author);
                console.log("имя и фамилия автора поста: " + author[0].first_name + " " + author[0].last_name);
                //console.log("ссылка на аву автора: " + author[0].photo_200);

                var postlink = project.settings.mail.vk_url + "?w=wall" + next.wall.authorId + "_" + next.wall.id;

                if ((next.wall.text != null) && (next.wall.attachments.length == 0)) {
                    console.log("attachments = false && text = true");

                    var embed = new Discord.MessageEmbed()
                        .setColor("#006182")
                        .setTimestamp()
                        .setAuthor(author[0].first_name + " " + author[0].last_name, author[0].photo_200)
                        .setTitle("**Посмотреть пост в группе вк**")
                        .setURL(postlink)
                        .addField("Содержание поста:", "**" + next.wall.text + "**")
                        .setFooter("Данная новость была автоматически сгенерирована на основе поста с группы ВКонтакте. \n© l_nik801_l")

                    client.guilds.cache.get(project.settings.dc_guild_id).channels.cache.get(project.settings.dc_news_channel_id).send("@everyone", embed);
                }

                if ((next.wall.attachments.length != 0) && (next.wall.text != null)) {
                    console.log("attachments = true && text = true");

                    var embed = new Discord.MessageEmbed()
                        .setColor("#006182")
                        .setTimestamp()
                        .setAuthor(author[0].first_name + " " + author[0].last_name, author[0].photo_200)
                        .setTitle("**Посмотреть пост в группе вк**")
                        .setURL(postlink)
                        .addField("Содержание поста:", "**" + next.wall.text + "**")
                        .setImage(next.wall.attachments[0].largePhoto)
                        .setFooter("Данная новость была автоматически сгенерирована на основе поста с группы ВКонтакте. \n© l_nik801_l")

                    client.guilds.cache.get(project.settings.dc_guild_id).channels.cache.get(project.settings.dc_news_channel_id).send("@everyone", embed);
                }

                if ((next.wall.attachments.length != 0) && (next.wall.text == null)) {
                    console.log("attachments = true && text = false");

                    var embed = new Discord.MessageEmbed()
                        .setColor("#006182")
                        .setTimestamp()
                        .setAuthor(author[0].first_name + " " + author[0].last_name, author[0].photo_200)
                        .setTitle("**Посмотреть пост в группе вк**")
                        .setURL(postlink)
                        .addField("Содержание поста: фото")
                        .setImage(next.wall.attachments[0].largePhoto)
                        .setFooter("Данная новость была автоматически сгенерирована на основе поста с группы ВКонтакте. \n© l_nik801_l")

                    client.guilds.cache.get(project.settings.dc_guild_id).channels.cache.get(project.settings.dc_news_channel_id).send("@everyone", embed);

                }


            });


            async function run() {
                if (process.env.UPDATES === 'webhook') {
                    await vk.updates.startWebhook();

                    console.log('vk Webhook server started');
                } else {
                    await vk.updates.startPolling();

                    console.log('vk Polling started');

                }
            }


            run().catch(console.error);

        } else {
            console.log("project " + project.settings.mail.site_url + " have broken vk cfg!")
        }
    }


}