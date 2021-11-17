import { LocalStorage } from "node-localstorage";

const BASE_DIR = './data/cache';

const storage: LocalStorage = new LocalStorage(BASE_DIR);

export interface CacheData {
    data: any;
    datetime: number;
};

class DefaultCacheDate implements CacheData {
    data: undefined;
    datetime: number = Date.now();
}

function safe_get_cache(cache_ident: string): CacheData {
    const item = storage.getItem(cache_ident);
    const stat: CacheData = item === null ? new DefaultCacheDate() : JSON.parse(item);
    return stat;
}

export function get_cache(cache_ident: string, def: CacheData = new DefaultCacheDate()): CacheData {
    const cache = safe_get_cache(cache_ident);

    if(cache.data !== undefined)
        return cache;
    return def;
}

export function set_cache(cache_ident: string, state: CacheData): void {
    storage.setItem(cache_ident, JSON.stringify(state));
}

export function remove_cache(cache_ident: string) {
    storage.removeItem(cache_ident);
}