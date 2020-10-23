"use strict";
const nodemailer = require("nodemailer");
const cfg = require('../config/constants');

const request = require('request');
const dc = require('discord.js');

const discord = require('../modules/discord');

// async..await is not allowed in global scope, must use a wrapper
module.exports.sendMail = function main(to, token, project, type, method) {

    if (type == "notifychange") {
        sendNotifyChange(to, token, project, method);
    }

    if (type == "mailchange") {
        sendMailChange(to, token, project, method);
    }

    if (type == "passwdchange") {
        sendPasswdChange(to, token, project, method);
    }

    if (type == "reg") {
        sendRegEmail(to, token, project);
    }


}

async function sendNotifyChange(user, token, project, method) {

    if (method == 0) {
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        let testAccount = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass // generated ethereal password
            }
        });



        let info = await transporter.sendMail({
            from: '"UProjects 👻" <noreply@uprojects.su>', // sender address
            to: user.email, // list of receivers
            subject: "Смена метода оповещения | UProjects ✔", // Subject line
            html: `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html style="width:100%;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0;">

<head>
    <meta charset="UTF-8">
    <meta content="width=device-width, initial-scale=1" name="viewport">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta content="telephone=no" name="format-detection">
    <title>Смена метода оповещения на проекте ` + project + `</title>
    <link href="https://fonts.googleapis.com/css?family=Roboto:400,400i,700,700i" rel="stylesheet">
    <!--<![endif]-->
    <style type="text/css">
        @media only screen and (max-width:600px) {
            .st-br {
                padding-left: 10px!important;
                padding-right: 10px!important
            }
            p,
            ul li,
            ol li,
            a {
                font-size: 16px!important;
                line-height: 150%!important
            }
            h1 {
                font-size: 28px!important;
                text-align: center;
                line-height: 120%!important
            }
            h2 {
                font-size: 24px!important;
                text-align: center;
                line-height: 120%!important
            }
            h3 {
                font-size: 20px!important;
                text-align: center;
                line-height: 120%!important
            }
            h1 a {
                font-size: 28px!important;
                text-align: center
            }
            h2 a {
                font-size: 24px!important;
                text-align: center
            }
            h3 a {
                font-size: 20px!important;
                text-align: center
            }
            .es-menu td a {
                font-size: 14px!important
            }
            .es-header-body p,
            .es-header-body ul li,
            .es-header-body ol li,
            .es-header-body a {
                font-size: 16px!important
            }
            .es-footer-body p,
            .es-footer-body ul li,
            .es-footer-body ol li,
            .es-footer-body a {
                font-size: 14px!important
            }
            .es-infoblock p,
            .es-infoblock ul li,
            .es-infoblock ol li,
            .es-infoblock a {
                font-size: 12px!important
            }
            *[class="gmail-fix"] {
                display: none!important
            }
            .es-m-txt-c,
            .es-m-txt-c h1,
            .es-m-txt-c h2,
            .es-m-txt-c h3 {
                text-align: center!important
            }
            .es-m-txt-r,
            .es-m-txt-r h1,
            .es-m-txt-r h2,
            .es-m-txt-r h3 {
                text-align: right!important
            }
            .es-m-txt-l,
            .es-m-txt-l h1,
            .es-m-txt-l h2,
            .es-m-txt-l h3 {
                text-align: left!important
            }
            .es-m-txt-r img,
            .es-m-txt-c img,
            .es-m-txt-l img {
                display: inline!important
            }
            .es-button-border {
                display: block!important
            }
            a.es-button {
                font-size: 16px!important;
                display: block!important;
                border-left-width: 0px!important;
                border-right-width: 0px!important
            }
            .es-btn-fw {
                border-width: 10px 0px!important;
                text-align: center!important
            }
            .es-adaptive table,
            .es-btn-fw,
            .es-btn-fw-brdr,
            .es-left,
            .es-right {
                width: 100%!important
            }
            .es-content table,
            .es-header table,
            .es-footer table,
            .es-content,
            .es-footer,
            .es-header {
                width: 100%!important;
                max-width: 600px!important
            }
            .es-adapt-td {
                display: block!important;
                width: 100%!important
            }
            .adapt-img {
                width: 100%!important;
                height: auto!important
            }
            .es-m-p0 {
                padding: 0px!important
            }
            .es-m-p0r {
                padding-right: 0px!important
            }
            .es-m-p0l {
                padding-left: 0px!important
            }
            .es-m-p0t {
                padding-top: 0px!important
            }
            .es-m-p0b {
                padding-bottom: 0!important
            }
            .es-m-p20b {
                padding-bottom: 20px!important
            }
            .es-mobile-hidden,
            .es-hidden {
                display: none!important
            }
            .es-desk-hidden {
                display: table-row!important;
                width: auto!important;
                overflow: visible!important;
                float: none!important;
                max-height: inherit!important;
                line-height: inherit!important
            }
            .es-desk-menu-hidden {
                display: table-cell!important
            }
            table.es-table-not-adapt,
            .esd-block-html table {
                width: auto!important
            }
            table.es-social {
                display: inline-block!important
            }
            table.es-social td {
                display: inline-block!important
            }
        }
        
        .rollover:hover .rollover-first {
            max-height: 0px!important;
            display: none!important;
        }
        
        .rollover:hover .rollover-second {
            max-height: none!important;
            display: block!important;
        }
        
        #outlook a {
            padding: 0;
        }
        
        .ExternalClass {
            width: 100%;
        }
        
        .ExternalClass,
        .ExternalClass p,
        .ExternalClass span,
        .ExternalClass font,
        .ExternalClass td,
        .ExternalClass div {
            line-height: 100%;
        }
        
        .es-button {
            mso-style-priority: 100!important;
            text-decoration: none!important;
        }
        
        a[x-apple-data-detectors] {
            color: inherit!important;
            text-decoration: none!important;
            font-size: inherit!important;
            font-family: inherit!important;
            font-weight: inherit!important;
            line-height: inherit!important;
        }
        
        .es-desk-hidden {
            display: none;
            float: left;
            overflow: hidden;
            width: 0;
            max-height: 0;
            line-height: 0;
            mso-hide: all;
        }
        
        .es-button-border:hover {
            border-style: solid solid solid solid!important;
            background: #d6a700!important;
            border-color: #42d159 #42d159 #42d159 #42d159!important;
        }
        
        .es-button-border:hover a.es-button {
            background: #d6a700!important;
            border-color: #d6a700!important;
        }
        
        td .es-button-border:hover a.es-button-1 {
            background: #4c4c4c!important;
            border-color: #4c4c4c!important;
        }
        
        td .es-button-border-2:hover {
            background: #4c4c4c!important;
        }
    </style>
</head>

<body style="width:100%;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0;">
    <div class="es-wrapper-color" style="background-color:#F6F6F6;">
        <!--[if gte mso 9]>
      <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
        <v:fill type="tile" color="#f6f6f6"></v:fill>
      </v:background>
    <![endif]-->
        <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;">
            <tr style="border-collapse:collapse;">
                <td class="st-br" valign="top" style="padding:0;Margin:0;">
                    <table cellpadding="0" cellspacing="0" class="es-header" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top;">
                        <tr style="border-collapse:collapse;">
                            <td align="center" style="padding:0;Margin:0;background-image:url(https://i.imgur.com/YEAxkT9.jpg);background-color:transparent;background-position:center bottom;background-repeat:no-repeat;" bgcolor="transparent" background="https://i.imgur.com/YEAxkT9.jpg">
                                <div>
                                    <table bgcolor="transparent" class="es-header-body" align="center" cellpadding="0" cellspacing="0" width="600" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;">
                                        <tr style="border-collapse:collapse;">
                                            <td align="left" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;">
                                                <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                    <tr style="border-collapse:collapse;">
                                                        <td width="560" align="center" valign="top" style="padding:0;Margin:0;">
                                                            <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                                <tr style="border-collapse:collapse;">
                                                                    <td align="center" height="100" style="padding:0;Margin:0;"></td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </td>
                        </tr>
                    </table>
                    <table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;">
                        <tr style="border-collapse:collapse;">
                            <td align="center" bgcolor="transparent" style="padding:0;Margin:0;background-color:transparent;">
                                <table bgcolor="transparent" class="es-content-body" align="center" cellpadding="0" cellspacing="0" width="600" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;">
                                    <tr style="border-collapse:collapse;">
                                        <td align="left" style="padding:0;Margin:0;padding-top:30px;padding-left:30px;padding-right:30px;border-radius:10px 10px 0px 0px;background-color:#FFFFFF;background-position:left bottom;" bgcolor="#ffffff">
                                            <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                <tr style="border-collapse:collapse;">
                                                    <td width="540" align="center" valign="top" style="padding:0;Margin:0;">
                                                        <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                            <tr style="border-collapse:collapse;">
                                                                <td align="center" style="padding:0;Margin:0;">
                                                                    <h1 style="Margin:0;line-height:36px;mso-line-height-rule:exactly;font-family:tahoma, verdana, segoe, sans-serif;font-size:30px;font-style:normal;font-weight:bold;color:#212121;">Привет, дорогой игрок!</h1>
                                                                </td>
                                                            </tr>
                                                            <tr style="border-collapse:collapse;">
                                                                <td align="center" style="padding:0;Margin:0;padding-top:20px;">
                                                                    <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;color:#131313;">Для твоего аккаунта было запрошено изменение метода оповещения.</p>
                                                                    <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;color:#131313;">Если ты этого не делал, не переживай, твой аккаунт в безопасности. Ключ для изменения метода оповещения будет обнулён через 5 часов.</p>
                                                                    <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;color:#131313;">На случай, если это всё же был ты, вот код:</p>
                                                                    <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;color:#131313;">` + token + `</p>
                                                                </td>
                                                            </tr>
                                                            <tr style="border-collapse:collapse;">
                                                                <td align="center" style="padding:0;Margin:0;">
                                                                    <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;color:#131313;">Хотите интеграцию своего проекта в нашей системе? Напишите нам!</p>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    <table cellpadding="0" cellspacing="0" class="es-footer" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:#F6F6F6;background-repeat:repeat;background-position:center top;">
                        <tr style="border-collapse:collapse;">
                            <td align="center" style="padding:0;Margin:0;background-image:url(https://i.imgur.com/YuK217x.jpg);background-repeat:no-repeat;background-position:left top;" background="https://i.imgur.com/YuK217x.jpg">
                                <table class="es-footer-body" width="600" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;">
                                    <tr style="border-collapse:collapse;">
                                        <td align="left" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;">
                                            <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                <tr style="border-collapse:collapse;">
                                                    <td width="560" valign="top" align="center" style="padding:0;Margin:0;">
                                                        <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                            <tr style="border-collapse:collapse;">
                                                                <td style="padding:0;Margin:0;">
                                                                    <table class="es-menu" width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                                        <tr class="links" style="border-collapse:collapse;">
                                                                            <td style="Margin:0;padding-left:5px;padding-right:5px;padding-top:0px;padding-bottom:0px;border:0;" id="esd-menu-id-0" width="25%" bgcolor="transparent" align="center"><a target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;font-size:16px;text-decoration:none;display:block;color:#000000;"
                                                                                    href="https://uprojects.su">Сайт системы</a></td>
                                                                            <td style="Margin:0;padding-left:5px;padding-right:5px;padding-top:0px;padding-bottom:0px;border:0;border-left:1px solid #000000;" id="esd-menu-id-1" esdev-border-color="#ffffff" width="25%" bgcolor="transparent" align="center"><a target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;font-size:16px;text-decoration:none;display:block;color:#000000;"
                                                                                    href="` + cfg.projects[project].settings.mail.vk_url + `">VK проекта</a></td>
                                                                            <td style="Margin:0;padding-left:5px;padding-right:5px;padding-top:0px;padding-bottom:0px;border:0;border-left:1px solid #000000;" id="esd-menu-id-2" esdev-border-color="#ffffff" width="25%" bgcolor="transparent" align="center"><a target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;font-size:16px;text-decoration:none;display:block;color:#000000;"
                                                                                    href="` + cfg.projects[project].settings.mail.discord_url + `">Discord проекта</a></td>
                                                                            <td style="Margin:0;padding-left:5px;padding-right:5px;padding-top:0px;padding-bottom:0px;border:0;border-left:1px solid #000000;" id="esd-menu-id-2" esdev-border-color="#ffffff" width="25%" bgcolor="transparent" align="center"><a target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;font-size:16px;text-decoration:none;display:block;color:#000000;"
                                                                                    href="https://vk.com/uprojects.official">VK системы</a></td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr style="border-collapse:collapse;">
                                        <td align="left" style="Margin:0;padding-top:10px;padding-bottom:15px;padding-left:20px;padding-right:20px;">
                                            <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                <tr style="border-collapse:collapse;">
                                                    <td width="560" valign="top" align="center" style="padding:0;Margin:0;">
                                                        <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                            <tr style="border-collapse:collapse;">
                                                                <td align="center" style="padding:0;Margin:0;padding-top:10px;">
                                                                    <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:19px;color:#131313;">Copyright @UProjects</p>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>
</body>

</html>
`
        });

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }

    if (method == 1) {
        let message =
            `
          Привет, дорогой игрок!
          Для твоего аккаунта было запрошено изменение метода оповещения.

          Если ты этого не делал, не переживай, твой аккаунт в безопасности. Ключ для изменения метода оповещения будет обнулён через 5 часов.

          На случай, если это всё же был ты, вот код:

          ` + token;
        var randomNumber = '';
        for (var i = 0; i < 19; i++) {
            randomNumber += Math.floor(Math.random() * 10);
        }
        let params = "user_id=" + user.vk_id + "&random_id=" + randomNumber + "&message=" + message + "&v=5.100";
        let vktoken = "access_token=" + cfg.projects[project].settings.mail.vk_group_key;

        console.log(encodeURI('https://api.vk.com/method/messages.send?' + params + "&" + vktoken));

        request(encodeURI('https://api.vk.com/method/messages.send?' + params + "&" + vktoken), function (err, response, body) {
            if (err)
                console.log(err);
            if (response) {
                console.log(JSON.parse(response.body));
            }
        });
    }

    if (method == 2) {
        const embed = new dc.MessageEmbed()
            .setColor('#d1d1d1')
            .setAuthor('UProjects | система уведомлений', 'https://i.imgur.com/3MBVh77.png', 'https://uprojects.su')
            .setDescription('Привет, дорогой игрок!\n\nДля твоего аккаунта было запрошено изменение метода оповещения.\n\nЕсли ты этого не делал, не переживай, твой аккаунт в безопасности. Ключ будет обнулён через 5 часов.')
            .addField('На случай, если это всё же был ты, вот код:', '``` ' + token + ' ```', true)
            .setTimestamp()
            .setFooter('© UProjects | l_nik801_l (https://vk.com/l_nik801_l)');

        discord.instance("#main").users.fetch(user.discord_id).then((u) => {
            const lE = embed;
            u.send(lE);
        });

    }

}

