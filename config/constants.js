const mongoose = require('mongoose');

module.exports.appDir = __dirname.substring(0, __dirname.length - 6);
module.exports.skinsDir = "routes/api/skins/";
module.exports.app_id = 1;
module.exports.client_secret = "";
module.exports.redirect_uri = "http://localhost:8000/api/users/linkvk/callback";
module.exports.login_redirect_uri = "http://localhost:8000/api/users/vklogin/callback";
module.exports.mongodb_url = "mongodb://127.0.0.1:27017/"
module.exports.db_main = "db";
module.exports.projects = {
    "galaxy": {
        "main": {
            "offer_server_url": "http://localhost:8088",
            "serverdir": "/home/lnik801l/Рабочий стол/projects/spaceworld/galaxy/"
        }
    },
    "basic": {
        "hitech": {
            "offer_server_url": "http://localhost:8088",
            "serverdir": "/home/lnik801l/Рабочий стол/projects/spaceworld/galaxy/"
        }
    }
}
module.exports.projects_settings = {
    "galaxy": {
        "db_name": "galaxy",
        "database": mongoose.createConnection(this.mongodb_url + 'galaxy', {useNewUrlParser: true, useUnifiedTopology: true})
    },
    "basic": {
        "db_name": "basic",
        "database": mongoose.createConnection(this.mongodb_url + 'basic', {useNewUrlParser: true, useUnifiedTopology: true})
    }
    
}