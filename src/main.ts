import { VK } from 'vk-io';
import discord from './modules/discord/discord';
import vk from './modules/vk/vk';
import web from './modules/web/web';
import database from './utils/database/database';
import Logger from "./utils/Logger";

const logger: Logger = new Logger('main');

logger.warn("launch...");
new web(5000);
new database();
new discord();
new vk();

/*
Auth.generateAccessToken('testUSername', 'asdasdads', (token) => {
  log.log(token);
  Auth.validateToken(token, (decoded) => {
    log.log(decoded);
  });
});
*/



