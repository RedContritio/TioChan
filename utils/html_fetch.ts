import request from 'request';
import { parse, HTMLElement } from 'node-html-parser';
import { resolve } from 'path/posix';

export async function fetch_raw(url: string) : Promise<any> {
    return new Promise((resolve, reject) => {
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                try {
                    resolve(body);
                } catch (e) {
                    reject(e);
                }
            } else {
                reject(`${error} ${response.statusCode}`);
            }
        });
    });
}

export async function fetch_page(url: string) : Promise<HTMLElement> {
    return fetch_raw(url).then(
        (body: any) => parse(body)
    );
}