async function sendMailChange(user, token, project, method) {

    if (method == 0) {
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        let testAccount = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass // generated ethereal password
            }
        });



        let info = await transporter.sendMail({
            from: '"UProjects 👻" <noreply@uprojects.su>', // sender address
            to: user.email, // list of receivers
            subject: "Смена EMail | UProjects ✔", // Subject line
            html: `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html style="width:100%;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0;">
  
  <head>
      <meta charset="UTF-8">
      <meta content="width=device-width, initial-scale=1" name="viewport">
      <meta name="x-apple-disable-message-reformatting">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta content="telephone=no" name="format-detection">
      <title>Смена EMail на проекте ` + project + `</title>
      <link href="https://fonts.googleapis.com/css?family=Roboto:400,400i,700,700i" rel="stylesheet">
      <!--<![endif]-->
      <style type="text/css">
          @media only screen and (max-width:600px) {
              .st-br {
                  padding-left: 10px!important;
                  padding-right: 10px!important
              }
              p,
              ul li,
              ol li,
              a {
                  font-size: 16px!important;
                  line-height: 150%!important
              }
              h1 {
                  font-size: 28px!important;
                  text-align: center;
                  line-height: 120%!important
              }
              h2 {
                  font-size: 24px!important;
                  text-align: center;
                  line-height: 120%!important
              }
              h3 {
                  font-size: 20px!important;
                  text-align: center;
                  line-height: 120%!important
              }
              h1 a {
                  font-size: 28px!important;
                  text-align: center
              }
              h2 a {
                  font-size: 24px!important;
                  text-align: center
              }
              h3 a {
                  font-size: 20px!important;
                  text-align: center
              }
              .es-menu td a {
                  font-size: 14px!important
              }
              .es-header-body p,
              .es-header-body ul li,
              .es-header-body ol li,
              .es-header-body a {
                  font-size: 16px!important
              }
              .es-footer-body p,
              .es-footer-body ul li,
              .es-footer-body ol li,
              .es-footer-body a {
                  font-size: 14px!important
              }
              .es-infoblock p,
              .es-infoblock ul li,
              .es-infoblock ol li,
              .es-infoblock a {
                  font-size: 12px!important
              }
              *[class="gmail-fix"] {
                  display: none!important
              }
              .es-m-txt-c,
              .es-m-txt-c h1,
              .es-m-txt-c h2,
              .es-m-txt-c h3 {
                  text-align: center!important
              }
              .es-m-txt-r,
              .es-m-txt-r h1,
              .es-m-txt-r h2,
              .es-m-txt-r h3 {
                  text-align: right!important
              }
              .es-m-txt-l,
              .es-m-txt-l h1,
              .es-m-txt-l h2,
              .es-m-txt-l h3 {
                  text-align: left!important
              }
              .es-m-txt-r img,
              .es-m-txt-c img,
              .es-m-txt-l img {
                  display: inline!important
              }
              .es-button-border {
                  display: block!important
              }
              a.es-button {
                  font-size: 16px!important;
                  display: block!important;
                  border-left-width: 0px!important;
                  border-right-width: 0px!important
              }
              .es-btn-fw {
                  border-width: 10px 0px!important;
                  text-align: center!important
              }
              .es-adaptive table,
              .es-btn-fw,
              .es-btn-fw-brdr,
              .es-left,
              .es-right {
                  width: 100%!important
              }
              .es-content table,
              .es-header table,
              .es-footer table,
              .es-content,
              .es-footer,
              .es-header {
                  width: 100%!important;
                  max-width: 600px!important
              }
              .es-adapt-td {
                  display: block!important;
                  width: 100%!important
              }
              .adapt-img {
                  width: 100%!important;
                  height: auto!important
              }
              .es-m-p0 {
                  padding: 0px!important
              }
              .es-m-p0r {
                  padding-right: 0px!important
              }
              .es-m-p0l {
                  padding-left: 0px!important
              }
              .es-m-p0t {
                  padding-top: 0px!important
              }
              .es-m-p0b {
                  padding-bottom: 0!important
              }
              .es-m-p20b {
                  padding-bottom: 20px!important
              }
              .es-mobile-hidden,
              .es-hidden {
                  display: none!important
              }
              .es-desk-hidden {
                  display: table-row!important;
                  width: auto!important;
                  overflow: visible!important;
                  float: none!important;
                  max-height: inherit!important;
                  line-height: inherit!important
              }
              .es-desk-menu-hidden {
                  display: table-cell!important
              }
              table.es-table-not-adapt,
              .esd-block-html table {
                  width: auto!important
              }
              table.es-social {
                  display: inline-block!important
              }
              table.es-social td {
                  display: inline-block!important
              }
          }
          
          .rollover:hover .rollover-first {
              max-height: 0px!important;
              display: none!important;
          }
          
          .rollover:hover .rollover-second {
              max-height: none!important;
              display: block!important;
          }
          
          #outlook a {
              padding: 0;
          }
          
          .ExternalClass {
              width: 100%;
          }
          
          .ExternalClass,
          .ExternalClass p,
          .ExternalClass span,
          .ExternalClass font,
          .ExternalClass td,
          .ExternalClass div {
              line-height: 100%;
          }
          
          .es-button {
              mso-style-priority: 100!important;
              text-decoration: none!important;
          }
          
          a[x-apple-data-detectors] {
              color: inherit!important;
              text-decoration: none!important;
              font-size: inherit!important;
              font-family: inherit!important;
              font-weight: inherit!important;
              line-height: inherit!important;
          }
          
          .es-desk-hidden {
              display: none;
              float: left;
              overflow: hidden;
              width: 0;
              max-height: 0;
              line-height: 0;
              mso-hide: all;
          }
          
          .es-button-border:hover {
              border-style: solid solid solid solid!important;
              background: #d6a700!important;
              border-color: #42d159 #42d159 #42d159 #42d159!important;
          }
          
          .es-button-border:hover a.es-button {
              background: #d6a700!important;
              border-color: #d6a700!important;
          }
          
          td .es-button-border:hover a.es-button-1 {
              background: #4c4c4c!important;
              border-color: #4c4c4c!important;
          }
          
          td .es-button-border-2:hover {
              background: #4c4c4c!important;
          }
      </style>
  </head>
  
  <body style="width:100%;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0;">
      <div class="es-wrapper-color" style="background-color:#F6F6F6;">
          <!--[if gte mso 9]>
        <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
          <v:fill type="tile" color="#f6f6f6"></v:fill>
        </v:background>
      <![endif]-->
          <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;">
              <tr style="border-collapse:collapse;">
                  <td class="st-br" valign="top" style="padding:0;Margin:0;">
                      <table cellpadding="0" cellspacing="0" class="es-header" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top;">
                          <tr style="border-collapse:collapse;">
                              <td align="center" style="padding:0;Margin:0;background-image:url(https://i.imgur.com/YEAxkT9.jpg);background-color:transparent;background-position:center bottom;background-repeat:no-repeat;" bgcolor="transparent" background="https://i.imgur.com/YEAxkT9.jpg">
                                  <div>
                                      <table bgcolor="transparent" class="es-header-body" align="center" cellpadding="0" cellspacing="0" width="600" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;">
                                          <tr style="border-collapse:collapse;">
                                              <td align="left" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;">
                                                  <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                      <tr style="border-collapse:collapse;">
                                                          <td width="560" align="center" valign="top" style="padding:0;Margin:0;">
                                                              <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                                  <tr style="border-collapse:collapse;">
                                                                      <td align="center" height="100" style="padding:0;Margin:0;"></td>
                                                                  </tr>
                                                              </table>
                                                          </td>
                                                      </tr>
                                                  </table>
                                              </td>
                                          </tr>
                                      </table>
                                  </div>
                              </td>
                          </tr>
                      </table>
                      <table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;">
                          <tr style="border-collapse:collapse;">
                              <td align="center" bgcolor="transparent" style="padding:0;Margin:0;background-color:transparent;">
                                  <table bgcolor="transparent" class="es-content-body" align="center" cellpadding="0" cellspacing="0" width="600" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;">
                                      <tr style="border-collapse:collapse;">
                                          <td align="left" style="padding:0;Margin:0;padding-top:30px;padding-left:30px;padding-right:30px;border-radius:10px 10px 0px 0px;background-color:#FFFFFF;background-position:left bottom;" bgcolor="#ffffff">
                                              <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                  <tr style="border-collapse:collapse;">
                                                      <td width="540" align="center" valign="top" style="padding:0;Margin:0;">
                                                          <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                              <tr style="border-collapse:collapse;">
                                                                  <td align="center" style="padding:0;Margin:0;">
                                                                      <h1 style="Margin:0;line-height:36px;mso-line-height-rule:exactly;font-family:tahoma, verdana, segoe, sans-serif;font-size:30px;font-style:normal;font-weight:bold;color:#212121;">Привет, дорогой игрок!</h1>
                                                                  </td>
                                                              </tr>
                                                              <tr style="border-collapse:collapse;">
                                                                  <td align="center" style="padding:0;Margin:0;padding-top:20px;">
                                                                      <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;color:#131313;">Для твоего аккаунта было запрошено изменение EMail.</p>
                                                                      <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;color:#131313;">Если ты этого не делал, не переживай, твой аккаунт в безопасности. Ключ для изменения EMail будет обнулён через 5 часов.</p>
                                                                      <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;color:#131313;">На случай, если это всё же был ты, вот код:</p>
                                                                      <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;color:#131313;">` + token + `</p>
                                                                  </td>
                                                              </tr>
                                                              <tr style="border-collapse:collapse;">
                                                                  <td align="center" style="padding:0;Margin:0;">
                                                                      <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;color:#131313;">Хотите интеграцию своего проекта в нашей системе? Напишите нам!</p>
                                                                  </td>
                                                              </tr>
                                                          </table>
                                                      </td>
                                                  </tr>
                                              </table>
                                          </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                      </table>
                      <table cellpadding="0" cellspacing="0" class="es-footer" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:#F6F6F6;background-repeat:repeat;background-position:center top;">
                          <tr style="border-collapse:collapse;">
                              <td align="center" style="padding:0;Margin:0;background-image:url(https://i.imgur.com/YuK217x.jpg);background-repeat:no-repeat;background-position:left top;" background="https://i.imgur.com/YuK217x.jpg">
                                  <table class="es-footer-body" width="600" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;">
                                      <tr style="border-collapse:collapse;">
                                          <td align="left" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;">
                                              <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                  <tr style="border-collapse:collapse;">
                                                      <td width="560" valign="top" align="center" style="padding:0;Margin:0;">
                                                          <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                              <tr style="border-collapse:collapse;">
                                                                  <td style="padding:0;Margin:0;">
                                                                      <table class="es-menu" width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                                          <tr class="links" style="border-collapse:collapse;">
                                                                              <td style="Margin:0;padding-left:5px;padding-right:5px;padding-top:0px;padding-bottom:0px;border:0;" id="esd-menu-id-0" width="25%" bgcolor="transparent" align="center"><a target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;font-size:16px;text-decoration:none;display:block;color:#000000;"
                                                                                      href="https://uprojects.su">Сайт системы</a></td>
                                                                              <td style="Margin:0;padding-left:5px;padding-right:5px;padding-top:0px;padding-bottom:0px;border:0;border-left:1px solid #000000;" id="esd-menu-id-1" esdev-border-color="#ffffff" width="25%" bgcolor="transparent" align="center"><a target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;font-size:16px;text-decoration:none;display:block;color:#000000;"
                                                                                      href="` + cfg.projects[project].settings.mail.vk_url + `">VK проекта</a></td>
                                                                              <td style="Margin:0;padding-left:5px;padding-right:5px;padding-top:0px;padding-bottom:0px;border:0;border-left:1px solid #000000;" id="esd-menu-id-2" esdev-border-color="#ffffff" width="25%" bgcolor="transparent" align="center"><a target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;font-size:16px;text-decoration:none;display:block;color:#000000;"
                                                                                      href="` + cfg.projects[project].settings.mail.discord_url + `">Discord проекта</a></td>
                                                                              <td style="Margin:0;padding-left:5px;padding-right:5px;padding-top:0px;padding-bottom:0px;border:0;border-left:1px solid #000000;" id="esd-menu-id-2" esdev-border-color="#ffffff" width="25%" bgcolor="transparent" align="center"><a target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;font-size:16px;text-decoration:none;display:block;color:#000000;"
                                                                                      href="https://vk.com/uprojects.official">VK системы</a></td>
                                                                          </tr>
                                                                      </table>
                                                                  </td>
                                                              </tr>
                                                          </table>
                                                      </td>
                                                  </tr>
                                              </table>
                                          </td>
                                      </tr>
                                      <tr style="border-collapse:collapse;">
                                          <td align="left" style="Margin:0;padding-top:10px;padding-bottom:15px;padding-left:20px;padding-right:20px;">
                                              <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                  <tr style="border-collapse:collapse;">
                                                      <td width="560" valign="top" align="center" style="padding:0;Margin:0;">
                                                          <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                              <tr style="border-collapse:collapse;">
                                                                  <td align="center" style="padding:0;Margin:0;padding-top:10px;">
                                                                      <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:19px;color:#131313;">Copyright @UProjects</p>
                                                                  </td>
                                                              </tr>
                                                          </table>
                                                      </td>
                                                  </tr>
                                              </table>
                                          </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </div>
  </body>
  
  </html>
  `
        });
        console.log("ban");

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }

    if (method == 1) {
        let message =
            `
          Привет, дорогой игрок!
          Для твоего аккаунта было запрошено изменение EMail.

          Если ты этого не делал, не переживай, твой аккаунт в безопасности. Ключ для изменения EMail будет обнулён через 5 часов.

          На случай, если это всё же был ты, вот код:

          ` + token;
        var randomNumber = '';
        for (var i = 0; i < 19; i++) {
            randomNumber += Math.floor(Math.random() * 10);
        }
        let params = "user_id=" + user.vk_id + "&random_id=" + randomNumber + "&message=" + message + "&v=5.100";
        let vktoken = "access_token=" + cfg.projects[project].settings.mail.vk_group_key;

        console.log(encodeURI('https://api.vk.com/method/messages.send?' + params + "&" + vktoken));

        request(encodeURI('https://api.vk.com/method/messages.send?' + params + "&" + vktoken), function (err, response, body) {
            if (err)
                console.log(err);
            if (response) {
                console.log(JSON.parse(response.body));
            }
        });
    }

    if (method == 2) {
        const embed = new dc.MessageEmbed()
            .setColor('#d1d1d1')
            .setAuthor('UProjects | система уведомлений', 'https://i.imgur.com/3MBVh77.png', 'https://uprojects.su')
            .setDescription('Привет, дорогой игрок!\n\nДля твоего аккаунта было запрошено изменение EMail.\n\nЕсли ты этого не делал, не переживай, твой аккаунт в безопасности. Ключ будет обнулён через 5 часов.')
            .addField('На случай, если это всё же был ты, вот код:', '``` ' + token + ' ```', true)
            .setTimestamp()
            .setFooter('© UProjects | l_nik801_l (https://vk.com/l_nik801_l)');

        discord.instance("#main").users.fetch(user.discord_id).then((u) => {
            const lE = embed;
            u.send(lE);
        });

    }

}

