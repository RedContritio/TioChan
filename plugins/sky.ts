import { assert } from 'console';
import request from 'request';
import { ArticleMeta, BilibiliArticleMetaResponse } from '../utils/bilibili_interfaces';

import { parse, HTMLElement } from 'node-html-parser';
import { segment, cqcode, CommonMessageEventData, PrivateMessageEventData, GroupMessageEventData } from 'oicq';
import { get_group_switch, set_group_switch } from "../utils/group_switch";
import { bot } from '..';
import { master } from '../config';
import { LocalStorage } from 'node-localstorage';

const ls_key = 'sky163';

const config = {
    article_up_id: '672840385',
    article_meta_url_prefix: 'https://api.bilibili.com/x/space/article?mid=',
    article_url_prefix: 'https://www.bilibili.com/read/cv',
};

class ImageShowData {
    title: string | undefined = undefined;
    url: string | undefined = undefined;
};

class DailyContent {
    constCakes: string | undefined = undefined;
    randomCakes: ImageShowData[] | undefined = undefined;
    seasonCandle: ImageShowData | undefined = undefined;
    tasks: ImageShowData | undefined = undefined;
}


const CACHE_DIR = './data/cache';

const storage: LocalStorage = new LocalStorage(CACHE_DIR);

class CachedData {
    month: number = -1;
    date: number = -1;
    daily_content: DailyContent = new DailyContent();
}

function InitialCacheRead(): CachedData {
    const s = storage.getItem(ls_key);
    if(s == null)
        return new CachedData();
    return JSON.parse(s);
}

let cached_data: CachedData = InitialCacheRead();

const article_meta_url: string = config.article_meta_url_prefix + config.article_up_id;

async function fetchArticleMetaData(callback: (article: ArticleMeta | null) => void) {
    const now: Date = new Date(Date.now());
    const expect_title = `光遇国服每日任务蜡烛位置(${now.getMonth() + 1}月${now.getDate()}日)`;
    // console.log(expect_title);
    await request(article_meta_url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            const res: BilibiliArticleMetaResponse = JSON.parse(body);
            const { data } = res;
            const { articles } = data;
            const valid = articles == null ? [] : articles.filter((p: ArticleMeta) => {
                return p && p.title == expect_title;
            });
            assert(valid.length === 1);
            if (valid.length >= 1) {
                callback(valid[0]);
            } else {
                callback(null);
            }
        } else {
            callback(null);
        }
    });
}

async function fetchTodayArticle(article_id: string, callback: ((succ: boolean) => void) | null = null) {
    const article_url = config.article_url_prefix + article_id;
    const get_figcaption_text = (e: HTMLElement) => e.querySelector('figcaption')?.text;
    const figure2imagedata = (e: HTMLElement): ImageShowData => {
        const showdata = new ImageShowData();
        showdata.title = get_figcaption_text(e);
        showdata.url = e.querySelector('img')?.getAttribute('data-src')
        return showdata;
    };

    await request(article_url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            const root = parse(response.body);
            const article = root.querySelector('#article-content');

            const constCake = article?.querySelectorAll('p').filter((e: HTMLElement) => e.text.includes('固定位置'));
            const figures = article?.querySelectorAll('figure');

            const CandlesCake = figures?.filter((element: HTMLElement) => get_figcaption_text(element)?.includes('蜡烛堆'));
            const SeasonCandle = figures?.filter((element: HTMLElement) => get_figcaption_text(element)?.includes('季节蜡烛'));
            const Tasks = figures?.filter((element: HTMLElement) => get_figcaption_text(element)?.includes('今日任务'));
            // const task_figure = figures?.filter((element: HTMLElement) => element.querySelector('figcaption') == )
            // console.log(soup.select);
            // console.log(article?.text);
            // console.log(constCake && constCake.length > 0 ? constCake[0].text : '');

            // CandlesCake?.forEach((v: HTMLElement) => {
            //     console.log(get_figcaption_text(v));
            //     console.log(v.querySelector('img')?.getAttribute('data-src'));
            // });

            if (Tasks != null && Tasks.length >= 1) {
                cached_data = new CachedData();

                cached_data.daily_content.randomCakes = undefined;
                cached_data.daily_content.seasonCandle = undefined;
                cached_data.daily_content.tasks = undefined;
                cached_data.daily_content.constCakes = undefined;

                cached_data.daily_content.randomCakes = CandlesCake?.map(figure2imagedata);
                if(constCake && constCake.length > 0)
                    cached_data.daily_content.constCakes = constCake[0].text.slice(2);
                if (SeasonCandle && SeasonCandle.length > 0)
                    cached_data.daily_content.seasonCandle = figure2imagedata(SeasonCandle[0]);
                if (Tasks && Tasks.length > 0)
                    cached_data.daily_content.tasks = figure2imagedata(Tasks[0]);

                const now: Date = new Date(Date.now());
                cached_data.month = now.getMonth() + 1;
                cached_data.date = now.getDate();

                storage.setItem(ls_key, JSON.stringify(cached_data));
                // console.log('update');
            }
            // console.log(cached_data.daily_content);
            
            if(callback != null)
            {
                callback(true);
            }
        }
        else {
            if(callback != null)
            {
                callback(false);
            }
        }
    });
}

