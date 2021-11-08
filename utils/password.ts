import crypto from 'crypto';
import { LocalStorage } from "node-localstorage";

const BASE_DIR = './data/password';

const storage: LocalStorage = new LocalStorage(BASE_DIR);

export function get_password(pwd_type: string): string | null {
    const pwd: string | null = storage.getItem(pwd_type);

    return pwd;
}

export function get_password_md5(pwd_type: string): string | null {
    const pwd: string | null = get_password(pwd_type);

    return pwd === null ? null : crypto.createHash('md5').update(pwd).digest('hex');
}

export function set_password(pwd_type: string, pwd: string): void {
    storage.setItem(pwd_type, pwd);
}

export default { get_password, get_password_md5, set_password};