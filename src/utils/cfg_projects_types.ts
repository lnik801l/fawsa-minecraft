export interface vk_cfg_schema {
    url: string,
    group_key: string,
    group_id: number,
    group_admins: Array<string>,
    news_to_discord: boolean,
    bot: boolean,
    login_redirect_uri: string,
    link_redirect_uri: string,
    news_discord_channel_id: string
}

export interface discord_cfg_schema {
    url: string,
    guild_id: string
}

export interface cfg_rewards_params {
    mctop_secret: string,
    topcraft_secret: string,
    fairtop_secret: string
}

export interface cfg_servers_schema {
    [servername: string]: {
        offer_server_url: string,
        host: string,
        port: number
    }
}

export interface cfg_projects_schema {
    [projectname: string]: {
        url: string,
        vk: vk_cfg_schema,
        discord: discord_cfg_schema,
        rewards_params: cfg_rewards_params,
        servers: cfg_servers_schema
    }
}