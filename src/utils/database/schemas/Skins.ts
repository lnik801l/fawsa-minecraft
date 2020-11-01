import { prop } from '@typegoose/typegoose';
import * as canvas from 'canvas';
import { skins_set } from '../../../queries_types';

export class Skins {

    @prop()
    private linked_uuid: string;

    @prop()
    private skin: string;

    @prop()
    private cloak: string;

    public construct(linked_uuid: string): Skins {
        if (this.linked_uuid != null)
            throw new Error('that skins is already constructed!');
        this.linked_uuid = linked_uuid;
        return this;
    }

    public getSkin() {
        return this.skin;
    }

    public getCloak() {
        return this.cloak;
    }

    public async setData(params: skins_set): Promise<void> {
        if (params.type == 'skin') {
            await this.setSkin(params.payload);
        }
        if (params.type == 'cloak') {
            await this.setCloak(params.payload);
        }
    }

    public removeSkin() {
        this.skin = '';
    }

    public removeCloak() {
        this.cloak = '';
    }

    private async setSkin(base64: string): Promise<void> {
        let img: canvas.Image = await canvas.loadImage(base64);

        if (this.isSkinCorrect(img)) {
            this.skin = base64.replace(/^data:image\/png;base64, /, "");
            return;
        }
        else throw new Error('неверный формат скина!');
    }

    private async setCloak(base64: string) {
        let img: canvas.Image;
        try {
            img = await canvas.loadImage(base64);
        } catch (err) {
            throw 'повреждённое изображение!'
        }
        if (this.isCloakCorrect(img)) return this.cloak = base64.replace(/^data:image\/png;base64,/, "");
        else throw 'неверный формат скина!';
    }

    private isSkinCorrect(image: canvas.Image): boolean {
        if (image.width == 64 && image.height == 64)
            return true;
        if (image.width == 128 && image.height == 64)
            return true;
        if (image.width == 256 && image.height == 128)
            return true;
        if (image.width == 512 && image.height == 256)
            return true;
        if (image.width == 1024 && image.height == 512)
            return true;
        return false;
    }

    private isCloakCorrect(image: canvas.Image): boolean {
        if (image.width == 22 && image.height == 17)
            return true;
        if (image.width == 64 && image.height == 32)
            return true;
        if (image.width == 64 && image.height == 64)
            return true;
        if (image.width == 128 && image.height == 64)
            return true;
        if (image.width == 256 && image.height == 128)
            return true;
        if (image.width == 512 && image.height == 256)
            return true;
        if (image.width == 1024 && image.height == 512)
            return true;
        return false;
    }

    private getPart(src: canvas.Image, x: number, y: number, width: number, height: number, scale: number) {
        const cnv = canvas.createCanvas(scale * width, scale * height);
        const ctx = cnv.getContext('2d');
        ctx.patternQuality = "fast";
        ctx.drawImage(src, x, y, width, height, 0, 0, width * scale, height * scale);
        return cnv;
    }
}