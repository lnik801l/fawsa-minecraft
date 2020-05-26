const Discord = require('discord.js');
const mongoose = require('mongoose');
const Users = mongoose.model('Users');

const cfg = require('./config/constants');

let clients = {};
let rolecache = {};

module.exports.init = function(token, project) {
    let client = new Discord.Client();
    client.on('ready', () => {
        console.log(`[Discord] Logged in as ${client.user.tag}!`);
        client.guilds.cache.map(guild => {
            let flag = false;
            for (p in cfg.projects) {
                if (cfg.projects[p].settings.dc_guild_id == guild.id)
                    flag = true;
            }
            if (!flag)
                return;

            guild.fetch().then(g => {
                let flag = false;
                for (p in cfg.projects) {
                    if (cfg.projects[p].settings.dc_guild_id == g.id)
                        flag = true;
                }
                if (!flag)
                    return;

                g.roles.fetch().then(rm => {
                    rm.cache.array().forEach(role => {
                        console.log(project);
                        rolecache[project] = {};
                        rolecache[project][role.name] = role.id;
                    })
                    if (!rm.cache.array().some(r => { return r.name.includes("Verified ✔️") }))
                        rm.create({
                            data: {
                                name: "Verified ✔️",
                                color: "#3cd660",
                                permissions: []
                            },
                            reason: `группа для "верифицированных" игроков`
                        });
                });

            }).then(() => {
                guild.fetch().then(g => {
                    validateUsers(g, project);
                });
            })
        })
    });
    client.on('guildMemberAdd', (member) => {
        let flag = false;
        for (p in cfg.projects) {
            if (cfg.projects[p].settings.dc_guild_id == member.guild.id)
                flag = true;
        }
        if (!flag)
            return;

        Users.findOne({ discord_id: member.user.id }, function(err, doc) {
            if (err)
                console.log(err);
            if (doc)
                if (doc.discord_id == member.user.id && !member.roles.cache.some(r => { return r.name.includes("Verified ✔️") })) {
                    member.roles.add(rolecache[project]["Verified ✔️"]);
                    member.setNickname(doc.username);
                }

        })
    });
    client.on("message", (message) => {
        let flag = false;
        for (p in cfg.projects) {
            if (cfg.projects[p].settings.dc_guild_id == message.guild.id)
                flag = true;
        }
        if (!flag)
            return;

        if (message.content == "ping") {
            message.channel.send("pong!");
        }
    });
    client.login(token);
}
module.exports.instance = function(project) {
    if (clients[project])
        return clients[project];
    else
        return null;
};

function validateUsers(Guild, project) {
    Users.find(function(err, docs) {
        if (err)
            return console.log(err);
        if (docs)
            Guild.members.cache.array().forEach(member => {
                docs.forEach(doc => {
                    if (doc.discord_id == member.user.id && !member.roles.cache.some(r => { return r.name.includes("Verified ✔️") })) {
                        member.roles.add(rolecache[project]["Verified ✔️"]);
                        member.setNickname(doc.username);
                    }
                });
            });
    })
}