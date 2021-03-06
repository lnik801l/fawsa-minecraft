import mongoose = require('mongoose');
import User from './models/Users';
import { Cfg } from '../Cfg';
import { Logger } from '../Logger';
import { DocumentType, getModelForClass } from '@typegoose/typegoose';
import { token_data } from '../Auth';
import Skins from './models/Skins';

class database {
    private static mongo = mongoose;
    private static logger: Logger = new Logger('database');
    private static config: Cfg = new Cfg('database', {
        db_name: 'main',
        db_host: 'localhost',
        db_port: 27017,
        username: 'admin',
        password: 'admin',
        auth_database: 'admin',
    });

    private static users = getModelForClass(User);
    private static skins = getModelForClass(Skins);

    constructor() {
        this.connect();
    }

    private async connect() {
        try {
            database.mongo = await database.mongo.connect(`mongodb://${database.config.params.username}:${database.config.params.password}@${database.config.params.db_host}:${database.config.params.db_port}/${database.config.params.db_name}?authSource=${database.config.params.auth_database}`, { useNewUrlParser: true, useUnifiedTopology: true });
            database.logger.log('успешное подключение к базе данных!');
        } catch (err) {
            database.logger.err("произошла ошибка при подключении к базе данных! " + err);
        }
    }

    public static async getUser(username: string): Promise<User> {
        return await this.users.findOne({ username }).exec();
    }

    public static async getUserAuth(data: token_data): Promise<User> {
        return new Promise<User>(async (resolve, reject) => {
            try {
                return resolve(await this.users.findOne({ username: data.username }).exec());
            } catch (err) {
                return reject(err);
            }
        });
    }

    public static async createUser(
        username: string,
        password: string,
        email: string,
        refer?: string
    ): Promise<User> {
        return new Promise<User>(async (resolve, reject) => {
            const target = await this.users.findOne({ $or: [{ username }, { email }] });
            if (target) return reject('пользователь с таким именем пользователя или email уже существует!');
            const u = new this.users();
            u.construct(username, password, email, refer);
            u.save().then((d) => {
                return resolve(d as unknown as User);
            });
        });
    }

    public static async getSkin(uuid: string): Promise<DocumentType<Skins>> {
        return database.skins.findOne({ linked_uuid: uuid }).exec();
    }

    public static async getUser_vk(id: string): Promise<DocumentType<User>> {
        return database.users.findOne({ vk_id: id }).exec();
    }

    public static async createSkin(user: User): Promise<DocumentType<Skins>> {
        return new Promise<DocumentType<Skins>>(async (resolve, reject) => {
            const res = await database.skins.findOne({ linked_uuid: user.uuid });
            if (res) return reject('skins для этого юзера уже существует!');
            const skin = new this.skins();
            skin.construct(user.uuid);
            skin.save().then((d) => resolve(d));
        });
    }

}

export { database };