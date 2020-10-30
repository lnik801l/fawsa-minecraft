import { VK, Keyboard, Updates } from 'vk-io';

enum commands {
    faq,
    open_site,
    call_support,

}

interface payload {
    command: commands
}

class vk_bot {

    private updates: Updates;

    constructor(vk_i: VK) {
        this.updates = vk_i.updates;
        this.init();
    }

    private init() {

    }
}

export default vk_bot;