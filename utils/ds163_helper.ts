import { resolve } from "path";
import { fetch_page, fetch_raw } from "./html_fetch";
import { parse, HTMLElement } from 'node-html-parser';

const config = {
    base_url: 'https://ds.163.com/',
    article_prefix: 'https://ds.163.com/article/',
    topic_prefix: 'https://ds.163.com/topic/',
};

const up_id = '94c216523d214b499dc10b0506483651';

export interface ITopicCard {
    href: string;
    article_id: string;
    content: string | undefined;
}

export class TopicCard {
    static async fetch(topic: string, predicate: (content: ITopicCard) => boolean): Promise<ITopicCard[]> {
        const url = encodeURI(`${config.topic_prefix}${topic}/`);

        console.log(url);

        return new Promise((resolve, reject) => fetch_page(url).then(
            (root: HTMLElement) => {
                const cards = root.querySelectorAll('.feed-card');
                const cards_data = cards.map((card: HTMLElement) => {
                    const href = (card.firstChild as HTMLElement).attrs.href;
                    const content = card.querySelector('.feed-text')?.text;
                    const article_id = href.split('/')[2];

                    return {
                        href,
                        article_id,
                        content
                    }
                });
                
                resolve(cards_data.filter((card) => predicate(card)));
            }
        ));
    }
}

export interface IArticle {
    tasks: string[];
    cake_urls: string[];
    season_urls: string[];
}

type article_parse_state = 'init' | 'task' | 'cake' | 'season';
export class Article {

    static async fetch(article_id: string): Promise<IArticle> {
        const url = `${config.article_prefix}${article_id}`;

        return new Promise((resolve, reject) => fetch_page(url).then((root: HTMLElement) => {
            const article_card = root.querySelector('.feed-article .feed-article__content');
            const ps = article_card?.querySelectorAll('p');

            let state: article_parse_state = 'init';
            let tasks: string[] = [];
            let cake_urls: string[] = [];
            let season_urls: string[] = [];

            ps?.forEach((p: HTMLElement) => {
                if (p.text.includes('任务攻略')) {
                    state = 'task';
                } else if (p.text.startsWith('大蜡攻略')) {
                    state = 'cake';
                } else if (p.text.startsWith('季节烛火攻略')) {
                    state = 'season';
                } else {
                    const img = p.querySelector('img')?.attrs.src;
                    switch (state) {
                        case 'task':
                            tasks.push(p.text);
                            break;
                        case 'cake':
                            if(img) {

                            }
                            cake_url = p.querySelector('a')?.attrs.href;
                            break;
                        case 'season':
                            break;
                        default:
                            break;
                    }
                }
            })

            console.log(article_card?.textContent)
        }));
    }
}