function replyCakes(msg: CommonMessageEventData): void {
    let rep = '';
    if(cached_data.daily_content.constCakes) {
        rep += cached_data.daily_content.constCakes + '\n';
        cached_data.daily_content.randomCakes?.forEach((cake: ImageShowData) => {
            rep += '\n';
            rep += cake.title;
            rep += cqcode.image('http:' + cake.url);
        });
    }
    msg.reply(rep);
}

function replySeasonCandle(msg: CommonMessageEventData): void {
    let rep = '';
    if(cached_data.daily_content.seasonCandle) {
        rep += cached_data.daily_content.seasonCandle.title;
        rep += cqcode.image('http:' + cached_data.daily_content.seasonCandle.url);
    }
    msg.reply(rep);
}

function replyTasks(msg: CommonMessageEventData): void {
    let rep = '';
    if(cached_data.daily_content.tasks) {
        rep += cached_data.daily_content.tasks.title;
        rep += cqcode.image('http:' + cached_data.daily_content.tasks.url);
    }
    msg.reply(rep);
}

function replyHelp(msg: CommonMessageEventData): void {
    const rep = 
`是光遇小助手缇欧哒！
说“#光遇”即可唤醒；
支持的功能：
#大蜡烛
#季节蜡烛
#每日任务`;
    msg.reply(rep);
}

function SkyEntry(msg: CommonMessageEventData, normal: boolean = true): void {
    if(msg.raw_message.includes('#光遇')) {
        if(normal && msg.raw_message.includes('#大蜡烛') || msg.raw_message.includes('#蜡烛堆')) {
            replyCakes(msg);
        }
        else if(normal && msg.raw_message.includes('#季节蜡烛') || msg.raw_message.includes('#系蜡')) {
            replySeasonCandle(msg);
        }
        else if(normal && msg.raw_message.includes('#每日任务') || msg.raw_message.includes('#任务')) {
            replyTasks(msg);
        }
        else if (!normal) {
            msg.reply('数据源还没有更新，饭后再来看看吧');
        }
        else {
            replyHelp(msg);
        }
    }
}

function CheckUpdateEntry(msg: CommonMessageEventData): void {
    const now: Date = new Date(Date.now());
    if (cached_data.daily_content.tasks === undefined
        || cached_data.month != now.getMonth() + 1
        || cached_data.date != now.getDate()) {
        fetchArticleMetaData((a) => {
            if (a) {
                fetchTodayArticle(a.id.toString(), (succ) => SkyEntry(msg, succ));
            }
        });
    } else {
        SkyEntry(msg);
    }
}

// fetchArticleMetaData((a) => {
//     if (a) {
//         fetchTodayArticle(a.id.toString());
//     }
// });

bot.on('message.private', function (msg: PrivateMessageEventData) {
    CheckUpdateEntry(msg);
});


bot.on("message.group", function (msg: GroupMessageEventData) {
    if (get_group_switch(msg.group_id, ls_key) === true) {
        CheckUpdateEntry(msg);
    }
    if (msg.sender.user_id == master) {
        if(msg.raw_message.includes(':sky on')) {
            set_group_switch(msg.group_id, ls_key, true);
        } else if(msg.raw_message.includes(':sky off')) {
            set_group_switch(msg.group_id, ls_key, false);
        }
    }
})
