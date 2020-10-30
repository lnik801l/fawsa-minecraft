import { Document, Schema } from 'mongoose';
import { ObjectID } from 'mongodb';
import { prop } from '@typegoose/typegoose';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { Auth } from '../../Auth';

export const userSchema: Schema = new Schema({
    username: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['activated', 'non_activated', 'banned'],
        default: 'non_activated'
    },
    is_gadmin: {
        type: Boolean,
        default: false
    },
    refer: {
        type: String,
        default: null
    },
    vk_id: {
        type: String,
        default: null
    },
    discord_id: {
        type: String,
        default: null
    },
    email: {
        type: String,
        required: true
    },
    uuid: {
        type: String,
        required: true
    },
    reg_date: {
        type: Date,
        required: true
    },
    notify_method: {
        type: String,
        enum: ['vk', 'discord', 'email'],
        default: 'email'
    },
    hash: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    }
});

export class User {

    _id: ObjectID

    @prop()
    username: string;

    @prop()
    status: 'activated' | 'non_activated' | 'banned';

    @prop()
    is_gadmin: boolean;

    @prop()
    refer?: string;

    @prop()
    vk_id: string;

    @prop()
    discord_id: string;

    @prop()
    email: string;

    @prop()
    uuid: string;

    @prop()
    reg_date: Date;

    @prop()
    notify_method: 'vk' | 'discord' | 'email';

    @prop()
    hash: string;

    @prop()
    salt: string;

    public construct(username: string, password: string, email: string, refer?: string): User {
        if (this.username != null)
            throw new Error('user is already constructed!');
        this.username = username;
        this.email = email;
        this.setPassword(password);
        this.status = "non_activated";
        this.refer = refer;
        this.generateUUID();
        this.notify_method = "email";
        this.is_gadmin = false;
        this.reg_date = new Date();
        return this;
    }

    public setPassword(password: string) {
        this.salt = crypto.randomBytes(16).toString('hex');
        this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    };

    public validatePassword(password: string) {
        const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
        return this.hash === hash;
    };

    public generateUUID() {
        if (this.uuid != null)
            throw new Error('user uuid is already constructed!');
        var uuid = uuidv4();
        return this.uuid = uuid;
    };

    public async toAuthJSON() {
        return {
            email: this.email,
            username: this.username,
            uuid: this.uuid,
            status: this.status,
            reg_date: this.reg_date,
            notify_method: this.notify_method,
            token: await Auth.generateAccessToken({ username: this.username, salt: this.salt })
        };
    };

    public toAuthJSONreg() {
        return {
            email: this.email,
            username: this.username,
            uuid: this.uuid,
            status: this.status,
        };
    };
}