async function sendPasswdChange(user, token, project, method) {

    if (method == 0) {
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        let testAccount = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass // generated ethereal password
            }
        });



        let info = await transporter.sendMail({
            from: '"UProjects 👻" <noreply@uprojects.su>', // sender address
            to: user.email, // list of receivers
            subject: "Восстановление пароля | UProjects ✔", // Subject line
            html: `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html style="width:100%;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0;">
    
    <head>
        <meta charset="UTF-8">
        <meta content="width=device-width, initial-scale=1" name="viewport">
        <meta name="x-apple-disable-message-reformatting">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta content="telephone=no" name="format-detection">
        <title>Восстановление пароля на проекте ` + project + `</title>
        <link href="https://fonts.googleapis.com/css?family=Roboto:400,400i,700,700i" rel="stylesheet">
        <!--<![endif]-->
        <style type="text/css">
            @media only screen and (max-width:600px) {
                .st-br {
                    padding-left: 10px!important;
                    padding-right: 10px!important
                }
                p,
                ul li,
                ol li,
                a {
                    font-size: 16px!important;
                    line-height: 150%!important
                }
                h1 {
                    font-size: 28px!important;
                    text-align: center;
                    line-height: 120%!important
                }
                h2 {
                    font-size: 24px!important;
                    text-align: center;
                    line-height: 120%!important
                }
                h3 {
                    font-size: 20px!important;
                    text-align: center;
                    line-height: 120%!important
                }
                h1 a {
                    font-size: 28px!important;
                    text-align: center
                }
                h2 a {
                    font-size: 24px!important;
                    text-align: center
                }
                h3 a {
                    font-size: 20px!important;
                    text-align: center
                }
                .es-menu td a {
                    font-size: 14px!important
                }
                .es-header-body p,
                .es-header-body ul li,
                .es-header-body ol li,
                .es-header-body a {
                    font-size: 16px!important
                }
                .es-footer-body p,
                .es-footer-body ul li,
                .es-footer-body ol li,
                .es-footer-body a {
                    font-size: 14px!important
                }
                .es-infoblock p,
                .es-infoblock ul li,
                .es-infoblock ol li,
                .es-infoblock a {
                    font-size: 12px!important
                }
                *[class="gmail-fix"] {
                    display: none!important
                }
                .es-m-txt-c,
                .es-m-txt-c h1,
                .es-m-txt-c h2,
                .es-m-txt-c h3 {
                    text-align: center!important
                }
                .es-m-txt-r,
                .es-m-txt-r h1,
                .es-m-txt-r h2,
                .es-m-txt-r h3 {
                    text-align: right!important
                }
                .es-m-txt-l,
                .es-m-txt-l h1,
                .es-m-txt-l h2,
                .es-m-txt-l h3 {
                    text-align: left!important
                }
                .es-m-txt-r img,
                .es-m-txt-c img,
                .es-m-txt-l img {
                    display: inline!important
                }
                .es-button-border {
                    display: block!important
                }
                a.es-button {
                    font-size: 16px!important;
                    display: block!important;
                    border-left-width: 0px!important;
                    border-right-width: 0px!important
                }
                .es-btn-fw {
                    border-width: 10px 0px!important;
                    text-align: center!important
                }
                .es-adaptive table,
                .es-btn-fw,
                .es-btn-fw-brdr,
                .es-left,
                .es-right {
                    width: 100%!important
                }
                .es-content table,
                .es-header table,
                .es-footer table,
                .es-content,
                .es-footer,
                .es-header {
                    width: 100%!important;
                    max-width: 600px!important
                }
                .es-adapt-td {
                    display: block!important;
                    width: 100%!important
                }
                .adapt-img {
                    width: 100%!important;
                    height: auto!important
                }
                .es-m-p0 {
                    padding: 0px!important
                }
                .es-m-p0r {
                    padding-right: 0px!important
                }
                .es-m-p0l {
                    padding-left: 0px!important
                }
                .es-m-p0t {
                    padding-top: 0px!important
                }
                .es-m-p0b {
                    padding-bottom: 0!important
                }
                .es-m-p20b {
                    padding-bottom: 20px!important
                }
                .es-mobile-hidden,
                .es-hidden {
                    display: none!important
                }
                .es-desk-hidden {
                    display: table-row!important;
                    width: auto!important;
                    overflow: visible!important;
                    float: none!important;
                    max-height: inherit!important;
                    line-height: inherit!important
                }
                .es-desk-menu-hidden {
                    display: table-cell!important
                }
                table.es-table-not-adapt,
                .esd-block-html table {
                    width: auto!important
                }
                table.es-social {
                    display: inline-block!important
                }
                table.es-social td {
                    display: inline-block!important
                }
            }
            
            .rollover:hover .rollover-first {
                max-height: 0px!important;
                display: none!important;
            }
            
            .rollover:hover .rollover-second {
                max-height: none!important;
                display: block!important;
            }
            
            #outlook a {
                padding: 0;
            }
            
            .ExternalClass {
                width: 100%;
            }
            
            .ExternalClass,
            .ExternalClass p,
            .ExternalClass span,
            .ExternalClass font,
            .ExternalClass td,
            .ExternalClass div {
                line-height: 100%;
            }
            
            .es-button {
                mso-style-priority: 100!important;
                text-decoration: none!important;
            }
            
            a[x-apple-data-detectors] {
                color: inherit!important;
                text-decoration: none!important;
                font-size: inherit!important;
                font-family: inherit!important;
                font-weight: inherit!important;
                line-height: inherit!important;
            }
            
            .es-desk-hidden {
                display: none;
                float: left;
                overflow: hidden;
                width: 0;
                max-height: 0;
                line-height: 0;
                mso-hide: all;
            }
            
            .es-button-border:hover {
                border-style: solid solid solid solid!important;
                background: #d6a700!important;
                border-color: #42d159 #42d159 #42d159 #42d159!important;
            }
            
            .es-button-border:hover a.es-button {
                background: #d6a700!important;
                border-color: #d6a700!important;
            }
            
            td .es-button-border:hover a.es-button-1 {
                background: #4c4c4c!important;
                border-color: #4c4c4c!important;
            }
            
            td .es-button-border-2:hover {
                background: #4c4c4c!important;
            }
        </style>
    </head>
    
    <body style="width:100%;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0;">
        <div class="es-wrapper-color" style="background-color:#F6F6F6;">
            <!--[if gte mso 9]>
          <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
            <v:fill type="tile" color="#f6f6f6"></v:fill>
          </v:background>
        <![endif]-->
            <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;">
                <tr style="border-collapse:collapse;">
                    <td class="st-br" valign="top" style="padding:0;Margin:0;">
                        <table cellpadding="0" cellspacing="0" class="es-header" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top;">
                            <tr style="border-collapse:collapse;">
                                <td align="center" style="padding:0;Margin:0;background-image:url(https://i.imgur.com/YEAxkT9.jpg);background-color:transparent;background-position:center bottom;background-repeat:no-repeat;" bgcolor="transparent" background="https://i.imgur.com/YEAxkT9.jpg">
                                    <div>
                                        <table bgcolor="transparent" class="es-header-body" align="center" cellpadding="0" cellspacing="0" width="600" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;">
                                            <tr style="border-collapse:collapse;">
                                                <td align="left" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;">
                                                    <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                        <tr style="border-collapse:collapse;">
                                                            <td width="560" align="center" valign="top" style="padding:0;Margin:0;">
                                                                <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                                    <tr style="border-collapse:collapse;">
                                                                        <td align="center" height="100" style="padding:0;Margin:0;"></td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                        </table>
                        <table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;">
                            <tr style="border-collapse:collapse;">
                                <td align="center" bgcolor="transparent" style="padding:0;Margin:0;background-color:transparent;">
                                    <table bgcolor="transparent" class="es-content-body" align="center" cellpadding="0" cellspacing="0" width="600" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;">
                                        <tr style="border-collapse:collapse;">
                                            <td align="left" style="padding:0;Margin:0;padding-top:30px;padding-left:30px;padding-right:30px;border-radius:10px 10px 0px 0px;background-color:#FFFFFF;background-position:left bottom;" bgcolor="#ffffff">
                                                <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                    <tr style="border-collapse:collapse;">
                                                        <td width="540" align="center" valign="top" style="padding:0;Margin:0;">
                                                            <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                                <tr style="border-collapse:collapse;">
                                                                    <td align="center" style="padding:0;Margin:0;">
                                                                        <h1 style="Margin:0;line-height:36px;mso-line-height-rule:exactly;font-family:tahoma, verdana, segoe, sans-serif;font-size:30px;font-style:normal;font-weight:bold;color:#212121;">Привет, дорогой игрок!</h1>
                                                                    </td>
                                                                </tr>
                                                                <tr style="border-collapse:collapse;">
                                                                    <td align="center" style="padding:0;Margin:0;padding-top:20px;">
                                                                        <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;color:#131313;">Для твоего аккаунта было запрошено изменение пароля.</p>
                                                                        <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;color:#131313;">Если ты этого не делал, не переживай, твой аккаунт в безопасности. Ключ для изменения пароля будет обнулён через 5 часов.</p>
                                                                        <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;color:#131313;">На случай, если это всё же был ты, вот код:</p>
                                                                        <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;color:#131313;">` + token + `</p>
                                                                    </td>
                                                                </tr>
                                                                <tr style="border-collapse:collapse;">
                                                                    <td align="center" style="padding:0;Margin:0;">
                                                                        <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;color:#131313;">Хотите интеграцию своего проекта в нашей системе? Напишите нам!</p>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                        <table cellpadding="0" cellspacing="0" class="es-footer" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:#F6F6F6;background-repeat:repeat;background-position:center top;">
                            <tr style="border-collapse:collapse;">
                                <td align="center" style="padding:0;Margin:0;background-image:url(https://i.imgur.com/YuK217x.jpg);background-repeat:no-repeat;background-position:left top;" background="https://i.imgur.com/YuK217x.jpg">
                                    <table class="es-footer-body" width="600" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;">
                                        <tr style="border-collapse:collapse;">
                                            <td align="left" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;">
                                                <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                    <tr style="border-collapse:collapse;">
                                                        <td width="560" valign="top" align="center" style="padding:0;Margin:0;">
                                                            <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                                <tr style="border-collapse:collapse;">
                                                                    <td style="padding:0;Margin:0;">
                                                                        <table class="es-menu" width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                                            <tr class="links" style="border-collapse:collapse;">
                                                                                <td style="Margin:0;padding-left:5px;padding-right:5px;padding-top:0px;padding-bottom:0px;border:0;" id="esd-menu-id-0" width="25%" bgcolor="transparent" align="center"><a target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;font-size:16px;text-decoration:none;display:block;color:#000000;"
                                                                                        href="https://uprojects.su">Сайт системы</a></td>
                                                                                <td style="Margin:0;padding-left:5px;padding-right:5px;padding-top:0px;padding-bottom:0px;border:0;border-left:1px solid #000000;" id="esd-menu-id-1" esdev-border-color="#ffffff" width="25%" bgcolor="transparent" align="center"><a target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;font-size:16px;text-decoration:none;display:block;color:#000000;"
                                                                                        href="` + cfg.projects[project].settings.mail.vk_url + `">VK проекта</a></td>
                                                                                <td style="Margin:0;padding-left:5px;padding-right:5px;padding-top:0px;padding-bottom:0px;border:0;border-left:1px solid #000000;" id="esd-menu-id-2" esdev-border-color="#ffffff" width="25%" bgcolor="transparent" align="center"><a target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;font-size:16px;text-decoration:none;display:block;color:#000000;"
                                                                                        href="` + cfg.projects[project].settings.mail.discord_url + `">Discord проекта</a></td>
                                                                                <td style="Margin:0;padding-left:5px;padding-right:5px;padding-top:0px;padding-bottom:0px;border:0;border-left:1px solid #000000;" id="esd-menu-id-2" esdev-border-color="#ffffff" width="25%" bgcolor="transparent" align="center"><a target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;font-size:16px;text-decoration:none;display:block;color:#000000;"
                                                                                        href="https://vk.com/uprojects.official">VK системы</a></td>
                                                                            </tr>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr style="border-collapse:collapse;">
                                            <td align="left" style="Margin:0;padding-top:10px;padding-bottom:15px;padding-left:20px;padding-right:20px;">
                                                <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                    <tr style="border-collapse:collapse;">
                                                        <td width="560" valign="top" align="center" style="padding:0;Margin:0;">
                                                            <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                                <tr style="border-collapse:collapse;">
                                                                    <td align="center" style="padding:0;Margin:0;padding-top:10px;">
                                                                        <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:19px;color:#131313;">Copyright @UProjects</p>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>
    </body>
    
    </html>
    `
        });
        console.log("ban");

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }

    if (method == 1) {
        let message =
            `
          Привет, дорогой игрок!
          Для твоего аккаунта было запрошено изменение пароля.

          Если ты этого не делал, не переживай, твой аккаунт в безопасности. Ключ для изменения пароля будет обнулён через 5 часов.

          На случай, если это всё же был ты, вот код:

          ` + token;
        var randomNumber = '';
        for (var i = 0; i < 19; i++) {
            randomNumber += Math.floor(Math.random() * 10);
        }
        let params = "user_id=" + user.vk_id + "&random_id=" + randomNumber + "&message=" + message + "&v=5.100";
        let vktoken = "access_token=" + cfg.projects[project].settings.mail.vk_group_key;

        console.log(encodeURI('https://api.vk.com/method/messages.send?' + params + "&" + vktoken));

        request(encodeURI('https://api.vk.com/method/messages.send?' + params + "&" + vktoken), function (err, response, body) {
            if (err)
                console.log(err);
            if (response) {
                console.log(JSON.parse(response.body));
            }
        });
    }

    if (method == 2) {
        const embed = new dc.MessageEmbed()
            .setColor('#d1d1d1')
            .setAuthor('UProjects | система уведомлений', 'https://i.imgur.com/3MBVh77.png', 'https://uprojects.su')
            .setDescription('Привет, дорогой игрок!\n\nДля твоего аккаунта было запрошено изменение пароля.\n\nЕсли ты этого не делал, не переживай, твой аккаунт в безопасности. Ключ будет обнулён через 5 часов.')
            .addField('На случай, если это всё же был ты, вот код:', '``` ' + token + ' ```', true)
            .setTimestamp()
            .setFooter('© UProjects | l_nik801_l (https://vk.com/l_nik801_l)');

        discord.instance("#main").users.fetch(user.discord_id).then((u) => {
            const lE = embed;
            u.send(lE);
        });

    }

}

