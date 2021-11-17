import { Article, ArticleMeta, IArticleMeta } from '../utils/bilibili_article_helper';

import schedule from 'node-schedule';
import _dateformat from 'date-fns/format';

import { parse, HTMLElement } from 'node-html-parser';
import { segment, cqcode, CommonMessageEventData, PrivateMessageEventData, GroupMessageEventData } from 'oicq';
import { get_group_switch, set_group_switch } from "../utils/group_switch";
import { bot } from '..';
import { master } from '../config';
import { LocalStorage } from 'node-localstorage';
import { report_error } from '../utils/debug_message';
import { zhCN, ru } from 'date-fns/locale';
import { CacheData, get_cache as _get_cache, remove_cache, set_cache } from '../utils/cache';

const ls_key = 'sky163';
const cache_key = {
    bilibili: 'sky163_bilibili'
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

function dateformat(date: number, format: string) {
    const date_zh = new Date(date);
    date_zh.setHours(date_zh.getUTCHours() + 8);
    return _dateformat(date_zh, format);
    // return _dateformat(date, format, { locale: zhCN});
}

class DailyCacheData implements CacheData {
    data: DailyContent = new DailyContent();
    datetime: number = 0;
}

const get_bilibili_cache = () => _get_cache(cache_key.bilibili, new DailyCacheData());

const config = {
    article_up_id: '672840385',
    article_meta_url_prefix: 'https://api.bilibili.com/x/space/article?mid=',
    article_url_prefix: 'https://www.bilibili.com/read/cv',
};

function parseTodayArticle2Cache(root: HTMLElement): boolean {
    const get_figcaption_text = (e: HTMLElement) => e.querySelector('figcaption')?.text;
    const figure2imagedata = (e: HTMLElement): ImageShowData => {
        const showdata = new ImageShowData();
        showdata.title = get_figcaption_text(e);
        showdata.url = e.querySelector('img')?.getAttribute('data-src')
        return showdata;
    };

    const article = root.querySelector('#article-content');

    const constCake = article?.querySelectorAll('p').filter((e: HTMLElement) => e.text.includes('固定位置'));
    const figures = article?.querySelectorAll('figure');

    const CandlesCake = figures?.filter((element: HTMLElement) => get_figcaption_text(element)?.includes('蜡烛堆'));
    const SeasonCandle = figures?.filter((element: HTMLElement) => get_figcaption_text(element)?.includes('季节蜡烛'));
    const Tasks = figures?.filter((element: HTMLElement) => get_figcaption_text(element)?.includes('今日任务'));

    if (Tasks != null && Tasks.length >= 1) {
        const cached_data = new DailyCacheData();

        cached_data.data.randomCakes = undefined;
        cached_data.data.seasonCandle = undefined;
        cached_data.data.tasks = undefined;
        cached_data.data.constCakes = undefined;

        cached_data.data.randomCakes = CandlesCake?.map(figure2imagedata);
        if (constCake && constCake.length > 0)
            cached_data.data.constCakes = constCake[0].text.slice(2);
        if (SeasonCandle && SeasonCandle.length > 0)
            cached_data.data.seasonCandle = figure2imagedata(SeasonCandle[0]);
        if (Tasks && Tasks.length > 0)
            cached_data.data.tasks = figure2imagedata(Tasks[0]);

        cached_data.datetime = Date.now();

        set_cache(cache_key.bilibili, cached_data);
        // console.log('parsed');
        return true;
    }
    return false;
}

function replyCakes(msg: CommonMessageEventData): void {
    CheckUpdate().then(
        () => {
            const cached_data = get_bilibili_cache();
            let rep = '';
            msg.reply('正在查找缓存...');

            if (cached_data.data.constCakes) {
                rep += dateformat(cached_data.datetime, 'MM月dd日') + '\n';
                rep += cached_data.data.constCakes + '\n';
                cached_data.data.randomCakes?.forEach((cake: ImageShowData) => {
                    rep += '\n';
                    rep += cake.title;
                    rep += cqcode.image('http:' + cake.url);
                });
            }
            msg.reply(rep);
        }
    ).catch(
        (reason: any) => report_error(bot, reason)
    );
}

function replySeasonCandle(msg: CommonMessageEventData): void {
    CheckUpdate().then(
        () => {
            const cached_data = get_bilibili_cache();
            let rep = '';
            msg.reply('正在查找缓存...');

            if (cached_data.data.seasonCandle) {
                rep += dateformat(cached_data.datetime, 'MM月dd日') + '\n';
                rep += cached_data.data.seasonCandle.title;
                rep += cqcode.image('http:' + cached_data.data.seasonCandle.url);
            }
            msg.reply(rep);
        }
    ).catch(
        (reason: any) => report_error(bot, reason)
    );
}

function replyTasks(msg: CommonMessageEventData): void {
    CheckUpdate().then(
        () => {
            const cached_data = get_bilibili_cache();
            let rep = '';
            msg.reply('正在查找缓存...');

            if (cached_data.data.tasks) {
                rep += dateformat(cached_data.datetime, 'MM月dd日') + '\n';
                rep += cached_data.data.tasks.title;
                rep += cqcode.image('http:' + cached_data.data.tasks.url);
            }
            msg.reply(rep);
        }
    ).catch(
        (reason: any) => report_error(bot, reason)
    );
    
}

function replyHelp(msg: CommonMessageEventData): void {
    const cached_data = get_bilibili_cache();
    const { datetime } = cached_data; 
    const timestr = dateformat(datetime, 'yyyy-MM-dd HH:mm:ss');
    const rep =
`是光遇小助手缇欧哒！
说“#光遇”即可唤醒；
支持的功能：
#大蜡烛
#季节蜡烛
#每日任务

最近缓存于 ${timestr}`;

    msg.reply(rep);
}

function SkyEntry(msg: CommonMessageEventData): void {
    const content: string = msg.raw_message;

    try {
        if (content.includes('#光遇')) {
            if (content.includes('#大蜡烛') || content.includes('#蜡烛堆')) {
                replyCakes(msg);
            }
            else if (content.includes('#季节蜡烛') || content.includes('#季蜡')) {
                replySeasonCandle(msg);
            }
            else if (content.includes('#每日任务') || content.includes('#任务') || content.includes('#今日任务')) {
                replyTasks(msg);
            }
            else if (content.includes('#强制更新') || content.includes('#更新')) {
                msg.reply('@_@ 开始强制更新');
                remove_cache(cache_key.bilibili);
                CheckUpdate().then(
                    () => msg.reply('更新完成')
                ).catch(
                    (e) => {
                        report_error(bot, e);
                        msg.reply('TAT 更新失败，之后再来看看吧');
                    }
                );
            }
            else {
                replyHelp(msg);
            }
        }
    } catch (exception) {
        report_error(bot, exception);
    }
}

async function bilibili_update() {
    const now: Date = new Date(Date.now());
    const bilibili_article_up_id = '672840385';
    const expect_title = `光遇国服每日任务蜡烛位置(${dateformat(Date.now(), 'MM月dd日')})`;

    // console.log(expect_title);

    return ArticleMeta.fetch(bilibili_article_up_id, (article: IArticleMeta) => article.title == expect_title).then(
        (article: IArticleMeta) => {
            const id = article.id.toString();
            Article.fetch(id).then(
                (root: HTMLElement) => {
                    parseTodayArticle2Cache(root);
                    // console.log('sky: parsed succeed.');
                },
                (reason) => {
                    report_error(bot, reason);
                }
            );
        },
        (reason) => {
            report_error(bot, reason);
        }
    );
}

async function CheckUpdate(): Promise<void> {
    return new Promise(
        (resolve, reject) => {
            const cached_data = get_bilibili_cache();
            const prev: Date = new Date(cached_data.datetime);
            const now: Date = new Date(Date.now());
            if (cached_data.data.tasks === undefined
                || prev.getUTCMonth() != now.getUTCMonth()
                || prev.getUTCDate() != now.getUTCDate()) {
                bilibili_update().then(
                    (v) => resolve(v),
                    (r) => reject(r)
                );
            } else {
                resolve();
                // console.log('resolved');
            }
        }
    )
}


const UpdateJob = schedule.scheduleJob('sky163_update', '* 0 * * * *', () => {
    CheckUpdate();
});

bot.on('message.private', function (msg: PrivateMessageEventData) {
    SkyEntry(msg);
});


bot.on("message.group", function (msg: GroupMessageEventData) {
    if (get_group_switch(msg.group_id, ls_key) === true) {
        SkyEntry(msg);
    }
    if (msg.sender.user_id == master) {
        const content: string = msg.raw_message;

        if (content.includes(':sky on')) {
            set_group_switch(msg.group_id, ls_key, true);
        } else if (content.includes(':sky off')) {
            set_group_switch(msg.group_id, ls_key, false);
        }
    }
})
