var adminmessage = require("./vk/blankmessage").send;

var message = require("./vk/blankmessage").send;


var introkey = Keyboard.keyboard([
    Keyboard.textButton({
        label: 'Начать',
        payload: {
            command: 'start'
        },
        color: Keyboard.PRIMARY_COLOR
    })
]);

updates.on("join_group_member", async (next) => {
    message(next.userId, "Привет, дорогой игрок! Если тебя что-то интересует, или ты просто хочешь получить какую-то информацию по нашему проекту, нажми кнопку \"Начать\"", project.settings.mail.vk_group_key, introkey);
});

var mainkeyboard = Keyboard.keyboard([
    [
        Keyboard.textButton({
            label: 'Начать играть',
            payload: {
                command: 'startplay'
            },
            color: Keyboard.PRIMARY_COLOR
        }),
        Keyboard.textButton({
            label: 'Сообщить о баге / дюпе',
            payload: {
                command: 'dupe'
            },
            color: Keyboard.PRIMARY_COLOR
        })
    ],
    [
        Keyboard.textButton({
            label: 'Предложить сотрудничество',
            payload: {
                command: 'cooperation'
            },
            color: Keyboard.PRIMARY_COLOR
        })/*,
        Keyboard.textButton({
            label: 'Где узнать список модов?',
            payload: {
                command: 'modlist'
            },
            color: Keyboard.PRIMARY_COLOR
        })*/
    ],
    Keyboard.textButton({
        label: 'У меня проблема! Что делать?',
        payload: {
            command: 'faq'
        },
        color: Keyboard.PRIMARY_COLOR
    })
]);

updates.hear('Начать', async (context) => {
    await context.send({
        message: `
            Что ты хочешь сделать?
        `,
        keyboard: mainkeyboard
    });
});

updates.hear('/start', async (context) => {
    await context.send({
        message: `
            Что ты хочешь сделать?
        `,
        keyboard: mainkeyboard
    });
});

updates.hear('Главное меню', async (context) => {
    await context.send({
        message: `
            Что ты хочешь сделать?
        `,
        keyboard: mainkeyboard
    });
});

updates.hear('Начать играть', async (context) => {
    await context.send({
        message: `
        Начать игру на нашем проекте очень просто, достаточно выполнить лишь несколько шагов:
        
        1) Зарегистрируйтесь на нашем сайте:
        https://candycraft.su/start
        2) Скачайте лаунчер:
        https://candycraft.su/CandyCraft.exe
        3) Выберите сервер для игры
        (в данный момент есть только Клаустрофобия =) )
        4) Играйте!
        
        Если у Вас возникли вопросы, Вы всегда можете обратиться к нашему боту за помощью. 
        `
    });
});

updates.hear('Сообщить о баге / дюпе', async (context) => {
    await context.send({
        message: `
        Для начала давайте определимся, что именно Вы хотите нам сообщить, 
        после чего выберите на клавиатуре соответствующую кнопку, напишите сообщение
        и оно сразу будет отправлено нашей администрации. Выбирайте категорию правильно.

        ***Баг (клиента):***
        
        Если у Вас вылетел клиент или он делает это слишком часто, следуйте инструкции ниже
        1) Нажмите на кнопку "ПОЛУЧИТЬ ССЫЛКУ" в самой игре, скриншот прикреплен ниже 
        (в 99% случаев майнкрафт не закрывается сразу, давая возможность не запускать игру заново)
        2) напишите сюда по следующей форме:

        1. ссылка на ваш краш (полученная в пункте 1)
        2. как повторить данный вылет (желательно подробно и кратко)

        ваше сообщение останется без ответа, если Вы написали его без соответствия форме.

        ***Баг (сервера):***

        Опишите как можно подробнее Вашу проблему, а мы обязательно постараемся её исправить

        ***Дюп:***

        Если вы хотите сообщить нам о дюпе, мы обязательно с вами свяжемся (только оставьте ссылку на вк / DiscordID / имя пользователя в Telegram)

        Мы очень ценим наше комьюнити, поэтому можете быть уверены, за каждый слитый дюп вы будете щедро награждены (если, конечно, не успели задюпать весь сервер).

        Каждое сообщение будет отправлено Администрации проекта, поэтому пишите как можно грамотнее и понятнее
        `,
        keyboard: Keyboard.keyboard([
            [
                Keyboard.textButton({
                    label: 'Баг (клиента)',
                    payload: {
                        command: 'clientbug'
                    },
                    color: Keyboard.PRIMARY_COLOR
                }),
                Keyboard.textButton({
                    label: 'Баг (сервера)',
                    payload: {
                        command: 'serverbug'
                    },
                    color: Keyboard.PRIMARY_COLOR
                }),
                Keyboard.textButton({
                    label: 'Дюп',
                    payload: {
                        command: 'dupe'
                    },
                    color: Keyboard.PRIMARY_COLOR
                })
            ],
            Keyboard.textButton({
                label: 'Главное меню',
                payload: {
                    command: 'mainmenu'
                },
                color: Keyboard.PRIMARY_COLOR
            })
        ])
    });
});
//реакция на клавиатуру
updates.hear('Баг (клиента)', async (context) => {
    context.send(`
    А теперь напишите то, что хотели нам сообщить по формам выше в виде
    Названиеформы: Текст

    Например: 

    Баг (клиента) 
    1. https://example.com/123123123
    2. нужно взять верстак в руку, поставить его и майнкрафт вылетит

    Если вы всё напишете правильно в одном из следующих сообщений, 
    то в случае успеха вы получите ответное сообщение.
    `)
});

