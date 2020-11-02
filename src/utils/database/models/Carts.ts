export default class Carts {
    private linked_user_id: string;
    private linked_projectname: string;
    private linked_servername: string;
    private items: {
        [name: string]: item
    } = {};
    private bought_items: {
        [name: string]: item
    } = {};

    public addItems(items: { [name: string]: item }) {
        for (const i in items) {
            if (this.items[i].count)
                this.items[i].count += items[i].count;
            else
                this.items[i] = items[i];
        }
    }
    public addBoughtItems(items: { [name: string]: item }) {
        for (const i in items) {
            if (this.bought_items[i].count)
                this.bought_items[i].count += items[i].count;
            else
                this.bought_items[i] = items[i];
        }
    }

    public buyCart() {
        this.addBoughtItems(this.items);
        this.items = {};
    }
}

export interface item {
    itemstack: {
        registry_name: string,
        damage: number,
        itemstack_nbt: string,
        capabilities_nbt: string
    },
    count: number,
    price: number,
    discount: number
}