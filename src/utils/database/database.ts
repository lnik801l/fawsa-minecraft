import mongoose = require('mongoose');
import usershema from './schemas/Users';
import { Cfg } from '../Cfg';
import Logger from '../Logger';

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

    //private static users = database.mongo.model('users', usershema);

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

    /*

    public static async getUser(username: string): Promise<usershema> {
        return await this.users.findOne({ username }).exec() as usershema;
    }

    public static async createUser(
        username: string,
        password: string,
        email: string,
        refer?: string
    ) {
        const target = await this.users.findOne({ $or: [{ username }, { email }] });
        if (target)
            throw 'пользователь с таким именем пользователя или паролем уже существует!';
        return (await new UserSchema(username, password, email, refer).save()).execPopulate();
    }
    */


}

export default database;