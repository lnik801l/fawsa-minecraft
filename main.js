const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
var morgan = require('morgan');
const mongoose = require('mongoose');
const errorHandler = require('errorhandler');
const fs = require('fs');

var vk = require("./modules/vk");
const cfg = require('./config/constants');


if (!fs.existsSync(cfg.appDir + 'logs'))
    fs.mkdirSync(cfg.appDir + 'logs');

var trueLog = console.log;
console.log = function (msg) {
    fs.appendFile(cfg.appDir + 'logs/log.log', msg + '\r\n', function (err) {
        if (err) {
            return trueLog(err);
        }
    });
    trueLog(msg);
}

var trueDebug = console.debug;
console.log = function (msg) {
    fs.appendFile(cfg.appDir + 'logs/debug.log', msg + '\r\n', function (err) {
        if (err) {
            return trueDebug(err);
        }
    });
    trueDebug(msg);
}


var trueErr = console.error;
console.error = function (msg) {
    fs.appendFile(cfg.appDir + 'logs/error.log', msg + '\r\n', function (err) {
        if (err) {
            return trueErr(err);
        }
    });
    trueErr(msg);
}


//Configure mongoose's promise to global promise
mongoose.promise = global.Promise;

//Configure isProduction variable
//const isProduction = process.env.NODE_ENV === 'production';
const isProduction = true;


//Initiate our app
const app = express();

//Configure our app
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(cors());

if (app.get('env') == 'production') {
    app.use(morgan('common', { skip: function (req, res) { return res.statusCode < 400 } }));
} else {
    app.use(morgan('dev'));
}



app.use(bodyParser.urlencoded({ limit: '4mb', extended: true }));
app.use(bodyParser.json({ limit: '4mb' }));

if (!isProduction) {
    app.use(errorHandler());
}



//Configure Mongoose
mongoose.connect('mongodb://localhost/' + cfg.db_main, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('debug', true);

//Models & routes

//adding ALL models recursively (ибо заебало вручную дописывать модели)
require("fs").readdirSync(require("path").join(__dirname, "models")).forEach(function (file) {
    if (file.endsWith(".js"))
        require("./models/" + file);
});

require('./config/passport');
app.use(require('./routes'));
const discord = require('./modules/discord');

//Error handlers & middlewares
if (!isProduction) {
    app.use((err, req, res) => {
        res.status(err.status || 500);

        res.json({
            errors: {
                message: err.message,
                error: err,
            },
        });
    });
}



//connect to discord bots to send notifies... and so one
discord.init(cfg.discord_bot_token, "#main");
for (const project in cfg.projects) {
    if (cfg.projects[project].settings.mail) {
        new vk.init(cfg.projects[project]);
    }
    //if (cfg.projects[project].settings.mail)
    //discord.init(cfg.projects[project].settings.mail.discord_bot_token, project);
}

const port = 25801;

app.listen(port, () => console.log('Server running on http://localhost:' + port));