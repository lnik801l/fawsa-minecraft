import * as mongoose from 'mongoose';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

const { Schema } = mongoose;

const schema = new Schema();

class UserSchema extends mongoose.Document {
    username: string;
    status: "activated" | "non_activated" | "banned";
    is_gadmin: boolean;
    refer?: string;
    vk_id: string;
    discord_id: string;
    email: string;
    uuid: string;
    reg_date: Date;
    notify_method: "vk" | "discord" | "email";
    hash: string;
    salt: string;

    public constructor(username: string, password: string, email: string, refer?: string) {
        super();
        this.username = username;
        this.email = email;
        this.setPassword(password);
        this.status = "non_activated";
        this.refer = refer;
        this.generateUUID();
        this.notify_method = "email";
        this.is_gadmin = false;
        this.reg_date = new Date();
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
        var uuid = uuidv4();
        return this.uuid = uuid;
    };

    public toAuthJSON() {
        return {
            _id: this._id,
            email: this.email,
            username: this.username,
            uuid: this.uuid,
            status: this.status,
            reg_date: this.reg_date,
            notify_method: this.notify_method,
        };
    };

    public toAuthJSONreg() {
        return {
            _id: this._id,
            email: this.email,
            username: this.username,
            uuid: this.uuid
        };
    };
}

export default UserSchema;