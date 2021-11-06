import fs from 'fs';
import path from 'path';
import md5 from 'md5';
import { uin } from '../config';

export class LocalStorage {
    static basedir = path.join('data', 'localstorage');
    static create_dir() {
        if(!fs.existsSync(this.basedir))
            fs.mkdirSync(this.basedir);
    }

    static get(key: string, def: any = {}): any {
        try {
            const filename = md5(key) + '.json';
            const filepath = path.join(LocalStorage.basedir, filename);
            if(!fs.existsSync(filepath))
                return def;
            const buffer: Buffer = fs.readFileSync(filepath);
            const obj = JSON.parse(buffer.toString('utf-8'));
            return obj;
        } catch (error) {
            console.log(error);
            return def;
        }
    }

    static set(key: string, obj: any): void {
        try {
            LocalStorage.create_dir();
            const filename = md5(key) + '.json';
            const filepath = path.join(LocalStorage.basedir, filename);
            fs.writeFileSync(filepath, JSON.stringify(obj));
        } catch (error) {
            console.log(error);
        }
        console.log(JSON.stringify(obj));
    }
}