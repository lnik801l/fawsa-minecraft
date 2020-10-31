import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import { Cfg } from './Cfg';
import { generateKeyPair, publicEncrypt, privateDecrypt } from 'crypto';
import { Logger } from './Logger';
import { main_config } from '../main';

interface token_data {
    username: string,
    salt: string,
    iat?: number,
    exp?: number
}

class Auth {

    private static config: Cfg = new Cfg('Auth', {
        passphrase1: 'zxzxcSADaaaa--asdzxcasd random big string ----aaaa--asdzxcasd',
        passphrase2: 'asdklzxct7IASDTzxc--asdzxcasd random big string ----aaaa--asdzxcasd'
    });
    private static logger: Logger = new Logger('auth');

    private static pkey1: string;
    private static pkey2: string;
    private static pubkey1: string;
    private static pubkey2: string;

    private static inited = false;

    private static init(): Promise<void> {
        return new Promise((resolve, _reject) => {
            if (!Auth.inited) {
                Auth.inited = true;
                fs.access('./keys/', (err) => {
                    let flag = 0;
                    const initKey = (name: number, passphrase: string) => {
                        fs.access('./keys/private.key' + name, (err) => {
                            fs.access('./keys/public.key' + name, (err1) => {
                                if (err || err1) {
                                    generateKeyPair('rsa', {
                                        modulusLength: 2048,
                                        publicKeyEncoding: {
                                            type: 'spki',
                                            format: 'pem'
                                        },
                                        privateKeyEncoding: {
                                            type: 'pkcs8',
                                            format: 'pem',
                                            cipher: 'aes-256-cbc',
                                            passphrase: passphrase
                                        }
                                    }, (err, publicKey, privateKey) => {
                                        if (err) throw Auth.logger.err(err.message);
                                        if (name == 1) {
                                            Auth.pkey1 = privateKey;
                                            Auth.pubkey1 = publicKey;
                                        }
                                        if (name == 2) {
                                            Auth.pkey2 = privateKey;
                                            Auth.pubkey2 = publicKey;
                                        }
                                        fs.writeFileSync('./keys/private.key' + name, privateKey);
                                        fs.writeFileSync('./keys/public.key' + name, publicKey);
                                        flag++;
                                        if (flag == 2)
                                            resolve();
                                    });
                                } else {
                                    if (name == 1) {
                                        Auth.pkey1 = fs.readFileSync('./keys/private.key' + name).toString();
                                        Auth.pubkey1 = fs.readFileSync('./keys/public.key' + name).toString();
                                    }
                                    if (name == 2) {
                                        Auth.pkey2 = fs.readFileSync('./keys/private.key' + name).toString();
                                        Auth.pubkey2 = fs.readFileSync('./keys/public.key' + name).toString();
                                    }
                                    flag++;
                                    if (flag == 2)
                                        resolve();
                                }
                            })
                        });
                    };
                    const cb = () => { initKey(1, this.config.params.passphrase1); initKey(2, this.config.params.passphrase2); };
                    err ? fs.mkdir('./keys', cb) : cb();
                });
            } else {
                resolve();
            }

        });

    }

    private static encrypt(s: string) {
        let buffer = Buffer.from(s);
        let encrypted = publicEncrypt(Auth.pubkey2, buffer);
        return encrypted.toString("base64");
    };

    private static decrypt(s: string) {
        var buffer = Buffer.from(s, "base64");
        var decrypted = privateDecrypt({ key: Auth.pkey2, passphrase: Auth.config.params.passphrase2 }, buffer);
        return decrypted.toString("utf8");
    };

    private static seriallize(data: token_data): object {
        return {
            data: Auth.encrypt(JSON.stringify(data)).toString()
        }
    }

    private static deseriallize(o: any): token_data {
        o.data = JSON.parse(Auth.decrypt(o.data).toString());
        for (const p in o.data) {
            o[p] = o.data[p];
        }
        delete o.data;
        return o;
    }

    public static generateAccessToken(data: token_data): Promise<string> {
        return new Promise(async (resolve, reject) => {
            await Auth.init();
            jwt.sign(Auth.seriallize({ username: data.username, salt: data.salt }), { key: Auth.pkey1, passphrase: Auth.config.params.passphrase1 }, { algorithm: 'RS256', expiresIn: '10m' }, (err: Error, token: string) => {
                if (err) return reject(Auth.logger.err('произошла ошибка при генерации токена! ' + err.stack));
                return resolve(token);
            });
        });



    }

    public static async validateToken(t: string): Promise<token_data> {
        return new Promise(async (resolve, reject) => {
            await Auth.init();
            jwt.verify(t, Auth.pubkey1, (err: Error, decoded: any) => {
                if (err) return reject(`произошла ошибка при валидировании токена! ${main_config.params.debug ? err.stack : ''}`);
                return resolve(Auth.deseriallize(decoded));
            });
        });
    }

}

export { Auth, token_data };