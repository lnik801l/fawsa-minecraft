const mongoose = require('mongoose');

module.exports.recaptcha_secret = '6Lc8KPYUAAAAAHssGSFoLXkEczYnEXm238T6ZSPL'

module.exports.appDir = __dirname.substring(0, __dirname.length - 6);
module.exports.skinsDir = 'routes/api/skins/'
module.exports.vk_api_ver = '5.107';
module.exports.vk_app_id = 7436229;
module.exports.vk_client_secret = "T5xET2CYiCYHP9F4KlRX";
module.exports.vk_redirect_uri = "http://localhost:8080/cabinet/linkvkcallback";
module.exports.vk_login_redirect_uri = "http://localhost:8000/api/users/vklogin/callback";
module.exports.vk_news_parser_service_key = 'a91cfafea91cfafea91cfafe46a96d4bcdaa91ca91cfafef7ad13fdad21292557f04e24';

module.exports.dc_redirect_uri = "http://localhost:8000/api/users/linkdc/callback";
module.exports.dc_login_redirect_uri = "http://localhost:8000/api/users/dclogin/callback";
module.exports.dc_client_id = '705165732153131049';
module.exports.dc_client_secret = '1taV-jUpzex4PGMf55ZHqKiT8irIUKhm';
module.exports.discord_bot_token = 'NzA1MTY1NzMyMTUzMTMxMDQ5.Xs1_TQ.eW6AnsYqBXXwr7VnQeazAuk2oiI';

module.exports.mongodb_url = "mongodb://127.0.0.1:27017/"
module.exports.db_main = "db";
module.exports.api_allowed_cors = ['http://127.0.0.1:8020', 'http://localhost:8020', 'http://127.0.0.1:9000', 'http://localhost:9000'];

module.exports.projects = {
    galaxy: {
        settings: {
            mail: {
                vk_group_key: '5857253dc5db75e2a7fb12124f5546c39076b9f45118b6ea08c3a18099621d6d3a7259aa328c181fbab16',
                discord_url: 'https://discord.gg/XNECDGV',
                vk_url: 'https://vk.com/deepmine.official',
                site_url: 'https://deepmine.su'
            },
            rewards_params: {
                mctop_secret: '',
                topcraft_secret: '',
                fairtop_secret: ''
            },
            vk_group_admins: ['207789877', '426336279', '592061177'],
            vk_login_redirect_uri: 'http://localhost:8080/login/vk',
            vk_link_redirect_uri: 'http://localhost:8080/cabinet/vk',
            dc_login_redirect_uri: 'http://localhost:8080/login/dc',
            dc_link_redirect_uri: 'http://localhost:8080/cabinet/dc',
            dc_guild_id: '710117388305170442',
            dc_news_channel_id: '730390173111812168',
            vk_group_id: '-196845992',
            db_name: "galaxy",
            database: mongoose.createConnection(this.mongodb_url + 'galaxy', { useNewUrlParser: true, useUnifiedTopology: true })
        },
        servers: {
            main: {
                offer_server_url: "http://localhost:8088",
                serverdir: "/home/lnik801l/Рабочий стол/projects/spaceworld/galaxy/",
                host: 'localhost',
                port: 25565
            },
            ban: {
                offer_server_url: "http://localhost:8088",
                serverdir: "/home/lnik801l/Рабочий стол/projects/spaceworld/galaxy/",
                host: 'localhost',
                port: 25566
            }
        }

    },
    basic: {
        settings: {
            vk_group_id: '',
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
                serverdir: "/home/lnik801l/Рабочий стол/projects/spaceworld/galaxy/",
                host: 'localhost',
                port: 25566
            }
        }

    }
}