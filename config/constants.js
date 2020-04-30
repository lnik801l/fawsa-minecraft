const mongoose = require('mongoose');

module.exports.appDir = __dirname.substring(0, __dirname.length - 6);
module.exports.vk_app_id = 1;
module.exports.vk_client_secret = "";
module.exports.vk_redirect_uri = "http://localhost:8000/api/users/linkvk/callback";
module.exports.vk_login_redirect_uri = "http://localhost:8000/api/users/vklogin/callback";

module.exports.dc_redirect_uri = "http://localhost:8000/api/users/linkdc/callback";
module.exports.dc_login_redirect_uri = "http://localhost:8000/api/users/dclogin/callback";
module.exports.dc_client_id = '';
module.exports.dc_client_secret = '';

module.exports.mongodb_url = "mongodb://127.0.0.1:27017/"
module.exports.db_main = "db";
module.exports.projects = {
    galaxy: {
        settings: {
            rewards_params: {
                mctop_secret: '',
                topcraft_secret: '',
                fairtop_secret: ''
            },
            db_name: "galaxy",
            database: mongoose.createConnection(this.mongodb_url + 'galaxy', { useNewUrlParser: true, useUnifiedTopology: true })
        },
        servers: {
            main: {
                offer_server_url: "http://localhost:8088",
                serverdir: "/home/lnik801l/Рабочий стол/projects/spaceworld/galaxy/"
            }
        }

    },
    basic: {
        settings: {
            rewards_params: {
                mctop_secret: '',
                topcraft_secret: '',
                fairtop_secret: ''
            },
            db_name: "basic",
            database: mongoose.createConnection(this.mongodb_url + 'basic', { useNewUrlParser: true, useUnifiedTopology: true })
        },
        servers: {
            hitech: {
                offer_server_url: "http://localhost:8088",
                serverdir: "/home/lnik801l/Рабочий стол/projects/spaceworld/galaxy/"
            }
        }

    }
}