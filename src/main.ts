import discord from './modules/discord/discord';
import vk from './modules/vk/vk';
import web from './modules/web/web';
import { database } from './utils';
import { Cfg } from './utils/Cfg';

new web(5000);
new database();
new discord();
new vk();

const cfg = new Cfg('main', {
  debug: true
});

export { cfg as main_config };