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
import { Article, IArticle, ITopicCard, TopicCard } from '../utils/ds163_helper';

const ls_key = 'sky163';
const cache_key = {
    bilibili: 'sky163_bilibili',
    ds163: 'sky163_ds163',
};

class ImageShowData {
    title: string | undefined = undefined;
    url: string;

    constructor(url: string) {
        this.url = url;
    }
};

class DailyContent {
    cakes: ImageShowData[] = [];
    // constCakes: string | undefined = undefined;
    // randomCakes: ImageShowData[] | undefined = undefined;
    seasonCandles: ImageShowData[] | undefined = undefined;
    tasks: string[] = [];
}

function dateformat(date: number, format: string) {
    const date_zh = new Date(date);
    // date_zh.setHours(date_zh.getHours() + 8);
    return _dateformat(date_zh, format);
    // return _dateformat(date, format, { locale: zhCN});
}

class DailyCacheData implements CacheData {
    data: DailyContent = new DailyContent();
    datetime: number = 0;
}

// const get_bilibili_cache = () => _get_cache(cache_key.bilibili, new DailyCacheData());
const get_ds163_cache = () => _get_cache(cache_key.ds163, new DailyCacheData());

const config = {
    article_up_id: '672840385',
    article_meta_url_prefix: 'https://api.bilibili.com/x/space/article?mid=',
    article_url_prefix: 'https://www.bilibili.com/read/cv',
};

async function replyCakes(msg: CommonMessageEventData) {
    await CheckUpdate();
    const cached_data = get_ds163_cache();
    let rep = '';
    msg.reply('正在查找缓存...');
    // if (cached_data.data.cakes) {
    rep += dateformat(cached_data.datetime, 'M月dd日');
    // rep += cached_data.data.constCakes + '\n';
    cached_data.data.cakes.forEach((e: ImageShowData) => {
        rep += '\n';
        rep += cqcode.image(e.url);
    });
        // cached_data.data.randomCakes?.forEach((cake: ImageShowData) => {
        //     rep += '\n';
        //     rep += cake.title;
        //     rep += cqcode.image('http:' + cake.url);
        // });
    // }
    msg.reply(rep);
}

async function replyseasonCandles(msg: CommonMessageEventData) {
    await CheckUpdate();
    const cached_data = get_ds163_cache();
    let rep = '';
    msg.reply('正在查找缓存...');
    // if (cached_data.data.seasonCandles) {
    rep += dateformat(cached_data.datetime, 'M月dd日');
    cached_data.data.seasonCandles.forEach((e: ImageShowData) => {
        rep += '\n';
        rep += cqcode.image(e.url);
    });
    // }
    msg.reply(rep);
}

async function replyTasks(msg: CommonMessageEventData) {
    await CheckUpdate();
    const cached_data = get_ds163_cache();
    let rep = '';
    msg.reply('正在查找缓存...');
    // if (cached_data.data.tasks) {
    rep += dateformat(cached_data.datetime, 'M月dd日');
    cached_data.data.tasks.forEach((e: string) => {
        rep += '\n';
        rep += e;
    });
    // }
    msg.reply(rep);
}

function replyHelp(msg: CommonMessageEventData): void {
    const cached_data = get_ds163_cache();
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
                replyCakes(msg).catch((reason) => report_error(bot, reason));
            }
            else if (content.includes('#季节蜡烛') || content.includes('#季蜡')) {
                replyseasonCandles(msg).catch((reason) => report_error(bot, reason));
            }
            else if (content.includes('#每日任务') || content.includes('#任务') || content.includes('#今日任务')) {
                replyTasks(msg).catch((reason) => report_error(bot, reason));
            }
            else if (content.includes('#强制更新') || content.includes('#更新')) {
                msg.reply('@_@ 开始强制更新');
                remove_cache(cache_key.ds163);
                CheckUpdate().then(
                    () => msg.reply('更新完成')
                ).catch((reason) => report_error(bot, reason));
            }
            else {
                replyHelp(msg);
            }
        }
    } catch (exception) {
        report_error(bot, exception);
    }
}
async function ds163_update() {
    const now: Date = new Date(Date.now());
    const expect_title = dateformat(Date.now(), 'M月d日');

    const title_predicate = (card: ITopicCard) => {
        return card.content != undefined && card.content.includes(expect_title)
    }

    return TopicCard.fetch('光遇每日任务攻略', title_predicate).then((cards: ITopicCard[]) => {
        Article.fetch(cards[0].article_id).then((article: IArticle) => {
            const cached_data = new DailyCacheData();
            cached_data.data.tasks = article.tasks;
            cached_data.data.cakes = article.cake_urls.map((url: string) => new ImageShowData(url));
            cached_data.data.seasonCandles = article.season_urls.map((url: string) => new ImageShowData(url));
            cached_data.datetime = Date.now();

            set_cache(cache_key.ds163, cached_data);
        });
    })
}

async function CheckUpdate(): Promise<void> {
    return new Promise(
        (resolve, reject) => {
            const cached_data = get_ds163_cache();
            const prev: Date = new Date(cached_data.datetime);
            const now: Date = new Date(Date.now());
            if (cached_data.data.tasks === undefined
                || prev.getUTCMonth() != now.getUTCMonth()
                || prev.getUTCDate() != now.getUTCDate()) {
                ds163_update().then(
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

// const UpdateJob = schedule.scheduleJob('sky163_update', '* 0 * * * *', () => {
//     CheckUpdate().catch((r) => report_error(bot, r));
// });

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
