import { accessSync } from "fs";
import { LocalStorage } from "node-localstorage";
import path from "path";

const BASE_DIR = './data/group_switch';

const storage: LocalStorage = new LocalStorage(BASE_DIR);

function safe_get_group_switch_dict(switch_ident: string): {[key: string]: boolean} {
    const item = storage.getItem(switch_ident);
    const stat: {[key: number]: boolean} = item === null ? {} : JSON.parse(item);
    return stat;
}

export function get_group_switch(group_id: number, switch_ident: string): boolean {
    const dict = safe_get_group_switch_dict(switch_ident);

    if(group_id in dict && dict[group_id] === true) {
        return true;
    }
    return false;
}

export function set_group_switch(group_id: number, switch_ident: string, state: boolean): void {
    const dict = safe_get_group_switch_dict(switch_ident);

    dict[group_id] = state;

    console.log('dict', dict);

    storage.setItem(switch_ident, JSON.stringify(dict));
    console.log(storage.getItem(switch_ident));
}