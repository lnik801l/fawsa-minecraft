import discord from './modules/discord/discord';
import serverdata from './modules/serverdata/serverdata';
import vk from './modules/vk/vk';
import web from './modules/web/web';
import { database } from './utils';
import { Cfg } from './utils/Cfg';

export const main_config = new Cfg('main', {
  debug: true
});

export const projects = new Cfg('projects', {
  example: {
    url: "https://example.com",
    vk: {
      url: "https://vk.com/example",
      group_key: "string",
      group_id: 0,
      group_admins: ["example"],
      news_to_discord: false,
      bot: false,
      login_redirect_uri: "https://example.com/auth/:projectname:/vk",
      link_redirect_uri: "https://example.com/auth/:projectname:/link/vk",
      news_discord_channel_id: "0"
    },
    discord: {
      url: "https://discord.gg/example",
      guild_id: "0"
    },
    rewards_params: {
      mctop_secret: '',
      topcraft_secret: '',
      fairtop_secret: ''
    },
    servers: {
      example: {
        offer_server_url: "http://localhost:8088",
        host: 'localhost',
        port: 25565
      }
    }
  }
});

new web(5000);
new database();
new discord();
new vk();
new serverdata();