async function sendRegEmail(user, token, project) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass // generated ethereal password
        }
    });



    let info = await transporter.sendMail({
        from: '"UProjects 👻" <noreply@uprojects.su>', // sender address
        to: user, // list of receivers
        subject: "Регистрация аккаунта | UProjects ✔", // Subject line
        html: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html style="width:100%;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0;">
      
      <head>
          <meta charset="UTF-8">
          <meta content="width=device-width, initial-scale=1" name="viewport">
          <meta name="x-apple-disable-message-reformatting">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta content="telephone=no" name="format-detection">
          <title>Регистрация в системе UProjects</title>
          <link href="https://fonts.googleapis.com/css?family=Roboto:400,400i,700,700i" rel="stylesheet">
          <!--<![endif]-->
          <style type="text/css">
              @media only screen and (max-width:600px) {
                  .st-br {
                      padding-left: 10px!important;
                      padding-right: 10px!important
                  }
                  p,
                  ul li,
                  ol li,
                  a {
                      font-size: 16px!important;
                      line-height: 150%!important
                  }
                  h1 {
                      font-size: 28px!important;
                      text-align: center;
                      line-height: 120%!important
                  }
                  h2 {
                      font-size: 24px!important;
                      text-align: center;
                      line-height: 120%!important
                  }
                  h3 {
                      font-size: 20px!important;
                      text-align: center;
                      line-height: 120%!important
                  }
                  h1 a {
                      font-size: 28px!important;
                      text-align: center
                  }
                  h2 a {
                      font-size: 24px!important;
                      text-align: center
                  }
                  h3 a {
                      font-size: 20px!important;
                      text-align: center
                  }
                  .es-menu td a {
                      font-size: 14px!important
                  }
                  .es-header-body p,
                  .es-header-body ul li,
                  .es-header-body ol li,
                  .es-header-body a {
                      font-size: 16px!important
                  }
                  .es-footer-body p,
                  .es-footer-body ul li,
                  .es-footer-body ol li,
                  .es-footer-body a {
                      font-size: 14px!important
                  }
                  .es-infoblock p,
                  .es-infoblock ul li,
                  .es-infoblock ol li,
                  .es-infoblock a {
                      font-size: 12px!important
                  }
                  *[class="gmail-fix"] {
                      display: none!important
                  }
                  .es-m-txt-c,
                  .es-m-txt-c h1,
                  .es-m-txt-c h2,
                  .es-m-txt-c h3 {
                      text-align: center!important
                  }
                  .es-m-txt-r,
                  .es-m-txt-r h1,
                  .es-m-txt-r h2,
                  .es-m-txt-r h3 {
                      text-align: right!important
                  }
                  .es-m-txt-l,
                  .es-m-txt-l h1,
                  .es-m-txt-l h2,
                  .es-m-txt-l h3 {
                      text-align: left!important
                  }
                  .es-m-txt-r img,
                  .es-m-txt-c img,
                  .es-m-txt-l img {
                      display: inline!important
                  }
                  .es-button-border {
                      display: block!important
                  }
                  a.es-button {
                      font-size: 16px!important;
                      display: block!important;
                      border-left-width: 0px!important;
                      border-right-width: 0px!important
                  }
                  .es-btn-fw {
                      border-width: 10px 0px!important;
                      text-align: center!important
                  }
                  .es-adaptive table,
                  .es-btn-fw,
                  .es-btn-fw-brdr,
                  .es-left,
                  .es-right {
                      width: 100%!important
                  }
                  .es-content table,
                  .es-header table,
                  .es-footer table,
                  .es-content,
                  .es-footer,
                  .es-header {
                      width: 100%!important;
                      max-width: 600px!important
                  }
                  .es-adapt-td {
                      display: block!important;
                      width: 100%!important
                  }
                  .adapt-img {
                      width: 100%!important;
                      height: auto!important
                  }
                  .es-m-p0 {
                      padding: 0px!important
                  }
                  .es-m-p0r {
                      padding-right: 0px!important
                  }
                  .es-m-p0l {
                      padding-left: 0px!important
                  }
                  .es-m-p0t {
                      padding-top: 0px!important
                  }
                  .es-m-p0b {
                      padding-bottom: 0!important
                  }
                  .es-m-p20b {
                      padding-bottom: 20px!important
                  }
                  .es-mobile-hidden,
                  .es-hidden {
                      display: none!important
                  }
                  .es-desk-hidden {
                      display: table-row!important;
                      width: auto!important;
                      overflow: visible!important;
                      float: none!important;
                      max-height: inherit!important;
                      line-height: inherit!important
                  }
                  .es-desk-menu-hidden {
                      display: table-cell!important
                  }
                  table.es-table-not-adapt,
                  .esd-block-html table {
                      width: auto!important
                  }
                  table.es-social {
                      display: inline-block!important
                  }
                  table.es-social td {
                      display: inline-block!important
                  }
              }
              
              .rollover:hover .rollover-first {
                  max-height: 0px!important;
                  display: none!important;
              }
              
              .rollover:hover .rollover-second {
                  max-height: none!important;
                  display: block!important;
              }
              
              #outlook a {
                  padding: 0;
              }
              
              .ExternalClass {
                  width: 100%;
              }
              
              .ExternalClass,
              .ExternalClass p,
              .ExternalClass span,
              .ExternalClass font,
              .ExternalClass td,
              .ExternalClass div {
                  line-height: 100%;
              }
              
              .es-button {
                  mso-style-priority: 100!important;
                  text-decoration: none!important;
              }
              
              a[x-apple-data-detectors] {
                  color: inherit!important;
                  text-decoration: none!important;
                  font-size: inherit!important;
                  font-family: inherit!important;
                  font-weight: inherit!important;
                  line-height: inherit!important;
              }
              
              .es-desk-hidden {
                  display: none;
                  float: left;
                  overflow: hidden;
                  width: 0;
                  max-height: 0;
                  line-height: 0;
                  mso-hide: all;
              }
              
              .es-button-border:hover {
                  border-style: solid solid solid solid!important;
                  background: #d6a700!important;
                  border-color: #42d159 #42d159 #42d159 #42d159!important;
              }
              
              .es-button-border:hover a.es-button {
                  background: #d6a700!important;
                  border-color: #d6a700!important;
              }
              
              td .es-button-border:hover a.es-button-1 {
                  background: #4c4c4c!important;
                  border-color: #4c4c4c!important;
              }
              
              td .es-button-border-2:hover {
                  background: #4c4c4c!important;
              }
          </style>
      </head>
      
      <body style="width:100%;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0;">
          <div class="es-wrapper-color" style="background-color:#F6F6F6;">
              <!--[if gte mso 9]>
            <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
              <v:fill type="tile" color="#f6f6f6"></v:fill>
            </v:background>
          <![endif]-->
              <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;">
                  <tr style="border-collapse:collapse;">
                      <td class="st-br" valign="top" style="padding:0;Margin:0;">
                          <table cellpadding="0" cellspacing="0" class="es-header" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top;">
                              <tr style="border-collapse:collapse;">
                                  <td align="center" style="padding:0;Margin:0;background-image:url(https://i.imgur.com/YEAxkT9.jpg);background-color:transparent;background-position:center bottom;background-repeat:no-repeat;" bgcolor="transparent" background="https://i.imgur.com/YEAxkT9.jpg">
                                      <div>
                                          <table bgcolor="transparent" class="es-header-body" align="center" cellpadding="0" cellspacing="0" width="600" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;">
                                              <tr style="border-collapse:collapse;">
                                                  <td align="left" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;">
                                                      <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                          <tr style="border-collapse:collapse;">
                                                              <td width="560" align="center" valign="top" style="padding:0;Margin:0;">
                                                                  <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                                      <tr style="border-collapse:collapse;">
                                                                          <td align="center" height="100" style="padding:0;Margin:0;"></td>
                                                                      </tr>
                                                                  </table>
                                                              </td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </table>
                                      </div>
                                  </td>
                              </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;">
                              <tr style="border-collapse:collapse;">
                                  <td align="center" bgcolor="transparent" style="padding:0;Margin:0;background-color:transparent;">
                                      <table bgcolor="transparent" class="es-content-body" align="center" cellpadding="0" cellspacing="0" width="600" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;">
                                          <tr style="border-collapse:collapse;">
                                              <td align="left" style="padding:0;Margin:0;padding-top:30px;padding-left:30px;padding-right:30px;border-radius:10px 10px 0px 0px;background-color:#FFFFFF;background-position:left bottom;" bgcolor="#ffffff">
                                                  <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                      <tr style="border-collapse:collapse;">
                                                          <td width="540" align="center" valign="top" style="padding:0;Margin:0;">
                                                              <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                                  <tr style="border-collapse:collapse;">
                                                                      <td align="center" style="padding:0;Margin:0;">
                                                                          <h1 style="Margin:0;line-height:36px;mso-line-height-rule:exactly;font-family:tahoma, verdana, segoe, sans-serif;font-size:30px;font-style:normal;font-weight:bold;color:#212121;">Привет, дорогой игрок!</h1>
                                                                      </td>
                                                                  </tr>
                                                                  <tr style="border-collapse:collapse;">
                                                                      <td align="center" style="padding:0;Margin:0;padding-top:20px;">
                                                                          <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;color:#131313;">Данный EMail был использован для регистрации на проекте ` + project + ` в системе UProjects.</p>
                                                                          <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;color:#131313;">Чтобы подтвердить свою регистрацию, нажми кнопку ниже.</p>
                                                                          <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;color:#131313;">Если это письмо ошибочно,&nbsp;аккаунт автоматически будет удалён&nbsp;через 5 часов.</p>
                                                                      </td>
                                                                  </tr>
                                                                  <tr style="border-collapse:collapse;">
                                                                      <td align="center" style="padding:10px;Margin:0;"><span class="es-button-border es-button-border-2" style="border-style:solid;border-color:#2CB543;background:#333333;border-width:0px;display:inline-block;border-radius:3px;width:auto;"><a href="` + cfg.projects[project].settings.mail.site_url + "/activate/" + token + `" class="es-button es-button-1" target="_blank" style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;font-size:18px;color:#FFFFFF;border-style:solid;border-color:#333333;border-width:10px 20px 10px 20px;display:inline-block;background:#333333;border-radius:3px;font-weight:normal;font-style:normal;line-height:22px;width:auto;text-align:center;">Активировать аккаунт</a></span></td>
                                                                  </tr>
                                                                  <tr style="border-collapse:collapse;">
                                                                      <td align="center" style="padding:0;Margin:0;">
                                                                          <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;color:#131313;">Хотите интеграцию своего проекта в нашей системе? Напишите нам!</p>
                                                                      </td>
                                                                  </tr>
                                                              </table>
                                                          </td>
                                                      </tr>
                                                  </table>
                                              </td>
                                          </tr>
                                      </table>
                                  </td>
                              </tr>
                          </table>
                          <table cellpadding="0" cellspacing="0" class="es-footer" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:#F6F6F6;background-repeat:repeat;background-position:center top;">
                              <tr style="border-collapse:collapse;">
                                  <td align="center" style="padding:0;Margin:0;background-image:url(https://i.imgur.com/YuK217x.jpg);background-repeat:no-repeat;background-position:left top;" background="https://i.imgur.com/YuK217x.jpg">
                                      <table class="es-footer-body" width="600" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;">
                                          <tr style="border-collapse:collapse;">
                                              <td align="left" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;">
                                                  <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                      <tr style="border-collapse:collapse;">
                                                          <td width="560" valign="top" align="center" style="padding:0;Margin:0;">
                                                              <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                                  <tr style="border-collapse:collapse;">
                                                                      <td style="padding:0;Margin:0;">
                                                                          <table class="es-menu" width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                                              <tr class="links" style="border-collapse:collapse;">
                                                                                  <td style="Margin:0;padding-left:5px;padding-right:5px;padding-top:0px;padding-bottom:0px;border:0;" id="esd-menu-id-0" width="25%" bgcolor="transparent" align="center"><a target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;font-size:16px;text-decoration:none;display:block;color:#000000;"
                                                                                          href="https://uprojects.su">Сайт системы</a></td>
                                                                                  <td style="Margin:0;padding-left:5px;padding-right:5px;padding-top:0px;padding-bottom:0px;border:0;border-left:1px solid #000000;" id="esd-menu-id-1" esdev-border-color="#ffffff" width="25%" bgcolor="transparent" align="center"><a target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;font-size:16px;text-decoration:none;display:block;color:#000000;"
                                                                                          href="` + cfg.projects[project].settings.mail.vk_url + `">VK проекта</a></td>
                                                                                  <td style="Margin:0;padding-left:5px;padding-right:5px;padding-top:0px;padding-bottom:0px;border:0;border-left:1px solid #000000;" id="esd-menu-id-2" esdev-border-color="#ffffff" width="25%" bgcolor="transparent" align="center"><a target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;font-size:16px;text-decoration:none;display:block;color:#000000;"
                                                                                          href="` + cfg.projects[project].settings.mail.discord_url + `">Discord проекта</a></td>
                                                                                  <td style="Margin:0;padding-left:5px;padding-right:5px;padding-top:0px;padding-bottom:0px;border:0;border-left:1px solid #000000;" id="esd-menu-id-2" esdev-border-color="#ffffff" width="25%" bgcolor="transparent" align="center"><a target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;font-size:16px;text-decoration:none;display:block;color:#000000;"
                                                                                          href="https://vk.com/uprojects.official">VK системы</a></td>
                                                                              </tr>
                                                                          </table>
                                                                      </td>
                                                                  </tr>
                                                              </table>
                                                          </td>
                                                      </tr>
                                                  </table>
                                              </td>
                                          </tr>
                                          <tr style="border-collapse:collapse;">
                                              <td align="left" style="Margin:0;padding-top:10px;padding-bottom:15px;padding-left:20px;padding-right:20px;">
                                                  <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                      <tr style="border-collapse:collapse;">
                                                          <td width="560" valign="top" align="center" style="padding:0;Margin:0;">
                                                              <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                                                                  <tr style="border-collapse:collapse;">
                                                                      <td align="center" style="padding:0;Margin:0;padding-top:10px;">
                                                                          <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:19px;color:#131313;">Copyright @UProjects</p>
                                                                      </td>
                                                                  </tr>
                                                              </table>
                                                          </td>
                                                      </tr>
                                                  </table>
                                              </td>
                                          </tr>
                                      </table>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr>
              </table>
          </div>
      </body>
      
      </html>
      `
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...


}