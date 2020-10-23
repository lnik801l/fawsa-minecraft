module.exports = {
    send: function (userid, text, token, keyboard) {
        const { VK } = require('vk-io');

        if (token == undefined) {
            console.log("ТОКЕН НУЛЛУ РАВЕН КСТА!");
            return;
        }

        const vk = new VK({
            token: token
        });

        if (keyboard == undefined) {
            try {
                vk.api.messages.send({ user_id: userid, message: text });
            } catch (error) {
                console.error('Error:', error);
            }
        } else {
            try {
                vk.api.messages.send({ user_id: userid, message: text, keyboard: keyboard });
            } catch (error) {
                console.error('Error:', error);
            }
        }

        vk.updates.start().catch(console.error);
        vk.updates.stop();

    }
}