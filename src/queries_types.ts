export interface auth_register {
    username: string,
    password: string,
    email: string,
    refer?: string
}
export interface auth_get {
    username: string,
    password: string
}
export interface skins_set {
    type: "skin" | "cloak",
    payload: string
}
export interface skins_remove {
    type: "skin" | "cloak"
}