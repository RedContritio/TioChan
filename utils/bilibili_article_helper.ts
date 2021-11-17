import { rejects } from 'assert';
import { resolve } from 'path/posix';
import request from 'request';
import { parse, HTMLElement } from 'node-html-parser';
import { fetch_raw, fetch_page } from './html_fetch';

export interface IBilibiliArticleMetaResponse {
    code: number;
    message: string;
    ttl: number;
    data: IArticleMetaResponseData;
}
export interface IArticleMetaResponseData {
    articles?: (IArticleMeta)[] | null;
    pn: number;
    ps: number;
    count: number;
}
export interface IArticleMeta {
    id: number;
    category: ICategory;
    categories?: (ICategory)[] | null;
    title: string;
    summary: string;
    banner_url: string;
    template_id: number;
    state: number;
    author: IAuthor;
    reprint: number;
    image_urls?: (string)[] | null;
    publish_time: number;
    ctime: number;
    stats: Stats;
    words: number;
    origin_image_urls?: (string)[] | null;
    list?: null;
    is_like: boolean;
    media: Media;
    apply_time: string;
    check_time: string;
    original: number;
    act_id: number;
    dispute?: Dispute | null;
    authenMark?: null;
    cover_avid: number;
    top_video_info?: null;
    type: number;
    tags?: (TagsEntity)[] | null;
}
export interface ICategory {
    id: number;
    parent_id: number;
    name: string;
}
export interface IAuthor {
    mid: number;
    name: string;
    face: string;
    pendant: Pendant;
    official_verify: OfficialVerify;
    nameplate: Nameplate;
    vip: Vip;
}
export interface Pendant {
    pid: number;
    name: string;
    image: string;
    expire: number;
}
export interface OfficialVerify {
    type: number;
    desc: string;
}
export interface Nameplate {
    nid: number;
    name: string;
    image: string;
    image_small: string;
    level: string;
    condition: string;
}
export interface Vip {
    type: number;
    status: number;
    due_date: number;
    vip_pay_type: number;
    theme_type: number;
    label: Label;
    avatar_subscript: number;
    nickname_color: string;
}
export interface Label {
    path: string;
    text: string;
    label_theme: string;
}
export interface Stats {
    view: number;
    favorite: number;
    like: number;
    dislike: number;
    reply: number;
    share: number;
    coin: number;
    dynamic: number;
}
export interface Media {
    score: number;
    media_id: number;
    title: string;
    cover: string;
    area: string;
    type_id: number;
    type_name: string;
    spoiler: number;
}
export interface Dispute {
    dispute: string;
    dispute_url: string;
}
export interface TagsEntity {
    tid: number;
    name: string;
}

const config = {
    article_meta_url_prefix: 'https://api.bilibili.com/x/space/article?mid=',
    article_url_prefix: 'https://www.bilibili.com/read/cv',
};

export class ArticleMeta {
    /**
     * 获取文章元数据
     * @param up_id up主id
     * @param predicate ArticleMeta 筛选谓词
     * @param callback 参数为 null 表示发生了异常
     */
    static async fetch(up_id: string,
        predicate: (article: IArticleMeta) => boolean): Promise<IArticleMeta> {

        const url = `${config.article_meta_url_prefix}${up_id}`;
        
        return fetch_raw(url).then(
            (body: any) => {
                const res: IBilibiliArticleMetaResponse = JSON.parse(body);
                const { data } = res;
                const { articles } = data;
                const valid = articles == null ? [] : articles.filter(predicate);

                if(valid.length == 0)
                    throw `no valid articles found in ${url}`;
                return valid[0];
            }
        );
    }
};

export class Article {
    /**
     * 获取文章
     * @param article_id 文章id
     * @param predicate ArticleMeta 筛选谓词
     * @param callback 参数为 null 表示发生了异常
     */
     static async fetch(article_id: string): Promise<HTMLElement> {
        const url = `${config.article_url_prefix}${article_id}`;
        
        return fetch_page(url);
    }
}