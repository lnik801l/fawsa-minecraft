import { Cfg } from "./Cfg"
import Logger from './Logger';
import request from 'request';

class Captcha {
    private static logger: Logger = new Logger('captcha');
    private static cfg: Cfg = new Cfg('captcha', {
        secret_key: 'private',
        site_key: 'public'
    });
    public static validate(captcha: string): Promise<{ err: boolean, message: string | null }> {
        return new Promise((resolve, reject) => {
            request({
                uri: 'https://www.google.com/recaptcha/api/siteverify',
                form: {
                    secret: this.cfg.params.secret_key,
                    response: captcha
                },
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }, function (err, response) {
                if (err) return reject(Captcha.logger.err(err));
                if (response) {
                    let json = JSON.parse(response.body);
                    if (!json.success || json.action != 'login') {
                        return resolve({ err: true, message: "not valid captcha" });
                    }
                    if (json.score <= 0.5)
                        return resolve({ err: true, message: "your actions are like a bot. refresh page and try again" })
                    if (json.success)
                        return resolve({ err: false, message: null });
                }
            });
        });
    }
}

export default Captcha;