import { Article, ArticleMeta, IArticleMeta } from '../utils/bilibili_article_helper';

import schedule from 'node-schedule';
import dateformat from 'date-fns/format';

import { parse, HTMLElement } from 'node-html-parser';
import { segment, cqcode, CommonMessageEventData, PrivateMessageEventData, GroupMessageEventData } from 'oicq';
import { get_group_switch, set_group_switch } from "../utils/group_switch";
import { bot } from '..';
import { master } from '../config';
import { LocalStorage } from 'node-localstorage';

const ls_key = 'sky163';



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
    date: number = 0;
    daily_content: DailyContent = new DailyContent();
}

function InitialCacheRead(): CachedData {
    const s = storage.getItem(ls_key);
    if (s == null)
        return new CachedData();
    return JSON.parse(s);
}

let cached_data: CachedData = InitialCacheRead();

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
        cached_data = new CachedData();

        cached_data.daily_content.randomCakes = undefined;
        cached_data.daily_content.seasonCandle = undefined;
        cached_data.daily_content.tasks = undefined;
        cached_data.daily_content.constCakes = undefined;

        cached_data.daily_content.randomCakes = CandlesCake?.map(figure2imagedata);
        if (constCake && constCake.length > 0)
            cached_data.daily_content.constCakes = constCake[0].text.slice(2);
        if (SeasonCandle && SeasonCandle.length > 0)
            cached_data.daily_content.seasonCandle = figure2imagedata(SeasonCandle[0]);
        if (Tasks && Tasks.length > 0)
            cached_data.daily_content.tasks = figure2imagedata(Tasks[0]);

        cached_data.date = Date.now();

        storage.setItem(ls_key, JSON.stringify(cached_data));
        return true;
    }
    return false;
}

function replyCakes(msg: CommonMessageEventData): void {
    let rep = '';
    if (cached_data.daily_content.constCakes) {
        rep += dateformat(cached_data.date, 'MM月dd日') + '\n';
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
    if (cached_data.daily_content.seasonCandle) {
        rep += dateformat(cached_data.date, 'MM月dd日') + '\n';
        rep += cached_data.daily_content.seasonCandle.title;
        rep += cqcode.image('http:' + cached_data.daily_content.seasonCandle.url);
    }
    msg.reply(rep);
}

function replyTasks(msg: CommonMessageEventData): void {
    let rep = '';
    if (cached_data.daily_content.tasks) {
        rep += dateformat(cached_data.date, 'MM月dd日') + '\n';
        rep += cached_data.daily_content.tasks.title;
        rep += cqcode.image('http:' + cached_data.daily_content.tasks.url);
    }
    msg.reply(rep);
}

function replyHelp(msg: CommonMessageEventData): void {
    const { date } = cached_data; 
    const timestr = dateformat(date, 'yyyy-MM-dd HH:mm:ss');
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
                cached_data.daily_content.tasks = undefined;
                CheckUpdate();
            }
            else {
                replyHelp(msg);
            }
        }
    } catch (exception) {
        msg.reply(`[Exception]\n${exception}`);
    }
}

async function CheckUpdate() {
    const prev: Date = new Date(cached_data.date);
    const now: Date = new Date(Date.now());
    if (cached_data.daily_content.tasks === undefined
        || prev.getMonth() != now.getMonth()
        || prev.getDate() != now.getDate()) {

        const article_up_id = '672840385';
        const expect_title = `光遇国服每日任务蜡烛位置(${now.getMonth() + 1}月${now.getDate()}日)`;

        await ArticleMeta.fetch(article_up_id, (article: IArticleMeta) => article.title == expect_title).then(
            (article: IArticleMeta) => {
                const id = article.id.toString();
                Article.fetch(id).then(
                    (root: HTMLElement) => {
                        parseTodayArticle2Cache(root);
                        console.log('sky: parsed succeed.');
                    },
                    (reason) => {
                        console.error(`sky: Failed in fetch article because ${reason}`);
                    }
                );
            },
            (reason) => {
                console.error(`sky: Failed in fetch article meta because ${reason}`);
            }
        );
    }
}

function CheckUpdateEntry(msg: CommonMessageEventData): void {
    CheckUpdate();

    SkyEntry(msg);
}

const UpdateJob = schedule.scheduleJob('sky163_update', '* 0 * * * *', () => {
    CheckUpdate();
});

bot.on('message.private', function (msg: PrivateMessageEventData) {
    CheckUpdateEntry(msg);
});


bot.on("message.group", function (msg: GroupMessageEventData) {
    if (get_group_switch(msg.group_id, ls_key) === true) {
        CheckUpdateEntry(msg);
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
