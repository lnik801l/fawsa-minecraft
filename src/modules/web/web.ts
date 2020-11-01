import express = require('express');
import { Cfg } from '../../utils/Cfg';
import { json as parser_json } from 'body-parser';
import { Logger } from '../../utils';

class Web {
    public static config: Cfg = new Cfg('web', {
        enableV1: true,
        enableV2: false,
        enabled_projects: ["example"],
        allowed_cors: ["http://localhost:8080"]
    });
    public static app = express();
    public static router: express.Router = express.Router();
    private static logger: Logger = new Logger('web');

    constructor(port: number) {
        Web.app.use(parser_json());
        Web.app.use(function (req, _res, next) {
            Web.logger.log(req.method + ' ' + req.url);
            next();
        });
        Web.app.use(require('./api/routes').default);
        Web.app.listen(port, () => {
            // tslint:disable-next-line:no-console
            Web.logger.log(`server started at http://localhost:${port}`);
        });
    }
}

export default Web;

