"use strict"
const fs = require('fs');
const path = require('path');
const md5 = require('md5');
const { uin } = require('../config');

class LocalStorage {
    static basedir = path.join('data', 'localstorage');
    static create_dir() {
        if(!fs.existsSync(this.basedir))
            fs.mkdirSync(this.basedir);
    }

    static get(key, def = {}) {
        try {
            const filename = md5(key) + '.json';
            const filepath = path.join(LocalStorage.basedir, filename);
            if(!fs.existsSync(path))
                return def;
            const buffer = fs.readFileSync(filepath);
            const obj = JSON.parse(buffer);
            return obj;
        } catch (error) {
            console.log(error);
            return def;
        }
    }

    static set(key, obj) {
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

module.exports = LocalStorage;