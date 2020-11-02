import { projects } from '../../main';
import { cfg_projects_schema, cfg_servers_schema } from '../../utils/cfg_projects_types';
import * as mc_ping from 'minecraft-server-ping';
import { Logger } from '../../utils/Logger';
import request from 'request';


export interface server_info {
    isOnline: boolean,
    pending: boolean,
    online: number,
    online_max: number,
    version: string,
    offers_error: boolean,
    offers: { [name: string]: offer }
}

interface offer {
    itemstack: {
        registry_name: string,
        damage: number,
        itemstack_nbt: string,
        capabilities_nbt: string
    },
    count: number,
    price: number,
    discount: number,
    image: string
}

export default class serverdata {

    private static ticker: NodeJS.Timeout = null;
    private static logger: Logger = new Logger('serverdata');

    private static servers: {
        [projectname: string]: cfg_servers_schema
    } = {};
    public static data: {
        [projectname: string]: {
            [servername: string]: server_info
        }
    } = {};

    private static tick() {
        for (const p in serverdata.servers) {
            if (!serverdata.data[p])
                serverdata.data[p] = {};
            for (const s in serverdata.servers[p]) {
                if (!serverdata.data[p][s])
                    serverdata.data[p][s] = {} as server_info;
                const srv = serverdata.servers[p][s];
                const data = serverdata.data[p][s];
                if (!data.pending) {
                    serverdata.get_offers(srv.offer_server_url, serverdata.data[p][s]);
                    serverdata.ping_srv(srv.host, srv.port, serverdata.data[p][s]);
                }
            }
        }
    }

    private static async ping_srv(host: string, port: number, info: server_info) {
        try {
            info.pending = true;
            const data = await mc_ping.ping(host, port);
            info.online = data.players.online;
            info.online_max = data.players.max;
            info.version = data.version.name;
            info.isOnline = true;
            info.pending = false;
        } catch (err) {
            info.isOnline = false;
            info.pending = false;
        }

    }

    private static async get_offers(uri: string, info: server_info) {
        request({
            method: 'GET',
            url: uri
        }, (err, _res, body) => {
            if (err) {
                console.log(err);
                return info.offers_error = true;
            }
            info.offers = JSON.parse(body) as { [name: string]: offer };
            return info.offers_error = false;
        })
    }

    constructor() {
        const p = projects.params as cfg_projects_schema;
        for (const param in p) {
            if (p[param] != undefined) {
                serverdata.servers[param] = p[param].servers;
            }
        }
        if (serverdata.ticker == null) {
            serverdata.ticker = setInterval(serverdata.tick, 5000);
            serverdata.tick();
        }
    }
}