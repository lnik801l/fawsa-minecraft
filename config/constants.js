module.exports.appDir = __dirname.substring(0, __dirname.length - 6);
module.exports.skinsDir = "routes/api/skins/";
module.exports.app_id = 1;
module.exports.client_secret = "";
module.exports.redirect_uri = "http://localhost:8000/api/users/linkvk/callback";
module.exports.login_redirect_uri = "http://localhost:8000/api/users/vklogin/callback";
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