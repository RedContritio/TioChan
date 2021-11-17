import { LocalStorage } from "node-localstorage";

const BASE_DIR = './data/friend';

const storage: LocalStorage = new LocalStorage(BASE_DIR);

function safe_get_friend_data(friend_uin: number): {[key: string]: string} {
    const item = storage.getItem(friend_uin.toString());
    const stat: {[key: number]: string} = item === null ? {} : JSON.parse(item);
    return stat;
}

export function get_friend_data(friend_uin: number, key: string, def: any = undefined): any {
    const dict = safe_get_friend_data(friend_uin);

    if(key in dict)
        return dict[key];
    return def;
}

export function set_friend_data(friend_uin: number, key: string, state: any): void {
    const dict = safe_get_friend_data(friend_uin);

    dict[key] = state;

    storage.setItem(friend_uin.toString(), JSON.stringify(dict));
    // console.log(safe_get_friend_data(friend_uin));
}