updates.hear('Баг (сервера)', async (context) => {
    context.send(`
    А теперь напишите то, что хотели нам сообщить по формам выше в виде
    Названиеформы: Текст

    Например:

    Баг (сервера) 
    описание: киркой из draconic evolution Не ломаются блоки, если включен режим копания 7x7

    Если вы всё напишете правильно в одном из следующих сообщений, 
    то в случае успеха вы получите ответное сообщение.
    `)
});

updates.hear('Дюп', async (context) => {
    context.send(`
    А теперь напишите то, что хотели нам сообщить по формам выше в виде
    Названиеформы: Текст

    Например:

    Дюп
    здесь описывать не буду, давайте свяжемся в дискорде.
    Мой дискорд: l_nik801_l#3122

    Если вы всё напишете правильно в одном из следующих сообщений, 
    то в случае успеха вы получите ответное сообщение.
    `)
});

updates.hear(/^Баг \(клиента\)\s{0,2}\n1\./gm, async (context) => {
    context.send(`
    Вы всё сделали правильно!
    Если ваше сообщение соответствует форме, Администрация в скором времени ответит вам.
    `);
    var user = await vk.api.users.get({
        user_ids: context.senderId
    });
    var text = `Пользователь ` + user[0].first_name + ` ` + user[0].last_name + ` написал багрепорт на тему \"Баг (клиента)\".
    Ссылка на диалог: https://vk.com/gim` + p_group_id + `?sel=` + context.senderId + `
    
    Текст сообщения: 
    ` + context.text;

    project.settings.vk_group_admins.forEach(function (element) {
        adminmessage(element, text, project.settings.mail.vk_group_key);
    });
});

updates.hear(/^Баг \(сервера\)\s{0,2}\nописание:/gm, async (context) => {
    context.send(`
    Вы всё сделали правильно!
    Если ваше сообщение соответствует форме, Администрация в скором времени ответит вам.
    `);
    var user = await vk.api.users.get({
        user_ids: context.senderId
    });
    var text = `Пользователь ` + user[0].first_name + ` ` + user[0].last_name + ` написал багрепорт на тему \"Баг (сервера)\".
    Ссылка на диалог: https://vk.com/gim` + p_group_id + `?sel=` + context.senderId + `
    
    Текст сообщения: 
    ` + context.text;

    project.settings.vk_group_admins.forEach(function (element) {
        adminmessage(element, text, project.settings.mail.vk_group_key);
    });
});

updates.hear(/^Дюп\s{0,2}\n/gm, async (context) => {
    context.send(`
    Вы всё сделали правильно!
    Если ваше сообщение соответствует форме, Администрация в скором времени ответит вам.
    `);
    var user = await vk.api.users.get({
        user_ids: context.senderId
    });
    var text = `Пользователь ` + user[0].first_name + ` ` + user[0].last_name + ` написал багрепорт на тему \"Дюп\".
    Ссылка на диалог: https://vk.com/gim` + p_group_id + `?sel=` + context.senderId + `
    
    Текст сообщения: 
    ` + context.text;

    project.settings.vk_group_admins.forEach(function (element) {
        adminmessage(element, text, project.settings.mail.vk_group_key);
    });
});
/*
updates.hear('Где узнать список модов?', async (context) => {
    context.send(`
    Конечно на сайте!
    Скорее переходи по ссылке:
    https://spaceworld.tech/servers, чтобы получить самую свежую информацию о серверах!
    `)
});*/

updates.hear('Предложить сотрудничество', async (context) => {
    context.send(`
    У Вас есть предложение о сотрудничестве, которое может нас заинтересовать?

    Мы всегда готовы сотрудничать с креативными, опытными людьми, которые желают помогать проекту в любом виде

    Напишите как можно подробнее, как именно вы хотите с нами сотрудничать, а мы, в свою очередь, свяжемся с Вами как можно скорее.

    Обязательно пишите по примеру ниже:

    Хочу сотрудничать
    ваше предложение

    в случае успеха, вы получите ответное сообщение.
    `)
});

updates.hear(/^Хочу сотрудничать\s{0,2}\n/gm, async (context) => {
    context.send(`
    Вы всё сделали правильно!
    Если ваше предложение заинтересует нас, мы в скором времени ответит вам.
    `);
    var user = await vk.api.users.get({
        user_ids: context.senderId
    });
    var text = `Пользователь ` + user[0].first_name + ` ` + user[0].last_name + ` написал сообщение на тему \"Сотрудничество\".
    Ссылка на диалог: https://vk.com/gim` + p_group_id + `?sel=` + context.senderId + `
    
    Текст сообщения: 
    ` + context.text;

    project.settings.vk_group_admins.forEach(function (element) {
        adminmessage(element, text, project.settings.mail.vk_group_key);
    });
});

updates.hear('У меня проблема! Что делать?', async (context) => {
    await context.send({
        message: `
        К сожалению, FAQ пока не готов.
        `,
        keyboard: Keyboard.keyboard([
            Keyboard.textButton({
                label: 'Главное меню',
                payload: {
                    command: 'mainmenu'
                },
                color: Keyboard.PRIMARY_COLOR
            })
        ])
    });
});