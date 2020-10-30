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